# wc-view: Open Decisions

## Status

proposed

## Context

- `docs/changes/proposed/wc-view-local-markdown-review-surface.md` was accepted and its resolved content moved into `docs/design/`.
- Five decisions from that proposal's **Open Decisions** section remain unresolved. They are not design truth until explicitly accepted.

## Problem

- Design docs referencing these decisions currently point back here rather than stating a value, so implementation tasks that depend on them cannot start.

## Proposed Change

Resolve each of the following, then move the resolution into the referencing design doc:

1. **Markdown dialect and Mermaid rendering baseline** — also fixes the rendered-text coordinate space that anchors resolve against. Affects `docs/design/data/feedback-schema.md`.
2. **Feedback retention lifecycle and `wc-view gc` automatic cleanup triggers**. Affects `docs/design/interfaces/cli-contract.md`.
3. **Queue mutation model**: append-only JSONL with folded state-transition events vs. Maildir-style file moves for in-place status changes. Affects `docs/design/data/feedback-schema.md`.
4. **Localhost trust model** (loopback-only bind; who may POST feedback) and concurrency handling for simultaneous writers. Affects `docs/design/interfaces/cli-contract.md`.
5. **Single-document view vs. docs-tree navigation tabs in V1**. Affects `docs/design/interfaces/cli-contract.md`.

## Expected Design Impact

- Each resolved item updates the `Decisions` section of its referencing design doc and removes the corresponding `Contracts` gap line.

## Expected Implementation Impact

- Implementation tasks scoped to queue read/write, `gc`, server binding, and Markdown/Mermaid rendering stay `pending` with a `Dependencies` entry on this doc until resolved.
