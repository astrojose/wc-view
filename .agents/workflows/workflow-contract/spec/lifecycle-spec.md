# Lifecycle Spec

## States

1. Idea
2. Proposed
3. Adopted in design
4. Planned in implementation
5. Active implementation
6. Reported status
7. Reconciled completion

## State Movement

- **Idea → Proposed**: create or update proposal doc in `docs/changes/proposed`.
- **Proposed → Adopted**: merge accepted behavior into `docs/design`. Remove from proposed.
- **Adopted → Planned**: update `docs/implementation/project` and phase/task docs.
- **Planned → Active**: task must pass readiness gate before status moves to `in-progress`.
- **Active → Reported**: reflect delivery state in `docs/implementation/status`.
- **Reported → Reconciled**: task must pass completion gate. Ensure design and implementation remain aligned.

## Readiness Gate

A task cannot move to `in-progress` until:

- `Acceptance Criteria` is populated with at least one binary, verifiable condition.
- `Scope Boundary` explicitly states what is in scope and what is out of scope.
- `Agent Context` names the design docs and skills the executing agent must read first.

Enforced by the `READINESS` validator check.

## Completion Gate

A task cannot move to `done` until:

- `Verification` contains command output, test results, or explicit reconciliation evidence — not a placeholder.

Enforced by the `READINESS` validator check.
