# Composer & Annotation Editor

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
- Constraints: Composer must never trap focus. Modal dialogs reserved for destructive confirmation only. Announce state changes via `aria-live="polite"`, never by color alone.
- Do not touch: floating bar collapse/expand mechanics (task-04), queue persistence (Phase 04).

## Authority

- Allowed: non-modal composer, per-annotation editor, `aria-live` status region, and destructive-confirmation modal in `src/client/`.
- Requires approval: persistent queue submission or anchor extraction.
- Prohibited: floating-bar collapse/expand mechanics, queue persistence, package publish, git push, and GitHub release creation.

## Objective

Implement the non-modal composer and per-annotation editor, with keyboard-reachable open/close and draft preservation.

## Scope Boundary

**In scope:**
- Composer text input, non-modal behavior, Escape-to-close with draft preservation and focus return.
- Per-annotation editor: Enter/Space to open, remove/edit actions, keyboard navigable list.
- `aria-live="polite"` region for submitted/claimed/response-proposed/orphaned/failed state announcements.
- Destructive-confirmation modal pattern (focus trap, visible Cancel, restore focus) for clearing annotations.

**Out of scope:**
- Actual submission to a persistent queue (Phase 04).
- Anchor extraction logic (Phase 03).

## Acceptance Criteria

- [x] AC-01: Escape closes the composer or an open annotation editor, preserves the current draft, and returns focus to the invoking control.
- [x] AC-02: Every queued annotation is reachable via keyboard; Enter or Space opens its editor.
- [x] AC-03: A destructive action (e.g. "clear all annotations") opens a focus-trapping modal with a visible Cancel control and restores focus on close.
- [x] AC-04: State-change announcements use `aria-live="polite"` and are never conveyed by color alone.

## Dependencies

- task-04-floating-bar-states.md (composer lives within the floating bar's expanded state).

## Implementation Checklist

- [x] Build composer input with non-modal focus behavior.
- [x] Build annotation editor with Enter/Space open, edit/remove actions.
- [x] Wire Escape handling with draft preservation and focus return.
- [x] Add `aria-live="polite"` status region.
- [x] Build destructive-confirmation modal with focus trap and restore.

## Verification

- Command: `npm test` (`src/client/components/Components.test.ts`, `src/client/components/ConfirmDialog.ts`).
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
| AC-01 | pass | Components tests recorded Escape close, draft preservation, and focus return |
| AC-02 | pass | Components tests recorded keyboard-reachable annotation editors opened with Enter/Space |
| AC-03 | pass | ConfirmDialog tests recorded focus trapping and invoker focus restoration |
| AC-04 | pass | StatusRegion tests recorded `aria-live="polite"` |

### Alignment

- Design vs implementation: aligned with recorded evidence at 3ad1fd8c40f6
- Planned vs actual scope: no variance recorded
- Documentation drift: none found
- Deferred gaps: none recorded
- Newly discovered decisions: none recorded

### Follow-up

- None.
