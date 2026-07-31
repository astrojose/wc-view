# Task — Workflow Validation Readiness

## Status

- `in-progress`
- Last updated: 2026-06-15

## Linked Phase

- `Phase 01 — Baseline Foundation`

## Agent Context

- Skills: workflow-contract
- Design docs: docs/design/architecture/system-overview.md
- Constraints: docs changes only; no service code edits
- Do not touch: services/

## Objective

Align implementation artifacts so workflow validation passes consistently.

## Scope Boundary

**In scope:**
- docs/implementation/ — all phase, task, and status files
- .agents/workflows/workflow-contract/repo.config.json

**Out of scope:**
- docs/design/ — no design truth changes
- Service source code

## Acceptance Criteria

- [ ] `python3 .agents/workflows/workflow-contract/scripts/validate_workflow.py` exits with `WORKFLOW:ok`
- [ ] All required section headings are present in every task and phase doc
- [ ] No stale legacy references detected by REFERENCES check

## Dependencies

-

## Implementation Checklist

- [x] Confirm required docs locations and ownership
- [ ] Add missing section headings to implementation docs
- [ ] Re-run workflow validation and capture result

## Verification

- Command: `python3 .agents/workflows/workflow-contract/scripts/validate_workflow.py`
- Evidence: all six validator categories return `ok`
