# wc-view

Interactive artifact workspace for human-agent collaboration.

`wc-view` gives people and active agents a shared local surface for inspecting
and iterating on work. Serve existing Markdown or documentation folders when
that is the intent, or serve an HTML artifact synthesized during a design,
implementation, troubleshooting, or brainstorming discussion. Anchor feedback
to the artifact and route it back through the local agent bridge.

## What It Is For

- Turn an active discussion into an inspectable Markdown or HTML artifact.
- Review the artifact in a local browser and attach precise feedback.
- Let an agent process feedback while keeping protected project changes subject
  to explicit human acceptance.

## Package

- npm package: `@astrojose/wc-view`
- CLI binary: `wc-view`
- Runtime: Node.js 18+
- State path: `~/.wc-view/feedback/workspaces/<workspace-id>/queue.jsonl`

## Install

### CLI

Run the latest CLI without a global install:

```bash
npx --yes @astrojose/wc-view@latest --help
```

For a persistent `wc-view` command, install globally:

```bash
npm install -g @astrojose/wc-view
wc-view --help
```

### Claude Code

Add the GitHub marketplace and install the plugin:

```bash
claude plugin marketplace add astrojose/wc-view
claude plugin install wc-view@wc-view
claude plugin list
```

Inside an interactive Claude Code session, use:

```text
/plugin marketplace add astrojose/wc-view
/plugin install wc-view@wc-view
```

### Codex CLI

Add the GitHub marketplace and install the plugin:

```bash
codex plugin marketplace add astrojose/wc-view
codex plugin add wc-view@wc-view
codex plugin list
```

Start a new Codex thread after installation so it loads the plugin's skills.

### Local plugin testing

When testing an uncommitted checkout, use the local marketplace instead:

```bash
claude plugin marketplace add .
codex plugin marketplace add .
```

### Other agent harnesses

The repository also includes the vendor-neutral Agent Plugins 1.0 manifest at `plugin.json`. Harnesses that support that standard can install the repository through their plugin or marketplace command. There is no universal CLI for other harnesses; use their local-plugin installation flow.

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

Open the artifact in the system default browser after the server starts:

```bash
wc-view serve .wc-view-scratch.html --open
```

Export standalone offline HTML:

```bash
wc-view export docs/design/architecture/tech-stack.md --out ./tech-stack.html
```

Pull unresolved feedback for an agent:

```bash
wc-view feedback --workspace . --unresolved
```

Format feedback as a markdown checklist for PR comments:

```bash
wc-view feedback --workspace . --format markdown
```

Filter feedback to one served target or session:

```bash
wc-view feedback --workspace . --target .wc-view-scratch.html
wc-view feedback --workspace . --session <serve-session-id>
```

List legacy individual notes or explicitly inspect every workspace:

```bash
wc-view feedback --workspace . --legacy
wc-view feedback --all-workspaces
```

Run a workspace-scoped bridge:

```bash
wc-view bridge --workspace . --command "my-agent process"
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

Run release preflight for the current version:

```bash
python3 .agents/skills/release-wcv/scripts/preflight_release.py --version "$(node -p "require('./package.json').version")"
```

## Release

Ensure npm authentication is set in `.npmrc` (`npm login`).

Use the repo-local release skill:

```text
/release-wcv
```

The release workflow verifies typecheck, tests, build, changelog contents, npm package metadata, and npm tarball contents before any publish step. It publishes using `npm publish --access public` (utilizing `.npmrc`) and requires explicit approval before publishing, Git tag push, or GitHub Release creation.

## Documentation

- Product and architecture truth: `docs/design/`
- Repo-local skills: `.agents/skills/`

## Safety

- The localhost server must bind to `127.0.0.1`.
- Generated feedback state must remain outside the repository under `~/.wc-view/`.
- Machine-readable CLI output must write to `stdout`; diagnostics must write to `stderr`.
