# wc-view: Technical Stack & Architecture

## Context

- `wc-view` is a local Markdown review surface for agent workflows, designed as an independent CLI tool and localhost web interface.
- UI/UX design truth and visual tokens are defined in `wc-view Design System/` (and summarized in `docs/design/product/ux-design-system.md`).
- Markdown and explicit human acceptance are authoritative; browser feedback is unapproved input stored in user-local state (`~/.wc-view/feedback/queue.jsonl`).

## Requirements & Constraints

1. **Zero External CDN Dependencies**: All CSS tokens, fonts, icons, and client JavaScript assets must be self-contained and served locally to ensure zero runtime network calls and deterministic performance.
2. **Performance Budgets**:
   - INP ≤ 200 ms (p75).
   - CLS = 0 (driven by pre-reserved element heights `reservedHeight` for code blocks and SVGs/Mermaid diagrams). Dynamic AI visualizations (Mermaid, HTML) must render asynchronously without blocking or shifting content.
   - CLI startup time < 30 ms for help/version queries.
3. **Security Boundary**: Localhost server must bind strictly to `127.0.0.1` (loopback only) to prevent network exposure.

## Tech Stack Choices

| Subsystem | Technology | Rationale |
|---|---|---|
| **Runtime & Language** | Node.js (≥ 18) & TypeScript (ES2022, ESM `"type": "module"`) | Ubiquitous across AI agent environments (Codex, Claude Code, Antigravity, OpenCode, Cursor). Provides strict type safety for CLI contracts and feedback schemas. |
| **CLI Framework** | `commander` | Lightweight, zero-dependency argument parser with subcommand dispatch (`serve`, `feedback`, `gc`). |
| **Local HTTP Server** | Native Node.js `http` module | Sub-50ms cold startup time, zero external framework bloat, strict control over loopback `127.0.0.1` binding. |
| **Markdown Engine** | `marked` (+ GFM extension) | Ultra-fast client/server Markdown parsing with deterministic heading slug generation and HTML output. |
| **Diagram Engine** | `mermaid` | Client-side diagram rendering using pre-reserved height containers (`reservedHeight`) to prevent cumulative layout shift. |
| **UI Design System** | Vanilla CSS (`wc-view Design System/`) | Direct adoption of the 100% complete CSS custom properties, tokens, and components from `wc-view Design System/`. |
| **Build & Packaging** | `tsup` / `esbuild` | Fast TypeScript bundling into a single executable CLI (`dist/bin/wc-view.js`) and static frontend asset copier. |
| **Test Framework** | `vitest` / `node:test` | Unit and contract testing for CLI arguments, Markdown parsing, and JSONL queue operations. |

## CLI Engineering Best Practices

1. **POSIX Stream Discipline**:
   - `stdout` (`1`): Reserved exclusively for machine-readable output payloads (e.g. `wc-view feedback --unresolved`). Allows clean shell piping (`wc-view feedback | jq .`).
   - `stderr` (`2`): Used for all status logs, server listening toasts, diagnostic warnings, and error messages.
2. **TTY & Color Awareness (`NO_COLOR`)**:
   - Detect non-TTY execution environment (`!process.stdout.isTTY`). Strip ANSI colors automatically when piped or when `NO_COLOR` environment variable is set.
3. **Fast Lazy Loading**:
   - Defer importing heavy HTTP server or Markdown rendering modules until subcommands execute, keeping `wc-view --help` sub-30ms.
4. **Graceful Signal Handling (`SIGINT` / `SIGTERM`)**:
   - Intercept termination signals in `wc-view serve` to flush file queue writes and cleanly close localhost HTTP sockets.
5. **Dynamic Port Fallback**:
   - Default port: `127.0.0.1:3456`. If port is occupied, automatically increment to an available port and print the listening URL to `stderr`.
6. **Exit Code Schema**:
   - `0`: Clean success.
   - `1`: Operational error (file missing, queue lock failure).
   - `2`: Syntax / usage error (unknown flag, invalid option).

## Acceptance Criteria

- `dist/bin/wc-view.js` executes CLI subcommands without external network calls.
- Stdout contains clean JSON payloads when invoked non-interactively.
- Zero layout shift (CLS = 0) verified on rendered Markdown documents.
