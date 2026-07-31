# Phase 03 — Annotation Anchoring

## Status

- `blocked`
- Last updated: 2026-08-01

## Objective

- Implement the primary/secondary/tertiary anchor resolution chain from `docs/design/data/feedback-schema.md` against the rendered document.

## Scope

- Element selection UI hookup to anchor extraction (quote+prefix+suffix, heading slug + element type + occurrence index, line range/offset).
- Orphaned-anchor detection and marking.

## Features

- Quote + ~32-char prefix/suffix extraction from rendered text.
- Structural scope fallback (heading slug, element type, occurrence index).
- Position-hint cache, re-validated against the quote on every load.

## Tasks

- [ ] `task-06-annotation-anchoring.md`

## Acceptance Criteria

- [ ] Selecting an element produces all three anchor tiers per `docs/design/data/feedback-schema.md`.
- [ ] An anchor that no longer resolves is marked `orphaned`, never silently re-bound.

## Blockers

- Blocked on `docs/changes/proposed/wc-view-open-decisions.md` item 1 (Markdown dialect and Mermaid rendering baseline), which fixes the rendered-text coordinate space anchors resolve against.

## Linked Tasks

- task-06-annotation-anchoring.md
