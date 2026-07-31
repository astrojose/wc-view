# Phase 02 — Floating Bar & Composer

## Status

- `done`
- Last updated: 2026-08-01

## Objective

- Build the floating bottom bar and non-modal composer UI mechanics, independent of the feedback queue's persistence format.

## Scope

- Floating bar states (collapsed toast, expanded history/pending list), selection chip badges, non-modal composer, keyboard/focus behavior.
- Excludes: writing to `~/.wc-view/feedback/queue.jsonl` (blocked — see Phase 04) and annotation anchor resolution (blocked — see Phase 03).
- In-scope submission behavior is limited to invoking a local in-memory batch handoff function. This is a temporary implementation seam to sequence around the Phase 04 blocker, not a designed interface — Phase 04 replaces it with the real atomic write to `~/.wc-view/feedback/queue.jsonl`.

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

- None. (Depends on Phase 01 theme tokens and landmarks being available for styling and focus order.)

## Linked Tasks

- task-04-floating-bar-states.md
- task-05-composer-annotation-editor.md
