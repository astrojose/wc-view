# Workflow Spec

## Objective

Run a planning-first engineering loop that keeps documented truth synchronized with execution.

## Agent Modes

Four distinct modes. Mode describes the current activity; it is not task status.

- **Thinking**: settle behavior, constraints, tradeoffs, scope, authority, acceptance criteria, and verification. Output: proposals, accepted design, or prepared execution boundaries. No permanent implementation changes.
- **Investigation**: reproduce uncertain behavior, gather evidence, and test hypotheses. Start read-only. Temporary instrumentation requires explicit authority. Investigation does not approve behavior.
- **Execution**: make permanent changes within accepted intent, bounded scope, explicit authority, acceptance criteria, and a defined verification method.
- **Review**: compare output with accepted design and evidence, detect drift, and surface unresolved decisions. Review does not approve new behavior.

Implementation details may evolve during Investigation or Execution. Return to Thinking before changing accepted behavior, contracts, architecture, data semantics, or material scope.

| Mode | Entry | Exit |
|---|---|---|
| `Thinking` | Work needs classification, a decision, or an execution boundary | Intent is accepted and the class-appropriate execution boundary is ready; or work stops |
| `Investigation` | Current behavior, cause, or remedy is uncertain | Evidence supports reclassification to `direct`, `planned`, `decision`, or `blocked` |
| `Execution` | Intent, scope, authority, acceptance criteria, and verification are defined | Output is ready for Review; or uncertainty or scope change returns work to Investigation or Thinking |
| `Review` | Output and evidence are ready for comparison | Work is reconciled or returned to Thinking, Investigation, or Execution |

Review work declares `Mode: Review`, the current work class and task status, its review authority, the current reconciliation outcome, and the next gate.

## Work Classification

Classify work before mutation. Use this order:

1. Unknown failure cause or remedy → `incident`.
2. Unresolved behavior or system decision → `decision`.
3. Accepted behavior requiring coordinated implementation → `planned`.
4. Bounded behavior-preserving work → `direct`.
5. Unclear classification → `decision`.

Class requirements:

- **`direct`**: no persistent task required. Limit this class to work that changes no observable behavior, contract, data semantics, security rule, or operational policy. Declare objective, scope, authority, acceptance criteria, and verification before execution.
- **`planned`**: accepted design and a prepared task are required before execution. Use this class for diagnosed defects whose fix restores accepted behavior.
- **`decision`**: capture a proposal, obtain explicit human acceptance, update design, then reclassify as `planned`.
- **`incident`**: start in Investigation. Reclassify a known-design fix as `planned`, a required behavior or contract change as `decision`, behavior-preserving work as `direct`, or inaccessible proof as `blocked`.

## Coordination Profile

Coordination is independent of work class:

- **`single-repo`**: one repository owns execution.
- **`cross-repo`**: record participating repositories, shared contracts, invariants, integration owner, and dependency order.

Disjoint files do not make cross-repository contract changes independent.

## Operating Loop

1. Classify work and coordination. *(Thinking)*
2. Investigate uncertain current behavior when required. *(Investigation)*
3. Return unresolved behavior decisions to proposals and explicit acceptance. *(Thinking)*
4. Record accepted truth in `docs/design`. *(Thinking)*
5. Prepare the class-appropriate execution boundary. *(Thinking)*
6. Implement within accepted intent, scope, and authority. *(Execution)*
7. Review outcomes and reconcile docs with actual state. *(Review)*
8. Repeat for new requirements and deltas.

## Reconciliation

Review compares:

- accepted design;
- planned acceptance criteria;
- actual implementation;
- runtime evidence and environment;
- planned scope against the actual change;
- documentation drift;
- deferred gaps;
- newly discovered decisions.

Only `reconciled-and-verified` permits `done`. Missing live proof cannot be replaced by mock, structural, or validator evidence. Review cannot approve design drift.

If Review discovers a behavioral decision or material scope change:

1. Set outcome to `decision-required` and status to `blocked`.
2. Return to Thinking and create or update a proposal.
3. Request scoped human approval.
4. After approval, return through Execution and perform a new Review.

Approval is stale when the reviewed revision, acceptance criteria, or approved scope changes. Approval never directly changes a task to `done` and never implies push, merge, release, deployment, or production-write authority.

## Visible Workflow Protocol

Declare non-trivial work at the start, before an approval gate, and in the final handoff:

```md
Workflow

- Mode: Thinking | Investigation | Execution | Review
- Class: direct | planned | decision | incident
- Task status: pending | in-progress | blocked | review | done | cancelled | not applicable
- Authority: <allowed actions>
- Next gate: <next transition or approval>
```

Use `Task status: not applicable` when no persistent task exists. This display value does not add a configured task status.

Announce mode or class changes:

```md
Workflow transition

- Mode: Investigation → Execution
- Class: incident → planned
- Reason: <evidence supporting the transition>
- Authority: <allowed actions>
- Next gate: <next transition or approval>
```

Do not repeat the declaration in every progress message when nothing changed.

## Approval Protocol

Use a scoped approval request when human acceptance or additional authority is required:

```md
Approval required

- Decision: <decision requiring acceptance>
- Authorizes: <exact scope and actions>
- Does not authorize: <excluded actions>

Reply **Approve <specific scope>** to proceed.

Recommended reasoning effort: **<Low, Medium, or High>**
Reason: <required for High or a non-obvious recommendation>
```

Approval rules:

- Only explicit human acceptance authorizes the stated decision and scope.
- Silence, reactions, annotations, and agent inference are not approval.
- Unambiguous natural-language acceptance is valid; the bold reply phrase is an affordance, not a parser command.
- Ambiguous approval does not authorize execution.
- Material scope changes require new approval.
- Design approval does not authorize implementation, push, PR creation, release, deployment, or production writes unless stated.

## Reasoning Effort

Recommend one provider- and model-agnostic level for the next action at approval gates:

- **`Low`**: bounded, reversible, mechanically specified work with easy verification.
- **`Medium`**: default for planned multi-file work, routine debugging, and standard review.
- **`High`**: unresolved decisions, uncertain incidents, consequential cross-repository work, security, payments, migrations, concurrency, data integrity, or conflicting evidence.

Reasoning effort is advisory. It may be ignored when the host exposes no control and never replaces acceptance criteria, verification, or review.

## Source Hierarchy

1. `docs/design` — approved product, architecture, interface, data, and integration truth
2. `docs/implementation` — execution planning: project, phases, tasks, status
3. `docs/changes/proposed` — unresolved ideas, open questions, proposed deltas

`docs/design/` subdirectories are created on demand, not scaffolded upfront. Place each design doc under `docs/design/<concern>/` — suggested concerns: `product`, `architecture`, `interfaces`, `data`, `integrations`. Reuse an existing subdirectory before creating a new one. Names are convention, not a fixed taxonomy.

## Layer Rules

- New behavior not present in design starts in `docs/changes/proposed`.
- Execution work starts in `docs/implementation` only after design truth exists.
- Status reporting is isolated to `docs/implementation/status`.
- Do not duplicate truth across layers.
- Do not define net-new behavior in `docs/implementation`.

## Parallel Agent Safety

Multiple agents can work concurrently when:
- Each task has a disjoint `Scope Boundary` — no two active tasks own the same files or modules.
- Shared modules are touched by at most one task at a time; other tasks that depend on them are blocked until that task is done.
- No task assumes another task's output unless listed under `Dependencies`.

## Content Style

Apply to every doc in every layer:

- **Brevity**: one idea per bullet, one purpose per section. Remove words that add length without adding precision.
- **Structure**: use headings, bullets, tables, and checklists. No narrative paragraphs.
- **Directness**: state what must happen. Not what might, could, or should happen.
- **Agent-executable**: every sentence is a directive, constraint, or fact. Avoid explanation of obvious behavior.
- **No filler**: remove "in order to", "it is important to", "please note", "as mentioned".
- **Concrete**: reference specific files, commands, endpoints, states, and behaviors — not abstract intent.

## Required Behaviors

- Do not invent behavior in implementation docs.
- Track progress through tasks and phases, not ad hoc notes.
- Capture unresolved or ambiguous behavior only in proposals.
- Do not start planned execution without a task that passes the readiness standard.
- Do not start direct execution without a declared objective, scope, authority, acceptance criteria, and verification method.
- Do not make permanent changes during Investigation without reclassification and execution authority.
- Do not mark a task done without verification evidence.
- Do not use status reports as reconciliation evidence or approval.
- Do not complete reconciliation from ambiguous or stale approval.
