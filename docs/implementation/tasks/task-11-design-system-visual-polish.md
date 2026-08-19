# Design-System Visual Polish

## Status

- `done`
- Last updated: 2026-08-15

## Work Classification

- Class: planned
- Coordination: single-repo
- Reclassified from: not applicable

## Linked Phase

- not applicable (standalone work after Phase 05)

## Agent Context

- Skills: workflow-contract
- Proposal: not applicable
- Design docs: docs/design/product/ux-design-system.md, docs/design/interfaces/floating-bar-interaction-spec.md
- Constraints: No sidebars, no decorative gradients beyond sticky protection fade, no external CDN dependencies, no new icons or image assets.
- Do not touch: package publishing credentials, release tags, external network integrations, `wc-view Design System/`.

## Authority

- Allowed: production CSS and named-class markup cleanup in `src/client/styles/app.css`, `FloatingComposer.ts`, and `AnnotationEditor.ts`.
- Requires approval: new product flows, routes, or persistence behavior.
- Prohibited: changing `wc-view Design System/` source assets, publishing, tagging, pushing, creating a release, and adding external CDN/runtime dependencies.

## Objective

Bring the production review surface closer to `wc-view Design System/` for document typography, annotation affordances, floating controls, and generated HTML artifact readability.

## Scope Boundary

**In scope:**
- `src/client/styles/app.css` visual styling for document content, HTML artifacts, code, tables, composer, status region, annotation popover, and responsive behavior.
- `src/client/components/FloatingComposer.ts` and `src/client/components/AnnotationEditor.ts` markup class cleanup where inline layout styles block design-system styling.
- Component tests that protect the class contract and avoid inline layout regressions.
- Build smoke checks against a representative `.wc-view-scratch.html` artifact.
- Implementation task/project reconciliation.

**Out of scope:**
- New product flows, new routes, or new persistence behavior.
- Changing `wc-view Design System/` source assets.
- Publishing, tagging, pushing, or creating a release.
- Adding external CDN/runtime dependencies.

## Acceptance Criteria

- [x] AC-01: The document canvas uses the design-system reading measure, typography hierarchy, flat surfaces, and annotation rule behavior.
- [x] AC-02: Markdown and HTML artifact content receive styled headings, paragraphs, lists, links, tables, blockquotes, and code blocks without requiring artifact-specific CSS.
- [x] AC-03: Composer, status region, annotation popover, and queue rows use named CSS classes instead of inline layout styles.
- [x] AC-04: Controls preserve 44px primary targets, visible focus, non-modal composer behavior, and screen-reader status text.
- [x] AC-05: Built browser smoke confirms no blank page, JavaScript chunks load, document content renders, and no console errors occur on representative Markdown/HTML artifacts.
- [x] AC-06: `npm test`, `./node_modules/.bin/tsc --noEmit`, `npm run build`, `npm run validate:workflow`, and `git diff --check` exit 0.

## Dependencies

- task-10-html-scratch-artifacts.md.

## Implementation Checklist

- [x] Compare production CSS/components against design-system tokens and component guidance.
- [x] Replace inline component layout styles with named classes.
- [x] Expand document-content styling for Markdown and HTML artifact readability.
- [x] Tighten floating composer, queue, status, and annotation popover visuals.
- [x] Add regression tests for class contracts.
- [x] Run verification and mark task done.

## Verification

- Commands: `./node_modules/.bin/tsc --noEmit`; `npm test`; `git diff --check`; `npm run build`; built browser smoke.
- Evidence: recorded under Reconciliation.

## Investigation

- Not applicable: planned work.

## Cross-Repository Coordination

- Not applicable: single-repo work.

## Reconciliation

- Outcome: reconciled-and-verified
- Reviewed revision: 18d21d4b215c
- Environment: local typecheck, Vitest, production build, and system Chrome smoke on 127.0.0.1:3462
- Reviewed at: 2026-08-01T00:00:00Z
- Reviewer: original verification record migrated to workflow-contract v0.4.0-rc.1

### Acceptance Evidence

| Criterion | Result | Evidence |
|---|---|---|
| AC-01 | pass | Desktop/mobile smoke recorded design-system reading measure and typography on the canvas |
| AC-02 | pass | Smoke recorded styled table, code block, and HTML artifact content without artifact-specific CSS |
| AC-03 | pass | Smoke recorded `0` inline layout styles in composer/popover/dialog |
| AC-04 | pass | Tests and smoke recorded 44px targets, visible focus, and non-modal composer |
| AC-05 | pass | Chrome smoke on 1280x900 and 390x844 recorded rendered artifact, console errors `[]`, overflow `[]` |
| AC-06 | pass | typecheck, 7 files/34 tests, build, `git diff --check` exited 0 |

### Alignment

- Design vs implementation: aligned at 18d21d4b215c
- Planned vs actual scope: no variance recorded
- Documentation drift: constraint "no sidebars" later diverged in directory-serve; resolved by task-16 HTML canvas width adoption.
- Deferred gaps: none recorded
- Newly discovered decisions: none recorded at original completion

### Follow-up

- None.
