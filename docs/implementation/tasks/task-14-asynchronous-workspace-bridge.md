# Asynchronous Workspace Bridge

## Status

- `done`

## Linked Phase

- phase-06-feedback-isolation-and-bridge-hardening.md

## Objective

Dispatch only workspace-scoped batches through a non-blocking adapter process with renewable ownership and proposal-only protected handling.

## Scope Boundary

**In scope:**
- `src/core/bridge.ts` and `src/core/bridge.test.ts`: asynchronous execution, workspace claims, lease renewal, ownership checks, adapter envelopes, and result validation.
- Bridge-specific CLI invocation behavior after task 13 workspace plumbing exists.

**Out of scope:**
- Queue storage layout and feedback listing implemented by task 13.
- HTTP endpoints, SSE delivery, document selection, and browser components.
- Operating-system sandboxing of trusted local adapter commands.

## Dependencies

- `task-13-workspace-scoped-feedback-store-and-cli.md`

## Acceptance Criteria

- A bridge claims batches only from its configured workspace store.
- Adapter execution does not block a timer scheduled in the same Node.js process.
- The bridge renews a working claim before lease expiry until the adapter exits.
- A second bridge cannot claim a batch while the first bridge owns a renewed lease.
- Only the current claim owner can persist an adapter result.
- An unapproved protected envelope is marked proposal-only and omits the canonical writable target contract.
- An `applied` adapter result for an unapproved protected batch persists as `awaiting_acceptance`, never `applied`.
- Approved protected and scratch envelopes include their canonical target contract.
- Non-zero, invalid JSON, lost ownership, and spawn failures persist deterministic failure diagnostics.

## Agent Context

- Skills: workflow-contract
- Design docs: `docs/design/data/feedback-schema.md`, `docs/design/interfaces/cli-contract.md`, `docs/design/architecture/wc-view-system-flow.md`
- Constraints: Adapter commands are trusted local processes; document the workflow boundary without claiming OS sandboxing.
- Do not touch: `src/server/index.ts`, `src/client/`, `wc-view Design System/`

## Implementation Checklist

1. Replace synchronous adapter execution with asynchronous child-process lifecycle handling.
2. Add workspace-specific claim acquisition and owner-checked transitions.
3. Renew leases while adapters are running and stop renewal on every exit path.
4. Build scratch, approved-protected, and proposal-only adapter envelopes.
5. Validate policy-compatible adapter results before persistence.
6. Add concurrency, lease, policy, and failure tests.

## Verification

- `./node_modules/.bin/tsc --noEmit` exited 0 on 2026-08-14.
- `npm test` passed bridge tests for asynchronous execution, renewable ownership, workspace claims, and protected acceptance.
- Production-built E2E completed protected `awaiting_acceptance` → approval → `resolved` handling.
