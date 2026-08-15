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
- Treat npm browser OTP approval as part of the normal publish flow. Never ask the user to paste an OTP or authentication token into chat.
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
   - Set `version` in `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, and `plugin.json` (Agent Plugins 1.0 manifest) to the target version.
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
   - If npm returns `EOTP` with a masked browser URL, follow **Browser OTP Approval** below; do not push or create the GitHub Release until npm publication is verified.
   - Push the branch and tag.
   - Run `gh release create v<x.y.z> --title "v<x.y.z>" --notes-file <release-notes-file>`.
6. Verify publication:
   - Run `npm view @astrojose/wc-view@<x.y.z> version`.
   - Run `gh release view v<x.y.z>`.
   - Report npm package, tag, GitHub Release URL, and verification commands.

## Browser OTP Approval

Use this flow when non-interactive `npm publish` returns `EOTP` and masks the browser URL:

1. Start the same publish command in a durable pseudo-terminal. Prefer a tracked terminal session that survives tool-response boundaries:

   ```bash
   tmux new-session -d -s wc-view-npm-publish \
     "cd <repo> && script -q /tmp/wc-view-npm-auth.txt npm publish --access public"
   ```

   - Reuse an existing dedicated session only after confirming it belongs to the same package and version.
   - When durable terminal tooling is unavailable, run `script -q /tmp/wc-view-npm-auth.txt npm publish --access public` in a foreground pseudo-terminal and keep it alive until approval completes.

2. Poll the transcript until npm emits the full URL:

   ```bash
   grep -Eo 'https://www\.npmjs\.com/auth/cli/[[:alnum:]-]+' /tmp/wc-view-npm-auth.txt | tail -1
   ```

3. Print that URL to the user and ask them to approve it in the browser. Do not expose the registry completion URL, retrieved token, `.npmrc`, or OTP material.
4. Keep the original publish process alive. Do not launch a second publish while it is waiting for approval.
5. After the user confirms approval, wait for the original process to exit and inspect its output.
6. Verify publication before proceeding:

   ```bash
   npm view @astrojose/wc-view@<x.y.z> version
   ```

7. If the waiting process was interrupted or its result is ambiguous:
   - Run the npm verification command first.
   - If the target version exists, treat publication as complete and continue with branch/tag push and GitHub Release creation.
   - Retry `npm publish --access public` only when the target version is absent.
   - If a retry says the version was previously published, verify the registry and continue rather than treating it as a release failure.

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
