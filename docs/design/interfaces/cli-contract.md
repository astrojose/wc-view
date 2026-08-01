# wc-view: CLI Contract

## Context

- `wc-view` is an independent CLI; terminal agent execution is completely decoupled from the browser review surface.
- New independent repository/package; no changes to the `workflow-contract` runtime.
- Later optional `workflow-contract` skill guidance may invoke `wc-view`; it must not duplicate viewer logic.

## Requirements

- `wc-view serve`: render Markdown files or a `docs/` tree in a lightweight localhost browser UI.
- `wc-view feedback --unresolved [--format <json|toon|...>]`: agent pulls structured, low-token feedback payloads on demand.
- `wc-view gc`: garbage-collect feedback per retention lifecycle.
- **POSIX Stream Discipline**: Machine-readable data outputs (e.g. `feedback --unresolved`) write strictly to `stdout`. Diagnostics, server toasts, warnings, and errors write strictly to `stderr`.
- **TTY & Color Awareness**: Automatically strip ANSI color codes when `stdout` is piped or when `NO_COLOR` environment variable is present.
- **Exit Code Schema**: `0` for clean execution, `1` for operational errors (file missing, queue lock error), `2` for invalid CLI usage.

## Decisions

- Default feedback payload format is compact JSON (see `docs/design/data/feedback-schema.md`).
- Execution runtime: Node.js 18+ ESM CLI (`dist/bin/wc-view.js`).
- Localhost security: `wc-view serve` binds exclusively to `127.0.0.1` (loopback interface), rejecting any external network requests.
- GC retention: `wc-view gc` deletes `resolved` items older than 30 days by default, or all `resolved` items when `--all` is set.
- View modes: single-file mode when given a `.md` file; docs-tree sidebar navigation when given a directory path.

## Contracts

- `wc-view serve [path]` options:
  - `-p, --port <number>` (default: `3456`)
  - `-h, --host <string>` (default: `127.0.0.1`)
- `wc-view feedback` options:
  - `-u, --unresolved` (default: true)
  - `-f, --format <type>` (`json` | `toon`, default: `json`)
- `wc-view gc` options:
  - `-a, --all` (purge all resolved feedback regardless of age)
  - `-d, --days <number>` (retention days threshold, default: 30)
- HTTP REST API endpoints on `wc-view serve`:
  - `GET /api/document`: returns document text and file metadata.
  - `GET /api/feedback`: returns feedback queue items for current file.
  - `POST /api/feedback`: creates or updates a feedback entry in `~/.wc-view/feedback/queue.jsonl`.
  - `GET /api/events`: opens a Server-Sent Events stream for real-time feedback updates.
  - `PATCH /api/feedback/:id`: updates status (`resolved`, `in_progress`, etc.).
- System-level flow: `docs/design/architecture/wc-view-system-flow.md`.

## Acceptance Criteria

- `wc-view serve`, `wc-view feedback --unresolved`, and `wc-view gc` exist as named commands.
- `wc-view feedback --format` supports at least `json` as the default output.
- Server binds strictly to `127.0.0.1` loopback.
- `POST /api/feedback` broadcasts the newly saved feedback item as JSON over each active `/api/events` SSE connection.
