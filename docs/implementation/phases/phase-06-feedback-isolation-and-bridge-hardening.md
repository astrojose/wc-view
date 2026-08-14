# Phase 06 — Feedback Isolation and Bridge Hardening

## Status

- `done`
- Last updated: 2026-08-14

## Objective

- Isolate feedback by workspace and make bridge dispatch, protected-target handling, and browser status recovery match adopted design.

## Scope

- Workspace-scoped queue storage and provenance.
- Batch-aware feedback CLI filtering.
- Asynchronous bridge execution, lease renewal, and protected proposal envelopes.
- Server-owned target identity and target-scoped SSE projection.
- Legacy global queue remains readable only through explicit legacy migration or listing behavior.

## Features

- Workspace queue directories and metadata.
- Explicit bridge workspace scope.
- Workspace, target, and session feedback filters.
- Renewable bridge leases.
- Proposal-only protected dispatch.
- Per-client validated document targets.
- Direct SSE broadcast with durable polling recovery.

## Tasks

- [x] `task-13-workspace-scoped-feedback-store-and-cli.md`
- [x] `task-14-asynchronous-workspace-bridge.md`
- [x] `task-15-server-target-and-sse-isolation.md`

## Acceptance Criteria

- [x] Default feedback and bridge commands cannot list or claim another workspace's batches.
- [x] A working adapter cannot be reclaimed while its lease is renewed.
- [x] An unapproved protected adapter result cannot be persisted as `applied`.
- [x] Browser submissions use server-derived workspace, session, and target identity.
- [x] SSE reconnect returns only batches for the browser's validated target.

## Linked Tasks

- task-13-workspace-scoped-feedback-store-and-cli.md
- task-14-asynchronous-workspace-bridge.md
- task-15-server-target-and-sse-isolation.md
