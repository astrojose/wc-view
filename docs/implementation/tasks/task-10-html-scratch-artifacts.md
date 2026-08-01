# HTML Scratch Artifacts

## Status

- `done`
- Last updated: 2026-08-01

## Objective

Render workspace-local `.wc-view-scratch*.html` artifacts as styled HTML inside `wc-view serve`, while preserving Markdown rendering for existing `.md` documents.

## Scope Boundary

**In scope:**
- `src/server/index.ts` document format detection, directory file selection, static bundled asset serving, and `/api/document` metadata.
- `src/client/main.ts` and `src/client/components/DocCanvas.ts` HTML rendering path.
- `src/core/queue.ts` scratch classification for `.html` scratch artifacts.
- Tests for HTML scratch rendering, artifact classification, and bundled chunk asset delivery.
- Design and implementation documentation reconciliation for the accepted HTML artifact contract.

**Out of scope:**
- New agent or LLM integration.
- Publishing, tagging, or GitHub release creation.
- External CDN dependencies.
- Automatic mutation of protected non-scratch HTML files.

## Acceptance Criteria

- [x] `wc-view serve .wc-view-scratch.html` returns `/api/document` with `format: "html"` and `artifactClass: "scratch"`.
- [x] The browser canvas renders HTML content directly inside the styled wc-view shell instead of parsing it as Markdown.
- [x] `wc-view serve docs/` still serves Markdown files when no HTML scratch file is selected.
- [x] Bundled JavaScript chunk files under `dist/` are served as `text/javascript`, not the HTML shell.
- [x] `npm test`, `./node_modules/.bin/tsc --noEmit`, `npm run build`, and `npm run validate:workflow` exit 0.

## Agent Context

- Skills: workflow-contract
- Design docs: docs/design/interfaces/cli-contract.md, docs/design/architecture/tech-stack.md, docs/design/product/ux-design-system.md
- Constraints: Preserve loopback-only binding, stdout/stderr discipline, user-local feedback storage, and protected-target mutation boundary.
- Do not touch: package publishing credentials, release tags, external network integrations.

## Implementation Checklist

1. Add document-format detection and HTML scratch file classification.
2. Render HTML documents through the existing styled canvas without Markdown parsing.
3. Prefer scratch HTML files when serving a directory; preserve Markdown fallback.
4. Fix bundled chunk static asset serving from package `dist/`.
5. Add or update focused tests.
6. Run verification and update task status.

## Verification

- `./node_modules/.bin/tsc --noEmit` -> exit 0.
- `npm test` -> 7 files, 30 tests passed.
- `npm run build` -> exit 0.
- `npm run validate:workflow` -> STRUCTURE, METADATA, READINESS, SCOPE, TRANSITIONS, REFERENCES, WORKFLOW all ok.
- `node dist/bin/wc-view.js --version` -> `0.4.0`.
- Built smoke: `node dist/bin/wc-view.js serve <temp>/.wc-view-scratch.html --host 127.0.0.1 --port 3460`; `/api/document` returned `format:"html"` and `artifactClass:"scratch"`, `/main.js` and `/chunk-5WRI5ZAA.js` returned `200 text/javascript`, and `/not-real.js` returned non-cacheable `404 text/plain`.
