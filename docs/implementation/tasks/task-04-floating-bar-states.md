# Floating Bar States

## Status

- `done`
- Last updated: 2026-08-15

## Work Classification

- Class: planned
- Coordination: single-repo
- Reclassified from: not applicable

## Linked Phase

- phase-02-floating-bar-composer.md

## Agent Context

- Skills: workflow-contract
- Proposal: not applicable
- Design docs: docs/design/interfaces/floating-bar-interaction-spec.md, docs/design/product/ux-design-system.md
- Constraints: No persistent sidebar. Bar must never trap focus while collapsed.
- Do not touch: composer/editor internals (task-05), feedback queue persistence (Phase 04).

## Authority

- Allowed: collapsed/expanded floating-bar UI and in-memory pending-annotation list state in `src/client/`.
- Requires approval: persistence to `~/.wc-view/feedback/queue.jsonl` or anchor extraction.
- Prohibited: composer/editor internals, queue persistence, package publish, git push, and GitHub release creation.

## Objective

Implement the floating bottom bar's collapsed and expanded states, including latest-message toast, selection chip badge, and pending-annotation list affordance.

## Scope Boundary

**In scope:**
- Collapsed state: latest agent message/status toast, expandable on click.
- Selection chip badge display (e.g. `[ 🏷️ 3 notes attached ]`).
- Expanded state: full message history access and pending-annotation list.
- Client-side in-memory state only — no persistence to disk in this task.

**Out of scope:**
- Writing to `~/.wc-view/feedback/queue.jsonl` (Phase 04).
- Annotation anchor extraction (Phase 03).

## Acceptance Criteria

- [x] AC-01: Collapsed bar shows only the latest agent message/status by default.
- [x] AC-02: Clicking the collapsed toast expands to show full message and pending-annotation list.
- [x] AC-03: Selection chip badge updates its count as annotations are added/removed from the in-memory pending list.
- [x] AC-04: Expanded bar remains non-modal and does not trap focus.

## Dependencies

- Phase 01 theme tokens and landmarks must be in place for styling and focus order.

## Implementation Checklist

- [x] Build collapsed toast component bound to latest message state.
- [x] Build expand/collapse toggle.
- [x] Build pending-annotation list view (in-memory).
- [x] Build selection chip badge counter.
- [x] Verify non-modal focus behavior in both states.

## Verification

- Command: `npm test` (`src/client/components/Components.test.ts`).
- Evidence: recorded under Reconciliation.

## Investigation

- Not applicable: planned work.

## Cross-Repository Coordination

- Not applicable: single-repo work.

## Reconciliation

- Outcome: reconciled-and-verified
- Reviewed revision: 3ad1fd8c40f6
- Environment: local Vitest
- Reviewed at: 2026-08-01T00:00:00Z
- Reviewer: recorded from original task verification during v0.4.0-rc.1 migration

### Acceptance Evidence

| Criterion | Result | Evidence |
|---|---|---|
| AC-01 | pass | FloatingComposer tests recorded collapsed latest-message toast |
| AC-02 | pass | FloatingComposer tests recorded expand to message and pending-annotation list |
| AC-03 | pass | FloatingComposer tests recorded chip badge count updates (`🏷️ 1 note attached`) on add/remove |
| AC-04 | pass | FloatingComposer tests recorded non-modal keyboard focus handling |

### Alignment

- Design vs implementation: aligned with recorded evidence at 3ad1fd8c40f6
- Planned vs actual scope: no variance recorded
- Documentation drift: none found
- Deferred gaps: none recorded
- Newly discovered decisions: none recorded

### Follow-up

- None.
