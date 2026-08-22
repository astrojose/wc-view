# wc-view

Interactive artifact workspace for human-agent collaboration.

## Start Here

1. Read `skills/use-wc-view/SKILL.md` for artifact, visualization, feedback, and bridge behavior.
2. Read relevant product and interface truth in `docs/design/`.
3. Read `.agents/skills/release-wcv/SKILL.md` only for release work.

## Testing & Verification

- Type-check: `./node_modules/.bin/tsc --noEmit`.
- Unit tests: `npm test`.
- Production build: `npm run build`.
- Release preflight: `python3 .agents/skills/release-wcv/scripts/preflight_release.py --version <version>`.

Run type-check after coherent TypeScript changes.

## Project Rules

- Markdown, Mermaid, and explicit human acceptance are authoritative.
- Keep generated viewer state outside the repository: `~/.wc-view/`.
- Keep machine-readable CLI payloads on `stdout`; send diagnostics to `stderr`.
- Preserve `wc-view` localhost binding to `127.0.0.1` unless an accepted design change says otherwise.
- Do not run `npm publish`, `git push`, `git push --tags`, or `gh release create` without explicit user approval in the current turn. Ensure npm authentication is configured via `.npmrc` (`npm login`).
