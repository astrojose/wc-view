# Server Target and SSE Isolation

## Status

- `done`

## Linked Phase

- phase-06-feedback-isolation-and-bridge-hardening.md

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

## Dependencies

- `task-13-workspace-scoped-feedback-store-and-cli.md`
- `task-14-asynchronous-workspace-bridge.md`

## Acceptance Criteria

- `POST /api/batches` rejects `filePath`, `workspacePath`, `workspaceId`, and `sessionId` fields supplied by a client.
- A created batch contains the server's workspace id, serve session id, and canonical validated target path.
- Two clients selecting different documents in one served tree create batches for their own validated targets.
- `GET /api/batches` and the initial `/api/events` snapshot return only batches matching the requesting target.
- Server-owned transitions broadcast without waiting for the recovery polling interval.
- Bridge-owned queue changes reach connected browsers through filesystem wake-up or periodic polling fallback.
- An integrated `serve --agent-command` remains HTTP/SSE responsive while adapter work runs.
- The client no longer submits `filePath` in a feedback batch.
- README examples show workspace-scoped feedback and bridge usage.

## Agent Context

- Skills: workflow-contract
- Design docs: `docs/design/interfaces/cli-contract.md`, `docs/design/data/feedback-schema.md`, `docs/design/interfaces/floating-bar-interaction-spec.md`, `docs/design/architecture/wc-view-system-flow.md`
- Constraints: Bind only to `127.0.0.1`; treat the durable queue as source of truth and SSE as a browser projection; retain polling as recovery fallback.
- Do not touch: `wc-view Design System/`, export behavior, Markdown rendering and annotation anchoring internals.

## Implementation Checklist

1. Generate serve-session identity and initialize the workspace store.
2. Replace server-global active target authority with validated per-client target context.
3. Derive all batch provenance server-side and reject client authority fields.
4. Scope batch REST and SSE reads by validated target.
5. Broadcast server writes directly and add filesystem wake-up with polling fallback for bridge writes.
6. Remove `filePath` from client submissions and update integration tests.
7. Update README command examples and behavior notes.

## Verification

- `./node_modules/.bin/tsc --noEmit` exited 0 on 2026-08-14.
- `npm test` passed 49 tests, including server-owned provenance, target-scoped REST/SSE, and client submission coverage.
- `npm run build` completed the production ESM build.
- `npm run validate:workflow` passed all workflow categories.
- Production-built E2E proved two-workspace claim isolation, two-target query isolation, and protected acceptance; observed statuses were `a_one=resolved`, `a_two=queued`, and `b_one=queued`.
