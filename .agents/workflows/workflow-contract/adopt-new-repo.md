# Adopt in New Repo

Use this sequence when onboarding `.agents/workflows/workflow-contract` into a different repository.

## Prerequisites

- Python 3 available in CI and local development.
- Docs root in the consumer repo at `docs/`.

## Bootstrap Sequence

Plain `agents-setup init` only creates agent wiring and does not create `docs/`. Use the workflow setup when this workflow contract should own the repo docs scaffold.

1. Run the public no-clone setup CLI:
   ```bash
   npx @jerrylusato/agents-setup init --workflow workflow-contract --yes
   ```
2. Run validation when you need an explicit check:
   ```bash
   make -C .agents/workflows/workflow-contract check
   ```
3. Add the required snippet below to `AGENTS.md`.
4. Tune `.agents/workflows/workflow-contract/repo.config.json` for your repo paths and constraints.

`make check` does not edit an existing `AGENTS.md`. Add the snippet manually so repo-specific agent instructions stay intentional.

Manual fallback:

```bash
git submodule add git@github.com:iPFSoftwares/workflow-contract.git .agents/workflows/workflow-contract
git submodule update --init --recursive
make -C .agents/workflows/workflow-contract check
```

Done when:

- `AGENTS.md` contains `Workflow Authority` and `Start Here`.
- `.agents/workflows/workflow-contract/repo.config.json` reflects your repo's paths and constraints.
- `python3 .agents/workflows/workflow-contract/scripts/validate_workflow.py` ends with `WORKFLOW:ok`.

## Manual Fallback (No Make)

```bash
python3 .agents/workflows/workflow-contract/scripts/init_workflow_contract.py
python3 .agents/workflows/workflow-contract/scripts/validate_workflow.py
```

## Required AGENTS.md Snippet

```md
## Workflow Authority

- Canonical workflow policy: `.agents/workflows/workflow-contract/spec/*`
- Canonical validator: `python3 .agents/workflows/workflow-contract/scripts/validate_workflow.py`

## Start Here

1. Classify the task.
2. Run `python3 .agents/workflows/workflow-contract/scripts/validate_workflow.py`.
3. Read `docs/design/`.
4. Read `docs/implementation/`.
5. If behavior is unresolved, read or create `docs/changes/proposed/`.
6. Load required repo skill(s).
7. Inspect target service code before editing.
```

## Optional AGENTS.md Reinforcement

```md
## Documentation Workflow

Use `$workflow-contract` for:

- design docs
- implementation docs
- backlog, phase, task, and status updates
- proposed changes
- docs-vs-code reconciliation
- workflow validation failures

Layer rules:

- `docs/design/`: approved product/system truth.
- `docs/implementation/`: execution plans, phases, tasks, and status only.
- `docs/changes/proposed/`: unresolved proposals only.

Do not define net-new behavior in implementation docs. Put unresolved behavior in `docs/changes/proposed` until accepted.
```

## Non-Mutating Dry-Run Checklist

- Each bootstrap step has an explicit input and output path.
- No step depends on undocumented repo-specific behavior.
- Read order is clear: `docs/design` → `docs/implementation` → `docs/changes/proposed`.
- No circular references between onboarding docs.
- Validator command and expected output are present in onboarding docs.
- `AGENTS.md` has workflow authority and startup order.
