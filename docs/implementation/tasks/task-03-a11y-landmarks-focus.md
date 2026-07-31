# A11y Landmarks & Focus Contract

## Status

- `done`
- Last updated: 2026-08-01

## Linked Phase

- phase-01-canvas-theme-foundation.md

## Agent Context

- Skills: workflow-contract
- Design docs: docs/design/product/ux-design-system.md
- Constraints: WCAG 2.2 AA minimum. Native HTML controls before ARIA. Never convey state by color alone.
- Do not touch: composer/floating bar interaction logic (Phase 02) — this task covers only landmark structure and base focus order.

## Objective

Establish semantic landmark regions (document, review queue, composer, status) and a base keyboard focus order, with reduced-motion support.

## Scope Boundary

**In scope:**
- Semantic landmark roles/elements for document, review queue, composer, status regions.
- Base tab order: document reachable without entering review controls.
- `@media (prefers-reduced-motion: reduce)` handling.
- Visible focus indicators and 44px minimum pointer targets on any interactive element introduced in this task.

**Out of scope:**
- Annotation-specific keyboard behavior (Enter/Space to open editor) — Phase 02/03.
- `aria-live` status announcements for feedback state changes — Phase 02.

## Acceptance Criteria

- [x] Document, review queue, composer, and status each expose a distinct native or ARIA landmark role.
- [x] Tab order allows reaching and reading the full document without focus entering any review control.
- [x] All interactive elements introduced in this task have a visible focus indicator and a minimum 44 CSS-pixel hit target.
- [x] Reduced-motion preference disables non-essential transitions/animations.

## Dependencies

- None.

## Implementation Checklist

- [x] Add landmark roles/elements for the four regions.
- [x] Verify tab order via keyboard-only navigation.
- [x] Add `@media (prefers-reduced-motion: reduce)` rules.
- [x] Confirm focus indicator visibility and target sizing.

## Verification

- Command: `npm test` (verified via `src/client/components/Components.test.ts`).
- Evidence: Landmark roles (`<main role="main">`, `<footer role="region">`, `<div role="status">`) verified in test suite; 44px min target and `@media (prefers-reduced-motion: reduce)` rules verified in `app.css`.
