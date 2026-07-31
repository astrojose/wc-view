# CLI: feedback & gc

## Status

- `done`
- Last updated: 2026-08-01

## Linked Phase

- phase-04-feedback-queue-cli.md

## Agent Context

- Skills: workflow-contract
- Design docs: docs/design/interfaces/cli-contract.md, docs/design/data/feedback-schema.md
- Constraints: Ensure feedback payload defaults to compact JSON on stdout, stderr for diagnostic messages.
- Do not touch: `serve` command (task-07), annotation anchoring (task-06).

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

- [x] `wc-view feedback --unresolved` returns only unresolved feedback items formatted as JSON on `stdout`.
- [x] `wc-view gc` purges resolved feedback entries per retention lifecycle.
- [x] Feedback file is persisted strictly under `~/.wc-view/feedback/queue.jsonl`.

## Dependencies

- None (open decisions 2 and 3 resolved).

## Implementation Checklist

- [x] Implement `src/core/queue.ts` queue manager.
- [x] Wire `feedback` and `gc` commands in `src/cli/index.ts`.
- [x] Add unit tests in `src/core/queue.test.ts` and `src/cli/cli.test.ts`.

## Verification

- Command: `npm test` (verified via `src/core/queue.test.ts` and CLI binary execution).
- Evidence: `node dist/bin/wc-view.js feedback --unresolved` outputs structured JSON on stdout; `node dist/bin/wc-view.js gc` purges items and reports summary on stderr.
