# Release Notes

## Versioning

- Git tags: `vMAJOR.MINOR.PATCH`
- Backward-incompatible changes → minor bump (pre-1.0) or major bump (post-1.0)
- Additive changes (new optional features, new scripts that don't break existing configs) → patch bump
- All releases must pass `python3 .agents/workflows/workflow-contract/scripts/validate_workflow.py` before tagging

## Consumer Upgrade Contract

1. Install with `npx @jerrylusato/agents-setup init --workflow workflow-contract --yes`.
2. Follow the migration guide in `compatibility/migrate-vX.Y-to-vA.B.md` when present.
3. Run validator and confirm `WORKFLOW:ok`.
4. Merge only after compatibility is confirmed.

---

## v0.2.2

### Added

- `workflow.json` metadata so the public CLI can discover this workflow.
- `scripts/package_workflow_release.py` to build private `ipf-workflows-v<version>.tar.gz` release assets.
- `.agents/workflows/workflow-contract` as the canonical installed workflow location.

### Changed

- Bootstrap now uses `.agents/skills` directly and links Claude/Junie to that store.
- Bootstrap no longer creates a `GEMINI.md` bridge.
- Consumer onboarding is CLI-first through `npx @jerrylusato/agents-setup`.

---

## v0.2.1

**Breaking changes — see `compatibility/migrate-v0.2.0-to-v0.2.1.md`.**

### Removed

- `adapters/` directory and all consumer adapter files — state does not belong in the shared library
- `adapter-template.md` — adapter concept eliminated
- `--repo-name` CLI argument from `init_workflow_contract.py` — was only used for adapter generation
- `repo_name_from_git()`, `sanitize_repo_name()`, `resolve_repo_name()`, `ensure_adapter()` from `init_workflow_contract.py`
- `.agents/workflows/workflow-contract/adapters` from `required_directories` in `repo.config.json`
- "Adapter Extension Workflow" from `CONTRIBUTING.md`
- "Adapter Name Resolution" from `repo-config-reference.md`

### Changed

- `README.md` — removed all adapter references; updated `make check` description, done checklist, AGENTS.md snippet, package contents
- `adopt-new-repo.md` — removed adapter step from bootstrap sequence and done checklist
- `CONTRIBUTING.md` — replaced adapter workflow with documentation tone rules from `spec/workflow-spec.md`
- `.agents/skills/workflow-contract/SKILL.md` — removed adapter from canonical sources and Step 2 bootstrap

### Consumer migration

Remove the `Repo adapter:` line from the `Workflow Authority` section of `AGENTS.md`:

```diff
 ## Workflow Authority

 - Canonical workflow policy: `.agents/workflows/workflow-contract/spec/*`
-- Repo adapter: `.agents/workflows/workflow-contract/adapters/<repo-name>.md`
 - Canonical validator: `python3 .agents/workflows/workflow-contract/scripts/validate_workflow.py`
```

---

## v0.2.0

**Breaking changes — see `compatibility/migrate-v0.1-to-v0.2.md`.**

### Removed

- `spec/layering-spec.md` — layer rules absorbed into `spec/workflow-spec.md`
- `spec/enforcement-spec.md` — enforcement section absorbed into `spec/guardrails-spec.md`
- `spec/glossary.md` — terms dropped (self-evident from context)

### Added

- `spec/task-spec.md` — minimum viable task standard: required sections, acceptance criteria rules, parallel agent boundary rules
- `scripts/validate_readiness.py` — `READINESS` check: in-progress tasks must have populated acceptance criteria and scope boundary; done tasks must have verification evidence
- `scripts/validate_scope_conflicts.py` — `SCOPE` check: no two in-progress tasks may claim the same scope entry
- `compatibility/migrate-v0.1-to-v0.2.md` — consumer migration guide

### Changed

- `spec/workflow-spec.md` — added agent modes (Thinking / Execution / Review), parallel agent safety rules, content style standard, layer rules (absorbed from layering-spec)
- `spec/guardrails-spec.md` — three new hard rules (no execution without acceptance criteria; no done without verification; no shared mutable scope without boundary); enforcement section absorbed from enforcement-spec
- `spec/lifecycle-spec.md` — readiness gate (planned → active) and completion gate (active → done) added and enforced by READINESS validator
- `templates/implementation-task.md` — new sections: `Agent Context`, `Scope Boundary`, `Acceptance Criteria`, `Dependencies`, `Verification`; removed `Related Design Docs`, `Verification Notes`
- `scripts/validate_metadata.py` — task files now require `Acceptance Criteria`, `Scope Boundary`, `Verification` headings
- `scripts/validate_workflow.py` — pipeline now runs 6 checks: STRUCTURE, METADATA, READINESS, SCOPE, TRANSITIONS, REFERENCES
- `repo.config.json` — added `enable_readiness`, `enable_scope_conflicts` flags; removed deleted spec files from `required_files`; added new scripts to `required_files`
- `adapter-template.md` — stale reference to `layering-spec.md` updated to `workflow-spec.md`
- `examples/task-example.md` — updated to reflect new task template
- `.agents/skills/workflow-contract/SKILL.md` — updated canonical sources, added three-way classification, task readiness table, validator failure reference
- `.agents/skills/workflow-contract/agents/openai.yaml` — expanded default prompt to reflect updated skill steps

---

## v0.1.0

Initial release.

- Three-layer doc structure: `docs/design`, `docs/implementation`, `docs/changes/proposed`
- Validator pipeline: STRUCTURE, METADATA, TRANSITIONS, REFERENCES
- Spec files: `workflow-spec.md`, `layering-spec.md`, `lifecycle-spec.md`, `guardrails-spec.md`, `enforcement-spec.md`, `glossary.md`
- Templates: design-doc, implementation-project, implementation-phase, implementation-task, implementation-status, change-proposal, decision-log-entry
