# Phase 02 — Floating Bar & Composer

## Status

- `done`
- Last updated: 2026-08-01

## Objective

- Build the floating bottom bar and non-modal composer UI mechanics, independent of the feedback queue's persistence format.

## Scope

- Floating bar states (collapsed toast, expanded history/pending list), selection chip badges, non-modal composer, keyboard/focus behavior.
- Excludes: durable feedback queue writes (Phase 04) and annotation anchor resolution (Phase 03).
- Submission uses a local in-memory handoff until Phase 04 adds atomic queue writes.

## Features

- Collapsed bar: latest agent message/status toast, expandable on click.
- Selection chip badge (e.g. `[ 🏷️ 3 notes attached ]`).
- Non-modal composer: never traps focus, Escape preserves draft and returns focus.
- Modal dialog pattern reserved for destructive confirmations only.

## Tasks

- [x] `task-04-floating-bar-states.md`
- [x] `task-05-composer-annotation-editor.md`

## Acceptance Criteria

- [x] Floating bar defaults to showing only the latest agent message, with an affordance to view prior turns and pending annotations.
- [x] Composer never traps focus; Escape closes it, preserves the draft, and returns focus to the invoking control.
- [x] Destructive confirmations use a focus-trapping modal with a visible Cancel control.

## Blockers

- None.

## Linked Tasks

- task-04-floating-bar-states.md
- task-05-composer-annotation-editor.md
