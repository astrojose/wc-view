# Weekly Status

## 2026-08-15

### Summary

- Migrated implementation tasks, weekly status, and open proposals to workflow-contract v0.4.0-rc.1 schema.
- Adopted the five completed open decisions into `docs/design/` and removed `docs/changes/proposed/wc-view-open-decisions.md`.
- Existing completed work stays `done` with `reconciled-and-verified` from recorded original verification, not new product evidence.

### Completed

- Workflow-contract upgrade to v0.4.0-rc.1.
- Schema v2 headings, `AC-NN` identifiers, and reconciliation blocks on tasks 01-15.
- Adopted Markdown/GFM+DOM-offset anchors, `gc` 30-day retention, JSONL atomic queue mutation, loopback REST trust, and file-versus-directory serve into design docs.

### In Progress

- None.

### Awaiting Review

- None.

### Reconciled and Verified

- Tasks 01-12 against original 2026-08-01 verification notes.
- Tasks 13-15 against original 2026-08-14 verification notes.

### Implemented but Unverified

- None.

### Decisions Required

- `docs/changes/proposed/wc-view-html-artifact-canvas-width.md` remains unresolved.

### Blockers

- None.

### Cancelled

- None.

### Next Focus

- Keep `docs/changes/proposed/wc-view-html-artifact-canvas-width.md` as unresolved intent. Do not treat it as design truth.

## 2026-08-14

### Summary

- Completed Phase 06 — Feedback Isolation and Bridge Hardening.

### Completed

- Feedback batches persist in canonical workspace stores and carry workspace, session, and server-derived target provenance.
- Feedback CLI output defaults to one workspace and supports explicit target, session, legacy, and cross-workspace filters.
- Bridges claim only matching workspace batches, execute adapters asynchronously, renew leases, and validate claim ownership before results persist.
- Unapproved protected work uses proposal-only envelopes and cannot persist as `applied` before acceptance.
- REST and SSE batch state is scoped to each validated browser target; known writes broadcast directly and durable polling remains the recovery path.

### In Progress

- None.

### Awaiting Review

- None.

### Reconciled and Verified

- TypeScript type-check, 49 Vitest tests, production build, workflow validation, CodeRabbit review remediation, and production-built multi-workspace/multi-target E2E.

### Implemented but Unverified

- None.

### Decisions Required

- None recorded on this date.

### Blockers

- None.

### Cancelled

- None.

### Next Focus

- None recorded on this date.

## 2026-08-01

- Completed Phase 01 — Canvas & Theme Foundation.
- Completed Phase 02 — Floating Bar & Composer.
- Completed Phase 03 — Annotation Anchoring.
- Completed Phase 04 — Feedback Queue & CLI.
- Completed Phase 05 — Automatic Agent Feedback Loop.
  - Browser notes remain local until one atomic feedback batch is submitted.
  - Batch submission persists durable user-local state and streams `queued`, claim, work, and terminal result updates to the browser.
  - `wc-view bridge --command <command>` claims and dispatches queued work without a second user prompt.
  - Scratch artifacts may receive adapter-applied updates.
  - Protected targets return an acceptance-required result. `POST /api/batches/:id/accept` records approval and requeues the batch for the bridge.
  - Batch ids prevent retry duplication; queue claims use leases.
- Verification passed: TypeScript type-check, 24 Vitest tests, workflow validation, production build, and production-built bridge E2E.
