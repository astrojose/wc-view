# Guardrails Spec

## Hard Rules

- Do not edit `docs/design` without accepted change intent.
- Do not define net-new behavior in `docs/implementation`.
- Do not treat `docs/changes/proposed` as approved truth.
- Do not keep duplicate truth statements across layers.
- Do not execute implementation tasks without linked design context.
- Do not add requirement changes to status reports.
- Do not start execution without defined acceptance criteria and scope boundary.
- Do not mark a task done without verification evidence.
- Do not allow tasks to share mutable file scope without an explicit boundary per task.

## Exception Policy

Any exception must include: reason, scope, and follow-up action. Exceptions cannot override source hierarchy.

## Enforcement

Validation command:

```
python3 .agents/workflows/workflow-contract/scripts/validate_workflow.py
```

Check categories:

- `STRUCTURE`: required and disallowed paths exist.
- `METADATA`: required section contracts per document type.
- `READINESS`: in-progress tasks have populated acceptance criteria and scope boundary; done tasks have verification evidence.
- `SCOPE`: no two in-progress tasks claim the same scope entry.
- `TRANSITIONS`: legal status values per document type.
- `REFERENCES`: stale or broken legacy references.

Any violation returns non-zero. Each finding includes category and path. Remediation guidance is in `validator-findings.md`.
