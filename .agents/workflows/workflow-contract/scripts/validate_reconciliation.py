#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from collections import Counter

from workflow_document import (
    acceptance_criteria,
    acceptance_evidence,
    field,
    is_populated,
    section,
    section_is_populated,
    status,
    valid_revision,
)
from workflow_paths import config_path, project_root


ROOT = project_root()


def main() -> int:
    config = json.loads(config_path().read_text(encoding="utf-8"))
    if not config.get("validation", {}).get("enable_reconciliation", True):
        print("RECONCILIATION:skipped")
        return 0

    allowed_results = set(config["reconciliation"]["evidence_results"])
    status_outcomes = config["reconciliation"]["status_outcomes"]
    task_dir = ROOT / config["paths"]["implementation_tasks"]
    errors: list[str] = []

    for path in sorted(task_dir.glob("*.md")):
        if path.name == "backlog.md":
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        rel = path.relative_to(ROOT).as_posix()
        task_status = status(text)
        outcome = field(text, "Reconciliation", "Outcome").lower()
        criteria = acceptance_criteria(text)
        criterion_ids = [item[0] for item in criteria]
        evidence = acceptance_evidence(text)
        evidence_ids = [item[0] for item in evidence]

        if not criteria:
            errors.append(f"RECONCILIATION:{rel}:missing-criterion-ids")
        duplicates = [key for key, count in Counter(criterion_ids).items() if count > 1]
        if duplicates:
            errors.append(f"RECONCILIATION:{rel}:duplicate-criteria:{','.join(duplicates)}")
        duplicates = [key for key, count in Counter(evidence_ids).items() if count > 1]
        if duplicates:
            errors.append(f"RECONCILIATION:{rel}:duplicate-evidence:{','.join(duplicates)}")

        missing = sorted(set(criterion_ids) - set(evidence_ids))
        extra = sorted(set(evidence_ids) - set(criterion_ids))
        if missing:
            errors.append(f"RECONCILIATION:{rel}:missing-evidence:{','.join(missing)}")
        if extra:
            errors.append(f"RECONCILIATION:{rel}:unknown-evidence:{','.join(extra)}")
        for criterion, result, _ in evidence:
            if result not in allowed_results:
                errors.append(f"RECONCILIATION:{rel}:invalid-result:{criterion}:{result}")

        if any(result == "fail" for _, result, _ in evidence) and task_status != "in-progress":
            errors.append(f"RECONCILIATION:{rel}:failed-criterion-requires-in-progress")

        allowed_outcomes = set(status_outcomes.get(task_status, []))
        if outcome not in allowed_outcomes:
            errors.append(f"RECONCILIATION:{rel}:status-outcome-mismatch:{task_status}:{outcome or 'missing'}")

        if task_status == "done":
            reviewed_revision = field(text, "Reconciliation", "Reviewed revision")
            environment = field(text, "Reconciliation", "Environment")
            if not valid_revision(reviewed_revision):
                errors.append(f"RECONCILIATION:{rel}:done-requires-reviewed-revision")
            if not is_populated(environment):
                errors.append(f"RECONCILIATION:{rel}:done-requires-environment")
            for criterion, result, proof in evidence:
                if result != "pass" or not is_populated(proof):
                    errors.append(f"RECONCILIATION:{rel}:done-requires-passing-evidence:{criterion}")
            if not section_is_populated(text, "Alignment", level=3):
                errors.append(f"RECONCILIATION:{rel}:done-requires-alignment")

        if task_status == "cancelled":
            if outcome == "reverted":
                if not valid_revision(field(text, "Reconciliation", "Reviewed revision")):
                    errors.append(f"RECONCILIATION:{rel}:reverted-requires-reviewed-revision")
                if not is_populated(field(text, "Reconciliation", "Environment")):
                    errors.append(f"RECONCILIATION:{rel}:reverted-requires-environment")
            if not section_is_populated(text, "Follow-up", level=3):
                errors.append(f"RECONCILIATION:{rel}:cancelled-requires-follow-up")
            if outcome == "superseded":
                follow_up = section(text, "Follow-up", level=3)
                if not re.search(r"docs/(?:implementation/tasks|design)/\S+\.md", follow_up):
                    errors.append(f"RECONCILIATION:{rel}:superseded-requires-replacement-link")

        if task_status == "blocked":
            if not section_is_populated(text, "Follow-up", level=3):
                errors.append(f"RECONCILIATION:{rel}:blocked-requires-follow-up")
            if outcome == "decision-required" and not is_populated(
                field(text, "Alignment", "Newly discovered decisions", level=3)
            ):
                errors.append(f"RECONCILIATION:{rel}:decision-required-needs-decision")
            if outcome == "design-drift" and not is_populated(
                field(text, "Alignment", "Design vs implementation", level=3)
            ):
                errors.append(f"RECONCILIATION:{rel}:design-drift-needs-alignment")

    if errors:
        print("\n".join(errors))
        return 1
    print("RECONCILIATION:ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
