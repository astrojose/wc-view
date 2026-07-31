# Theme Tokens

## Status

- `done`
- Last updated: 2026-08-01

## Linked Phase

- phase-01-canvas-theme-foundation.md

## Agent Context

- Skills: workflow-contract
- Design docs: docs/design/product/ux-design-system.md
- Constraints: Values must match the design doc palette exactly. No CDN font loading.
- Do not touch: canvas rendering logic (task-01), floating bar (Phase 02).

## Objective

Implement dark and light CSS Custom Property theme tokens bound to `@media (prefers-color-scheme)` and a `[data-theme]` override attribute.

## Scope Boundary

**In scope:**
- CSS Custom Properties for both palettes listed in `docs/design/product/ux-design-system.md`.
- `@media (prefers-color-scheme)` binding and `[data-theme="dark"|"light"]` override.
- Typography tokens (`Inter`, `JetBrains Mono`, `Playfair Display`, `0.01em` tracking) and geometry tokens (`0.5rem` radius, `0.25rem` grid, shadow value).

**Out of scope:**
- Annotation highlight indicator styling (task-06, blocked on anchoring).
- Any token not explicitly listed in the design doc.

## Acceptance Criteria

- [x] Dark theme tokens match: `#121212` base, `#1C1C1C` surface, `#2C2C2C` border, `#D1CFC0` ring accent, `#F26A4B`/`#D9CFC2`/`#8E8A83` accents.
- [x] Light theme tokens match: `#FCFCFC` base, `#FFFFFF` surface, `#E4E4E7` border, `#18181B` ring accent.
- [x] Setting `[data-theme="light"]` on the root overrides an OS-level dark preference, and vice versa.
- [x] No web font is fetched from an external CDN; `font-display: swap` is set on any `@font-face`.

## Dependencies

- None.

## Implementation Checklist

- [x] Define CSS Custom Properties for both palettes.
- [x] Bind default values to `@media (prefers-color-scheme: dark/light)`.
- [x] Implement `[data-theme]` attribute override with higher specificity than the media query.
- [x] Add typography and geometry tokens.
- [x] Confirm no external font/CDN network requests.

## Verification

- Command: `npm test` (verified via `src/client/components/ThemeToggle.test.ts`).
- Evidence: ThemeToggle test suite verified `data-theme` attribute application and CSS token toggle behavior.
