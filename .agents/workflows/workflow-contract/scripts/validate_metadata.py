#!/usr/bin/env python3
from __future__ import annotations

import sys
import json
import re
from pathlib import Path

from workflow_paths import config_path, project_root

ROOT = project_root()
CONFIG_PATH = config_path()


def load_config() -> dict:
    with CONFIG_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def has_heading(text: str, heading: str) -> bool:
    pattern = rf"^##\s+{re.escape(heading)}\s*$"
    return re.search(pattern, text, flags=re.MULTILINE) is not None


def has_any_heading(text: str, headings: list[str]) -> bool:
    return any(has_heading(text, heading) for heading in headings)


def main() -> int:
    config = load_config()
    enabled = bool(config.get("validation", {}).get("enable_metadata", False))
    if not enabled:
        print("METADATA:skipped")
        return 0

    errors: list[str] = []

    proposal_dir = ROOT / config["paths"]["changes_proposed"]
    phase_dir = ROOT / config["paths"]["implementation_phases"]
    task_dir = ROOT / config["paths"]["implementation_tasks"]
    project_path = ROOT / config["paths"]["implementation_project"]
    status_path = ROOT / config["paths"]["implementation_status"] / "weekly-status.md"

    for path in sorted(proposal_dir.glob("*.md")):
        text = path.read_text(encoding="utf-8", errors="ignore")
        required = ["Status", "Context", "Problem"]
        missing = [h for h in required if not has_heading(text, h)]
        if not has_any_heading(text, ["Proposed Change", "Proposed Boundary"]):
            missing.append("Proposed Change|Proposed Boundary")
        if missing:
            rel = path.relative_to(ROOT).as_posix()
            errors.append(f"METADATA:{rel}:missing-sections:{','.join(missing)}")

    for path in sorted(phase_dir.glob("*.md")):
        text = path.read_text(encoding="utf-8", errors="ignore")
        required = ["Scope", "Features", "Tasks", "Acceptance Criteria"]
        missing = [h for h in required if not has_heading(text, h)]
        if missing:
            rel = path.relative_to(ROOT).as_posix()
            errors.append(f"METADATA:{rel}:missing-sections:{','.join(missing)}")

    for path in sorted(task_dir.glob("*.md")):
        text = path.read_text(encoding="utf-8", errors="ignore")
        if path.name == "backlog.md":
            required = ["Status", "Objective", "Implementation Checklist"]
            missing = [h for h in required if not has_heading(text, h)]
        else:
            required = ["Status", "Acceptance Criteria", "Scope Boundary", "Verification"]
            missing = [h for h in required if not has_heading(text, h)]
            if not has_any_heading(text, ["Objective", "Goal"]):
                missing.append("Objective|Goal")
        if missing:
            rel = path.relative_to(ROOT).as_posix()
            errors.append(f"METADATA:{rel}:missing-sections:{','.join(missing)}")

    project_text = project_path.read_text(encoding="utf-8", errors="ignore")
    project_required = ["Overview", "Current Priorities", "Active Phases", "Linked Artifacts"]
    project_missing = [h for h in project_required if not has_heading(project_text, h)]
    if project_missing:
        rel = project_path.relative_to(ROOT).as_posix()
        errors.append(f"METADATA:{rel}:missing-sections:{','.join(project_missing)}")

    status_text = status_path.read_text(encoding="utf-8", errors="ignore")
    if not re.search(r"^##\s+\d{4}-\d{2}-\d{2}", status_text, re.MULTILINE):
        rel = status_path.relative_to(ROOT).as_posix()
        errors.append(f"METADATA:{rel}:missing-date-status-headings")

    if errors:
        for err in errors:
            print(err)
        return 1

    print("METADATA:ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
