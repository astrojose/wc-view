# wc-view

Local Markdown and HTML review surface for agent workflows.

## Current State

- `wc-view` design truth is adopted in `docs/design/` (product, interfaces, data).
- `wc-view Design System/` is the authoritative source for the UI/UX design system (tokens, components, colors, typography, layout).
- Implementation is tracked in `docs/implementation/`.
- Package name is `@astrojose/wc-view`; CLI binary is `wc-view`.
- Release workflow is owned by `.agents/skills/release-wcv/`.

## Start Here

1. Read `.agents/skills/workflow-contract/SKILL.md`.
2. Validate: `python3 .agents/workflows/workflow-contract/scripts/validate_workflow.py`.
3. Read relevant docs in `docs/design/`.
4. Treat `docs/changes/proposed/` as unresolved intent only.

## Local Setup

1. Install dependencies: `npm install`.
2. Build the CLI: `npm run build`.
3. Run the local CLI: `node dist/bin/wc-view.js --help`.

## Running

- Serve docs: `node dist/bin/wc-view.js serve docs/`.
- Serve one file: `node dist/bin/wc-view.js serve docs/design/architecture/tech-stack.md`.
- Use a custom port: `node dist/bin/wc-view.js serve docs/ --port 3457`.
- Pull unresolved feedback: `node dist/bin/wc-view.js feedback --unresolved`.
- Garbage-collect feedback: `node dist/bin/wc-view.js gc`.

## Testing & Verification

- Type-check: `./node_modules/.bin/tsc --noEmit`.
- Unit tests: `npm test`.
- Production build: `npm run build`.
- Workflow validation: `npm run validate:workflow`.
- Release preflight: `python3 .agents/skills/release-wcv/scripts/preflight_release.py --version <version>`.

Run type-check after coherent TypeScript changes. Run workflow validation after docs, task, proposal, or AGENTS changes.

## Agent Rules

- Markdown, Mermaid, and explicit human acceptance are authoritative.
- When asked to "visualize" a concept, process, or file, synthesize a dynamic visual representation into a temporary scratch file and serve that artifact via `wc-view`, rather than serving static text docs blindly.
- Prefer `.wc-view-scratch.html` for rich visual artifacts that need layout, style, or interaction; use `.wc-view-scratch.md` for document-first review.
- Do not create implementation tasks or code before accepted design truth exists.
- Do not treat `docs/changes/proposed/` as approved truth.
- Keep generated viewer state outside the repository: `~/.wc-view/`.
- Keep machine-readable CLI payloads on `stdout`; send diagnostics to `stderr`.
- Preserve `wc-view` localhost binding to `127.0.0.1` unless an accepted design change says otherwise.
- Do not run `npm publish`, `git push`, `git push --tags`, or `gh release create` without explicit user approval in the current turn.

## Shared Skills

- Canonical skills: `.agents/skills/`
- Consumer companion skill: `skills/use-wc-view/`
- Workflow policy: `.agents/workflows/workflow-contract/`
- Release workflow: `.agents/skills/release-wcv/`
