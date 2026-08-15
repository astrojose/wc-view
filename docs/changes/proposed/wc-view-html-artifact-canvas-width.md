# wc-view: HTML Artifact Canvas Width

## Status

proposed

## Context

- `.doc-canvas` (`src/client/styles/app.css`) renders Markdown and HTML with the same width formula: `width: min(var(--measure-doc), calc(100% - (2 * var(--space-6))))`, capped at `max-width: var(--measure-doc-max)` (76ch, ~600px).
- That 68-76ch measure is accepted design truth for Markdown prose (`docs/design/product/ux-design-system.md`, `docs/implementation/tasks/task-01-centered-canvas-render.md`).
- The served page already knows document `format` (`"markdown" | "html"`) at render time via `src/server/index.ts` → `main.ts renderDocument()`.
- Reviewer feedback on a served HTML scratch artifact (`.wc-view-scratch.html`) called the canvas thin and its contents overly compressed, and asked to widen it without changing the floating composer/action bar.
- Directory-serve already ships `.doc-sidebar` (17rem, fixed) with `body.has-sidebar .doc-canvas { margin-left: max(18rem, calc(50vw - var(--measure-doc-max) / 2)); }`. That contradicts the still-unreconciled "no persistent sidebar" line in `ux-design-system.md`. Any width-formula change touches the same lines; this proposal does not otherwise resolve sidebar behavior.

## Problem

The prose reading measure (68-76ch) is correct for Markdown and wrong for visually dense HTML artifacts. Applying the same cap to both leaves HTML artifacts compressed.

## Proposed Change

1. Scope the width change to HTML documents only, via a `format`-scoped modifier (e.g. `.doc-canvas.is-html`). Markdown keeps 68-76ch. HTML targets roughly 3/4 of the available content area.
2. Define available content area relative to the sidebar, not the raw viewport:
   - No sidebar (single-file serve): ~3/4 of the full viewport width.
   - Sidebar open (directory-serve): ~3/4 of the space remaining after the fixed 17rem sidebar.
3. Update the sidebar offset formula in the same edit. `body.has-sidebar .doc-canvas` `margin-left` is keyed to `--measure-doc-max`; an HTML-scoped wide canvas needs its own offset/width pairing.
4. Keep `.theme-toggle` aligned with `.doc-canvas`; it must widen with any HTML-scoped modifier.
5. Do not touch the floating composer/action bar.
6. When adopted into `docs/design/product/ux-design-system.md`, update the stale "no persistent sidebar" line to match the sidebar that already ships.

## Decision Required

- Accept an HTML-only wider canvas (~3/4 of available content area, sidebar-aware) while Markdown stays at 68-76ch.
- Accept that adopting this change also updates the design-doc sidebar statement to match directory-serve.

## Approval Boundary

- Authorizes: HTML-scoped canvas width, matching theme-toggle alignment, sidebar offset pairing for the HTML modifier, and the design-doc sidebar wording update named above.
- Does not authorize: Markdown measure changes, floating composer/action bar changes, sidebar behavior changes beyond the offset/width pairing, package publish, git push, or GitHub release creation.

## Expected Design Impact

- Update `docs/design/product/ux-design-system.md` canvas measure for HTML artifacts and the persistent-sidebar statement.

## Expected Implementation Impact

- CSS width/offset pairing for `.doc-canvas.is-html` (or equivalent) and aligned `.theme-toggle`.
- Tests covering Markdown measure unchanged and HTML canvas using the wider formula with and without sidebar.
