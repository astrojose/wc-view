# Phase 01 — Canvas & Theme Foundation

## Status

- `done`
- Last updated: 2026-08-01

## Objective

- Render Markdown in a full-width centered canvas with dark/light theme tokens and the base accessibility contract, with no dependency on any open design decision.

## Scope

- New `wc-view` repository/package: document canvas, theme tokens, semantic landmarks, base focus/keyboard contract.
- No feedback queue, no CLI, no annotation anchoring — those are later phases.

## Features

- Full-width centered reading column, `68-76ch`, zero sidebars.
- Dark/light CSS Custom Property tokens per `docs/design/product/ux-design-system.md`.
- Semantic landmarks for document, review queue, composer, status.
- Reduced-motion support.

## Tasks

- [x] `task-01-centered-canvas-render.md`
- [x] `task-02-theme-tokens.md`
- [x] `task-03-a11y-landmarks-focus.md`

## Acceptance Criteria

- [x] Rendered Markdown column measures `68-76ch` with no sidebar element present in the DOM.
- [x] Dark and light palettes match `docs/design/product/ux-design-system.md` hex values exactly.
- [x] Document, review queue, composer, and status regions are each reachable via a native landmark role.

## Blockers

- None.

## Linked Tasks

- task-01-centered-canvas-render.md
- task-02-theme-tokens.md
- task-03-a11y-landmarks-focus.md
