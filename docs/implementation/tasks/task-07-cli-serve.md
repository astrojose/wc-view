# CLI: serve

## Status

- `blocked`
- Last updated: 2026-08-01

## Linked Phase

- phase-04-feedback-queue-cli.md

## Agent Context

- Skills: workflow-contract
- Design docs: docs/design/interfaces/cli-contract.md
- Constraints: Do not resolve the localhost trust model or single-doc-vs-tree decision unilaterally — they must be accepted in `docs/changes/proposed/wc-view-open-decisions.md` first.
- Do not touch: annotation anchoring (task-06), feedback/gc commands (task-08).

## Objective

Implement `wc-view serve` to render Markdown files or a `docs/` tree in a localhost browser UI.

## Scope Boundary

**In scope:**
- `wc-view serve` command per `docs/design/interfaces/cli-contract.md`.

**Out of scope:**
- `feedback` and `gc` commands (task-08).
- Anchor resolution (task-06, blocked).

## Acceptance Criteria

- [ ] Blocked — cannot be finalized until `docs/changes/proposed/wc-view-open-decisions.md` items 4 (localhost trust model, concurrency) and 5 (single-document vs. docs-tree navigation) are resolved and reflected in `docs/design/interfaces/cli-contract.md`.

## Dependencies

- `docs/changes/proposed/wc-view-open-decisions.md` (items 4 and 5).

## Implementation Checklist

- [ ] Blocked pending open decision resolution — do not begin implementation.

## Verification

- Command: Not applicable until unblocked.
- Evidence: Not applicable until unblocked.
