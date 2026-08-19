# Phase 04 — Feedback Queue & CLI

## Status

- `done`
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

- [x] `task-07-cli-serve.md`
- [x] `task-08-cli-feedback-gc.md`

## Acceptance Criteria

- [x] `wc-view feedback --unresolved` returns only `unresolved`-status items as compact JSON by default.
- [x] Queue file lives under `~/.wc-view/feedback/`, never inside a git-tracked path.

## Blockers

- None.

## Linked Tasks

- task-07-cli-serve.md
- task-08-cli-feedback-gc.md
