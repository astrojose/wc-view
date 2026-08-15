# HTML Artifact Canvas Width

## Status

- `done`
- Last updated: 2026-08-15

## Work Classification

- Class: planned
- Coordination: single-repo
- Reclassified from: not applicable

## Linked Phase

- not applicable (standalone work following adopted proposal `wc-view-html-artifact-canvas-width`)

## Agent Context

- Skills: workflow-contract
- Proposal: adopted into `docs/design/product/ux-design-system.md`
- Design docs: docs/design/product/ux-design-system.md
- Constraints: Markdown measure stays at `68-76ch`; HTML widening is `format`-scoped only; `.theme-toggle` must follow the active canvas width; do not touch the floating composer/action bar.
- Do not touch: `.floating-composer-container`, `.floating-composer-bar`, `.status-region`, composer controls, package publishing, release tags.

## Authority

- Allowed: add a `format`-scoped HTML canvas modifier (e.g. `.doc-canvas.is-html`) and matching `.theme-toggle` alignment in `src/client/styles/app.css`; update `body.has-sidebar .doc-canvas` offset/width pairing for the HTML modifier; add tests for Markdown measure unchanged and HTML measure with and without sidebar.
- Requires approval: changes to Markdown measure, floating composer/action bar, sidebar behavior beyond the offset/width pairing, package publish, git push, GitHub release creation.
- Prohibited: changing Markdown `68-76ch` measure, altering floating composer/action bar layout, sidebar behavior changes beyond the offset/width pairing, external CDN dependencies.

## Objective

HTML artifact canvas renders at ~3/4 of the available content area, sidebar-aware, while Markdown stays at `68-76ch` and the floating composer/action bar is unchanged.

## Scope Boundary

**In scope:**
- `src/client/styles/app.css` `.doc-canvas` width/offset, `.doc-canvas.is-html` modifier, `body.has-sidebar .doc-canvas` offset/width pairing, `.theme-toggle` width alignment.
- `src/client/main.ts` or `src/client/components/DocCanvas.ts` to apply the `is-html` class when `format === "html"`.
- Tests covering Markdown measure unchanged and HTML canvas using the wider formula with and without sidebar.

**Out of scope:**
- Markdown `68-76ch` measure changes.
- Floating composer/action bar changes.
- Sidebar behavior changes beyond the offset/width pairing.
- Package publish, git push, GitHub release creation.
- External CDN dependencies.

## Acceptance Criteria

- [ ] AC-01: A served Markdown document renders `.doc-canvas` at `width: min(var(--measure-doc), calc(100% - (2 * var(--space-6))))` capped at `max-width: var(--measure-doc-max)` (68-76ch), unchanged by the HTML modifier.
- [ ] AC-02: A served HTML scratch artifact (`.wc-view-scratch.html`) renders `.doc-canvas.is-html` at ~3/4 of the available content area with no sidebar present.
- [ ] AC-03: A served HTML document under directory-serve (sidebar open) renders `.doc-canvas.is-html` at ~3/4 of the space remaining after the fixed 17rem `.doc-sidebar`.
- [ ] AC-04: `.theme-toggle` width matches the active `.doc-canvas` width under both Markdown and HTML formats, with and without sidebar.
- [ ] AC-05: `./node_modules/.bin/tsc --noEmit`, `npm test`, `npm run build`, and `npm run validate:workflow` exit 0.

## Dependencies

- `docs/design/product/ux-design-system.md` HTML canvas measure decision (adopted).
- task-10-html-scratch-artifacts.md complete (HTML format detection and rendering path exist).

## Implementation Checklist

- [x] Add `.doc-canvas.is-html` width formula targeting ~3/4 of available content area, capped for line-length comfort.
- [x] Add `body.has-sidebar .doc-canvas.is-html` offset/width pairing keyed to the HTML measure.
- [x] Align `.theme-toggle` width to follow the active canvas (Markdown vs HTML) under both sidebar states.
- [x] Apply the `is-html` class to `.doc-canvas` when the served document `format === "html"`.
- [x] Add tests for Markdown measure unchanged and HTML measure with and without sidebar.
- [x] Run verification and update task status.

## Verification

- Commands: `./node_modules/.bin/tsc --noEmit`; `npm test`; `npm run build`; `npm run validate:workflow`; built smoke serve of a Markdown file, an HTML scratch file, and a directory with sidebar.
- Evidence: recorded under Reconciliation.

## Investigation

- Not applicable: planned work.

## Cross-Repository Coordination

- Not applicable: single-repo work.

## Reconciliation

- Outcome: reconciled-and-verified
- Reviewed revision: 7a77277
- Environment: local typecheck, Vitest, production build, workflow validation, built smoke serve on 127.0.0.1 (ports 3460/3461/3462)
- Reviewed at: 2026-08-15
- Reviewer: agent (mechanical) + user (live visual confirmation requested)

### Acceptance Evidence

| Criterion | Result | Evidence |
|---|---|---|
| AC-01 | pass | Base `.doc-canvas` rule unchanged (`width: min(var(--measure-doc), calc(100% - (2 * var(--space-6))))`, `max-width: var(--measure-doc-max)`); `is-html` only applies when `format==="html"` (unit test `toggles is-html class on the canvas based on document format`); `/api/document?file=readme.md` returns `format=markdown`. |
| AC-02 | pass | `dist/client/main.css` ships `.doc-canvas.is-html { width: min(75%, calc(100% - (2 * var(--space-6)))); max-width: var(--measure-html-max, 90rem); }`; `is-html` applied for HTML format (unit test); single-file HTML serve `/api/document` returns `format=html`. Live visual confirmation requested at http://127.0.0.1:3461/. |
| AC-03 | pass | `dist/client/main.css` ships `body.has-sidebar .doc-canvas.is-html { --html-available: calc(100% - 17rem); width: min(calc(0.75 * var(--html-available)), var(--measure-html-max, 90rem)); margin-left: calc(17rem + (var(--html-available) - ...) / 2); }` (`100%` of body used instead of `100vw` so classic scrollbars do not skew centering); directory serve `/api/document` returns `format=html` with `files` listing (sidebar). Live visual confirmation requested at http://127.0.0.1:3460/. |
| AC-04 | pass | `dist/client/main.css` ships `.theme-toggle.is-html` and `body.has-sidebar .theme-toggle.is-html` with width/margin formulas identical to the matching `.doc-canvas.is-html` rules; `ThemeToggle.setHtmlCanvas` toggles the class (unit test `toggles is-html class on the theme-toggle element`); `ReviewApp.renderDocument` calls `setHtmlCanvas(format === "html")` (unit test `aligns canvas and theme-toggle width with the served document format`). |
| AC-05 | pass | `./node_modules/.bin/tsc --noEmit` exit 0; `npm test` 54/54 passed; `npm run build` success; `npm run validate:workflow` `WORKFLOW:ok`. |

### Alignment

- Design vs implementation: aligned. `docs/design/product/ux-design-system.md` Markdown 68-76ch + HTML ~3/4 sidebar-aware; CSS encodes `min(75%, ...)` (no sidebar) and `min(calc(0.75 * (100vw - 17rem)), ...)` (sidebar) with matching `.theme-toggle` formulas.
- Planned vs actual scope: no variance. CSS width/offset pairing, `is-html` class application, `.theme-toggle` alignment, and tests delivered; floating composer/action bar untouched.
- Documentation drift: none. Design doc updated in the adoption step.
- Deferred gaps: none. Mobile media query updated so `is-html` yields to full width at ≤640px.
- Newly discovered decisions: none.

### Follow-up

- None. User confirmed live visuals on 2026-08-15 (docs directory serve on 3460, HTML scratch artifact on 3461); status flipped to `done`.
