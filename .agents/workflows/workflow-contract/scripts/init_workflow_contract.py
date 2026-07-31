#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import shutil
import sys
from datetime import date
from pathlib import Path

from workflow_paths import (
    SKILL_INSTALL_ROOT,
    config_path,
    installed_workflow_rel,
    project_root,
    workflow_root,
)

ROOT = project_root()
WORKFLOW_ROOT = workflow_root()
CONFIG_PATH = config_path()
SKILL_SOURCE = WORKFLOW_ROOT / ".agents/skills/workflow-contract"
SKILL_TARGET = ROOT / SKILL_INSTALL_ROOT


class InitError(RuntimeError):
    pass


def load_config() -> dict:
    with CONFIG_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def ensure_dir(path: Path, dry_run: bool) -> None:
    if path.exists():
        if not path.is_dir():
            raise InitError(f"Expected directory but found file: {path}")
        return
    print(f"create dir: {path.relative_to(ROOT)}")
    if not dry_run:
        path.mkdir(parents=True, exist_ok=True)


def ensure_file(path: Path, content: str, dry_run: bool) -> None:
    if path.exists():
        if not path.is_file():
            raise InitError(f"Expected file but found non-file path: {path}")
        return
    print(f"create file: {path.relative_to(ROOT)}")
    if not dry_run:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")


def ensure_symlink(path: Path, target: str, dry_run: bool) -> None:
    desired = Path(target)
    if path.is_symlink():
        current = Path(path.readlink())
        if current == desired:
            return
        print(f"repair symlink: {path.relative_to(ROOT)} -> {target}")
        if not dry_run:
            path.unlink()
            path.symlink_to(target)
        return

    if path.exists():
        raise InitError(
            f"Cannot create symlink at {path.relative_to(ROOT)}: regular file or directory exists. "
            f"Move/remove it, then rerun."
        )

    print(f"create symlink: {path.relative_to(ROOT)} -> {target}")
    if not dry_run:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.symlink_to(target)


def copy_skill_source(dry_run: bool) -> None:
    if SKILL_TARGET.exists():
        return
    if not SKILL_SOURCE.exists():
        raise InitError(f"Missing source skill directory: {SKILL_SOURCE}")
    print(f"copy skill: {SKILL_SOURCE} -> {SKILL_TARGET.relative_to(ROOT)}")
    if not dry_run:
        SKILL_TARGET.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(SKILL_SOURCE, SKILL_TARGET)


def placeholder_for(path: Path, config: dict) -> str:
    rel = path.relative_to(ROOT).as_posix()
    today = date.today().isoformat()
    if rel == "AGENTS.md":
        return "# AGENTS.md\n\nProject agent instructions.\n"
    if rel == "docs/README.md":
        return (
            "# Documentation Map\n\n"
            "## Canonical Workflow Policy\n\n"
            f"- `{installed_workflow_rel('spec')}/*`\n"
        )
    if rel == "docs/implementation/README.md":
        return "# Implementation Docs\n\nExecution planning artifacts.\n"
    if rel == config["paths"]["implementation_project"]:
        return (
            "# Project Implementation\n\n"
            "## Overview\n\n-\n\n"
            "## Current Priorities\n\n-\n\n"
            "## Active Phases\n\n- [ ] \n\n"
            "## Linked Artifacts\n\n- phases:\n- tasks:\n- status:\n"
        )
    if rel == "docs/implementation/tasks/backlog.md":
        return (
            "# Backlog\n\n## Status\n\npending\n\n## Objective\n\n-\n\n"
            "## Implementation Checklist\n\n- [ ] \n"
        )
    if rel == "docs/implementation/status/weekly-status.md":
        return f"# Weekly Status\n\n## {today}\n\n-\n"
    if rel == "docs/changes/README.md":
        return "# Proposed Changes\n\nUnresolved deltas only.\n"
    if rel == "docs/changes/template.md":
        return (
            "# Proposal Title\n\n## Status\n\nproposed\n\n## Context\n\n-\n\n"
            "## Problem\n\n-\n\n## Proposed Change\n\n-\n"
        )
    return ""


def ensure_required_structure(config: dict, dry_run: bool) -> None:
    for rel in config.get("required_directories", []):
        ensure_dir(ROOT / rel, dry_run=dry_run)
    for rel in config.get("required_files", []):
        file_path = ROOT / rel
        ensure_file(file_path, placeholder_for(file_path, config), dry_run=dry_run)


def main() -> int:
    parser = argparse.ArgumentParser(description="Initialize workflow-contract structure and links.")
    parser.add_argument("--dry-run", action="store_true", help="Print actions only")
    args = parser.parse_args()

    try:
        config = load_config()

        ensure_dir(ROOT / ".agents" / "skills", dry_run=args.dry_run)
        ensure_dir(ROOT / ".agents" / "workflows", dry_run=args.dry_run)
        copy_skill_source(dry_run=args.dry_run)

        ensure_dir(ROOT / ".claude", dry_run=args.dry_run)
        ensure_dir(ROOT / ".junie", dry_run=args.dry_run)
        ensure_symlink(ROOT / ".claude/skills", "../.agents/skills", dry_run=args.dry_run)
        ensure_symlink(ROOT / ".junie/skills", "../.agents/skills", dry_run=args.dry_run)

        ensure_symlink(ROOT / "CLAUDE.md", "AGENTS.md", dry_run=args.dry_run)
        ensure_required_structure(config, dry_run=args.dry_run)

        print("INIT:ok")
        return 0
    except InitError as err:
        print(f"INIT:error:{err}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
