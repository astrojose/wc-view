# wc-view

Local Markdown review surface for agent workflows.

## Current State

- `wc-view` design truth is adopted in `docs/design/` (product, interfaces, data).
- `wc-view Design System/` is the authoritative source for the UI/UX design system (tokens, components, colors, typography, layout).
- Implementation is planned in `docs/implementation/` — Phases 01-02 are unblocked; Phases 03-04 are `blocked` pending open decisions.
- Five open decisions remain unresolved: `docs/changes/proposed/wc-view-open-decisions.md`.
- No code is authorized yet — only design and implementation planning docs exist.

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
