# Migration Guide — v0.2.0 to v0.2.1

## What Changed

The `adapters/` directory is removed. Consumer-specific state (repo name, paths, entrypoints) belongs in `repo.config.json` and `AGENTS.md` — not in the shared library. The adapter concept added maintenance burden without adding unique value.

## Breaking Changes

### `adapters/` directory removed

The `adapters/` directory no longer exists in the submodule.

**Action:** Remove any reference to adapter files in your docs and config.

```bash
grep -rn "adapters/" docs/ AGENTS.md CLAUDE.md ai/skills/ --include="*.md" --include="*.yaml"
```

Remove every match.

### `Repo adapter:` line in `AGENTS.md`

**Action:** Delete this line from the `Workflow Authority` section:

```diff
 ## Workflow Authority

 - Canonical workflow policy: `ai/workflow-contract/spec/*`
-- Repo adapter: `ai/workflow-contract/adapters/<repo-name>.md`
 - Canonical validator: `python3 ai/workflow-contract/scripts/validate_workflow.py`
```

### `init_workflow_contract.py` `--repo-name` argument removed

**Action:** Remove `--repo-name` from any CI or Makefile invocations of the init script.

### `ai/workflow-contract/adapters` removed from `required_directories`

**Action:** If you have overridden `required_directories` in `repo.config.json`, remove this entry:

```json
"ai/workflow-contract/adapters"
```

## Validation

After applying all changes:

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
