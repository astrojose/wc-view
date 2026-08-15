# HTML Scratch Artifacts

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
- Design docs: docs/design/interfaces/cli-contract.md, docs/design/architecture/tech-stack.md, docs/design/product/ux-design-system.md
- Constraints: Preserve loopback-only binding, stdout/stderr discipline, user-local feedback storage, and protected-target mutation boundary.
- Do not touch: package publishing credentials, release tags, external network integrations.

## Authority

- Allowed: document format detection, HTML scratch rendering, scratch classification, and bundled chunk asset serving in the listed source files.
- Requires approval: automatic mutation of protected non-scratch HTML files.
- Prohibited: new agent/LLM integration, publishing, tagging, GitHub release creation, and external CDN dependencies.

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

- [x] AC-01: `wc-view serve .wc-view-scratch.html` returns `/api/document` with `format: "html"` and `artifactClass: "scratch"`.
- [x] AC-02: The browser canvas renders HTML content directly inside the styled wc-view shell instead of parsing it as Markdown.
- [x] AC-03: `wc-view serve docs/` still serves Markdown files when no HTML scratch file is selected.
- [x] AC-04: Bundled JavaScript chunk files under `dist/` are served as `text/javascript`, not the HTML shell.
- [x] AC-05: `npm test`, `./node_modules/.bin/tsc --noEmit`, `npm run build`, and `npm run validate:workflow` exit 0.

## Dependencies

- Phase 05 complete.

## Implementation Checklist

- [x] Add document-format detection and HTML scratch file classification.
- [x] Render HTML documents through the existing styled canvas without Markdown parsing.
- [x] Prefer scratch HTML files when serving a directory; preserve Markdown fallback.
- [x] Fix bundled chunk static asset serving from package `dist/`.
- [x] Add or update focused tests.
- [x] Run verification and update task status.

## Verification

- Commands: `./node_modules/.bin/tsc --noEmit`; `npm test`; `npm run build`; `npm run validate:workflow`; built smoke serve.
- Evidence: recorded under Reconciliation.

## Investigation

- Not applicable: planned work.

## Cross-Repository Coordination

- Not applicable: single-repo work.

## Reconciliation

- Outcome: reconciled-and-verified
- Reviewed revision: 18d21d4b215c
- Environment: local typecheck, Vitest, production build, and built smoke on 127.0.0.1:3460
- Reviewed at: 2026-08-01T00:00:00Z
- Reviewer: recorded from original task verification during v0.4.0-rc.1 migration

### Acceptance Evidence

| Criterion | Result | Evidence |
|---|---|---|
| AC-01 | pass | Built smoke `/api/document` returned `format:"html"` and `artifactClass:"scratch"` |
| AC-02 | pass | Built smoke rendered HTML scratch inside the styled shell |
| AC-03 | pass | Directory serve preserved Markdown when no HTML scratch was selected |
| AC-04 | pass | `/main.js` and `/chunk-5WRI5ZAA.js` returned `200 text/javascript`; `/not-real.js` returned non-cacheable `404 text/plain` |
| AC-05 | pass | typecheck, 7 files/30 tests, build, and workflow validation exited 0; CLI version recorded `0.4.0` |

### Alignment

- Design vs implementation: aligned with recorded evidence at 18d21d4b215c
- Planned vs actual scope: no variance recorded
- Documentation drift: HTML canvas still uses the Markdown 68-76ch measure; unresolved in `docs/changes/proposed/wc-view-html-artifact-canvas-width.md`
- Deferred gaps: HTML artifact canvas width remains proposed
- Newly discovered decisions: none recorded at original completion

### Follow-up

- None.
