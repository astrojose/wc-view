# Phase 04 — Feedback Queue & CLI

## Status

- `blocked`
- Last updated: 2026-08-01

## Objective

- Implement the `wc-view` CLI (`serve`, `feedback --unresolved`, `gc`) and the durable local feedback queue.

## Scope

- `~/.wc-view/feedback/queue.jsonl` read/write.
- `wc-view serve`, `wc-view feedback --unresolved [--format <json|toon|...>]`, `wc-view gc`.
- Localhost bind and concurrent-writer handling.

## Features

- Compact-JSON default feedback payload.
- Deterministic reconcile loop (`unresolved` → `in_progress` → `resolved`, `orphaned`).

## Tasks

- [ ] `task-07-cli-serve.md`
- [ ] `task-08-cli-feedback-gc.md`

## Acceptance Criteria

- [ ] `wc-view feedback --unresolved` returns only `unresolved`-status items as compact JSON by default.
- [ ] Queue file lives under `~/.wc-view/feedback/`, never inside a git-tracked path.

## Blockers

- Blocked on `docs/changes/proposed/wc-view-open-decisions.md` items 2, 3, 4, 5 (gc retention triggers, queue mutation model, localhost trust/concurrency model, single-doc vs. docs-tree navigation).

## Linked Tasks

- task-07-cli-serve.md
- task-08-cli-feedback-gc.md
