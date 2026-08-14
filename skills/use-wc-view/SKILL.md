---
name: use-wc-view
description: >-
  Install and use the @astrojose/wc-view CLI for local Markdown and HTML
  workflow review. Use when a user asks to open, view, inspect, review,
  visualize, export, or interact with Markdown files, styled HTML artifacts,
  workflow-contract documents, docs/ trees, feedback queues, bridges, or
  agent review surfaces using wc-view; when a user asks how to install or
  update wc-view; or when a prompt implies the CLI should be run if available
  and installed or updated if missing or stale.
---

# Use wc-view

## Overview

Use `@astrojose/wc-view` as the standard local Markdown and HTML review surface for agent workflows. Prefer the installed `wc-view` CLI when it is current enough for the requested behavior. Install or update it when the user explicitly asks, when it is missing, or when the installed version is older than the npm latest and the requested workflow depends on newer behavior.

## Quick Start

```bash
# Install globally
npm install --global @astrojose/wc-view

# Serve a docs tree
wc-view serve docs/

# Export to standalone HTML
wc-view export README.md --out review.html

# Pull unresolved feedback as a markdown checklist
wc-view feedback --format markdown
```

## Workflow

1. **Identify the target content** from the prompt.

   - **Visualization requests** ("visualize", "show the flow", "make a review artifact"): DO NOT just serve an existing static `.md` file. Synthesize a rich visual representation and serve it through a workspace-local scratch artifact.
     - Prefer `.wc-view-scratch.html` for styled layouts, cards, tables, diagrams, visual hierarchy, or embedded interaction.
     - Use `.wc-view-scratch.md` when the output is Markdown-native documentation or mostly Mermaid plus prose.
   - **Standard review** ("open this", "view this", "review these docs"): Use the explicit file or directory path provided.
   - **General docs review**: Use the current repository's `docs/` directory when `docs/` exists.
   - **Export requests** ("export to HTML", "make offline copy"): Use `wc-view export`.

2. **Check whether `wc-view` is available and current.**

   ```bash
   command -v wc-view
   wc-view --version
   npm view @astrojose/wc-view version --json
   ```

3. **Install or update** if needed.

   Install when missing. Update when the user asks, or when the requested behavior requires a newer version. Otherwise report versions and ask before updating.

   ```bash
   npm install --global @astrojose/wc-view
   wc-view --version
   ```

4. **Run the CLI** according to intent (see Command Reference below).

5. **Report results**: the command used, the local URL (usually `http://127.0.0.1:3456`), the installed version when relevant, whether the server or bridge is still running, and any recommended next action.

## Command Reference

### `wc-view serve [path]`

Render Markdown, HTML artifacts, or a docs/ tree in a lightweight localhost browser UI.

```bash
wc-view serve docs/
wc-view serve docs/design/architecture/tech-stack.md
wc-view serve .wc-view-scratch.html
wc-view serve docs/ --port 3457
wc-view serve docs/ --agent-command "codex exec"
```

| Flag | Default | Description |
|------|---------|-------------|
| `-p, --port <number>` | `3456` | Port to bind |
| `-H, --host <string>` | `127.0.0.1` | Host interface (loopback only) |
| `--agent-command <cmd>` | — | Start a local agent bridge adapter alongside the server |

**Browser features available in the review surface:**
- **Multi-document sidebar** — recursive file tree with real-time text filter. Switch documents via sidebar or `?file=<relPath>` query param.
- **Live hot-reload** — documents refresh automatically over SSE when edited on disk, without losing in-progress reviewer notes.
- **Dark / Light theme toggle** — Mermaid diagrams and diff blocks re-theme dynamically.
- **GFM task list checkboxes** — clickable `- [ ]` / `- [x]` that stage structured decision notes into the floating composer.
- **Diff block syntax highlighting** — `+`/`-`/`@@` lines render with visual diff colors.
- **Keyboard shortcut help** — press `?` to open the accessible help modal listing all shortcuts.
- **Floating composer** — annotate document blocks and submit structured feedback batches.
- **Activity Drawer (`💬 Feed`)** — sliding panel showing agent replies and conversation threads per batch.

### `wc-view export <path> [-o, --out <path>]`

Export a Markdown review document to a standalone, zero-dependency offline HTML file with embedded styles, Mermaid rendering (via CDN), and a Dark/Light theme toggle.

```bash
wc-view export README.md
wc-view export docs/design/product.md --out /tmp/product-review.html
```

- Returns JSON on stdout: `{ "exported": true, "source": "...", "destination": "..." }`
- Diagnostics go to stderr.

### `wc-view feedback`

Pull structured review feedback payloads for agent consumption.

```bash
# Default: JSON payload of unresolved items
wc-view feedback

# Markdown checklist format
wc-view feedback --format markdown

# JSON with explicit flags
wc-view feedback --unresolved --format json
```

| Flag | Default | Description |
|------|---------|-------------|
| `-u, --unresolved` | `true` | Filter to unresolved items |
| `-f, --format <type>` | `json` | Output format: `json`, `toon`, or `markdown` |

### `wc-view feedback resolve <id>`

Mark a feedback item, batch, or individual note as resolved.

```bash
wc-view feedback resolve fb_1723672800000
wc-view feedback resolve batch_review_1
```

- Returns JSON on stdout with `{ "type": "...", "id": "..." }`.
- Exits with code 1 if the ID is not found.

### `wc-view feedback reply <batchId> -m <text>`

Post an agent reply message back to a feedback batch. The reply appears in the browser's sliding Activity Drawer (`💬 Feed`) for human review.

```bash
wc-view feedback reply batch_review_1 --message "Applied the requested changes to the header component."
```

- Returns JSON on stdout: `{ "replied": true, "batchId": "...", "repliesCount": N }`.
- Exits with code 1 if the batch is not found.

### `wc-view bridge`

Claim feedback batches from the queue and dispatch them to a local agent adapter command. The adapter receives one FeedbackBatch JSON object on stdin.

```bash
# Continuous bridge
wc-view bridge --command "codex exec"

# Process one batch and exit
wc-view bridge --command "codex exec" --once
```

| Flag | Default | Description |
|------|---------|-------------|
| `--command <cmd>` | (required) | Adapter command receiving batch JSON on stdin |
| `--interval <ms>` | `500` | Queue polling interval (min 50ms) |
| `--bridge-id <id>` | `bridge_<pid>` | Stable bridge identity for lease exclusivity |
| `--once` | `false` | Process at most one queued batch and exit |

### `wc-view gc`

Garbage-collect resolved feedback queue items.

```bash
wc-view gc
wc-view gc --all
wc-view gc --days 7
```

| Flag | Default | Description |
|------|---------|-------------|
| `-a, --all` | `false` | Purge all resolved items regardless of age |
| `-d, --days <number>` | `30` | Retention threshold in days |

## Command Selection Guide

| User intent | Command |
|---|---|
| "open this", "view this", "review these docs", "show workflow" | `wc-view serve <target>` |
| "visualize this", "make a review artifact", "show the flow visually" | Create `.wc-view-scratch.html` or `.wc-view-scratch.md`, then `wc-view serve <scratch-file>` |
| "export to HTML", "make an offline copy", "standalone review" | `wc-view export <file> [--out <path>]` |
| "is it installed", "what version", setup checks | `command -v wc-view && wc-view --version && npm view @astrojose/wc-view version --json` |
| "install wc-view", "update wc-view" | `npm install --global @astrojose/wc-view` then `wc-view --version` |
| "pull feedback", "show unresolved feedback" | `wc-view feedback [--format markdown]` |
| "resolve this feedback", "mark as done" | `wc-view feedback resolve <id>` |
| "reply to feedback", "respond to the reviewer" | `wc-view feedback reply <batchId> -m <text>` |
| "start the agent bridge", "watch feedback" | `wc-view bridge --command <cmd>` or `wc-view serve <target> --agent-command <cmd>` |
| "process one feedback batch" | `wc-view bridge --command <cmd> --once` |
| "clean up old feedback" | `wc-view gc [--all] [--days N]` |
| "help", unfamiliar CLI usage | `wc-view --help` |

## Agent Integration Patterns

### Review-then-act loop

```bash
# 1. Serve docs for human review
wc-view serve docs/ &

# 2. Wait for feedback
wc-view feedback --format json  # poll or use bridge

# 3. Process feedback
wc-view feedback resolve <id>

# 4. Reply with status
wc-view feedback reply <batchId> -m "Changes applied."
```

### Automated bridge

```bash
# Start server with integrated bridge
wc-view serve docs/ --agent-command "my-agent process"

# Or standalone bridge for one-shot processing
wc-view bridge --command "my-agent process" --once
```

### Export for offline distribution

```bash
# Export a review document for sharing
wc-view export docs/design/product.md --out /tmp/product-review.html
```

## Guardrails

- Do not publish, tag, release, or mutate the `@astrojose/wc-view` package from this skill. This skill is for consumers and users only.
- Do not assume `npx @astrojose/wc-view --help` is the best path. Prefer global installation or an already-installed CLI because package-manager executable resolution can vary by npm version.
- Do not overwrite user-authored files. Scratch visualization artifacts may be created only as workspace-local `.wc-view-scratch.md` or `.wc-view-scratch.html` files.
- Treat browser feedback as unapproved input until the user accepts it or the scratch-artifact policy allows automatic application.
- `wc-view serve` binds to `127.0.0.1` only. Do not attempt to expose it to external networks.
- Generated viewer state lives outside the repository at `~/.wc-view/`. Do not commit feedback queue data.
- Machine-readable CLI payloads go to `stdout`; diagnostics go to `stderr`. Parse accordingly.
- If installation or update fails, report the npm error, Node/npm versions, npm global prefix, and the command attempted. Do not retry blindly with sudo; explain the likely permission issue and prefer a user-owned npm global prefix.

## Common Mistakes

1. **Serving a static doc when asked to "visualize"** — always synthesize a scratch artifact first for visualization requests.
2. **Forgetting `--format markdown`** — when the user wants human-readable feedback output, use `--format markdown` instead of the default JSON.
3. **Running `npx` instead of the global binary** — `npx` resolution varies across npm versions; prefer `npm install --global` and then call `wc-view` directly.
