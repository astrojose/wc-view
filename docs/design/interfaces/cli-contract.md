# wc-view: CLI Contract

## Context

- `wc-view` is an independent Node.js 18+ ESM CLI.
- Terminal agent execution is decoupled from the browser review surface through a local bridge protocol.
- Markdown and HTML source files remain authoritative. Browser feedback and bridge state are unapproved intermediate state.

## Requirements

- `wc-view serve`: render a Markdown or HTML file, or a docs tree, in a loopback-only browser UI.
- `wc-view feedback --unresolved`: pull unresolved legacy feedback items as compact JSON.
- `wc-view bridge --command <command>`: watch durable feedback batches, claim work, invoke an adapter, and persist result state.
- `wc-view gc`: garbage-collect resolved feedback records.
- Machine-readable payloads write only to standard output; diagnostics write only to standard error.
- The server binds exclusively to `127.0.0.1`.

## Decisions

- `serve` may receive `--agent-command <command>` to start one local bridge with the review server.
- The adapter receives the claimed `FeedbackBatch` JSON on standard input and returns its JSON result on standard output.
- The server owns no LLM integration. Harness adapters select, resume, or invoke the active agent session.
- A scratch artifact may be automatically changed by its adapter. Scratch artifacts include workspace-local `.wc-view-scratch*.md` and `.wc-view-scratch*.html` files.
- Dynamic visualization scratch artifacts should prefer styled HTML when the artifact benefits from richer layout, visual hierarchy, or embedded interaction; Markdown remains supported for documentation review.
- The core bridge dispatches protected targets but the adapter contract must return `awaiting_acceptance` rather than mutate them.
- Server-Sent Events replay the current batches at connection time and broadcast durable batch updates afterward.

## Contracts

### Commands

- `wc-view serve [path]`
  - `-p, --port <number>`: default `3456`.
  - `-h, --host <string>`: default `127.0.0.1`; non-loopback hosts are rejected.
  - `--agent-command <command>`: optional local bridge adapter command.
- `wc-view feedback --unresolved [--format <json|toon>]`.
- `wc-view bridge --command <command>`
  - `--interval <ms>`: queue poll interval, default `500`.
  - `--bridge-id <id>`: optional stable bridge identity.
  - `--once`: process at most one batch and exit.
- `wc-view gc [-a, --all] [-d, --days <number>]`.

### HTTP API

- `GET /api/document`: document text, format (`markdown` or `html`), and file metadata.
- `GET /api/feedback`: legacy feedback queue items.
- `POST /api/feedback`: legacy single-note write.
- `GET /api/batches`: current durable feedback batches for the served target.
- `POST /api/batches`: atomically creates one feedback batch. Caller supplies a client-generated idempotency key; a retry returns the original batch state.
- `POST /api/batches/:id/accept`: records explicit human approval for an `awaiting_acceptance` protected batch and requeues it for bridge dispatch.
- `GET /api/events`: SSE stream. Sends `snapshot` on connect and `batch` after every durable batch transition.

### Exit codes

- `0`: clean execution.
- `1`: operational error.
- `2`: invalid CLI usage.

## Acceptance Criteria

- Sending one browser batch creates exactly one `FeedbackBatch`.
- A connected bridge claims and dispatches a new batch without an additional user prompt.
- Browser clients receive current and live batch state through `/api/events`.
- The server rejects non-loopback bindings and requests.
- System-level flow: `docs/design/architecture/wc-view-system-flow.md`.
