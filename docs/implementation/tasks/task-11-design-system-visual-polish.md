# Design-System Visual Polish

## Status

- `done`
- Last updated: 2026-08-01

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

- [x] The document canvas uses the design-system reading measure, typography hierarchy, flat surfaces, and annotation rule behavior.
- [x] Markdown and HTML artifact content receive styled headings, paragraphs, lists, links, tables, blockquotes, and code blocks without requiring artifact-specific CSS.
- [x] Composer, status region, annotation popover, and queue rows use named CSS classes instead of inline layout styles.
- [x] Controls preserve 44px primary targets, visible focus, non-modal composer behavior, and screen-reader status text.
- [x] Built browser smoke confirms no blank page, JavaScript chunks load, document content renders, and no console errors occur on representative Markdown/HTML artifacts.
- [x] `npm test`, `./node_modules/.bin/tsc --noEmit`, `npm run build`, `npm run validate:workflow`, and `git diff --check` exit 0.

## Agent Context

- Skills: workflow-contract
- Design docs: docs/design/product/ux-design-system.md, docs/design/interfaces/floating-bar-interaction-spec.md
- Design-system source: `wc-view Design System/readme.md`, `wc-view Design System/tokens/*.css`, `wc-view Design System/components/**`
- Constraints: No sidebars, no decorative gradients beyond sticky protection fade, no external CDN dependencies, no new icons or image assets.
- Do not touch: package publishing credentials, release tags, external network integrations, `wc-view Design System/`.

## Implementation Checklist

1. Compare production CSS/components against design-system tokens and component guidance.
2. Replace inline component layout styles with named classes.
3. Expand document-content styling for Markdown and HTML artifact readability.
4. Tighten floating composer, queue, status, and annotation popover visuals.
5. Add regression tests for class contracts.
6. Run verification and mark task done.

## Verification

- `./node_modules/.bin/tsc --noEmit` exited 0.
- `npm test` exited 0: 7 test files and 34 tests passed. Vitest still prints a happy-dom Mermaid render warning on stderr, but no test fails.
- `git diff --check` exited 0.
- `npm run build` exited 0.
- Built browser smoke with system Chrome against `http://127.0.0.1:3462` exited clean:
  - Desktop 1280x900: rendered `.wc-view-scratch.html`, `Payment flow review`, table, code block, floating composer, and sticky status region; console errors `[]`; overflow elements `[]`; inline layout styles in composer/popover/dialog `0`; screenshot `/tmp/wc-view-polish-desktop.png`.
  - Mobile 390x844: rendered the same HTML artifact with centered theme/canvas/composer/status measures; compact document filename heading; console errors `[]`; overflow elements `[]`; inline layout styles in composer/popover/dialog `0`; screenshot `/tmp/wc-view-polish-mobile.png`.
