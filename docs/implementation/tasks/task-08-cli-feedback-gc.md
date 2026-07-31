# CLI: feedback & gc

## Status

- `blocked`
- Last updated: 2026-08-01

## Linked Phase

- phase-04-feedback-queue-cli.md

## Agent Context

- Skills: workflow-contract
- Design docs: docs/design/interfaces/cli-contract.md, docs/design/data/feedback-schema.md
- Constraints: Do not resolve the queue mutation model or gc retention triggers unilaterally — they must be accepted in `docs/changes/proposed/wc-view-open-decisions.md` first.
- Do not touch: `serve` command (task-07), annotation anchoring (task-06).

## Objective

Implement `wc-view feedback --unresolved [--format ...]` and `wc-view gc` against the `~/.wc-view/feedback/queue.jsonl` store.

## Scope Boundary

**In scope:**
- `feedback` and `gc` commands per `docs/design/interfaces/cli-contract.md`.
- Queue read/write against `~/.wc-view/feedback/queue.jsonl`.

**Out of scope:**
- `serve` command (task-07, blocked).
- Anchor resolution (task-06, blocked).

## Acceptance Criteria

- [ ] Blocked — cannot be finalized until `docs/changes/proposed/wc-view-open-decisions.md` items 2 (gc retention triggers) and 3 (queue mutation model) are resolved and reflected in `docs/design/interfaces/cli-contract.md` and `docs/design/data/feedback-schema.md`.

## Dependencies

- `docs/changes/proposed/wc-view-open-decisions.md` (items 2 and 3).

## Implementation Checklist

- [ ] Blocked pending open decision resolution — do not begin implementation.

## Verification

- Command: Not applicable until unblocked.
- Evidence: Not applicable until unblocked.
