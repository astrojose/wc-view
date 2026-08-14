---
name: release-wcv
description: Release wc-view as the @astrojose/wc-view npm package and GitHub Release. Use when the user invokes /release-wcv, $release-wcv, or asks to prepare, verify, tag, publish, or create release notes for wc-view.
---

# Release wc-view

## Purpose

Run the wc-view release workflow end to end: changelog, versioning, verification, npm package publishing, Git tag push, and GitHub Release notes.

## Release Target

- Package name: `@astrojose/wc-view`.
- CLI binary: `wc-view`.
- Primary distribution: npm.
- Contributor-testing distribution: GitHub Release with tag, generated release notes, source archive, npm pack evidence, and attached package artifact when available.
- Do not release this as part of `workflow-contract`; `wc-view` stays an independent CLI/browser tool.

## Safety Rules

- Never run `npm publish`, `git push`, `git push --tags`, or `gh release create` before showing the exact release plan and receiving explicit user approval in the current turn.
- Ensure npm authentication is configured in `.npmrc` (`npm login`) prior to publishing.
- Never discard, reset, or overwrite unrelated user changes.
- Always commit release changes on the current branch. Do not create or switch branches during this release skill.
- Always use `$git-commit-now` to create the release commit after verification, staging only the approved release files for the current branch.
- Stop if the package name is not `@astrojose/wc-view`.
- Stop if `npm pack --dry-run` shows unexpected sensitive files, local state, `.env`, credentials, or generated feedback under `~/.wc-view/`.
- Stop if npm pack includes repo-operational paths such as `.agents/`, `.claude/`, `docs/`, `src/`, or `wc-view Design System/`.
- Stop if `CHANGELOG.md` does not contain the target version and date.
- Stop if verification fails, unless the user explicitly accepts a documented exception.

## Workflow

1. Inspect release context:
   - Run `git status --short`.
   - Read `package.json`, `package-lock.json`, and `CHANGELOG.md`.
   - Determine the target semver version from the user request or package metadata.
2. Prepare release files:
   - Set `package.json` and `package-lock.json` to the target version.
   - Set `version` in `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json` to the target version.
   - Update `CHANGELOG.md` with a dated `## [x.y.z] - YYYY-MM-DD` entry.
   - Keep an `## [Unreleased]` section at the top for future work.
   - Review `skills/use-wc-view/SKILL.md` against any CLI surface changes in this release (new/changed commands, flags, output formats) and update it if it has drifted.
3. Verify locally:
   - Run `./node_modules/.bin/tsc --noEmit` when local TypeScript exists.
   - Run `npm test`.
   - Run `npm run build`.
   - Run `npm run validate:workflow`.
   - Run `python3 .agents/skills/release-wcv/scripts/preflight_release.py --version <x.y.z>` (includes `claude plugin validate .`).
   - Optionally sanity-check the Codex manifest by hand: `codex plugin marketplace add ./`, confirm `wc-view@wc-view` appears in `codex plugin list`, then `codex plugin marketplace remove wc-view`. Not run by the preflight script since it mutates local Codex config.
4. Review publish plan:
   - Show current branch and commit target.
   - Show version, npm package name, tag name `v<x.y.z>`, changelog heading, and release notes summary.
   - Show commands that will write externally.
   - Ask for explicit approval before external writes.
5. Publish only after approval:
   - Use `$git-commit-now` on the current branch to commit the approved release files with `chore(release): release v<x.y.z>`.
   - Create annotated tag `v<x.y.z>`.
   - Run `npm publish --access public` (utilizes authentication in `.npmrc`).
   - Push the branch and tag.
   - Run `gh release create v<x.y.z> --title "v<x.y.z>" --notes-file <release-notes-file>`.
6. Verify publication:
   - Run `npm view @astrojose/wc-view@<x.y.z> version`.
   - Run `gh release view v<x.y.z>`.
   - Report npm package, tag, GitHub Release URL, and verification commands.

## Changelog Format

Use this shape:

```markdown
# Changelog

## [Unreleased]

## [0.1.0] - 2026-08-01

### Added

- Initial wc-view release.
```

Keep entries concise and grouped under `Added`, `Changed`, `Fixed`, `Removed`, or `Security` only when those groups apply.

## Release Notes

Generate release notes from the changelog entry. Include:

- Package: `@astrojose/wc-view`.
- Install/test command: `npx @astrojose/wc-view@<x.y.z> --help`.
- Contributor-testing note: use the GitHub Release assets and npm pack artifact when testing before npm install.
- Verification summary: typecheck, tests, build, workflow validation, npm pack dry run.

## Preflight Script

Run:

```bash
python3 .agents/skills/release-wcv/scripts/preflight_release.py --version <x.y.z>
```

The script performs static release checks and command-based verification. It does not publish, tag, push, or create a GitHub Release.
