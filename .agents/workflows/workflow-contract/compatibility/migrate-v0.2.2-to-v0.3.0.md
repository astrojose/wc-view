# Migration Guide — v0.2.2 to v0.3.0

## What Changed

The canonical config now carries only workflow-invariant values, and `docs/design/` structure is on-demand instead of scaffolded upfront.

- `repo.name` is removed. It was never read by any validator and leaked consumer-specific state into the shared library.
- `docs/design/*` subdirectories are no longer required or scaffolded. Design docs are filed per concern on demand.
- `legacy_reference_patterns` in the canonical config is limited to workflow-invariant patterns. Repo-specific legacy paths belong only in the consumer copy.

None of these are hard-breaking: existing repos keep validating. The steps below realign your consumer copy.

## Changes

### `repo.name` removed

`repo` now holds only `docs_root`.

**Action:** In your `repo.config.json`, delete the `name` field.

```diff
 "repo": {
-  "name": "your-repo",
   "docs_root": "docs"
 },
```

No validator referenced `name`; removing it changes no behavior.

### `docs/design/*` subdirectories are on-demand

Old configs required `docs/design/{domain,architecture,data-models,integrations,features}`. These were empty, unenforceable (git does not track empty directories), and stack-specific.

Design docs are now filed per concern, created only when a doc exists. Suggested stack-agnostic concerns: `product`, `architecture`, `interfaces`, `data`, `integrations`.

**Action:** Remove `docs/design/*` entries from `required_directories` in your `repo.config.json`. Keep `docs/implementation/*` and `docs/changes/proposed`.

**Do not** delete or rename existing populated design directories. Older names remain valid equivalents:

- `domain` → `product`
- `data-models` → `data`

Placement rules live in the skill (`Step 3: Apply Layer Rules → Design Placement`) and `spec/workflow-spec.md` — a single source, not duplicated per repo.

### `legacy_reference_patterns` scoping

The canonical config ships only `docs/changes/approved/` and `docs/changes/rejected/`.

**Action:** Keep your own repo-specific legacy paths in your consumer `repo.config.json`. Do not expect them in the shared default.

## Verify

```bash
python3 .agents/workflows/workflow-contract/scripts/validate_workflow.py
```

Expect `WORKFLOW:ok`. If a design-structure finding appears, follow `validator-findings.md → Upgrade Remediation` — relocate content, never delete to satisfy the validator.
