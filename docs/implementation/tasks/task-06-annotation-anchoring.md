# Annotation Anchoring

## Status

- `blocked`
- Last updated: 2026-08-01

## Linked Phase

- phase-03-annotation-anchoring.md

## Agent Context

- Skills: workflow-contract
- Design docs: docs/design/data/feedback-schema.md, docs/design/interfaces/floating-bar-interaction-spec.md
- Constraints: Do not resolve the Markdown dialect / Mermaid rendering baseline decision unilaterally — it must be accepted in `docs/changes/proposed/wc-view-open-decisions.md` first.
- Do not touch: canvas rendering (task-01), theme tokens (task-02), CLI/queue (Phase 04).

## Objective

Implement primary (quote+context), secondary (structural scope), and tertiary (position hint) anchor extraction and resolution against the rendered document, marking unresolvable anchors `orphaned`.

## Scope Boundary

**In scope:**
- Anchor extraction on element selection (quote, ~32-char prefix/suffix, heading slug, element type, occurrence index, line range/offset).
- Anchor resolution/re-validation on document load.
- `orphaned` marking when no tier resolves.

**Out of scope:**
- Feedback queue persistence format (Phase 04, blocked).
- CLI commands (Phase 04, blocked).

## Acceptance Criteria

- [ ] Blocked — cannot be finalized until `docs/changes/proposed/wc-view-open-decisions.md` item 1 (Markdown dialect and Mermaid rendering baseline) is resolved and reflected in `docs/design/data/feedback-schema.md`.

## Dependencies

- `docs/changes/proposed/wc-view-open-decisions.md` (item 1: Markdown dialect and Mermaid rendering baseline).

## Implementation Checklist

- [ ] Blocked pending open decision resolution — do not begin implementation.

## Verification

- Command: Not applicable until unblocked.
- Evidence: Not applicable until unblocked.
