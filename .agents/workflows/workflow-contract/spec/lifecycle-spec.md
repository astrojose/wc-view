# Lifecycle Spec

## States

1. Idea
2. Proposed
3. Adopted in design
4. Planned in implementation
5. Active implementation
6. Review
7. Reconciled completion or cancellation

## State Movement

- **Idea → Proposed**: create or update proposal doc in `docs/changes/proposed`.
- **Proposed → Adopted**: merge accepted behavior into `docs/design`. Remove from proposed.
- **Adopted → Planned**: update `docs/implementation/project` and phase/task docs.
- **Planned → Active**: task must pass readiness gate before status moves to `in-progress`.
- **Active → Review**: stop mutation and compare output, evidence, scope, and design.
- **Review → Active**: return failed acceptance checks or unfinished implementation to `in-progress`.
- **Review → Blocked**: record incomplete proof, design drift, or a required decision.
- **Review → Reconciled**: use `done` only with `reconciled-and-verified`.
- **Any non-terminal state → Cancelled**: use `cancelled` only with `reverted` or `superseded`.

## Mode And Class Movement

- Mode and work class are operating context, not lifecycle states or task statuses.
- `decision` work remains in Thinking until explicit acceptance updates design; then reclassify it as `planned`.
- `incident` work begins in Investigation and moves from evidence to `direct`, `planned`, `decision`, or `blocked`.
- Investigation may return to Thinking whenever evidence exposes an unresolved behavior decision.
- Execution may return to Thinking whenever the required change exceeds accepted behavior or material scope.
- Review may return work to Thinking, Investigation, or Execution; it cannot approve new behavior.

## Readiness Gate

A task cannot move to `in-progress` until:

- `Acceptance Criteria` is populated with at least one binary, verifiable condition.
- `Scope Boundary` explicitly states what is in scope and what is out of scope.
- `Authority` states allowed actions, approval gates, and prohibited actions.
- `Agent Context` names the design docs and skills the executing agent must read first for `planned` work.
- its class permits the target status and any class-specific context is populated.

Enforced mechanically by the `READINESS` validator check.

This gate applies to `planned` work. `direct` work may use `Task status: not applicable` in the visible protocol and must declare objective, scope, authority, acceptance criteria, and verification without creating a persistent task.

## Completion Gate

A task cannot move to `done` until:

- every acceptance criterion has one `pass` result with non-placeholder evidence;
- `Reconciliation` records the reviewed revision and environment;
- the outcome is `reconciled-and-verified`;
- design, implementation, scope, and documentation are reconciled.

`done` is terminal. `cancelled` is terminal and requires `reverted` or `superseded`.

Enforced by the `RECONCILIATION` validator check.

## Reconciliation Outcomes

| Outcome | Status | Required action |
|---|---|---|
| `reconciled-and-verified` | `done` | None |
| `implemented-unverified` | `blocked` | Obtain missing proof |
| `design-drift` | `blocked` | Align implementation or create a proposal |
| `decision-required` | `blocked` | Return to Thinking and create or update a proposal |
| `reverted` | `cancelled` | Verify the prior state was restored |
| `superseded` | `cancelled` | Link the replacement task or design |

A failed acceptance check returns the task to `in-progress`; it is not a reconciliation outcome.
