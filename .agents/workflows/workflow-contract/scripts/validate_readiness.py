#!/usr/bin/env python3
from __future__ import annotations

import json
import sys

from workflow_document import acceptance_criteria, field, is_populated, section_is_populated, status
from workflow_paths import config_path, project_root

ROOT = project_root()

CLASS_STATUSES = {
    "direct": {"pending", "in-progress", "blocked", "review", "done", "cancelled"},
    "planned": {"pending", "in-progress", "blocked", "review", "done", "cancelled"},
    "decision": {"pending", "blocked", "cancelled"},
    "incident": {"pending", "in-progress", "blocked", "cancelled"},
}


def require_field(errors: list[str], rel: str, text: str, heading: str, label: str) -> None:
    if not is_populated(field(text, heading, label)):
        errors.append(f"READINESS:{rel}:requires-content:{heading}:{label}")


def main() -> int:
    config = json.loads(config_path().read_text(encoding="utf-8"))
    if not config.get("validation", {}).get("enable_readiness", True):
        print("READINESS:skipped")
        return 0

    errors: list[str] = []
    task_dir = ROOT / config["paths"]["implementation_tasks"]
    allowed_classes = set(config["classification"]["work_classes"])
    allowed_coordination = set(config["classification"]["coordination_profiles"])

    for path in sorted(task_dir.glob("*.md")):
        if path.name == "backlog.md":
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        rel = path.relative_to(ROOT).as_posix()
        task_status = status(text)
        work_class = field(text, "Work Classification", "Class").lower()
        coordination = field(text, "Work Classification", "Coordination").lower()
        reclassified = field(text, "Work Classification", "Reclassified from").lower()

        if work_class not in allowed_classes:
            errors.append(f"READINESS:{rel}:invalid-class:{work_class or 'missing'}")
            continue
        if coordination not in allowed_coordination:
            errors.append(f"READINESS:{rel}:invalid-coordination:{coordination or 'missing'}")
        if reclassified not in {"incident", "not applicable"}:
            errors.append(f"READINESS:{rel}:invalid-reclassified-from:{reclassified or 'missing'}")
        if task_status not in CLASS_STATUSES[work_class]:
            errors.append(f"READINESS:{rel}:invalid-class-status:{work_class}:{task_status or 'missing'}")

        if work_class in {"direct", "planned"}:
            if not section_is_populated(text, "Objective") and not section_is_populated(text, "Goal"):
                errors.append(f"READINESS:{rel}:requires-content:Objective|Goal")
            for heading in ["Scope Boundary", "Verification"]:
                if not section_is_populated(text, heading):
                    errors.append(f"READINESS:{rel}:requires-content:{heading}")
            for label in ["Allowed", "Requires approval", "Prohibited"]:
                require_field(errors, rel, text, "Authority", label)
            if not acceptance_criteria(text):
                errors.append(f"READINESS:{rel}:requires-criterion-ids")

        if work_class == "planned":
            for label in ["Skills", "Design docs", "Constraints", "Do not touch"]:
                require_field(errors, rel, text, "Agent Context", label)
            if not section_is_populated(text, "Dependencies"):
                errors.append(f"READINESS:{rel}:planned-requires-dependencies")
            if not section_is_populated(text, "Implementation Checklist"):
                errors.append(f"READINESS:{rel}:planned-requires-checklist")

        if work_class == "decision":
            require_field(errors, rel, text, "Agent Context", "Proposal")

        if work_class == "incident":
            for label in ["Symptom", "Environment", "Safety boundary", "Reproduction", "Evidence"]:
                require_field(errors, rel, text, "Investigation", label)

        if coordination == "cross-repo":
            for label in ["Participating repositories", "Shared contracts", "Invariants", "Integration owner", "Dependency order"]:
                require_field(errors, rel, text, "Cross-Repository Coordination", label)

    if errors:
        print("\n".join(errors))
        return 1
    print("READINESS:ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
