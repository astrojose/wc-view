# Project Implementation

## Overview

- `wc-view`: local Markdown review surface for agent workflows. Technical stack is established in `docs/design/architecture/tech-stack.md` (Node.js 18+ ESM, TypeScript, Commander, Marked, native HTTP). Visual design truth is defined in `wc-view Design System/` and `docs/design/product/ux-design-system.md`. Five open decisions remain in `docs/changes/proposed/wc-view-open-decisions.md`.

## Current Priorities

1. Phase 01 — Canvas & Theme Foundation (no open-decision dependency; unblocks all other phases' UI surface).
2. Phase 02 — Floating Bar & Composer (depends only on Phase 01; UI mechanics only, no persistence).
3. Phase 03 — Annotation Anchoring (blocked on open decision 1: Markdown/Mermaid rendering baseline).
4. Phase 04 — Feedback Queue & CLI (blocked on open decisions 2-5: gc triggers, queue mutation model, trust/concurrency model, single-doc vs. tree navigation).

## Active Phases

- None (Phase 01 and Phase 02 completed)

## Completed Phases

- [x] phase-01-canvas-theme-foundation.md
- [x] phase-02-floating-bar-composer.md

## Deferred Phases

- [ ] phase-03-annotation-anchoring.md (blocked)
- [ ] phase-04-feedback-queue-cli.md (blocked)

## Dependencies

- Phases 03 and 04 depend on resolution of `docs/changes/proposed/wc-view-open-decisions.md`.

## Linked Artifacts

- phases: docs/implementation/phases/phase-01-canvas-theme-foundation.md, docs/implementation/phases/phase-02-floating-bar-composer.md, docs/implementation/phases/phase-03-annotation-anchoring.md, docs/implementation/phases/phase-04-feedback-queue-cli.md
- tasks: docs/implementation/tasks/task-01-centered-canvas-render.md, docs/implementation/tasks/task-02-theme-tokens.md, docs/implementation/tasks/task-03-a11y-landmarks-focus.md, docs/implementation/tasks/task-04-floating-bar-states.md, docs/implementation/tasks/task-05-composer-annotation-editor.md, docs/implementation/tasks/task-06-annotation-anchoring.md, docs/implementation/tasks/task-07-cli-serve.md, docs/implementation/tasks/task-08-cli-feedback-gc.md
- status: docs/implementation/status/weekly-status.md
