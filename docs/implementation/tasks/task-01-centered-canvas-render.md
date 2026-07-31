# Centered Canvas Render

## Status

- `pending`
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

- [ ] Rendered document column width is clamped between `68ch` and `76ch` at all viewport widths ≥ 480px.
- [ ] No sidebar element (left or right) exists in the rendered DOM.
- [ ] Page has zero external CDN script or stylesheet requests (verified via network trace).

## Dependencies

- None.

## Implementation Checklist

- [ ] Choose and wire a Markdown rendering library (no CDN fetch at runtime).
- [ ] Implement centered column layout with `min()`/`clamp()` width constraint.
- [ ] Verify no sidebar markup is present.
- [ ] Verify zero external network requests on load.

## Verification

- Command: Load the rendered page and inspect network requests; measure column width at 480px, 768px, 1440px viewports.
- Evidence: Screenshot or DOM inspection showing column width in `68-76ch` range and zero external requests.
