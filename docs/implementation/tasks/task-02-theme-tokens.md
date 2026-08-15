# Theme Tokens

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
- Constraints: Values must match the design doc palette exactly. No CDN font loading.
- Do not touch: canvas rendering logic (task-01), floating bar (Phase 02).

## Authority

- Allowed: CSS Custom Properties, prefers-color-scheme binding, `[data-theme]` override, and listed typography/geometry tokens.
- Requires approval: any token not listed in `docs/design/product/ux-design-system.md`.
- Prohibited: canvas rendering changes, floating-bar work, external CDN fonts, package publish, git push, and GitHub release creation.

## Objective

Implement dark and light CSS Custom Property theme tokens bound to `@media (prefers-color-scheme)` and a `[data-theme]` override attribute.

## Scope Boundary

**In scope:**
- CSS Custom Properties for both palettes listed in `docs/design/product/ux-design-system.md`.
- `@media (prefers-color-scheme)` binding and `[data-theme="dark"|"light"]` override.
- Typography tokens (`Inter`, `JetBrains Mono`, `Playfair Display`, `0.01em` tracking) and geometry tokens (`0.5rem` radius, `0.25rem` grid, shadow value).

**Out of scope:**
- Annotation highlight indicator styling (task-06).
- Any token not explicitly listed in the design doc.

## Acceptance Criteria

- [x] AC-01: Dark theme tokens match: `#121212` base, `#1C1C1C` surface, `#2C2C2C` border, `#D1CFC0` ring accent, `#F26A4B`/`#D9CFC2`/`#8E8A83` accents.
- [x] AC-02: Light theme tokens match: `#FCFCFC` base, `#FFFFFF` surface, `#E4E4E7` border, `#18181B` ring accent.
- [x] AC-03: Setting `[data-theme="light"]` on the root overrides an OS-level dark preference, and vice versa.
- [x] AC-04: No web font is fetched from an external CDN; `font-display: swap` is set on any `@font-face`.

## Dependencies

- None recorded.

## Implementation Checklist

- [x] Define CSS Custom Properties for both palettes.
- [x] Bind default values to `@media (prefers-color-scheme: dark/light)`.
- [x] Implement `[data-theme]` attribute override with higher specificity than the media query.
- [x] Add typography and geometry tokens.
- [x] Confirm no external font/CDN network requests.

## Verification

- Command: `npm test` (`src/client/components/ThemeToggle.test.ts`).
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
| AC-01 | pass | ThemeToggle suite recorded dark palette token application |
| AC-02 | pass | ThemeToggle suite recorded light palette token application |
| AC-03 | pass | ThemeToggle suite recorded `data-theme` override of OS preference |
| AC-04 | pass | No external font/CDN network requests recorded; `font-display: swap` set on `@font-face` |

### Alignment

- Design vs implementation: aligned with recorded evidence at 3ad1fd8c40f6
- Planned vs actual scope: no variance recorded
- Documentation drift: none found
- Deferred gaps: none recorded
- Newly discovered decisions: none recorded

### Follow-up

- None.
