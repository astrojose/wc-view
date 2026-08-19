# Asynchronous Workspace Bridge

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
- Design docs: docs/design/data/feedback-schema.md, docs/design/interfaces/cli-contract.md, docs/design/architecture/wc-view-system-flow.md
- Constraints: Adapter commands are trusted local processes; document the workflow boundary without claiming OS sandboxing.
- Do not touch: `src/server/index.ts`, `src/client/`, `wc-view Design System/`

## Authority

- Allowed: asynchronous adapter execution, workspace claims, lease renewal, ownership checks, and adapter envelopes in `src/core/bridge.ts`.
- Requires approval: operating-system sandboxing of trusted local adapter commands.
- Prohibited: queue storage layout and feedback listing from task 13, HTTP/SSE/browser components, package publish, git push, and GitHub release creation.

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

## Acceptance Criteria

- [x] AC-01: A bridge claims batches only from its configured workspace store.
- [x] AC-02: Adapter execution does not block a timer scheduled in the same Node.js process.
- [x] AC-03: The bridge renews a working claim before lease expiry until the adapter exits.
- [x] AC-04: A second bridge cannot claim a batch while the first bridge owns a renewed lease.
- [x] AC-05: Only the current claim owner can persist an adapter result.
- [x] AC-06: An unapproved protected envelope is marked proposal-only and omits the canonical writable target contract.
- [x] AC-07: An `applied` adapter result for an unapproved protected batch persists as `awaiting_acceptance`, never `applied`.
- [x] AC-08: Approved protected and scratch envelopes include their canonical target contract.
- [x] AC-09: Non-zero, invalid JSON, lost ownership, and spawn failures persist deterministic failure diagnostics.

## Dependencies

- task-13-workspace-scoped-feedback-store-and-cli.md

## Implementation Checklist

- [x] Replace synchronous adapter execution with asynchronous child-process lifecycle handling.
- [x] Add workspace-specific claim acquisition and owner-checked transitions.
- [x] Renew leases while adapters are running and stop renewal on every exit path.
- [x] Build scratch, approved-protected, and proposal-only adapter envelopes.
- [x] Validate policy-compatible adapter results before persistence.
- [x] Add concurrency, lease, policy, and failure tests.

## Verification

- Commands: `./node_modules/.bin/tsc --noEmit`; `npm test`; production-built E2E.
- Evidence: recorded under Reconciliation.

## Investigation

- Not applicable: planned work.

## Cross-Repository Coordination

- Not applicable: single-repo work.

## Reconciliation

- Outcome: reconciled-and-verified
- Reviewed revision: 05e949bc3f86
- Environment: local typecheck, Vitest, and production-built E2E
- Reviewed at: 2026-08-14T00:00:00Z
- Reviewer: original verification record migrated to workflow-contract v0.4.0-rc.1

### Acceptance Evidence

| Criterion | Result | Evidence |
|---|---|---|
| AC-01 | pass | 2026-08-14: `npm test` passed bridge tests for workspace claims |
| AC-02 | pass | 2026-08-14: `npm test` passed bridge tests for asynchronous execution |
| AC-03 | pass | 2026-08-14: `npm test` passed bridge tests for renewable ownership |
| AC-04 | pass | 2026-08-14: `npm test` passed bridge tests for renewable ownership |
| AC-05 | pass | 2026-08-14: `npm test` passed bridge tests for renewable ownership |
| AC-06 | pass | 2026-08-14: `npm test` passed bridge tests for protected acceptance |
| AC-07 | pass | 2026-08-14: production-built E2E completed protected `awaiting_acceptance` → approval → `resolved` |
| AC-08 | pass | 2026-08-14: `npm test` passed bridge tests for protected acceptance |
| AC-09 | pass | 2026-08-14: `npm test` passed bridge tests for asynchronous execution and protected acceptance |

### Alignment

- Design vs implementation: aligned at 05e949bc3f86
- Planned vs actual scope: no variance recorded
- Documentation drift: none found
- Deferred gaps: none recorded
- Newly discovered decisions: none recorded

### Follow-up

- None.
