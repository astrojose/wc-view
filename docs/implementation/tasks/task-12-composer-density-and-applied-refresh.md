# Composer Density and Applied Refresh

## Status

- `done`
- Last updated: 2026-08-01

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

- [x] Floating composer visual rhythm is more compact while preserving 44px control targets.
- [x] A batch with `status: "applied"` for the current document triggers one `/api/document` refresh.
- [x] Repeated snapshots or batch events for the same applied batch do not repeatedly reload the document.
- [x] Batch status remains visible even if a document refresh fails.
- [x] Built CLI `--version` reports the package metadata version instead of a hardcoded older version.
- [x] Typecheck, tests, build, workflow validation, diff check, and rendered smoke pass.

## Verification

- `./node_modules/.bin/tsc --noEmit` exited 0.
- `npm test` exited 0: 8 test files and 35 tests passed. Vitest still prints the existing happy-dom Mermaid render warning on stderr, but no test fails.
- `npm run build` exited 0.
- `node dist/bin/wc-view.js --version` exited 0 with `0.5.1`.
- Published smoke for `npx -y @astrojose/wc-view@0.5.1 --version` returned stale `0.4.0`; the patch release now resolves npm `.bin` symlinks before reading package metadata.
- `npm run validate:workflow` exited 0.
- `git diff --check` exited 0.
- Built browser smoke against `http://127.0.0.1:3463` exited clean for desktop and mobile composer metrics:
  - `.floating-composer-bar` gap `8px`, padding `12px`.
  - `.floating-composer-container` gap `4px`, padding `20px 16px 16px`.
  - Primary buttons remain `44px` tall.
  - No console errors.
