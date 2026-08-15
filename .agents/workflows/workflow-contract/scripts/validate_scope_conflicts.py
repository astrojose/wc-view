#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
import json
from collections import defaultdict
from pathlib import Path

from workflow_paths import config_path, project_root

ROOT = project_root()
CONFIG_PATH = config_path()

_IN_SCOPE_LABEL = re.compile(r"^\*\*In scope:\*\*\s*$", re.MULTILINE)
_SECTION_START = re.compile(r"^## ", re.MULTILINE)
_SUB_LABEL = re.compile(r"^\*\*[^*]+\*\*:\s*$")


def load_config() -> dict:
    with CONFIG_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def extract_status(text: str) -> str | None:
    for index, line in enumerate(text.splitlines()):
        if line.strip() == "## Status":
            for next_line in text.splitlines()[index + 1 : index + 6]:
                cleaned = next_line.strip().lstrip("-").strip().strip("`").lower()
                if cleaned:
                    return cleaned
    return None


def extract_in_scope_entries(text: str) -> list[str]:
    """Extract bullet items from the **In scope:** sub-section of ## Scope Boundary."""
    boundary_match = re.search(r"^## Scope Boundary\s*$", text, re.MULTILINE)
    if not boundary_match:
        return []

    after_boundary = text[boundary_match.end():]
    next_section = _SECTION_START.search(after_boundary)
    boundary_block = after_boundary[: next_section.start()] if next_section else after_boundary

    in_scope_match = _IN_SCOPE_LABEL.search(boundary_block)
    if not in_scope_match:
        return []

    after_label = boundary_block[in_scope_match.end():]
    next_label = _SUB_LABEL.search(after_label)
    in_scope_block = after_label[: next_label.start()] if next_label else after_label

    entries = []
    for line in in_scope_block.splitlines():
        stripped = line.strip().lstrip("-").strip()
        if stripped and not _SUB_LABEL.match(line.strip()):
            entries.append(stripped)
    return entries


def main() -> int:
    config = load_config()
    enabled = bool(config.get("validation", {}).get("enable_scope_conflicts", True))
    if not enabled:
        print("SCOPE:skipped")
        return 0

    task_dir = ROOT / config["paths"]["implementation_tasks"]
    scope_map: dict[str, list[str]] = defaultdict(list)
    errors: list[str] = []

    for path in sorted(task_dir.glob("*.md")):
        if path.name == "backlog.md":
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        if extract_status(text) != "in-progress":
            continue
        rel = path.relative_to(ROOT).as_posix()
        for entry in extract_in_scope_entries(text):
            scope_map[entry].append(rel)

    for entry, owners in scope_map.items():
        if len(owners) > 1:
            owner_list = ", ".join(owners)
            errors.append(f"SCOPE:conflict:'{entry}':claimed-by:{owner_list}")

    if errors:
        for err in errors:
            print(err)
        return 1

    print("SCOPE:ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
