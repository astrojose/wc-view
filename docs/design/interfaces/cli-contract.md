# wc-view: CLI Contract

## Context

- `wc-view` is an independent Node.js 18+ ESM CLI.
- Terminal agent execution is decoupled from the browser review surface through a local bridge protocol.
- Markdown and HTML source files remain authoritative. Browser feedback and bridge state are unapproved intermediate state.

## Requirements

- `wc-view serve`: render a Markdown or HTML file, or a docs tree, in a loopback-only browser UI.
- `wc-view feedback --unresolved`: list unresolved feedback batches and legacy items for one workspace by default.
- `wc-view bridge --workspace <path> --command <command>`: watch one workspace's durable batches, claim work, invoke an adapter, and persist result state.
- `wc-view gc`: garbage-collect resolved feedback records.
- Machine-readable payloads write only to standard output; diagnostics write only to standard error.
- The server binds exclusively to `127.0.0.1`.

## Decisions

- `serve` generates a `sessionId`, resolves a canonical workspace, and may receive `--agent-command <command>` to start one bridge scoped to that workspace.
- A standalone bridge requires `--workspace <path>`.
- The adapter receives one policy-specific batch envelope on standard input and returns its JSON result on standard output.
- An unapproved protected envelope is proposal-only and omits a writable target contract; an approved or scratch envelope includes the canonical target path.
- Adapter execution is asynchronous and renews its claim lease until exit.
- The server owns no LLM integration. Harness adapters select, resume, or invoke the active agent session.
- A scratch artifact may be automatically changed by its adapter. Scratch artifacts include workspace-local `.wc-view-scratch*.md` and `.wc-view-scratch*.html` files.
- Dynamic visualization scratch artifacts should prefer styled HTML when the artifact benefits from richer layout, visual hierarchy, or embedded interaction; Markdown remains supported for documentation review.
- The core bridge dispatches protected targets but the adapter contract must return `awaiting_acceptance` rather than mutate them.
- Server-Sent Events replay current target-scoped batches at connection time and broadcast durable batch updates afterward.
- SSE is not used for bridge dispatch; disconnected bridges recover work from durable workspace queues.
- Server-owned writes broadcast immediately. Filesystem notification may detect bridge writes early; periodic queue polling remains the cross-platform recovery fallback.

## Contracts

### Commands

- `wc-view serve [path]`
  - `-p, --port <number>`: default `3456`.
  - `-h, --host <string>`: default `127.0.0.1`; non-loopback hosts are rejected.
  - `--agent-command <command>`: optional local bridge adapter command.
- `wc-view feedback --unresolved [--format <json|toon|markdown>]`
  - `--workspace <path>`: workspace scope; defaults to the canonical current directory.
  - `--target <path>`: optional canonical target filter inside the selected workspace.
  - `--session <id>`: optional originating serve-session filter.
  - `--legacy`: include unresolved legacy individual notes.
  - `--all-workspaces`: explicitly list records across known workspace stores.
- `wc-view bridge --workspace <path> --command <command>`
  - `--interval <ms>`: recovery poll interval.
  - `--bridge-id <id>`: optional stable bridge identity.
  - `--once`: process at most one workspace-scoped batch and exit.
- `wc-view gc [-a, --all] [-d, --days <number>]`.

### HTTP API

- `GET /api/document`: document text, format (`markdown` or `html`), and file metadata.
- `GET /api/feedback`: legacy feedback queue items.
- `POST /api/feedback`: legacy single-note write.
- `GET /api/batches`: current durable feedback batches for the served target.
- `POST /api/batches`: atomically creates one feedback batch for the server-validated active target. Caller supplies a client-generated idempotency key, prompt, and notes; caller-supplied workspace or target paths are rejected. A retry returns the original batch state.
- `POST /api/batches/:id/accept`: records explicit human approval for an `awaiting_acceptance` protected batch and requeues it for bridge dispatch.
- `GET /api/events`: SSE stream. Sends `snapshot` on connect and `batch` after every durable batch transition.

### Exit codes

- `0`: clean execution.
- `1`: operational error.
- `2`: invalid CLI usage.

## Acceptance Criteria

- Sending one browser batch creates exactly one server-scoped `FeedbackBatch`.
- `wc-view feedback` excludes unrelated workspaces unless `--all-workspaces` is supplied.
- A connected bridge claims and dispatches only batches from its configured workspace without an additional user prompt.
- Browser clients receive current and live target-scoped batch state through `/api/events`.
- The server rejects non-loopback bindings and requests.
- System-level flow: `docs/design/architecture/wc-view-system-flow.md`.
