# wc-view

Local Markdown and HTML review surface for agent workflows.

`wc-view` renders Markdown files, styled HTML artifacts, or documentation trees in a localhost browser UI and stores review feedback in user-local state for agent reconciliation.

## Package

- npm package: `@astrojose/wc-view`
- CLI binary: `wc-view`
- Runtime: Node.js 18+
- State path: `~/.wc-view/feedback/queue.jsonl`

## Install

Use without installing:

```bash
npx @astrojose/wc-view --help
```

Install globally:

```bash
npm install -g @astrojose/wc-view
wc-view --help
```

Use from a local checkout:

```bash
npm install
npm run build
node dist/bin/wc-view.js --help
```

## Usage

Render a documentation tree:

```bash
wc-view serve docs/
```

Render a single Markdown file:

```bash
wc-view serve docs/design/architecture/tech-stack.md
```

Render a styled HTML scratch artifact:

```bash
wc-view serve .wc-view-scratch.html
```

Use a custom port:

```bash
wc-view serve docs/ --port 3457
```

Export standalone offline HTML:

```bash
wc-view export docs/design/architecture/tech-stack.md --out ./tech-stack.html
```

Pull unresolved feedback for an agent:

```bash
wc-view feedback --unresolved
```

Format feedback as a markdown checklist for PR comments:

```bash
wc-view feedback --format markdown
```

Post an agent reply to a review batch:

```bash
wc-view feedback reply <batchId> --message "Updated database schema per review notes"
```

Resolve a feedback item or batch:

```bash
wc-view feedback resolve <id>
```

Garbage-collect resolved feedback older than the default retention window:

```bash
wc-view gc
```

Purge all resolved feedback:

```bash
wc-view gc --all
```


## Local Development

Install dependencies:

```bash
npm install
```

Build once:

```bash
npm run build
```

Watch builds:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Run TypeScript type-check:

```bash
./node_modules/.bin/tsc --noEmit
```

Run workflow validation:

```bash
npm run validate:workflow
```

Run release preflight for the current version:

```bash
python3 .agents/skills/release-wcv/scripts/preflight_release.py --version 0.1.0
```

## Release

Ensure npm authentication is set in `.npmrc` (`npm login`).

Use the repo-local release skill:

```text
/release-wcv
```

The release workflow verifies typecheck, tests, build, workflow validation, changelog contents, npm package metadata, and npm tarball contents before any publish step. It publishes using `npm publish --access public` (utilizing `.npmrc`) and requires explicit approval before publishing, Git tag push, or GitHub Release creation.

## Documentation

- Product and architecture truth: `docs/design/`
- Implementation planning: `docs/implementation/`
- Proposed unresolved changes: `docs/changes/proposed/`
- Workflow policy: `.agents/workflows/workflow-contract/`
- Repo-local skills: `.agents/skills/`

## Safety

- The localhost server must bind to `127.0.0.1`.
- Generated feedback state must remain outside the repository under `~/.wc-view/`.
- Machine-readable CLI output must write to `stdout`; diagnostics must write to `stderr`.
