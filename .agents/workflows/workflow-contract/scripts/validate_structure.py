#!/usr/bin/env python3
from __future__ import annotations

import sys
import json
from pathlib import Path

from workflow_paths import config_path, project_root

ROOT = project_root()
CONFIG_PATH = config_path()


def load_config() -> dict:
    with CONFIG_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def main() -> int:
    config = load_config()
    errors: list[str] = []

    for rel in config.get("required_directories", []):
        if not (ROOT / rel).is_dir():
            errors.append(f"STRUCTURE:{rel}:missing-required-directory")

    for rel in config.get("required_files", []):
        if not (ROOT / rel).is_file():
            errors.append(f"STRUCTURE:{rel}:missing-required-file")

    for rel in config.get("disallowed_directories", []):
        if (ROOT / rel).exists():
            errors.append(f"STRUCTURE:{rel}:disallowed-directory-present")

    for rel in config.get("disallowed_files", []):
        if (ROOT / rel).exists():
            errors.append(f"STRUCTURE:{rel}:disallowed-file-present")

    if errors:
        for err in errors:
            print(err)
        return 1

    print("STRUCTURE:ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
