# Changelog

## [Unreleased]

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
