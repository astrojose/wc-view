# Automatic Agent Feedback Loop

## Status

- `done`
- Last updated: 2026-08-01

## Linked Phase

- phase-05-automatic-agent-feedback.md

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

- `POST /api/batches` persists one batch containing every submitted note and the prompt.
- `GET /api/events` sends a current batch snapshot followed by batch transition events.
- `wc-view bridge --command <command> --once` claims one queued batch, passes it as JSON on stdin, and records the adapter result.
- A scratch batch can reach `applied`; a protected batch reaches `awaiting_acceptance` when its adapter returns that result.
- The composer does not POST individual notes before batch submit and shows durable status after submission.
- `npm test`, `./node_modules/.bin/tsc --noEmit`, and `npm run validate:workflow` exit 0.

## Agent Context

- Skills: workflow-contract
- Design docs: docs/design/architecture/wc-view-system-flow.md, docs/design/interfaces/cli-contract.md, docs/design/data/feedback-schema.md, docs/design/interfaces/floating-bar-interaction-spec.md, docs/design/product/ux-design-system.md
- Constraints: Preserve loopback-only binding, user-local feedback storage, stdout/stderr discipline, non-modal composer behavior, and protected-target mutation boundary.
- Do not touch: `wc-view Design System/`, external network integrations, package publishing configuration.

## Implementation Checklist

1. Add feedback batch, artifact classification, claim, transition, and result operations with queue tests.
2. Add batch REST endpoints and snapshot/batch SSE events with integration tests.
3. Add command adapter bridge and optional serve startup with machine-readable adapter I/O.
4. Change browser submission to one batch write and render server-streamed work state.
5. Reconcile implementation status and run verification.

## Verification

- Commands: `./node_modules/.bin/tsc --noEmit`; `npm test`; `npm run validate:workflow`; `npm run build`.
- Evidence: 24 Vitest tests passed. Production-built E2E verified `queued` → bridge claim/dispatch → `applied` with adapter result returned through `/api/batches`.
