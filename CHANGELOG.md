# Changelog

## [Unreleased]

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
