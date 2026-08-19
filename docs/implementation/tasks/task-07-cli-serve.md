# CLI: serve

## Status

- `done`
- Last updated: 2026-08-15

## Work Classification

- Class: planned
- Coordination: single-repo
- Reclassified from: not applicable

## Linked Phase

- phase-04-feedback-queue-cli.md

## Agent Context

- Skills: workflow-contract
- Proposal: not applicable
- Design docs: docs/design/interfaces/cli-contract.md
- Constraints: Bind strictly to loopback interface 127.0.0.1.
- Do not touch: annotation anchoring (task-06), feedback/gc commands (task-08).

## Authority

- Allowed: `wc-view serve` CLI wiring and native HTTP server for Markdown rendering plus `/api/document` and `/api/feedback`.
- Requires approval: bind address other than `127.0.0.1`.
- Prohibited: anchoring changes, feedback/gc commands, package publish, git push, and GitHub release creation.

## Objective

Implement `wc-view serve` to render Markdown files or a `docs/` tree in a localhost browser UI.

## Scope Boundary

**In scope:**
- CLI serve command execution.
- Native HTTP server for rendering Markdown files and providing document/feedback REST endpoints.

**Out of scope:**
- Anchor tier extraction implementation.
- CLI feedback and gc commands.

## Acceptance Criteria

- [x] AC-01: `wc-view serve` launches a local server on port 3456 (or custom `-p`).
- [x] AC-02: Serves Markdown file content or directory tree.
- [x] AC-03: Provides REST endpoints for `/api/document` and `/api/feedback`.

## Dependencies

- Loopback binding and file-versus-directory serve behavior are adopted in `docs/design/interfaces/cli-contract.md`.

## Implementation Checklist

- [x] Implement server logic in `src/server/index.ts`.
- [x] Connect `serve` command in `src/cli/index.ts`.
- [x] Add unit/integration tests in `src/cli/cli.test.ts`.

## Verification

- Command: `npm test` (`src/cli/cli.test.ts`).
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
| AC-01 | pass | `src/cli/cli.test.ts` recorded loopback server launch |
| AC-02 | pass | `src/cli/cli.test.ts` recorded Markdown file and directory serve |
| AC-03 | pass | `src/cli/cli.test.ts` recorded `/api/document` and `/api/feedback` |

### Alignment

- Design vs implementation: aligned at ee08c82e802c
- Planned vs actual scope: no variance recorded
- Documentation drift: none found
- Deferred gaps: none recorded
- Newly discovered decisions: none recorded

### Follow-up

- None.
