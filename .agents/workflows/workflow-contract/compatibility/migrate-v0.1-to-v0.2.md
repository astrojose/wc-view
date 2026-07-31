# Migration Guide — v0.1.0 to v0.2.0

## Breaking Changes

### Spec files deleted

`spec/layering-spec.md`, `spec/enforcement-spec.md`, and `spec/glossary.md` are removed.

- Layer rules moved into `spec/workflow-spec.md`.
- Enforcement section moved into `spec/guardrails-spec.md`.
- Glossary terms were self-evident and are dropped.

**Action:** Find and replace any references to these paths in your docs and config.

```bash
grep -r "layering-spec\|enforcement-spec\|glossary" docs/ ai/ AGENTS.md CLAUDE.md
```

Replace with the absorbing file:
- `spec/layering-spec.md` → `spec/workflow-spec.md`
- `spec/enforcement-spec.md` → `spec/guardrails-spec.md`
- `spec/glossary.md` → remove the reference

---

### New required spec file

`spec/task-spec.md` is now required by `validate_structure.py`.

**Action:** The file ships with the submodule — no action needed unless you have overridden `required_files` in `repo.config.json`. If so, add the entry:

```json
"ai/workflow-contract/spec/task-spec.md"
```

---

### New required validator scripts

`scripts/validate_readiness.py` and `scripts/validate_scope_conflicts.py` are added to the pipeline and marked required.

**Action:** Pull the submodule update — both scripts ship with it. If you have overridden `required_files`, add:

```json
"ai/workflow-contract/scripts/validate_readiness.py",
"ai/workflow-contract/scripts/validate_scope_conflicts.py"
```

---

### New `repo.config.json` keys

Two validation flags are required:

```json
"validation": {
  "enable_readiness": true,
  "enable_scope_conflicts": true
}
```

**Action:** Add both keys to your local `repo.config.json` under the `validation` block. Set to `false` to opt out of a check without removing the script.

---

### Task template: new required section headings

`validate_metadata.py` now requires these headings in every non-backlog task file:

- `Acceptance Criteria`
- `Scope Boundary`
- `Verification`

`Related Design Docs` and `Verification Notes` are no longer part of the standard template.

**Action:** For each existing task file under `docs/implementation/tasks/` (excluding `backlog.md`):

1. Add the missing headings.
2. Rename `Related Design Docs` → `Agent Context`.
3. Rename `Verification Notes` → `Verification`.
4. Populate `Acceptance Criteria` and `Scope Boundary` if the task is `in-progress`.
5. Populate `Verification` if the task is `done`.

Template:

```markdown
## Agent Context

- Skills:
- Design docs:
- Constraints:
- Do not touch:

## Scope Boundary

**In scope:**
-

**Out of scope:**
-

## Acceptance Criteria

- [ ]

## Dependencies

-

## Verification

- Command:
- Evidence:
```

---

## Validation

After applying all changes, run:

```bash
python3 ai/workflow-contract/scripts/validate_workflow.py
```

All six categories must return `ok`:

```
STRUCTURE:ok
METADATA:ok
READINESS:ok
SCOPE:ok
TRANSITIONS:ok
REFERENCES:ok
WORKFLOW:ok
```

Do not merge until `WORKFLOW:ok`.
