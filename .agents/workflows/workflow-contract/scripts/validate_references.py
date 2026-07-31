#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
import json
from pathlib import Path

from workflow_paths import config_path, project_root

ROOT = project_root()
CONFIG_PATH = config_path()
SKIP_DIRS = {".git", "node_modules", "dist", "coverage", ".next", ".turbo"}


def load_config() -> dict:
    with CONFIG_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def iter_text_files() -> list[Path]:
    files: list[Path] = []
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        if any(part in SKIP_DIRS for part in path.relative_to(ROOT).parts):
            continue
        if path.suffix in {".md", ".yaml", ".yml", ".json", ".ts", ".js", ".py"}:
            files.append(path)
    return files


def main() -> int:
    config = load_config()
    enabled = bool(config.get("validation", {}).get("enable_references", True))
    if not enabled:
        print("REFERENCES:skipped")
        return 0

    patterns = [re.escape(p) for p in config.get("legacy_reference_patterns", [])]
    legacy_re = re.compile("|".join(patterns)) if patterns else None
    errors: list[str] = []

    for path in iter_text_files():
        rel = path.relative_to(ROOT).as_posix()
        if rel.startswith(".agents/workflows/workflow-contract/examples/"):
            continue
        # Migration guides must name the legacy patterns they migrate away from.
        # Treat them as validator documentation, not scanned consumer docs.
        if rel.startswith("compatibility/") or rel.startswith(".agents/workflows/workflow-contract/compatibility/"):
            continue
        # A repo config intentionally carries legacy patterns for enforcement.
        # In nested monorepos, multiple workflow-contract instances can exist;
        # treat any such config as validator input, not a scanned text target.
        if rel == "repo.config.json" or rel.endswith("/repo.config.json"):
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        if legacy_re and legacy_re.search(text):
            errors.append(f"REFERENCES:{rel}:legacy-reference-found")

    if errors:
        for err in errors:
            print(err)
        return 1

    print("REFERENCES:ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
