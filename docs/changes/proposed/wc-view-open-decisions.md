# wc-view: Open Decisions

## Status

proposed

## Context

- `docs/changes/proposed/wc-view-open-decisions.md` contains decisions for Phase 3 and Phase 4 MVP.

## Problem

- Five decisions from that proposal required explicit specifications to unblock Phase 3 and Phase 4.

## Proposed Change

1. **Markdown dialect and Mermaid rendering baseline**: Standard `marked` parser with GFM options enabled. Text coordinate space for anchors uses normalized DOM text content offsets over rendered blocks.
2. **Feedback retention lifecycle and `wc-view gc`**: Queue items stored persistently in `~/.wc-view/feedback/queue.jsonl`. `wc-view gc` purges `resolved` items older than 30 days, or all `resolved` items when `--all` is supplied.
3. **Queue mutation model**: JSONL state file at `~/.wc-view/feedback/queue.jsonl`. Each record represents a feedback entry; updates rewrite/append the queue state with latest entry per ID winning.
4. **Localhost trust model and concurrency handling**: `wc-view serve` binds exclusively to `127.0.0.1` loopback interface. REST endpoints (`/api/feedback`, `/api/document`) accept local client requests. File operations use atomic file replaces to handle concurrent access safely.
5. **Single-document view vs. docs-tree navigation tabs**: Single file view served when a Markdown file path is specified. Directory navigation tabs/sidebar enabled when serving a directory path.


