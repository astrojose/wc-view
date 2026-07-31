# Composer & Annotation Editor

## Status

- `done`
- Last updated: 2026-08-01

## Linked Phase

- phase-02-floating-bar-composer.md

## Agent Context

- Skills: workflow-contract
- Design docs: docs/design/interfaces/floating-bar-interaction-spec.md, docs/design/product/ux-design-system.md
- Constraints: Composer must never trap focus. Modal dialogs reserved for destructive confirmation only. Announce state changes via `aria-live="polite"`, never by color alone.
- Do not touch: floating bar collapse/expand mechanics (task-04), queue persistence (Phase 04, blocked).

## Objective

Implement the non-modal composer and per-annotation editor, with keyboard-reachable open/close and draft preservation.

## Scope Boundary

**In scope:**
- Composer text input, non-modal behavior, Escape-to-close with draft preservation and focus return.
- Per-annotation editor: Enter/Space to open, remove/edit actions, keyboard navigable list.
- `aria-live="polite"` region for submitted/claimed/response-proposed/orphaned/failed state announcements.
- Destructive-confirmation modal pattern (focus trap, visible Cancel, restore focus) for clearing annotations.

**Out of scope:**
- Actual submission to a persistent queue (Phase 04, blocked).
- Anchor extraction logic (Phase 03, blocked).

## Acceptance Criteria

- [x] Escape closes the composer or an open annotation editor, preserves the current draft, and returns focus to the invoking control.
- [x] Every queued annotation is reachable via keyboard; Enter or Space opens its editor.
- [x] A destructive action (e.g. "clear all annotations") opens a focus-trapping modal with a visible Cancel control and restores focus on close.
- [x] State-change announcements use `aria-live="polite"` and are never conveyed by color alone.

## Dependencies

- task-04-floating-bar-states.md (composer lives within the floating bar's expanded state).

## Implementation Checklist

- [x] Build composer input with non-modal focus behavior.
- [x] Build annotation editor with Enter/Space open, edit/remove actions.
- [x] Wire Escape handling with draft preservation and focus return.
- [x] Add `aria-live="polite"` status region.
- [x] Build destructive-confirmation modal with focus trap and restore.

## Verification

- Command: `npm test` (verified via `src/client/components/Components.test.ts` and `src/client/components/ConfirmDialog.ts`).
- Evidence: StatusRegion `aria-live="polite"` verified; ConfirmDialog modal focus trapping and invoker focus restoration verified.
