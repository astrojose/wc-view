# Task Spec

## Purpose

A task is the primary artifact for `planned` work. It must be prepared to the point where an agent can operate without scope inference, behavior invention, or judgment about what "done" means.

`direct` work does not require a persistent task when it is bounded and behavior-preserving. It still requires a declared objective, scope, authority, acceptance criteria, and verification method. `decision` and `incident` work must reclassify before permanent execution.

## Minimum Viable Task

A task is ready for execution when all required sections are populated:

| Section | Required content |
|---|---|
| `Work Classification` | Class, coordination profile, and incident reclassification source |
| `Objective` | One sentence: what must be true when this task is done |
| `Scope Boundary` | Explicit in-scope files/modules and out-of-scope boundaries |
| `Acceptance Criteria` | Binary verifiable conditions — each must be checkable without judgment |
| `Agent Context` | Skills to load, design docs to read, constraints and do-not-touch boundaries |
| `Authority` | Allowed actions, approval gates, and prohibited actions |
| `Implementation Checklist` | Ordered steps the agent should follow |
| `Verification` | Exact command to run or evidence to produce |
| `Reconciliation` | Reviewed revision, environment, criterion evidence, alignment, outcome, and follow-up |

`incident` tasks additionally populate `Investigation`. `cross-repo` tasks additionally populate `Cross-Repository Coordination`. Other tasks retain those sections and mark them `not applicable`.

## Agent Context Format

```
- Skills: <skill-name>, <skill-name>
- Design docs: <path>, <path>
- Constraints: <constraint>
- Do not touch: <path or module>
```

Skills tell the agent which domain knowledge to load. Design docs tell it what to read before starting. Constraints are non-negotiable rules. Do-not-touch prevents scope creep into adjacent areas.

## Class And Status Rules

- `direct`: any task status; if persisted, it uses the complete task and reconciliation contract.
- `planned`: any task status; permanent execution requires accepted design and a prepared task.
- `decision`: only `pending`, `blocked`, or `cancelled`; it links a proposal and cannot enter permanent execution.
- `incident`: only `pending`, `in-progress`, `blocked`, or `cancelled`; it records investigation context and reclassifies before Review or completion.
- Unknown or invalid combinations fail validation.

Coordination is independent of class. `cross-repo` work records participating repositories, shared contracts, invariants, integration owner, and dependency order.

## Acceptance Criteria Rules

Each criterion must be:

- Binary: passes or fails — no partial states.
- Judgment-free: a second agent reading it reaches the same pass/fail conclusion.
- Specific: references an HTTP method, endpoint, command, file, state, or observable output.

Bad: `The auth flow works correctly.`
Good: `POST /auth/login returns 200 with a signed JWT when credentials are valid.`

Prefix every criterion with a unique identifier matching `AC-NN`, for example:

```md
- [ ] AC-01: POST /auth/login returns 200 with a signed JWT for valid credentials.
```

The validator checks identifier uniqueness and evidence coverage. Criterion quality remains a review responsibility.

## Acceptance Evidence

Review records exactly one row per criterion:

```md
| Criterion | Result | Evidence |
|---|---|---|
| AC-01 | pass | `pnpm test auth` output |
```

Allowed results are `pass`, `fail`, `blocked`, and `not-run`.

For `done`, every criterion must be `pass`, every evidence value must be non-placeholder, the reviewed revision must be a commit SHA or `no-code-change`, the environment must be recorded, and the outcome must be `reconciled-and-verified`.

## Review Outcomes

- `implemented-unverified`, `design-drift`, and `decision-required` set task status to `blocked`.
- `reverted` and `superseded` set task status to `cancelled`.
- Failed criteria return the task to `in-progress` with outcome `pending`.
- Status documents index these outcomes but never supply task evidence.
- Multi-task or cross-repository review may use a separate reconciliation report linked from each task.

## Parallel Agent Boundary

When multiple tasks run concurrently:

- Each task's `Scope Boundary` must be disjoint from all other `in-progress` tasks.
- Two tasks may not own the same file or module simultaneously.
- If a task needs a shared module that another task owns, list that task under `Dependencies` and keep status `pending` until it completes.
- `blocked` tasks must satisfy the readiness gate before transitioning to `in-progress`. A task blocked on unclear requirements is not ready for execution; resolve requirements before unblocking.

Scope conflict across active tasks is enforced by the `SCOPE` validator check.

## What Makes a Bad Task

- Objective is vague — agent must infer what done means.
- No acceptance criteria — agent self-declares done.
- No scope boundary — agent guesses what is in scope.
- No agent context — agent improvises which skills or docs to use.
- Verification is absent or a placeholder — no way to confirm correctness.
