#!/usr/bin/env python3
from __future__ import annotations

import json
import sys

from workflow_paths import config_path


EXPECTED = {
    "task_statuses": {"pending", "in-progress", "blocked", "review", "done", "cancelled"},
    "phase_statuses": {"pending", "in-progress", "blocked", "review", "done", "cancelled"},
    "work_classes": {"direct", "planned", "decision", "incident"},
    "coordination_profiles": {"single-repo", "cross-repo"},
    "outcomes": {
        "pending",
        "reconciled-and-verified",
        "implemented-unverified",
        "design-drift",
        "decision-required",
        "reverted",
        "superseded",
    },
    "evidence_results": {"pass", "fail", "blocked", "not-run"},
}

EXPECTED_STATUS_OUTCOMES = {
    "pending": {"pending"},
    "in-progress": {"pending"},
    "review": {"pending"},
    "blocked": {"implemented-unverified", "design-drift", "decision-required"},
    "done": {"reconciled-and-verified"},
    "cancelled": {"reverted", "superseded"},
}

REQUIRED_PATHS = {
    "implementation_project",
    "implementation_phases",
    "implementation_tasks",
    "implementation_reviews",
    "implementation_status",
    "changes_proposed",
}


def main() -> int:
    path = config_path()
    try:
        config = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        print(f"CONFIG:{path}:invalid-json:{error}")
        return 1

    if not isinstance(config, dict):
        print("CONFIG:repo.config.json:invalid-root:expected-object")
        return 1

    errors: list[str] = []
    if config.get("version") != 2:
        errors.append("CONFIG:repo.config.json:unsupported-version:expected-2:follow-compatibility/migrate-v0.3.0-to-v0.4.0.md")

    missing_paths = REQUIRED_PATHS - set(config.get("paths", {}))
    for key in sorted(missing_paths):
        errors.append(f"CONFIG:repo.config.json:missing-path:{key}")

    actual = {
        "task_statuses": set(config.get("statuses", {}).get("task", {}).get("allowed", [])),
        "phase_statuses": set(config.get("statuses", {}).get("phase", {}).get("allowed", [])),
        "work_classes": set(config.get("classification", {}).get("work_classes", [])),
        "coordination_profiles": set(config.get("classification", {}).get("coordination_profiles", [])),
        "outcomes": set(config.get("reconciliation", {}).get("outcomes", [])),
        "evidence_results": set(config.get("reconciliation", {}).get("evidence_results", [])),
    }
    for key, expected in EXPECTED.items():
        if actual[key] != expected:
            errors.append(f"CONFIG:repo.config.json:invalid-{key}")

    actual_status_outcomes = {
        key: set(value)
        for key, value in config.get("reconciliation", {}).get("status_outcomes", {}).items()
    }
    if actual_status_outcomes != EXPECTED_STATUS_OUTCOMES:
        errors.append("CONFIG:repo.config.json:invalid-status-outcomes")

    validation = config.get("validation", {})
    for key in [
        "enable_structure",
        "enable_metadata",
        "enable_readiness",
        "enable_scope_conflicts",
        "enable_transitions",
        "enable_reconciliation",
        "enable_references",
    ]:
        if key not in validation:
            errors.append(f"CONFIG:repo.config.json:missing-validation-flag:{key}")

    transitions = config.get("transitions", {})
    for artifact in ["proposal", "task", "phase"]:
        policy = transitions.get(artifact)
        allowed = set(config.get("statuses", {}).get(artifact, {}).get("allowed", []))
        if not isinstance(policy, dict):
            errors.append(f"CONFIG:repo.config.json:missing-transitions:{artifact}")
            continue
        if set(policy) != allowed:
            errors.append(f"CONFIG:repo.config.json:invalid-transition-sources:{artifact}")
        for source, targets in policy.items():
            if not isinstance(targets, list) or not set(targets).issubset(allowed):
                errors.append(f"CONFIG:repo.config.json:invalid-transition-targets:{artifact}:{source}")

    required_validator = ".agents/workflows/workflow-contract/scripts/validate_reconciliation.py"
    if required_validator not in config.get("required_files", []):
        errors.append("CONFIG:repo.config.json:missing-reconciliation-validator")

    if errors:
        print("\n".join(errors))
        return 1
    print("CONFIG:ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
