# Floating Bar States

## Status

- `done`
- Last updated: 2026-08-01

## Linked Phase

- phase-02-floating-bar-composer.md

## Agent Context

- Skills: workflow-contract
- Design docs: docs/design/interfaces/floating-bar-interaction-spec.md, docs/design/product/ux-design-system.md
- Constraints: No persistent sidebar. Bar must never trap focus while collapsed.
- Do not touch: composer/editor internals (task-05), feedback queue persistence (Phase 04, blocked).

## Objective

Implement the floating bottom bar's collapsed and expanded states, including latest-message toast, selection chip badge, and pending-annotation list affordance.

## Scope Boundary

**In scope:**
- Collapsed state: latest agent message/status toast, expandable on click.
- Selection chip badge display (e.g. `[ 🏷️ 3 notes attached ]`).
- Expanded state: full message history access and pending-annotation list.
- Client-side in-memory state only — no persistence to disk in this task.

**Out of scope:**
- Writing to `~/.wc-view/feedback/queue.jsonl` (Phase 04, blocked).
- Annotation anchor extraction (Phase 03, blocked).

## Acceptance Criteria

- [x] Collapsed bar shows only the latest agent message/status by default.
- [x] Clicking the collapsed toast expands to show full message and pending-annotation list.
- [x] Selection chip badge updates its count as annotations are added/removed from the in-memory pending list.
- [x] Expanded bar remains non-modal and does not trap focus.

## Dependencies

- Phase 01 (theme tokens, landmarks) must be in place for styling and focus order.

## Implementation Checklist

- [x] Build collapsed toast component bound to latest message state.
- [x] Build expand/collapse toggle.
- [x] Build pending-annotation list view (in-memory).
- [x] Build selection chip badge counter.
- [x] Verify non-modal focus behavior in both states.

## Verification

- Command: `npm test` (verified via `src/client/components/Components.test.ts`).
- Evidence: FloatingComposer test suite verified chip badge count updates (`🏷️ 1 note attached`), note addition/removal, and non-modal keyboard focus handling.
