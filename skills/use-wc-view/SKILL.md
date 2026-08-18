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

Use `@astrojose/wc-view` as the standard local Markdown and HTML review surface for agent workflows. Use an isolated `npx` invocation for consumer workflows so each run avoids stale global installs. Resolve `latest` once per invocation by default, or honor an explicitly supplied `WC_VIEW_VERSION` when a workflow needs a reviewed version.

## Quick Start

```bash
# Resolve one package spec for this invocation. Set WC_VIEW_VERSION explicitly
# when the workflow must use a previously approved version.
WC_VIEW_PACKAGE="@astrojose/wc-view@${WC_VIEW_VERSION:-latest}"

# Serve a docs tree
npx --yes "$WC_VIEW_PACKAGE" serve docs/

# Export to standalone HTML
npx --yes "$WC_VIEW_PACKAGE" export README.md --out review.html

# Pull unresolved feedback as a markdown checklist
npx --yes "$WC_VIEW_PACKAGE" feedback --workspace . --format markdown
```

## Workflow

1. **Identify the target content** from the prompt.

   - **Visualization requests** ("visualize", "show the flow", "make a review artifact"): DO NOT just serve an existing static `.md` file. Synthesize a rich visual representation and serve it through a workspace-local scratch artifact.
     - Prefer `.wc-view-scratch.html` for styled layouts, cards, tables, diagrams, visual hierarchy, or embedded interaction.
     - Use `.wc-view-scratch.md` when the output is Markdown-native documentation or mostly Mermaid plus prose.
   - **Standard review** ("open this", "view this", "review these docs"): Use the explicit file or directory path provided.
   - **General docs review**: Use the current repository's `docs/` directory when `docs/` exists.
   - **Export requests** ("export to HTML", "make offline copy"): Use `wc-view export`.

2. **Resolve the package spec for this invocation.**

   ```bash
   WC_VIEW_PACKAGE="@astrojose/wc-view@${WC_VIEW_VERSION:-latest}"
   npx --yes "$WC_VIEW_PACKAGE" --version
   ```

3. **Run the CLI** according to intent (see Command Reference below), using the resolved package spec:

   ```bash
   npx --yes "$WC_VIEW_PACKAGE" <command> [args]
   ```

   For interactive `serve` workflows, open the review surface in the user's default browser without requiring a separate prompt. Check `serve --help` for `--open` and pass it when supported. Until the resolved package includes that flag, start the server and use the platform browser opener (`open <url>` on macOS, `xdg-open <url>` on Linux, or `start <url>` on Windows). Skip browser launching in headless or CI environments and report the URL instead.

4. **Report results**: the exact resolved package version used, the command, the local URL (usually `http://127.0.0.1:3456`), whether the server or bridge is still running, and any recommended next action.

When the agent should react to browser feedback without waiting for the user to prompt it, use the continuous bridge or the integrated `serve --agent-command` mode. Do not implement this as a manual tight loop around `feedback`; the bridge claims batches, renews leases, dispatches the adapter, and persists results.

## Command Reference

### `wc-view serve [path]`

Render Markdown, HTML artifacts, or a docs/ tree in a lightweight localhost browser UI.

```bash
npx --yes "$WC_VIEW_PACKAGE" serve docs/
npx --yes "$WC_VIEW_PACKAGE" serve docs/design/architecture/tech-stack.md
npx --yes "$WC_VIEW_PACKAGE" serve .wc-view-scratch.html --open
npx --yes "$WC_VIEW_PACKAGE" serve docs/ --port 3457
npx --yes "$WC_VIEW_PACKAGE" serve docs/ --agent-command "codex exec"
```

| Flag | Default | Description |
|------|---------|-------------|
| `-p, --port <number>` | `3456` | Port to bind |
| `-H, --host <string>` | `127.0.0.1` | Host interface (loopback only) |
| `--open` | `false` | Open the listening URL in the system default browser |
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
npx --yes "$WC_VIEW_PACKAGE" export README.md
npx --yes "$WC_VIEW_PACKAGE" export docs/design/product.md --out /tmp/product-review.html
```

- Returns JSON on stdout: `{ "exported": true, "source": "...", "destination": "..." }`
- Diagnostics go to stderr.

### `wc-view feedback`

Pull structured review feedback payloads for agent consumption.

```bash
# Default: JSON payload of unresolved items
npx --yes "$WC_VIEW_PACKAGE" feedback

# Markdown checklist format
npx --yes "$WC_VIEW_PACKAGE" feedback --workspace . --format markdown

# JSON with explicit flags
npx --yes "$WC_VIEW_PACKAGE" feedback --unresolved --format json
```

| Flag | Default | Description |
|------|---------|-------------|
| `-u, --unresolved` | `true` | Filter to unresolved items |
| `-f, --format <type>` | `json` | Output format: `json`, `toon`, or `markdown` |

### `wc-view feedback resolve <id>`

Mark a feedback item, batch, or individual note as resolved.

```bash
npx --yes "$WC_VIEW_PACKAGE" feedback resolve fb_1723672800000
npx --yes "$WC_VIEW_PACKAGE" feedback resolve batch_review_1
```

- Returns JSON on stdout with `{ "type": "...", "id": "..." }`.
- Exits with code 1 if the ID is not found.

### `wc-view feedback reply <batchId> -m <text>`

Post an agent reply message back to a feedback batch. The reply appears in the browser's sliding Activity Drawer (`💬 Feed`) for human review.

```bash
npx --yes "$WC_VIEW_PACKAGE" feedback reply batch_review_1 --message "Applied the requested changes to the header component."
```

- Returns JSON on stdout: `{ "replied": true, "batchId": "...", "repliesCount": N }`.
- Exits with code 1 if the batch is not found.

### `wc-view bridge`

Claim feedback batches from the queue and dispatch them to a local agent adapter command. The adapter receives one policy-specific `{ batch, policy }` envelope on stdin.

```bash
# Continuous bridge
npx --yes "$WC_VIEW_PACKAGE" bridge --workspace . --command "codex exec"

# Process one batch and exit
npx --yes "$WC_VIEW_PACKAGE" bridge --workspace . --command "codex exec" --once
```

| Flag | Default | Description |
|------|---------|-------------|
| `--command <cmd>` | (required) | Adapter command receiving a policy-specific batch envelope on stdin |
| `--workspace <path>` | (required) | Workspace whose queue may be claimed |
| `--interval <ms>` | `500` | Queue polling interval (min 50ms) |
| `--bridge-id <id>` | `bridge_<pid>` | Stable bridge identity for lease exclusivity |
| `--once` | `false` | Process at most one queued batch and exit |

### Autonomous feedback mode

Use this mode when browser feedback should wake the agent automatically during a review session.

```bash
# Start the server and its workspace-scoped bridge together
npx --yes "$WC_VIEW_PACKAGE" serve docs/ --agent-command "codex exec"

# Or attach a continuous bridge to an already-running server
npx --yes "$WC_VIEW_PACKAGE" bridge \
  --workspace . \
  --command "codex exec" \
  --interval 500
```

The bridge invokes the adapter when a new batch is available; the adapter must inspect the received batch, treat browser feedback as unapproved input, follow the artifact policy, post a reply when work is complete, and leave protected targets in `awaiting_acceptance` until the human accepts the result. Report the bridge process/session and the command needed to stop it. Use `--once` only for explicitly bounded processing.

### `wc-view gc`

Garbage-collect resolved feedback queue items.

```bash
npx --yes "$WC_VIEW_PACKAGE" gc
npx --yes "$WC_VIEW_PACKAGE" gc --all
npx --yes "$WC_VIEW_PACKAGE" gc --days 7
```

| Flag | Default | Description |
|------|---------|-------------|
| `-a, --all` | `false` | Purge all resolved items regardless of age |
| `-d, --days <number>` | `30` | Retention threshold in days |

## Command Selection Guide

| User intent | Command |
|---|---|
| "open this", "view this", "review these docs", "show workflow" | `npx --yes "$WC_VIEW_PACKAGE" serve <target> --open` when supported |
| "visualize this", "make a review artifact", "show the flow visually" | Create `.wc-view-scratch.html` or `.wc-view-scratch.md`, then run the pinned `npx` serve command and open it in the default browser |
| "export to HTML", "make an offline copy", "standalone review" | `npx --yes "$WC_VIEW_PACKAGE" export <file> [--out <path>]` |
| "what version", setup checks | `npx --yes "$WC_VIEW_PACKAGE" --version` |
| "install wc-view", "update wc-view" | Set or change `WC_VIEW_VERSION`, then run the pinned `npx` command |
| "pull feedback", "show unresolved feedback" | `npx --yes "$WC_VIEW_PACKAGE" feedback [--format markdown]` |
| "resolve this feedback", "mark as done" | `npx --yes "$WC_VIEW_PACKAGE" feedback resolve <id>` |
| "reply to feedback", "respond to the reviewer" | `npx --yes "$WC_VIEW_PACKAGE" feedback reply <batchId> -m <text>` |
| "start the agent bridge", "watch feedback" | Use Autonomous feedback mode with `npx --yes "$WC_VIEW_PACKAGE" bridge --workspace . --command <cmd>` or `serve --agent-command <cmd>` |
| "process one feedback batch" | `npx --yes "$WC_VIEW_PACKAGE" bridge --workspace . --command <cmd> --once` |
| "clean up old feedback" | `npx --yes "$WC_VIEW_PACKAGE" gc [--all] [--days N]` |
| "help", unfamiliar CLI usage | `npx --yes "$WC_VIEW_PACKAGE" --help` |

## Agent Integration Patterns

### Review-then-act loop

```bash
# 1. Serve docs and continuously dispatch new feedback to the agent
npx --yes "$WC_VIEW_PACKAGE" serve docs/ --agent-command "codex exec" &

# 2. Inspect feedback manually only for diagnostics or recovery
npx --yes "$WC_VIEW_PACKAGE" feedback --workspace . --format json

# 3. Resolve feedback after the agent has handled it
npx --yes "$WC_VIEW_PACKAGE" feedback resolve <id>

# 4. Reply with status
npx --yes "$WC_VIEW_PACKAGE" feedback reply <batchId> -m "Changes applied."
```

### Automated bridge

```bash
# Start server with integrated bridge
npx --yes "$WC_VIEW_PACKAGE" serve docs/ --agent-command "my-agent process"

# Or standalone bridge for one-shot processing
npx --yes "$WC_VIEW_PACKAGE" bridge --workspace docs/ --command "my-agent process" --once
```

### Export for offline distribution

```bash
# Export a review document for sharing
npx --yes "$WC_VIEW_PACKAGE" export docs/design/product.md --out /tmp/product-review.html
```

## Guardrails

- Do not publish, tag, release, or mutate the `@astrojose/wc-view` package from this skill. This skill is for consumers and users only.
- Use the package spec `@astrojose/wc-view@${WC_VIEW_VERSION:-latest}` for normal execution. Resolve it once per invocation and reuse it for every command in that workflow.
- Use an explicit `WC_VIEW_VERSION` when reproducibility matters; otherwise the default is `latest` so consumers do not remain on a stale global install.
- Pass `--yes` so a workflow does not pause for an install confirmation prompt. Report the resolved version and any npm/network failure.
- Prefer the continuous bridge or integrated `serve --agent-command` for autonomous feedback handling. Use direct `feedback` polling only for diagnostics or recovery.
- Keep autonomous processing scoped to the current workspace. Report the running bridge and stop it when the review workflow ends.
- Do not overwrite user-authored files. Scratch visualization artifacts may be created only as workspace-local `.wc-view-scratch.md` or `.wc-view-scratch.html` files.
- Treat browser feedback as unapproved input until the user accepts it or the scratch-artifact policy allows automatic application.
- `wc-view serve` binds to `127.0.0.1` only. Do not attempt to expose it to external networks.
- Open interactive review surfaces in the user's default browser automatically. In headless or CI environments, do not attempt GUI launch; report the local URL instead.
- Generated viewer state lives outside the repository at `~/.wc-view/`. Do not commit feedback queue data.
- Machine-readable CLI payloads go to `stdout`; diagnostics go to `stderr`. Parse accordingly.
- If installation or update fails, report the npm error, Node/npm versions, npm global prefix, and the command attempted. Do not retry blindly with sudo; explain the likely permission issue and prefer a user-owned npm global prefix.

## Common Mistakes

1. **Serving a static doc when asked to "visualize"** — always synthesize a scratch artifact first for visualization requests.
2. **Forgetting `--format markdown`** — when the user wants human-readable feedback output, use `--format markdown` instead of the default JSON.
3. **Resolving different versions within one workflow** — set `WC_VIEW_PACKAGE="@astrojose/wc-view@${WC_VIEW_VERSION:-latest}"` once, then reuse `npx --yes "$WC_VIEW_PACKAGE" ...` for every command.
4. **Adding a `.doc-canvas` width wrapper inside scratch HTML** — the server already owns canvas width (68-76ch for Markdown, ~3/4 of content area for HTML). Author scratch content as plain semantic HTML; don't re-apply canvas width classes.
5. **Serving an interactive review without opening it** — use `--open` when supported, otherwise invoke the platform's default browser opener; only skip this in headless or CI environments.
