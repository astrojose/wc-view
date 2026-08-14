# Changelog

## [Unreleased]

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
