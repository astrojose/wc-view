# Composer & Annotation Editor

## Status

- `pending`
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

- [ ] Escape closes the composer or an open annotation editor, preserves the current draft, and returns focus to the invoking control.
- [ ] Every queued annotation is reachable via keyboard; Enter or Space opens its editor.
- [ ] A destructive action (e.g. "clear all annotations") opens a focus-trapping modal with a visible Cancel control and restores focus on close.
- [ ] State-change announcements use `aria-live="polite"` and are never conveyed by color alone.

## Dependencies

- task-04-floating-bar-states.md (composer lives within the floating bar's expanded state).

## Implementation Checklist

- [ ] Build composer input with non-modal focus behavior.
- [ ] Build annotation editor with Enter/Space open, edit/remove actions.
- [ ] Wire Escape handling with draft preservation and focus return.
- [ ] Add `aria-live="polite"` status region.
- [ ] Build destructive-confirmation modal with focus trap and restore.

## Verification

- Command: Keyboard-only pass through composer and editor; screen reader pass (VoiceOver/NVDA) confirming `aria-live` announcements.
- Evidence: Recording or transcript confirming focus never traps outside the destructive modal, draft persists across Escape, and announcements fire on state change.
