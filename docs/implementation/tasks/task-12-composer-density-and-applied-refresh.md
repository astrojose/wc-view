# Composer Density and Applied Refresh

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
- Design docs: docs/design/product/ux-design-system.md, docs/design/interfaces/floating-bar-interaction-spec.md, docs/design/interfaces/cli-contract.md
- Constraints: Preserve 44px control targets. No new bridge protocol statuses. No design-system token definition changes.
- Do not touch: server-side agent integration, package release/tag/push/publication, design-system token files.

## Authority

- Allowed: floating-composer spacing in `src/client/styles/app.css`, applied-batch document refresh in `src/client/main.ts`, and CLI version lookup in `src/cli/index.ts`.
- Requires approval: new bridge protocol statuses or server-side agent integration changes.
- Prohibited: package release, tag, push, publication, and design-system token definition changes.

## Objective

Tighten the floating composer proportions, refresh the rendered document when an agent-applied batch changes the served artifact, and fix the CLI version display observed while checking the installed package.

## Scope Boundary

**In scope:**
- `src/client/styles/app.css` spacing for the floating composer container and bar.
- `src/client/main.ts` handling for applied batch events from `/api/events`.
- `src/cli/index.ts` package-version lookup for `wc-view --version`.
- A focused client regression test for one-time document refresh after an applied batch.

**Out of scope:**
- New bridge protocol statuses.
- Server-side agent integration changes.
- Package release, tag, push, or publication.
- Changing design-system token definitions.

## Acceptance Criteria

- [x] AC-01: Floating composer visual rhythm is more compact while preserving 44px control targets.
- [x] AC-02: A batch with `status: "applied"` for the current document triggers one `/api/document` refresh.
- [x] AC-03: Repeated snapshots or batch events for the same applied batch do not repeatedly reload the document.
- [x] AC-04: Batch status remains visible even if a document refresh fails.
- [x] AC-05: Built CLI `--version` reports the package metadata version instead of a hardcoded older version.
- [x] AC-06: Typecheck, tests, build, workflow validation, diff check, and rendered smoke pass.

## Dependencies

- None recorded.

## Implementation Checklist

- [x] Tighten floating composer spacing in `src/client/styles/app.css`.
- [x] Refresh the document once on applied batch events in `src/client/main.ts`.
- [x] Fix CLI `--version` package-metadata lookup in `src/cli/index.ts`.
- [x] Add a focused client regression test for one-time applied refresh.
- [x] Run verification and mark task done.

## Verification

- Commands: `./node_modules/.bin/tsc --noEmit`; `npm test`; `npm run build`; `node dist/bin/wc-view.js --version`; `npm run validate:workflow`; `git diff --check`; built browser smoke.
- Evidence: recorded under Reconciliation.

## Investigation

- Not applicable: planned work.

## Cross-Repository Coordination

- Not applicable: single-repo work.

## Reconciliation

- Outcome: reconciled-and-verified
- Reviewed revision: f9d606c2c56c
- Environment: local typecheck, Vitest, production build, and built browser smoke on 127.0.0.1:3463
- Reviewed at: 2026-08-01T00:00:00Z
- Reviewer: original verification record migrated to workflow-contract v0.4.0-rc.1

### Acceptance Evidence

| Criterion | Result | Evidence |
|---|---|---|
| AC-01 | pass | Smoke recorded `.floating-composer-bar` gap `8px` / padding `12px`, container gap `4px` / padding `20px 16px 16px`, primary buttons `44px` |
| AC-02 | pass | Client regression test recorded one `/api/document` refresh on `status: "applied"` |
| AC-03 | pass | Client regression test recorded no repeated reload for the same applied batch |
| AC-04 | pass | Client tests recorded visible batch status when document refresh fails |
| AC-05 | pass | `node dist/bin/wc-view.js --version` exited 0 with `0.5.1` |
| AC-06 | pass | typecheck, 8 files/35 tests, build, workflow validation, `git diff --check`, and smoke with no console errors |

### Alignment

- Design vs implementation: aligned at f9d606c2c56c
- Planned vs actual scope: no variance recorded
- Documentation drift: published `npx -y @astrojose/wc-view@0.5.1 --version` smoke recorded stale `0.4.0`; patch release later resolved npm `.bin` symlink package-metadata lookup
- Deferred gaps: none recorded
- Newly discovered decisions: none recorded

### Follow-up

- None.
