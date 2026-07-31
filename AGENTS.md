# wc-view

Local Markdown review surface for agent workflows.

## Current State

- `wc-view` is proposed.
- No design, implementation plan, or code is authorized.
- Current proposal: `docs/changes/proposed/wc-view-local-markdown-review-surface.md`.

## Start Here

1. Read `.agents/skills/workflow-contract/SKILL.md`.
2. Validate: `python3 .agents/workflows/workflow-contract/scripts/validate_workflow.py`.
3. Read `docs/design/` when it exists.
4. Treat `docs/changes/proposed/` as unresolved intent only.

## Agent Rules

- Markdown and explicit human acceptance are authoritative.
- Do not create implementation tasks or code before accepted design truth exists.
- Keep generated viewer state outside the repository: `~/.wc-view/`.

## Shared Skills

- Canonical skills: `.agents/skills/`
- Workflow policy: `.agents/workflows/workflow-contract/`
