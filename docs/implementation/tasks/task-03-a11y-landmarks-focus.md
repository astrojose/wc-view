# A11y Landmarks & Focus Contract

## Status

- `done`
- Last updated: 2026-08-15

## Work Classification

- Class: planned
- Coordination: single-repo
- Reclassified from: not applicable

## Linked Phase

- phase-01-canvas-theme-foundation.md

## Agent Context

- Skills: workflow-contract
- Proposal: not applicable
- Design docs: docs/design/product/ux-design-system.md
- Constraints: WCAG 2.2 AA minimum. Native HTML controls before ARIA. Never convey state by color alone.
- Do not touch: composer/floating bar interaction logic (Phase 02) — this task covers only landmark structure and base focus order.

## Authority

- Allowed: landmark structure, base tab order, reduced-motion rules, focus indicators, and 44px targets for controls introduced here.
- Requires approval: annotation keyboard behavior or `aria-live` status announcements reserved for later phases.
- Prohibited: composer/floating-bar interaction logic, package publish, git push, and GitHub release creation.

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

- [x] AC-01: Document, review queue, composer, and status each expose a distinct native or ARIA landmark role.
- [x] AC-02: Tab order allows reaching and reading the full document without focus entering any review control.
- [x] AC-03: All interactive elements introduced in this task have a visible focus indicator and a minimum 44 CSS-pixel hit target.
- [x] AC-04: Reduced-motion preference disables non-essential transitions/animations.

## Dependencies

- None recorded.

## Implementation Checklist

- [x] Add landmark roles/elements for the four regions.
- [x] Verify tab order via keyboard-only navigation.
- [x] Add `@media (prefers-reduced-motion: reduce)` rules.
- [x] Confirm focus indicator visibility and target sizing.

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
- Reviewer: original verification record migrated to workflow-contract v0.4.0-rc.1

### Acceptance Evidence

| Criterion | Result | Evidence |
|---|---|---|
| AC-01 | pass | Components tests recorded `<main role="main">`, `<footer role="region">`, and `<div role="status">` |
| AC-02 | pass | Keyboard-only navigation recorded document reachability without entering review controls |
| AC-03 | pass | `app.css` recorded 44px min target and visible focus rules |
| AC-04 | pass | `app.css` recorded `@media (prefers-reduced-motion: reduce)` rules |

### Alignment

- Design vs implementation: aligned at 3ad1fd8c40f6
- Planned vs actual scope: no variance recorded
- Documentation drift: none found
- Deferred gaps: none recorded
- Newly discovered decisions: none recorded

### Follow-up

- None.
