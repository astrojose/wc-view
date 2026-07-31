#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
import json
from pathlib import Path

from workflow_paths import config_path, project_root

ROOT = project_root()
CONFIG_PATH = config_path()

# Lines that count as empty content inside a section.
_EMPTY_LINE = re.compile(
    r"^\s*("
    r"-\s*\[\s*\]\s*"   # - [ ]
    r"|-\s*$"           # bare -
    r"|`{3}.*"          # code fence open/close
    r"|\*\*[^*]+\*\*:\s*"  # sub-labels like **In scope:**
    r"|(Command|Evidence|Skills|Design docs|Constraints|Do not touch):\s*"  # empty key-value pairs
    r")\s*$"
)


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


def section_is_populated(text: str, heading: str) -> bool:
    pattern = rf"^## {re.escape(heading)}\s*$"
    match = re.search(pattern, text, re.MULTILINE)
    if not match:
        return False
    after = text[match.end():]
    next_section = re.search(r"^## ", after, re.MULTILINE)
    content = after[: next_section.start()] if next_section else after
    for line in content.splitlines():
        if line.strip() and not _EMPTY_LINE.match(line):
            return True
    return False


def main() -> int:
    config = load_config()
    enabled = bool(config.get("validation", {}).get("enable_readiness", True))
    if not enabled:
        print("READINESS:skipped")
        return 0

    task_dir = ROOT / config["paths"]["implementation_tasks"]
    errors: list[str] = []

    for path in sorted(task_dir.glob("*.md")):
        if path.name == "backlog.md":
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        status = extract_status(text)
        rel = path.relative_to(ROOT).as_posix()

        if status == "in-progress":
            for section in ["Acceptance Criteria", "Scope Boundary"]:
                if not section_is_populated(text, section):
                    errors.append(
                        f"READINESS:{rel}:in-progress-requires-content:{section}"
                    )

        if status == "done":
            if not section_is_populated(text, "Verification"):
                errors.append(f"READINESS:{rel}:done-requires-verification-evidence")

    if errors:
        for err in errors:
            print(err)
        return 1

    print("READINESS:ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
