# CLI: serve

## Status

- `done`
- Last updated: 2026-08-01

## Linked Phase

- phase-04-feedback-queue-cli.md

## Agent Context

- Skills: workflow-contract
- Design docs: docs/design/interfaces/cli-contract.md
- Constraints: Bind strictly to loopback interface 127.0.0.1.
- Do not touch: annotation anchoring (task-06), feedback/gc commands (task-08).

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

- [x] `wc-view serve` launches a local server on port 3456 (or custom `-p`).
- [x] Serves Markdown file content or directory tree.
- [x] Provides REST endpoints for `/api/document` and `/api/feedback`.

## Dependencies

- None (open decisions 4 and 5 resolved).

## Implementation Checklist

- [x] Implement server logic in `src/server/index.ts`.
- [x] Connect `serve` command in `src/cli/index.ts`.
- [x] Add unit/integration tests in `src/cli/cli.test.ts`.

## Verification

- Command: `npm test` (verified via `src/cli/cli.test.ts`).
- Evidence: Vitest passed integration tests verifying server loopback binding, `/api/document`, and `/api/feedback` REST endpoints.
