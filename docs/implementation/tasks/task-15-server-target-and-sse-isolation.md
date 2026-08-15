# Server Target and SSE Isolation

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
- Design docs: docs/design/interfaces/cli-contract.md, docs/design/data/feedback-schema.md, docs/design/interfaces/floating-bar-interaction-spec.md, docs/design/architecture/wc-view-system-flow.md
- Constraints: Bind only to `127.0.0.1`; treat the durable queue as source of truth and SSE as a browser projection; retain polling as recovery fallback.
- Do not touch: `wc-view Design System/`, export behavior, Markdown rendering and annotation anchoring internals.

## Authority

- Allowed: serve-session identity, validated per-client targets, scoped REST/SSE, and client submission cleanup in `src/server/index.ts` and `src/client/main.ts`.
- Requires approval: new UI visual design or design-system token changes.
- Prohibited: workspace storage internals from task 13, adapter/lease behavior from task 14, `wc-view Design System/` edits, package publish, git push, and GitHub release creation.

## Objective

Derive feedback provenance from validated server context and project only the active target's durable batch state to each browser client.

## Scope Boundary

**In scope:**
- `src/server/index.ts` and `src/cli/cli.test.ts`: serve session identity, validated target selection, batch payload validation, scoped queue integration, direct broadcasts, filesystem wake-up, and polling fallback.
- `src/client/main.ts` and relevant client tests: remove client target authority and consume target-scoped batch snapshots.
- User-facing CLI and README documentation for scoped feedback and bridge commands.

**Out of scope:**
- Workspace storage internals implemented by task 13.
- Adapter execution and lease behavior implemented by task 14.
- New UI visual design or design-system token changes.

## Acceptance Criteria

- [x] AC-01: `POST /api/batches` rejects `filePath`, `workspacePath`, `workspaceId`, and `sessionId` fields supplied by a client.
- [x] AC-02: A created batch contains the server's workspace id, serve session id, and canonical validated target path.
- [x] AC-03: Two clients selecting different documents in one served tree create batches for their own validated targets.
- [x] AC-04: `GET /api/batches` and the initial `/api/events` snapshot return only batches matching the requesting target.
- [x] AC-05: Server-owned transitions broadcast without waiting for the recovery polling interval.
- [x] AC-06: Bridge-owned queue changes reach connected browsers through filesystem wake-up or periodic polling fallback.
- [x] AC-07: An integrated `serve --agent-command` remains HTTP/SSE responsive while adapter work runs.
- [x] AC-08: The client no longer submits `filePath` in a feedback batch.
- [x] AC-09: README examples show workspace-scoped feedback and bridge usage.

## Dependencies

- task-13-workspace-scoped-feedback-store-and-cli.md
- task-14-asynchronous-workspace-bridge.md

## Implementation Checklist

- [x] Generate serve-session identity and initialize the workspace store.
- [x] Replace server-global active target authority with validated per-client target context.
- [x] Derive all batch provenance server-side and reject client authority fields.
- [x] Scope batch REST and SSE reads by validated target.
- [x] Broadcast server writes directly and add filesystem wake-up with polling fallback for bridge writes.
- [x] Remove `filePath` from client submissions and update integration tests.
- [x] Update README command examples and behavior notes.

## Verification

- Commands: `./node_modules/.bin/tsc --noEmit`; `npm test`; `npm run build`; `npm run validate:workflow`; production-built E2E.
- Evidence: recorded under Reconciliation.

## Investigation

- Not applicable: planned work.

## Cross-Repository Coordination

- Not applicable: single-repo work.

## Reconciliation

- Outcome: reconciled-and-verified
- Reviewed revision: 05e949bc3f86
- Environment: local typecheck, Vitest, production ESM build, and production-built E2E
- Reviewed at: 2026-08-14T00:00:00Z
- Reviewer: recorded from original task verification during v0.4.0-rc.1 migration

### Acceptance Evidence

| Criterion | Result | Evidence |
|---|---|---|
| AC-01 | pass | 2026-08-14: `npm test` passed 49 tests, including server-owned provenance and client submission coverage |
| AC-02 | pass | 2026-08-14: `npm test` passed 49 tests, including server-owned provenance |
| AC-03 | pass | 2026-08-14: production-built E2E proved two-target query isolation (`a_one=resolved`, `a_two=queued`, `b_one=queued`) |
| AC-04 | pass | 2026-08-14: `npm test` passed 49 tests, including target-scoped REST/SSE |
| AC-05 | pass | 2026-08-14: `npm test` passed 49 tests, including target-scoped REST/SSE |
| AC-06 | pass | 2026-08-14: `npm test` passed 49 tests, including target-scoped REST/SSE |
| AC-07 | pass | 2026-08-14: production-built E2E proved two-workspace claim isolation while adapter work ran |
| AC-08 | pass | 2026-08-14: `npm test` passed 49 tests, including client submission coverage |
| AC-09 | pass | 2026-08-14: task recorded README examples for workspace-scoped feedback and bridge usage |

### Alignment

- Design vs implementation: aligned with recorded evidence at 05e949bc3f86
- Planned vs actual scope: no variance recorded
- Documentation drift: none found
- Deferred gaps: none recorded
- Newly discovered decisions: none recorded

### Follow-up

- None.
