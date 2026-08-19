# Automatic Agent Feedback Loop

## Status

- `done`
- Last updated: 2026-08-15

## Work Classification

- Class: planned
- Coordination: single-repo
- Reclassified from: not applicable

## Linked Phase

- phase-05-automatic-agent-feedback.md

## Agent Context

- Skills: workflow-contract
- Proposal: not applicable
- Design docs: docs/design/architecture/wc-view-system-flow.md, docs/design/interfaces/cli-contract.md, docs/design/data/feedback-schema.md, docs/design/interfaces/floating-bar-interaction-spec.md, docs/design/product/ux-design-system.md
- Constraints: Preserve loopback-only binding, user-local feedback storage, stdout/stderr discipline, non-modal composer behavior, and protected-target mutation boundary.
- Do not touch: `wc-view Design System/`, external network integrations, package publishing configuration.

## Authority

- Allowed: batch persistence, bridge command, batch HTTP/SSE, and composer atomic submission in the listed source files.
- Requires approval: agent-specific SDK integrations or automatic mutation of non-scratch files.
- Prohibited: `wc-view Design System/` edits, external network integrations, package publishing configuration, git push, and GitHub release creation.

## Objective

Implement durable feedback batches, a command-driven local bridge, and browser-visible automatic work status.

## Scope Boundary

**In scope:**
- `src/core/queue.ts` and `src/core/queue.test.ts` batch persistence, claims, leases, and result transitions.
- `src/server/index.ts` and `src/cli/cli.test.ts` batch HTTP APIs and replayable SSE updates.
- `src/cli/index.ts` bridge command and optional serve bridge startup.
- `src/client/main.ts`, `src/client/components/FloatingComposer.ts`, component tests, and styles for atomic submission and work state.
- `docs/implementation/` phase, task, project, and status reconciliation.

**Out of scope:**
- Agent-specific SDK/API integrations.
- Automatic mutation of non-scratch files.
- Changes to `docs/design/**` beyond the already adopted bridge design.

## Acceptance Criteria

- [x] AC-01: `POST /api/batches` persists one batch containing every submitted note and the prompt.
- [x] AC-02: `GET /api/events` sends a current batch snapshot followed by batch transition events.
- [x] AC-03: `wc-view bridge --command <command> --once` claims one queued batch, passes it as JSON on stdin, and records the adapter result.
- [x] AC-04: A scratch batch can reach `applied`; a protected batch reaches `awaiting_acceptance` when its adapter returns that result.
- [x] AC-05: The composer does not POST individual notes before batch submit and shows durable status after submission.
- [x] AC-06: `npm test`, `./node_modules/.bin/tsc --noEmit`, and `npm run validate:workflow` exit 0.

## Dependencies

- Phases 01-04 complete. Adopted bridge design in the listed design docs.

## Implementation Checklist

- [x] Add feedback batch, artifact classification, claim, transition, and result operations with queue tests.
- [x] Add batch REST endpoints and snapshot/batch SSE events with integration tests.
- [x] Add command adapter bridge and optional serve startup with machine-readable adapter I/O.
- [x] Change browser submission to one batch write and render server-streamed work state.
- [x] Reconcile implementation status and run verification.

## Verification

- Commands: `./node_modules/.bin/tsc --noEmit`; `npm test`; `npm run validate:workflow`; `npm run build`.
- Evidence: recorded under Reconciliation.

## Investigation

- Not applicable: planned work.

## Cross-Repository Coordination

- Not applicable: single-repo work.

## Reconciliation

- Outcome: reconciled-and-verified
- Reviewed revision: d56d9e428422
- Environment: local typecheck, Vitest, production build, and production-built E2E
- Reviewed at: 2026-08-01T00:00:00Z
- Reviewer: original verification record migrated to workflow-contract v0.4.0-rc.1

### Acceptance Evidence

| Criterion | Result | Evidence |
|---|---|---|
| AC-01 | pass | 24 Vitest tests passed, including batch persist of notes and prompt |
| AC-02 | pass | Production-built E2E recorded SSE snapshot then transition events |
| AC-03 | pass | Production-built E2E recorded `queued` → bridge claim/dispatch |
| AC-04 | pass | Production-built E2E recorded `applied` with adapter result through `/api/batches` |
| AC-05 | pass | Composer tests recorded atomic batch submit and durable status |
| AC-06 | pass | typecheck, 24 Vitest tests, and workflow validation exited 0 |

### Alignment

- Design vs implementation: aligned at d56d9e428422
- Planned vs actual scope: no variance recorded
- Documentation drift: none found
- Deferred gaps: none recorded
- Newly discovered decisions: none recorded

### Follow-up

- None.
