---
name: workflow-contract
description: Route documentation work through the canonical workflow contract, enforce source-of-truth layering, bootstrap missing workflow structure, and validate docs policy before completion.
---

# Workflow Contract

Use this skill first for all doc updates, task creation, planning, and proposal work.

## Canonical Sources

Read in this order before making any change:

1. `.agents/workflows/workflow-contract/spec/workflow-spec.md` — operating loop, agent modes, layer rules, content style
2. `.agents/workflows/workflow-contract/spec/guardrails-spec.md` — hard rules and enforcement categories
3. `.agents/workflows/workflow-contract/spec/lifecycle-spec.md` — state transitions, readiness gate, completion gate
4. `.agents/workflows/workflow-contract/spec/task-spec.md` — minimum viable task standard (required when creating or updating tasks)

## Step 1: Classify

Identify three things before touching any file.

**Layer:**
- `design` — approved product/system truth
- `implementation` — execution planning: project, phases, tasks, status
- `changes/proposed` — unresolved ideas and proposals

**Lifecycle state:**
- Idea → Proposed → Adopted → Planned → Active → Reported → Reconciled
- Identify where the work currently sits and which transition it must make.

**Agent mode:**
- `Thinking` — producing design docs, task definitions, proposals. No code changes.
- `Execution` — implementing against a prepared task. Task must pass readiness gate before starting.
- `Review` — reconciling output against design truth. Detecting and surfacing drift.

Do not proceed until all three are identified.

## Step 2: Bootstrap

If workflow structure is missing, run:

```
python3 .agents/workflows/workflow-contract/scripts/init_workflow_contract.py
```

## Step 3: Apply Layer Rules

- New behavior not present in design → `docs/changes/proposed/` first.
- Execution work → `docs/implementation/` only after design truth exists in `docs/design/`.
- Status updates → `docs/implementation/status/` only.
- No duplicate truth across layers.

### Design Placement

`docs/design/` subdirectories are created on demand, not scaffolded upfront. Place each design doc under `docs/design/<concern>/`.

Suggested stack-agnostic concerns:

| Concern | Holds |
|---|---|
| `product` | what the system must do — user/product behavior, requirements, features |
| `architecture` | system structure — components, boundaries, control/data flow |
| `interfaces` | external-facing contracts — APIs, CLIs, events, protocols |
| `data` | data models, schemas, state, persistence |
| `integrations` | third-party/external system dependencies |

Rules:

- Reuse an existing subdirectory if one already fits the concern. Do not create a parallel directory for the same concern.
- Create a new concern directory only when none fits. Concern names are convention, not a fixed taxonomy — the rule is one coherent concern per doc.
- Do not rename existing subdirectories to match these names. Older names (`domain` → `product`, `data-models` → `data`) are accepted equivalents.

## Step 4: Task Readiness

Required when creating or updating any task doc. Read `.agents/workflows/workflow-contract/spec/task-spec.md`.

A task is ready for execution only when all sections are populated:

| Section | Required content |
|---|---|
| `Objective` | One sentence: concrete, verifiable outcome |
| `Scope Boundary` | Explicit in-scope paths/modules and out-of-scope boundaries |
| `Acceptance Criteria` | Binary, judgment-free conditions referencing specific endpoints, files, or behaviors |
| `Agent Context` | Skills to load, design docs to read, constraints, do-not-touch paths |
| `Implementation Checklist` | Ordered steps |
| `Verification` | Command and evidence |

Do not set status to `in-progress` until all sections are populated.

## Step 5: Validate

Run before marking any doc task complete:

```
python3 .agents/workflows/workflow-contract/scripts/validate_workflow.py
```

Validator categories:

| Category | Failure means |
|---|---|
| `STRUCTURE` | Required path missing or disallowed path present |
| `METADATA` | Required section heading absent from a doc |
| `READINESS` | `in-progress` task lacks acceptance criteria or scope boundary; `done` task lacks verification |
| `SCOPE` | Two `in-progress` tasks claim the same scope entry |
| `TRANSITIONS` | Invalid status value in a proposal doc |
| `REFERENCES` | Legacy path reference found in codebase |

Fix all failures before completion. Do not suppress or skip.
