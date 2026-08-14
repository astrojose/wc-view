# Weekly Status

## 2026-08-14

- Completed Phase 06 — Feedback Isolation and Bridge Hardening.
  - Feedback batches persist in canonical workspace stores and carry workspace, session, and server-derived target provenance.
  - Feedback CLI output defaults to one workspace and supports explicit target, session, legacy, and cross-workspace filters.
  - Bridges claim only matching workspace batches, execute adapters asynchronously, renew leases, and validate claim ownership before results persist.
  - Unapproved protected work uses proposal-only envelopes and cannot persist as `applied` before acceptance.
  - REST and SSE batch state is scoped to each validated browser target; known writes broadcast directly and durable polling remains the recovery path.
- Verification passed: TypeScript type-check, 49 Vitest tests, production build, workflow validation, CodeRabbit review remediation, and production-built multi-workspace/multi-target E2E.

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
