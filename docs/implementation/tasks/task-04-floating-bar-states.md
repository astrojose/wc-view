# Floating Bar States

## Status

- `pending`
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

- [ ] Collapsed bar shows only the latest agent message/status by default.
- [ ] Clicking the collapsed toast expands to show full message and pending-annotation list.
- [ ] Selection chip badge updates its count as annotations are added/removed from the in-memory pending list.
- [ ] Expanded bar remains non-modal and does not trap focus.

## Dependencies

- Phase 01 (theme tokens, landmarks) must be in place for styling and focus order.

## Implementation Checklist

- [ ] Build collapsed toast component bound to latest message state.
- [ ] Build expand/collapse toggle.
- [ ] Build pending-annotation list view (in-memory).
- [ ] Build selection chip badge counter.
- [ ] Verify non-modal focus behavior in both states.

## Verification

- Command: Manual interaction pass — add/remove in-memory annotations, toggle expand/collapse, tab through bar in both states.
- Evidence: Recording or step-by-step confirmation that badge count matches pending list and focus never traps.
