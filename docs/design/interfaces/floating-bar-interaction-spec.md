# wc-view: Floating Bar Interaction Spec

## Context

- The floating bottom bar is the focused review surface; it replaces a persistent chat sidebar.
- Feedback submission must hand work to a connected agent bridge without requiring a second terminal or chat prompt.

## Requirements

- Users select text or elements and attach inline notes with robust layered anchors.
- The composer displays active note badges and an optional prompt.
- **Atomic batch submission** writes the prompt and all accumulated notes as one server-scoped `FeedbackBatch`; notes are not persisted separately before submission.
- The browser supplies only the batch idempotency key, prompt, and notes. The server derives workspace, session, and canonical target identity.
- After submission, the floating bar shows the latest batch state: `queued`, `claimed`, `working`, `response_ready`, `applied`, `awaiting_acceptance`, `resolved`, `failed`, or `orphaned`.
- The browser streams the latest target-scoped agent result over SSE and keeps a lightweight affordance to recover prior target-scoped batch results.
- The composer remains non-modal. It never traps focus.
- An annotation whose quote cannot resolve is `orphaned`; it is never silently rebound.

## Decisions

- Target policy is visible before first submission:
  - `scratch`: the connected adapter may apply the result automatically.
  - `protected`: the adapter must return a proposed result awaiting explicit acceptance.
- A batch submission immediately clears the local composer only after the server confirms durable persistence.
- Failure leaves the submitted batch visible with a retryable result state; it does not recreate unanchored local notes.

## Contracts

- Anchor tiers are defined in `docs/design/data/feedback-schema.md`.
- Visual feedback, focus behavior, and aria-live announcements are defined in `docs/design/product/ux-design-system.md`.
- System-level flow: `docs/design/architecture/wc-view-system-flow.md`.

## Acceptance Criteria

- A single submit creates one durable batch containing every displayed note, the prompt, and server-derived workspace/session/target provenance.
- Two clients viewing different files in one served tree cannot change each other's batch target.
- Submitting feedback shows a browser-visible state update without another user prompt.
- `scratch` and `protected` policy is visible before submission.
- A protected target has no automatic mutation path in the UI contract.
