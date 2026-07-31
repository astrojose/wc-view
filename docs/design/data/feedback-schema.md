# wc-view: Feedback Schema

## Context

- No cross-harness standard yet exists for portable human→agent review feedback (MCP elicitation is agent-initiated and session-scoped; AGENTS.md carries static instructions, not per-item feedback) — this contract is **greenfield**.
- To keep future interop open, each feedback item is shaped on an established finding schema (SARIF / LSP `Diagnostic` / Reviewdog RDFormat): location anchor + message + severity.

## Requirements

- **Layered anchor**, following the W3C Web Annotation Data Model and Hypothes.is fuzzy-anchoring, resolved by ordered fallback:
  - **Primary — quote + context**: `exact` selected text plus ~32-char `prefix`/`suffix`, taken over the *rendered* text. This is the only tier that survives the agent rewrites this workload continuously produces.
  - **Secondary — structural scope narrower**: nearest stable heading slug + element type + occurrence index, used to disambiguate and cheaply bound the fuzzy search, not to locate.
  - **Tertiary — position hint**: `line_range` / offset kept only as a fast-path cache, re-validated against the quote on every load and never trusted alone.
- Feedback lifecycle status: `unresolved` → `in_progress` → `resolved`, plus `orphaned` when an anchor no longer resolves.
- Written to durable user-local state under `~/.wc-view/feedback/queue.jsonl` (never polluting git repositories).
- Default payload format is compact JSON — universally parseable and smallest on the nested, irregular shape of review feedback. A `--format` flag may offer alternatives (e.g. `toon`, CSV/Markdown table), adopted only where a benchmark on the real schema shows a stable, worthwhile token win.

## Decisions

- Comment/message field: plain feedback message (`comment`) plus `status` (`unresolved` | `in_progress` | `resolved` | `orphaned`).
- Payload interop target shape: location anchor + message + severity, mappable to SARIF / LSP `Diagnostic` / Reviewdog RDFormat.
- Storage path: durable user-local state under `~/.wc-view/feedback/queue.jsonl` (outside any git repository).
- Queue mutation model: JSONL format with one JSON object per line. State updates preserve latest item state per `id`.
- Anchor coordinate space: rendered DOM text content offsets generated via standard GFM `marked` parser.

## Contracts

- Feedback Item JSON structure:
  - `id`: string (e.g. `fb_123456`)
  - `filePath`: string (relative or absolute file path being reviewed)
  - `anchor`: object
    - `primary`: `{ exact: string, prefix: string, suffix: string }`
    - `secondary`: `{ headingSlug?: string, elementType: string, occurrenceIndex: number }`
    - `tertiary`: `{ startLine?: number, endLine?: number, offsetHint?: number }`
  - `comment`: string
  - `severity`: `"info" | "warning" | "error"`
  - `status`: `"unresolved" | "in_progress" | "resolved" | "orphaned"`
  - `createdAt`: string (ISO 8601)
  - `updatedAt`: string (ISO 8601)
- System-level flow: `docs/design/architecture/wc-view-system-flow.md`.

## Acceptance Criteria

- Every feedback item carries a primary (quote+context), secondary (structural scope), and tertiary (position hint) anchor tier.
- Status values are limited to `unresolved`, `in_progress`, `resolved`, `orphaned`.
- Feedback is persisted only under `~/.wc-view/feedback/`, never inside a git-tracked path.

