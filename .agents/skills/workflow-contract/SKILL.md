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

## Step 1: Classify And Declare

Identify the operating context before touching any file.

**Layer:**
- `design` — approved product/system truth
- `implementation` — execution planning: project, phases, tasks, status
- `changes/proposed` — unresolved ideas and proposals

**Lifecycle state:**
- Idea → Proposed → Adopted → Planned → Active → Reported → Reconciled
- Identify where the work currently sits and which transition it must make.

**Agent mode:**
- `Thinking` — settle behavior, scope, authority, acceptance criteria, and verification. No permanent implementation changes.
- `Investigation` — reproduce uncertain behavior and gather evidence. Start read-only.
- `Execution` — make permanent changes within accepted intent and explicit authority.
- `Review` — reconcile output against design truth and evidence. Do not approve new behavior.

**Work class:**
- `incident` — cause or remedy is unknown; start in Investigation.
- `decision` — behavior or a system decision is unresolved; remain in Thinking.
- `planned` — accepted behavior requires coordinated implementation and a prepared task; diagnosed fixes that restore accepted behavior use this class.
- `direct` — bounded work with no observable behavior, contract, data, security, or operational-policy change; no persistent task required, but objective, scope, authority, acceptance criteria, and verification are required.
- If unclear, use `decision`.

**Coordination:**
- `single-repo` — one repository owns execution.
- `cross-repo` — record participating repositories, shared contracts, invariants, integration owner, and dependency order.

For non-trivial work, show:

```md
Workflow

- Mode:
- Class:
- Task status:
- Authority:
- Next gate:
```

Use `Task status: not applicable` when no persistent task exists. Announce mode or class changes with the prior value, new value, reason, authority, and next gate.

In Review, also declare the current reconciliation outcome. Only `reconciled-and-verified` permits `done`. Use `blocked` for incomplete proof, design drift, or a required decision; use `cancelled` for reverted or superseded work.

Do not proceed until the operating context is identified.

### Approval Gates

When additional acceptance or authority is required, state the decision, exact authorized scope, and excluded actions. End with a bold scoped reply phrase:

```md
Reply **Approve <specific scope>** to proceed.

Recommended reasoning effort: **<Low, Medium, or High>**
```

- `Low` — bounded, reversible, mechanical, easily verified work.
- `Medium` — planned multi-file work, routine debugging, or standard review.
- `High` — unresolved decisions, uncertain incidents, consequential cross-repo work, security, payments, migrations, concurrency, data integrity, or conflicting evidence.

Add a reason for `High` or a non-obvious recommendation. The recommendation is advisory and provider-agnostic. Silence, reactions, annotations, inference, and ambiguous language are not approval. Approval never extends beyond the stated scope.

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

A `planned` task is ready for execution only when all sections are populated:

| Section | Required content |
|---|---|
| `Objective` | One sentence: concrete, verifiable outcome |
| `Scope Boundary` | Explicit in-scope paths/modules and out-of-scope boundaries |
| `Acceptance Criteria` | Binary, judgment-free conditions referencing specific endpoints, files, or behaviors |
| `Agent Context` | Skills to load, design docs to read, constraints, do-not-touch paths |
| `Implementation Checklist` | Ordered steps |
| `Verification` | Command and evidence |
| `Reconciliation` | Reviewed revision/environment, criterion evidence, alignment, outcome, follow-up |

Do not set status to `in-progress` until all sections are populated. `Direct` work instead requires a declared objective, scope, authority, acceptance criteria, and verification method. `Decision` and `incident` work must reclassify before permanent execution.

Every acceptance criterion needs a unique `AC-NN` identifier. Review records exactly one result and evidence value per criterion. A task can become `done` only when every result is `pass`, evidence is non-placeholder, reviewed revision and environment are recorded, and the outcome is `reconciled-and-verified`.

## Step 5: Validate

Run before marking any doc task complete:

```
python3 .agents/workflows/workflow-contract/scripts/validate_workflow.py
```

Validator categories:

| Category | Failure means |
|---|---|
| `CONFIG` | Schema v2 or required policy values are missing; pipeline stops |
| `STRUCTURE` | Required path missing or disallowed path present |
| `METADATA` | Required section heading absent from a doc |
| `READINESS` | Class/status combination or class-specific execution context is invalid |
| `SCOPE` | Two `in-progress` tasks claim the same scope entry |
| `TRANSITIONS` | Invalid proposal, task, or phase status value |
| `RECONCILIATION` | Criterion evidence, reviewed context, status, and outcome disagree |
| `REFERENCES` | Legacy path reference found in codebase |

Fix all failures before completion. Do not suppress or skip.
