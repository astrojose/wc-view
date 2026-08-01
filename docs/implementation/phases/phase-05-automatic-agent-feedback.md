# Phase 05 — Automatic Agent Feedback Loop

## Status

- `done`
- Last updated: 2026-08-01

## Objective

- Make browser feedback submission trigger durable, automatic agent-bridge work and return results to the review surface.

## Scope

- Atomic feedback batches, durable queue lifecycle, bridge dispatch, replayable SSE state, and composer work-state UI.
- Excludes agent-specific SDK integrations; adapters run through the documented command protocol.

## Features

- Atomic browser feedback batches.
- Durable bridge claims and adapter dispatch.
- Replayable browser work status and results.
- Scratch-versus-protected target policy.

## Tasks

- [x] `task-09-automatic-agent-feedback-loop.md`

## Acceptance Criteria

- [x] A browser submission persists one feedback batch containing the prompt and all notes.
- [x] A bridge claims and dispatches queued work without a second user prompt.
- [x] The browser shows current and live batch status and result.
- [x] Scratch artifacts can receive adapter-applied updates; protected targets return an acceptance-required result.

## Linked Tasks

- task-09-automatic-agent-feedback-loop.md
