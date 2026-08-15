# Workspace-scoped Feedback Store and CLI

## Status

- `done`
- Last updated: 2026-08-15

## Work Classification

- Class: planned
- Coordination: single-repo
- Reclassified from: not applicable

## Linked Phase

- phase-06-feedback-isolation-and-bridge-hardening.md

## Agent Context

- Skills: workflow-contract
- Proposal: not applicable
- Design docs: docs/design/data/feedback-schema.md, docs/design/interfaces/cli-contract.md
- Constraints: Keep durable state outside git; preserve atomic replacement; keep machine payloads on stdout and diagnostics on stderr.
- Do not touch: `src/core/bridge.ts`, `src/server/index.ts`, `src/client/`, `wc-view Design System/`

## Authority

- Allowed: workspace identity, scoped queue storage, and feedback CLI filters in `src/core/queue.ts` and `src/cli/index.ts`.
- Requires approval: automatic mutation or deletion of the legacy global queue.
- Prohibited: adapter execution in `src/core/bridge.ts`, HTTP/SSE/browser UI, package publish, git push, and GitHub release creation.

## Objective

Persist and query feedback through canonical workspace stores so default CLI operations cannot expose unrelated workspace records.

## Scope Boundary

**In scope:**
- `src/core/queue.ts` and `src/core/queue.test.ts`: workspace identity, storage paths, metadata, scoped records, lock recovery, and explicit read failures.
- `src/cli/index.ts`: workspace, target, session, legacy, and all-workspaces feedback filters; required bridge workspace option plumbing.
- CLI tests dedicated to feedback output and workspace argument validation.

**Out of scope:**
- Adapter process execution and lease renewal in `src/core/bridge.ts`.
- HTTP target derivation, SSE behavior, and browser UI.
- Automatic mutation or deletion of the legacy global queue.

## Acceptance Criteria

- [x] AC-01: `getWorkspaceStore(<path>)` returns the same workspace id for symlink and real paths resolving to the same directory.
- [x] AC-02: New batch records persist under `~/.wc-view/feedback/workspaces/<workspace-id>/queue.jsonl` with workspace, session, and canonical target provenance.
- [x] AC-03: `wc-view feedback --workspace <path>` lists unresolved batches only from that workspace by default.
- [x] AC-04: `--target` and `--session` restrict results to exact canonical target and session matches.
- [x] AC-05: Legacy individual notes appear only when `--legacy` is supplied.
- [x] AC-06: Cross-workspace output requires `--all-workspaces`.
- [x] AC-07: A filesystem read failure exits non-zero and writes a diagnostic to stderr instead of returning an empty result.
- [x] AC-08: A stale lock is recovered only after owner and age validation covered by tests.

## Dependencies

- None recorded.

## Implementation Checklist

- [x] Add canonical workspace identity, metadata, and scoped path helpers.
- [x] Add workspace/session provenance to batches and scoped queue operations.
- [x] Make read and lock failures explicit and test stale-lock recovery.
- [x] Make feedback output batch-aware with workspace, target, session, and legacy filters.
- [x] Add required workspace option plumbing for standalone bridge invocation.
- [x] Add isolated and cross-workspace tests.

## Verification

- Commands: `./node_modules/.bin/tsc --noEmit`; `npm test`; `npm run build`.
- Evidence: recorded under Reconciliation.

## Investigation

- Not applicable: planned work.

## Cross-Repository Coordination

- Not applicable: single-repo work.

## Reconciliation

- Outcome: reconciled-and-verified
- Reviewed revision: 05e949bc3f86
- Environment: local typecheck, Vitest, and production ESM build
- Reviewed at: 2026-08-14T00:00:00Z
- Reviewer: recorded from original task verification during v0.4.0-rc.1 migration

### Acceptance Evidence

| Criterion | Result | Evidence |
|---|---|---|
| AC-01 | pass | 2026-08-14: `npm test` passed 49 tests, including workspace identity coverage |
| AC-02 | pass | 2026-08-14: `npm test` passed 49 tests, including workspace identity coverage |
| AC-03 | pass | 2026-08-14: `npm test` passed 49 tests, including target isolation coverage |
| AC-04 | pass | 2026-08-14: `npm test` passed 49 tests, including target isolation coverage |
| AC-05 | pass | 2026-08-14: `npm test` passed 49 tests, including target isolation coverage |
| AC-06 | pass | 2026-08-14: `npm test` passed 49 tests, including target isolation coverage |
| AC-07 | pass | 2026-08-14: `npm test` passed 49 tests; typecheck exited 0 |
| AC-08 | pass | 2026-08-14: `npm test` passed 49 tests, including workspace identity coverage |

### Alignment

- Design vs implementation: aligned with recorded evidence at 05e949bc3f86
- Planned vs actual scope: no variance recorded
- Documentation drift: none found
- Deferred gaps: none recorded
- Newly discovered decisions: none recorded

### Follow-up

- None.
