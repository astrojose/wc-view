# Workspace-scoped Feedback Store and CLI

## Status

- `done`

## Linked Phase

- phase-06-feedback-isolation-and-bridge-hardening.md

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

## Dependencies

- None.

## Acceptance Criteria

- `getWorkspaceStore(<path>)` returns the same workspace id for symlink and real paths resolving to the same directory.
- New batch records persist under `~/.wc-view/feedback/workspaces/<workspace-id>/queue.jsonl` with workspace, session, and canonical target provenance.
- `wc-view feedback --workspace <path>` lists unresolved batches only from that workspace by default.
- `--target` and `--session` restrict results to exact canonical target and session matches.
- Legacy individual notes appear only when `--legacy` is supplied.
- Cross-workspace output requires `--all-workspaces`.
- A filesystem read failure exits non-zero and writes a diagnostic to stderr instead of returning an empty result.
- A stale lock is recovered only after owner and age validation covered by tests.

## Agent Context

- Skills: workflow-contract
- Design docs: `docs/design/data/feedback-schema.md`, `docs/design/interfaces/cli-contract.md`
- Constraints: Keep durable state outside git; preserve atomic replacement; keep machine payloads on stdout and diagnostics on stderr.
- Do not touch: `src/core/bridge.ts`, `src/server/index.ts`, `src/client/`, `wc-view Design System/`

## Implementation Checklist

1. Add canonical workspace identity, metadata, and scoped path helpers.
2. Add workspace/session provenance to batches and scoped queue operations.
3. Make read and lock failures explicit and test stale-lock recovery.
4. Make feedback output batch-aware with workspace, target, session, and legacy filters.
5. Add required workspace option plumbing for standalone bridge invocation.
6. Add isolated and cross-workspace tests.

## Verification

- `./node_modules/.bin/tsc --noEmit` exited 0 on 2026-08-14.
- `npm test` passed 49 tests, including workspace identity and target isolation coverage.
- `npm run build` completed the production ESM build.
