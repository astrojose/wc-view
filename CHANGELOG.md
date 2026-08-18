# Changelog

## [Unreleased]

## [0.9.2] - 2026-08-19

### Added

- Add `wc-view serve --open` to launch the review surface in the system default browser on macOS, Linux, and Windows.
- Teach the `use-wc-view` companion skill to open interactive review surfaces automatically, with compatibility fallback for older CLI versions and headless environments.

## [0.9.1] - 2026-08-15

### Fixed

- Center the sidebar-aware HTML artifact canvas using body-relative width (`100%`) instead of `100vw`, so classic (always-visible) scrollbars no longer skew centering.

## [0.9.0] - 2026-08-15

### Added

- Widen the HTML artifact canvas to ~3/4 of the available content area, sidebar-aware, via a `format`-scoped `.doc-canvas.is-html` modifier. Markdown stays at `68-76ch`.
- Align `.theme-toggle` to follow the active canvas width under both Markdown and HTML formats, with and without the directory-serve sidebar.
- Add a `use-wc-view` companion-skill guardrail against nesting `.doc-canvas` width wrappers inside scratch HTML.

## [0.8.3] - 2026-08-15

### Changed

- Publish releases to npm via a GitHub Actions workflow (`.github/workflows/publish.yml`) triggered by the pushed version tag, instead of running `npm publish` locally with browser OTP approval.

## [0.8.2] - 2026-08-15

### Changed

- Use version-isolated `npx` execution for the `use-wc-view` companion skill, defaulting to the latest release with an explicit version override for reproducible workflows.
- Document autonomous feedback handling through the workspace bridge so agents can react to browser feedback without manual polling prompts.
- Document browser-based npm OTP approval in the release workflow without exposing credentials or tokens.

## [0.8.1] - 2026-08-15

### Fixed

- Surface `wc-view serve` port conflicts as a clean, actionable CLI error instead of an unhandled `EADDRINUSE` stack trace.
- Warn on `wc-view serve` startup when a workspace already has queued feedback batches but no `--agent-command` bridge is attached, so they don't silently sit unprocessed.
- Show a "No Agent Attached" status chip in the browser's Review Activity drawer whenever the serving process has no agent bridge, replacing the always-on "Live Feed" chip that gave no signal that feedback would go unprocessed.

## [0.8.0] - 2026-08-15

### Added

- Add canonical workspace, serve-session, and server-derived target provenance to durable feedback batches.
- Add workspace, target, session, legacy, and cross-workspace filters to `wc-view feedback`.

### Changed

- Scope feedback stores and bridge claims by workspace instead of using one global queue.
- Run bridge adapters asynchronously with renewable ownership leases and policy-specific envelopes.
- Scope REST and SSE feedback state to each validated browser target while retaining durable polling recovery.
- Require `--workspace <path>` for standalone bridge commands.

### Fixed

- Prevent browser payloads and mismatched approval or reply requests from selecting another document target.
- Prevent unapproved protected work from persisting an `applied` result before explicit acceptance.
- Recover stale queue locks safely and surface queue read failures instead of treating them as empty state.

## [0.7.0] - 2026-08-15

### Added

- Add installable plugin manifests for Claude Code (`.claude-plugin/`), OpenAI Codex (`.codex-plugin/`), and the vendor-neutral Agent Plugins 1.0 standard (`plugin.json`), covering Cursor and other spec-compliant clients.
- Move the `use-wc-view` companion skill into the repository under `skills/use-wc-view/`.

### Changed

- Tokenize remaining hardcoded spacing and border values in the client stylesheet against the existing design-system scale.
- Align floating composer action button sizing (`Discard`, `Send to Agent`, `Accept and apply`) with the existing compact `btn-sm` variant already used by the Feed button.
- Document required npm `.npmrc` authentication for publishing in `AGENTS.md`, `README.md`, and the release skill.

### Fixed

- Remove inline styles from `FloatingComposer`; use design-system classes.
- Fix a CSS specificity bug where elements with the native `hidden` attribute (e.g. the "Accept and apply" button) remained visible due to an equal-specificity class rule.
- Fix the floating composer's text input overflowing its 44px tap-target floor due to padding stacking beyond `min-height`.
- Stop rendering the reviewed document's filename as a page heading above the canvas.

## [0.6.0] - 2026-08-14

### Added

- Add standalone zero-dependency offline HTML export engine and `wc-view export <file> [--out <path>]` CLI command.
- Add two-way agent dialogue feed with `wc-view feedback reply <batchId> --message <text>` and in-browser sliding Activity Drawer (`💬 Feed`).
- Add interactive GFM task list checkboxes (`- [ ]` / `- [x]`) that automatically stage structured decision notes into the composer.
- Add multi-document recursive tree sidebar with real-time text filter and in-browser document switching.
- Add live document hot-reloading over SSE on disk file changes.
- Add markdown diff block syntax highlighting and dynamic Mermaid diagram re-theming on Dark/Light mode switch.
- Add accessible design-system keyboard shortcut help modal (`HelpDialog`).
- Add programmatic feedback resolution via `wc-view feedback resolve <id>` and markdown checklist formatting via `wc-view feedback --format markdown`.

## [0.5.2] - 2026-08-01

### Fixed

- Resolve npm `.bin` symlink paths before reading package metadata so `wc-view --version` reports the published package version under `npx`.

## [0.5.1] - 2026-08-01

### Changed

- Tighten FloatingComposer spacing so the input and action controls keep better proportions.

### Fixed

- Refresh the rendered document when an agent-applied feedback batch updates the current file.
- Report the CLI version from package metadata instead of a stale hardcoded value.

## [0.5.0] - 2026-08-01

### Added

- Render `.html` and `.htm` review artifacts directly in wc-view with sanitized in-app styling.
- Treat `.wc-view-scratch.html` artifacts as scratch targets so accepted browser feedback can update generated styled HTML by default.

### Changed

- Style Markdown and HTML artifact content through the wc-view design system, including headings, tables, code blocks, blockquotes, cards, and responsive document layout.
- Replace inline composer, annotation, dialog, and status layout styles with named design-system classes.
- Keep the status region sticky at the top of the review surface while the composer remains non-modal at the bottom.

### Fixed

- Serve built client chunks from packaged `dist/` installs so dynamic Mermaid and other split assets load correctly from npm.
- Report the CLI version from package metadata instead of a hardcoded string.

## [0.4.0] - 2026-08-01


### Added

- Add durable feedback batches, exclusive bridge claims, and `wc-view bridge` for automatic agent work after browser submission.
- Stream replayable batch state and results to the review surface through Server-Sent Events.
- Add scratch-versus-protected target policy and explicit protected-result acceptance.

### Changed

- Submit all notes and the optional prompt as one idempotent browser batch instead of persisting notes individually.
- Prevent client asset caching so a restarted local review surface loads the current feedback workflow.

## [0.3.0] - 2026-08-01

### Added

- Stream real-time feedback updates over the new `/api/events` Server-Sent Events endpoint whenever feedback is posted.

### Changed

- Update review-surface submission messaging to confirm notes were submitted to the feedback queue.

## [0.2.1] - 2026-08-01

### Fixed

- Bundle Mermaid client assets for npm installs so dynamic diagram rendering works without CDN dependencies.
- Preserve CLI stream discipline by keeping feedback JSON as the default payload and sending diagnostics to stderr.

## [0.2.0] - 2026-08-01

### Added

- Support for dynamic AI visualization synthesis and Mermaid rendering within Markdown documents.

## [0.1.1] - 2026-08-01

### Fixed

- Prevent Space typed inside annotation comment fields from reopening the block editor and clearing the draft.

### Changed

- Require `release-wcv` to commit release changes on the current branch through `git-commit-now`.

## [0.1.0] - 2026-08-01

### Added

- Initial wc-view package setup for `@astrojose/wc-view`.
- Local `wc-view` CLI binary contract for Markdown review workflows.
- GitHub Release and npm publishing workflow support through `release-wcv`.
