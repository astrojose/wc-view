# wc-view: Feedback Schema

## Context

- Feedback uses location anchor + message + severity, shaped for future mapping to SARIF / LSP `Diagnostic` / Reviewdog RDFormat.
- Browser feedback must start connected agent work without a second terminal or chat prompt.
- Durable state remains outside git under `~/.wc-view/feedback/`.

## Requirements

- A submitted batch contains the optional prompt (`""` when omitted) and all selected notes in one atomic write.
- The browser supplies a client-generated batch id as an idempotency key; a retry with that id returns the original batch without resetting its state.
- Each note retains a layered anchor:
  - Primary: rendered-text `exact` quote plus `prefix` and `suffix`.
  - Secondary: heading slug, element type, and occurrence index.
  - Tertiary: line range or offset hint; never trusted without quote re-validation.
- A bridge atomically claims a queued batch before dispatching it to an agent adapter.
- State transitions are durable and recoverable after bridge restart.
- A browser reconnect receives current batch state before live updates.

## Decisions

- Storage path: `~/.wc-view/feedback/queue.jsonl`.
- Queue mutation model: JSONL, with latest record for an id taking precedence.
- Artifact class is `scratch` for a workspace-local `.wc-view-scratch*.md` or `.wc-view-scratch*.html` target; all other targets are `protected` unless a future contract adds stricter classes.
- `scratch` batches permit automatic artifact edits.
- `protected` batches permit analysis and result proposal only until explicit human acceptance.
- A claim contains bridge id and a lease expiry. An expired lease returns the batch to `queued`.

## Contracts

### FeedbackNote

- `id`: string.
- `anchor`: layered anchor object.
- `comment`: string.
- `severity`: optional `"info" | "warning" | "error"`.
- `status`: optional `"unresolved" | "resolved" | "orphaned"`; a batch is not resolved until every note is resolved or orphaned.

### FeedbackBatch

- `id`: string.
- `filePath`: absolute target path.
- `artifactClass`: `"scratch" | "protected"`.
- `prompt`: string.
- `notes`: `FeedbackNote[]`.
- `status`: `"queued" | "claimed" | "working" | "response_ready" | "applied" | "awaiting_acceptance" | "resolved" | "failed" | "orphaned"`.
- `claim`: optional `{ bridgeId: string, leaseExpiresAt: string }`.
- `approval`: optional `{ acceptedAt: string }`; present only after a human accepts a protected result.
- `result`: optional `{ summary: string, proposal?: string, status: "applied" | "awaiting_acceptance" | "resolved" | "failed" }`.
- `createdAt`: ISO 8601 string.
- `updatedAt`: ISO 8601 string.

### Bridge adapter result

- Adapter receives one `FeedbackBatch` as JSON on standard input.
- Adapter returns one JSON object on standard output: `{ "summary": string, "proposal"?: string, "status": "applied" | "awaiting_acceptance" | "resolved" }`.
- Non-zero process exit or invalid JSON produces a durable `failed` result with diagnostics as its summary.
- Adapter diagnostics write to standard error.

### Human acceptance

- `POST /api/batches/:id/accept` accepts only a batch in `awaiting_acceptance` state.
- Acceptance records `approval.acceptedAt`, returns the batch to `queued`, and broadcasts a batch event.
- The bridge redispatches the approved batch; only then may its adapter apply the protected target.

## Acceptance Criteria

- One browser submission persists one batch with its prompt and all notes.
- Batch records and all state transitions exist only below `~/.wc-view/feedback/`.
- A batch cannot be claimed by two non-expired bridge leases.
- A protected target is never mutated until a human accepts its durable `awaiting_acceptance` result.
- System-level flow: `docs/design/architecture/wc-view-system-flow.md`.
