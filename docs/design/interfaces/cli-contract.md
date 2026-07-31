# wc-view: CLI Contract

## Context

- `wc-view` is an independent CLI; terminal agent execution is completely decoupled from the browser review surface.
- New independent repository/package; no changes to the `workflow-contract` runtime.
- Later optional `workflow-contract` skill guidance may invoke `wc-view`; it must not duplicate viewer logic.

## Requirements

- `wc-view serve`: render Markdown files or a `docs/` tree in a lightweight localhost browser UI.
- `wc-view feedback --unresolved [--format <json|toon|...>]`: agent pulls structured, low-token feedback payloads on demand.
- `wc-view gc`: garbage-collect feedback per retention lifecycle.

## Decisions

- Default feedback payload format is compact JSON (see `docs/design/data/feedback-schema.md`).

## Contracts

- Command flags beyond `--unresolved` and `--format` on `feedback`, port/host binding defaults, exit codes, and `gc` retention triggers are not yet defined — see `docs/changes/proposed/wc-view-open-decisions.md`.
- Localhost trust model (loopback-only bind; who may POST feedback) and concurrency handling for simultaneous writers are not yet defined — see `docs/changes/proposed/wc-view-open-decisions.md`.
- Single-document view vs. docs-tree navigation tabs in V1 is not yet defined — see `docs/changes/proposed/wc-view-open-decisions.md`.
- System-level flow: `docs/design/architecture/wc-view-system-flow.md`.

## Acceptance Criteria

- `wc-view serve`, `wc-view feedback --unresolved`, and `wc-view gc` exist as named commands.
- `wc-view feedback --format` supports at least `json` as the default output.
