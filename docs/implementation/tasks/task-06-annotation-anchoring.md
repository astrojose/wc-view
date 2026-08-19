# Annotation Anchoring

## Status

- `done`
- Last updated: 2026-08-15

## Work Classification

- Class: planned
- Coordination: single-repo
- Reclassified from: not applicable

## Linked Phase

- phase-03-annotation-anchoring.md

## Agent Context

- Skills: workflow-contract
- Proposal: not applicable
- Design docs: docs/design/data/feedback-schema.md, docs/design/interfaces/floating-bar-interaction-spec.md
- Constraints: Ensure primary, secondary, and tertiary anchor tiers are extracted correctly from rendered text.
- Do not touch: canvas rendering (task-01), theme tokens (task-02), CLI/queue (Phase 04).

## Authority

- Allowed: anchor extraction and resolution in `src/client/anchoring.ts`, `DocCanvas.ts`, and ReviewApp.
- Requires approval: queue persistence or CLI changes.
- Prohibited: canvas rendering, theme tokens, CLI/queue, package publish, git push, and GitHub release creation.

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

- [x] AC-01: Selecting an element produces primary, secondary, and tertiary anchor tiers per `docs/design/data/feedback-schema.md`.
- [x] AC-02: Resolving an anchor matches primary quote+context, falls back to secondary structural scope, or tertiary position hint.
- [x] AC-03: An anchor that no longer resolves is marked `orphaned`, never silently re-bound.

## Dependencies

- Markdown dialect and DOM text-offset anchors are adopted in `docs/design/architecture/tech-stack.md` and `docs/design/data/feedback-schema.md`.

## Implementation Checklist

- [x] Implement `src/client/anchoring.ts` with `extractAnchor` and `resolveAnchor`.
- [x] Integrate anchor creation in `DocCanvas.ts` and `ReviewApp`.
- [x] Add unit tests in `src/client/anchoring.test.ts`.

## Verification

- Command: `npm test` (`src/client/anchoring.test.ts`).
- Evidence: recorded under Reconciliation.

## Investigation

- Not applicable: planned work.

## Cross-Repository Coordination

- Not applicable: single-repo work.

## Reconciliation

- Outcome: reconciled-and-verified
- Reviewed revision: ee08c82e802c
- Environment: local Vitest
- Reviewed at: 2026-08-01T00:00:00Z
- Reviewer: original verification record migrated to workflow-contract v0.4.0-rc.1

### Acceptance Evidence

| Criterion | Result | Evidence |
|---|---|---|
| AC-01 | pass | `src/client/anchoring.test.ts` recorded 3-tier extraction |
| AC-02 | pass | `src/client/anchoring.test.ts` recorded quote resolution fallback |
| AC-03 | pass | `src/client/anchoring.test.ts` recorded orphaned marking |

### Alignment

- Design vs implementation: aligned at ee08c82e802c
- Planned vs actual scope: no variance recorded
- Documentation drift: none found
- Deferred gaps: none recorded
- Newly discovered decisions: none recorded

### Follow-up

- None.
