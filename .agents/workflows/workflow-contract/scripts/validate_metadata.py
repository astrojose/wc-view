#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys

from workflow_paths import config_path, project_root

ROOT = project_root()


def has_heading(text: str, heading: str, level: int = 2) -> bool:
    return re.search(rf"^{'#' * level}\s+{re.escape(heading)}\s*$", text, re.MULTILINE) is not None


def missing_headings(text: str, headings: list[str], level: int = 2) -> list[str]:
    return [heading for heading in headings if not has_heading(text, heading, level)]


def main() -> int:
    config = json.loads(config_path().read_text(encoding="utf-8"))
    if not config.get("validation", {}).get("enable_metadata", False):
        print("METADATA:skipped")
        return 0

    errors: list[str] = []

    for path in sorted((ROOT / config["paths"]["changes_proposed"]).glob("*.md")):
        text = path.read_text(encoding="utf-8", errors="ignore")
        missing = missing_headings(
            text,
            ["Status", "Context", "Problem", "Decision Required", "Approval Boundary"],
        )
        if not any(has_heading(text, heading) for heading in ["Proposed Change", "Proposed Boundary"]):
            missing.append("Proposed Change|Proposed Boundary")
        if missing:
            errors.append(f"METADATA:{path.relative_to(ROOT).as_posix()}:missing-sections:{','.join(missing)}")

    for path in sorted((ROOT / config["paths"]["implementation_phases"]).glob("*.md")):
        text = path.read_text(encoding="utf-8", errors="ignore")
        missing = missing_headings(text, ["Status", "Scope", "Features", "Tasks", "Acceptance Criteria"])
        if missing:
            errors.append(f"METADATA:{path.relative_to(ROOT).as_posix()}:missing-sections:{','.join(missing)}")

    task_required = [
        "Status",
        "Work Classification",
        "Agent Context",
        "Authority",
        "Scope Boundary",
        "Acceptance Criteria",
        "Dependencies",
        "Implementation Checklist",
        "Verification",
        "Investigation",
        "Cross-Repository Coordination",
        "Reconciliation",
    ]
    for path in sorted((ROOT / config["paths"]["implementation_tasks"]).glob("*.md")):
        text = path.read_text(encoding="utf-8", errors="ignore")
        if path.name == "backlog.md":
            missing = missing_headings(text, ["Status", "Objective", "Implementation Checklist"])
        else:
            missing = missing_headings(text, task_required)
            if not any(has_heading(text, heading) for heading in ["Objective", "Goal"]):
                missing.append("Objective|Goal")
        if missing:
            errors.append(f"METADATA:{path.relative_to(ROOT).as_posix()}:missing-sections:{','.join(missing)}")

    project_path = ROOT / config["paths"]["implementation_project"]
    project_text = project_path.read_text(encoding="utf-8", errors="ignore")
    missing = missing_headings(project_text, ["Overview", "Current Priorities", "Active Phases", "Linked Artifacts"])
    if missing:
        errors.append(f"METADATA:{project_path.relative_to(ROOT).as_posix()}:missing-sections:{','.join(missing)}")

    status_path = ROOT / config["paths"]["implementation_status"] / "weekly-status.md"
    status_text = status_path.read_text(encoding="utf-8", errors="ignore")
    dates = list(re.finditer(r"^##\s+\d{4}-\d{2}-\d{2}\s*$", status_text, re.MULTILINE))
    if not dates:
        errors.append(f"METADATA:{status_path.relative_to(ROOT).as_posix()}:missing-date-status-headings")
    else:
        latest_date = max(dates, key=lambda match: match.group(0).strip())
        after_latest = status_text[latest_date.end():]
        next_date = re.search(r"^##\s+", after_latest, re.MULTILINE)
        latest = after_latest[:next_date.start()] if next_date else after_latest
        required = [
            "Summary", "Completed", "In Progress", "Awaiting Review",
            "Reconciled and Verified", "Implemented but Unverified",
            "Decisions Required", "Blockers", "Cancelled",
        ]
        missing = missing_headings(latest, required, level=3)
        if missing:
            errors.append(f"METADATA:{status_path.relative_to(ROOT).as_posix()}:missing-sections:{','.join(missing)}")

    review_dir = ROOT / config["paths"]["implementation_reviews"]
    for path in sorted(review_dir.glob("*.md")):
        if path.name == "README.md":
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        missing = missing_headings(text, ["Reviewed Work", "Acceptance Evidence", "Alignment", "Outcome", "Follow-up"])
        if missing:
            errors.append(f"METADATA:{path.relative_to(ROOT).as_posix()}:missing-sections:{','.join(missing)}")

    if errors:
        print("\n".join(errors))
        return 1
    print("METADATA:ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
