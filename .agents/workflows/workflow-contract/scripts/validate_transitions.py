#!/usr/bin/env python3
from __future__ import annotations

import json
import sys

from workflow_document import status
from workflow_paths import config_path, project_root

ROOT = project_root()


def validate_statuses(errors: list[str], paths, artifact: str, allowed: set[str]) -> None:
    for path in sorted(paths):
        if path.name in {"README.md", "backlog.md"}:
            continue
        value = status(path.read_text(encoding="utf-8", errors="ignore"))
        if value not in allowed:
            errors.append(f"TRANSITIONS:{path.relative_to(ROOT).as_posix()}:invalid-{artifact}-status:{value or 'missing'}")


def main() -> int:
    config = json.loads(config_path().read_text(encoding="utf-8"))
    if not config.get("validation", {}).get("enable_transitions", True):
        print("TRANSITIONS:skipped")
        return 0

    errors: list[str] = []
    validate_statuses(errors, (ROOT / config["paths"]["changes_proposed"]).glob("*.md"), "proposal", set(config["statuses"]["proposal"]["allowed"]))
    validate_statuses(errors, (ROOT / config["paths"]["implementation_tasks"]).glob("*.md"), "task", set(config["statuses"]["task"]["allowed"]))
    validate_statuses(errors, (ROOT / config["paths"]["implementation_phases"]).glob("*.md"), "phase", set(config["statuses"]["phase"]["allowed"]))

    if errors:
        print("\n".join(errors))
        return 1
    print("TRANSITIONS:ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
