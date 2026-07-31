#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
import json
from pathlib import Path

from workflow_paths import config_path, project_root

ROOT = project_root()
CONFIG_PATH = config_path()
STATUS_RE = re.compile(r"^## Status\s*$", re.MULTILINE)


def load_config() -> dict:
    with CONFIG_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def extract_status(text: str) -> str | None:
    if not STATUS_RE.search(text):
        return None

    lines = text.splitlines()
    for index, line in enumerate(lines):
        if line.strip() == "## Status":
            for next_line in lines[index + 1 : index + 6]:
                cleaned = next_line.strip().lstrip("-").strip().strip("`").lower()
                if cleaned:
                    return cleaned
    return None


def main() -> int:
    config = load_config()
    enabled = bool(config.get("validation", {}).get("enable_transitions", True))
    if not enabled:
        print("TRANSITIONS:skipped")
        return 0

    proposed_dir = ROOT / config["paths"]["changes_proposed"]
    allowed = set(config.get("statuses", {}).get("proposal", {}).get("allowed", []))
    errors: list[str] = []

    for path in sorted(proposed_dir.glob("*.md")):
        text = path.read_text(encoding="utf-8", errors="ignore")
        status = extract_status(text)
        if status and status not in allowed:
            rel = path.relative_to(ROOT).as_posix()
            errors.append(f"TRANSITIONS:{rel}:invalid-proposal-status:{status}")

    if errors:
        for err in errors:
            print(err)
        return 1

    print("TRANSITIONS:ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
