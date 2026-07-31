# Annotation Anchoring

## Status

- `done`
- Last updated: 2026-08-01

## Linked Phase

- phase-03-annotation-anchoring.md

## Agent Context

- Skills: workflow-contract
- Design docs: docs/design/data/feedback-schema.md, docs/design/interfaces/floating-bar-interaction-spec.md
- Constraints: Ensure primary, secondary, and tertiary anchor tiers are extracted correctly from rendered text.
- Do not touch: canvas rendering (task-01), theme tokens (task-02), CLI/queue (Phase 04).

## Objective

Implement primary (quote+context), secondary (structural scope), and tertiary (position hint) anchor extraction and resolution against the rendered document, marking unresolvable anchors `orphaned`.

## Scope Boundary

**In scope:**
- Anchor extraction for primary, secondary, and tertiary tiers.
- Anchor resolution against rendered DOM text.
- Marking unresolvable anchors as orphaned.

**Out of scope:**
- Local feedback queue storage.
- CLI serve command.



## Acceptance Criteria

- [x] Selecting an element produces primary, secondary, and tertiary anchor tiers per `docs/design/data/feedback-schema.md`.
- [x] Resolving an anchor matches primary quote+context, falls back to secondary structural scope, or tertiary position hint.
- [x] An anchor that no longer resolves is marked `orphaned`, never silently re-bound.

## Dependencies

- None (open decision 1 resolved).

## Implementation Checklist

- [x] Implement `src/client/anchoring.ts` with `extractAnchor` and `resolveAnchor`.
- [x] Integrate anchor creation in `DocCanvas.ts` and `ReviewApp`.
- [x] Add unit tests in `src/client/anchoring.test.ts`.

## Verification

- Command: `npm test` (verified via `src/client/anchoring.test.ts`).
- Evidence: Vitest passed all 3 unit tests for 3-tier anchor extraction, quote resolution, and orphaned marking.
