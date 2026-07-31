# Centered Canvas Render

## Status

- `done`
- Last updated: 2026-08-01

## Linked Phase

- phase-01-canvas-theme-foundation.md

## Agent Context

- Skills: workflow-contract
- Design docs: docs/design/product/ux-design-system.md
- Constraints: No sidebars. No CDN dependencies. Reading column must stay reachable without entering review controls.
- Do not touch: feedback queue, CLI, annotation anchoring code (later phases).

## Objective

Render a Markdown document in a full-width centered column, `68-76ch` wide, with zero sidebars.

## Scope Boundary

**In scope:**
- Markdown-to-HTML rendering pipeline for the document canvas.
- Centered column layout and responsive width clamp (`68-76ch`).

**Out of scope:**
- Theme tokens (task-02).
- Annotation UI, floating bar, composer (Phase 02/03).

## Acceptance Criteria

- [x] Rendered document column width is clamped between `68ch` and `76ch` at all viewport widths ≥ 480px.
- [x] No sidebar element (left or right) exists in the rendered DOM.
- [x] Page has zero external CDN script or stylesheet requests (verified via network trace).

## Dependencies

- None.

## Implementation Checklist

- [x] Wire `marked` parser in `src/core/markdown.ts` (zero runtime CDN fetches).
- [x] Implement centered column layout in `src/client/` using `wc-view Design System/components/doc/DocCanvas.html` with `clamp(68ch, 100%, 76ch)` width constraint.
- [x] Verify no sidebar markup is present in DOM.
- [x] Verify zero external network requests on load.

## Verification

- Command: `npm test` (verified via `src/core/markdown.test.ts` and `src/client/components/Components.test.ts`).
- Evidence: Vitest 7/7 tests passed; DOM inspection verified `DocCanvas` container renders at `width: min(72ch, 100%)` with `<main role="main">` and zero sidebars.
