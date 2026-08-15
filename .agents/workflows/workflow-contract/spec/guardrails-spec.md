# Guardrails Spec

## Hard Rules

- Do not edit `docs/design` without accepted change intent.
- Do not define net-new behavior in `docs/implementation`.
- Do not treat `docs/changes/proposed` as approved truth.
- Do not keep duplicate truth statements across layers.
- Do not execute planned tasks without linked design context.
- Do not add requirement changes to status reports.
- Do not start permanent execution without accepted intent, bounded scope, explicit authority, acceptance criteria, and a verification method.
- Do not let Investigation approve behavior or silently become permanent execution.
- Do not treat silence, reactions, annotations, inference, or ambiguous language as approval.
- Do not extend approval beyond the stated decision, scope, and actions.
- Do not treat reasoning effort as a substitute for evidence or review.
- Do not mark a task done unless its outcome is `reconciled-and-verified` and every acceptance criterion has passing evidence.
- Do not use mock, structural, or validator evidence as a substitute for required live proof.
- Do not use status reports as evidence authority.
- Do not let Review approve design drift, new behavior, or material scope changes.
- Do not complete reconciliation from ambiguous or stale approval.
- Do not allow tasks to share mutable file scope without an explicit boundary per task.

## Exception Policy

Any exception must include: reason, scope, and follow-up action. Exceptions cannot override source hierarchy.

## Enforcement

Validation command:

```
python3 .agents/workflows/workflow-contract/scripts/validate_workflow.py
```

Check categories:

- `CONFIG`: schema version and required policy values; failure stops the pipeline.
- `STRUCTURE`: required and disallowed paths exist.
- `METADATA`: required section contracts per document type.
- `READINESS`: active tasks satisfy class-specific execution requirements.
- `SCOPE`: no two in-progress tasks claim the same scope entry.
- `TRANSITIONS`: legal status values per document type.
- `RECONCILIATION`: criterion evidence, reviewed context, status, and outcome agree.
- `REFERENCES`: stale or broken legacy references.

Any violation returns non-zero. Each finding includes category and path. Remediation guidance is in `validator-findings.md`.
