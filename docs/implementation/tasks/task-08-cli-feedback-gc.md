# CLI: feedback & gc

## Status

- `done`
- Last updated: 2026-08-15

## Work Classification

- Class: planned
- Coordination: single-repo
- Reclassified from: not applicable

## Linked Phase

- phase-04-feedback-queue-cli.md

## Agent Context

- Skills: workflow-contract
- Proposal: not applicable
- Design docs: docs/design/interfaces/cli-contract.md, docs/design/data/feedback-schema.md
- Constraints: Ensure feedback payload defaults to compact JSON on stdout, stderr for diagnostic messages.
- Do not touch: `serve` command (task-07), annotation anchoring (task-06).

## Authority

- Allowed: `wc-view feedback` and `wc-view gc` plus queue manager read/write/gc on `~/.wc-view/feedback/queue.jsonl`.
- Requires approval: changing stdout/stderr payload discipline or moving the queue into the git tree.
- Prohibited: serve command changes, anchoring, package publish, git push, and GitHub release creation.

## Objective

Implement `wc-view feedback --unresolved [--format ...]` and `wc-view gc` against the `~/.wc-view/feedback/queue.jsonl` store.

## Scope Boundary

**In scope:**
- CLI feedback and gc commands execution.
- Queue manager handling read, write, and garbage collection on user-local queue.jsonl.

**Out of scope:**
- Browser DOM anchor resolver logic.
- HTTP server binding logic.

## Acceptance Criteria

- [x] AC-01: `wc-view feedback --unresolved` returns only unresolved feedback items formatted as JSON on `stdout`.
- [x] AC-02: `wc-view gc` purges resolved feedback entries per retention lifecycle.
- [x] AC-03: Feedback file is persisted strictly under `~/.wc-view/feedback/queue.jsonl`.

## Dependencies

- Queue mutation and `gc` retention are adopted in `docs/design/data/feedback-schema.md` and `docs/design/interfaces/cli-contract.md`.

## Implementation Checklist

- [x] Implement `src/core/queue.ts` queue manager.
- [x] Wire `feedback` and `gc` commands in `src/cli/index.ts`.
- [x] Add unit tests in `src/core/queue.test.ts` and `src/cli/cli.test.ts`.

## Verification

- Command: `npm test` (`src/core/queue.test.ts` and CLI binary execution).
- Evidence: recorded under Reconciliation.

## Investigation

- Not applicable: planned work.

## Cross-Repository Coordination

- Not applicable: single-repo work.

## Reconciliation

- Outcome: reconciled-and-verified
- Reviewed revision: ee08c82e802c
- Environment: local Vitest and built CLI
- Reviewed at: 2026-08-01T00:00:00Z
- Reviewer: original verification record migrated to workflow-contract v0.4.0-rc.1

### Acceptance Evidence

| Criterion | Result | Evidence |
|---|---|---|
| AC-01 | pass | `node dist/bin/wc-view.js feedback --unresolved` recorded structured JSON on stdout |
| AC-02 | pass | `node dist/bin/wc-view.js gc` recorded purge summary on stderr |
| AC-03 | pass | Queue manager tests recorded persistence under `~/.wc-view/feedback/queue.jsonl` |

### Alignment

- Design vs implementation: aligned at ee08c82e802c
- Planned vs actual scope: no variance recorded
- Documentation drift: none found
- Deferred gaps: none recorded
- Newly discovered decisions: none recorded

### Follow-up

- None.
