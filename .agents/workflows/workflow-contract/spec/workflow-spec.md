# Workflow Spec

## Objective

Run a planning-first engineering loop that keeps documented truth synchronized with execution.

## Agent Modes

Three distinct modes. Do not conflate them.

- **Thinking**: research, constraints discovery, requirement clarification, design tradeoffs, sequencing, context preparation. Output: design docs, task definitions, acceptance criteria, scope boundaries. No code changes in this mode.
- **Execution**: implement against a prepared task artifact. Agents in this mode operate against an explicit task, scope boundary, and acceptance criteria — not open-ended prompts. Thinking must be complete before execution begins.
- **Review**: verify output matches design truth, detect drift, reconcile docs with actual state. Output: reconciliation notes, updated status, surfaced unresolved decisions.

## Operating Loop

1. Research and clarify request context. *(Thinking)*
2. Align on requirements, constraints, and acceptance criteria. *(Thinking)*
3. Record approved truth in `docs/design`. *(Thinking)*
4. Convert truth into execution plan in `docs/implementation`. *(Thinking)*
5. Break execution into phases and tasks. Each task must satisfy the task readiness standard. *(Thinking)*
6. Implement against explicit tasks and checklists. *(Execution)*
7. Review outcomes and reconcile docs with actual state. *(Review)*
8. Repeat for new requirements and deltas.

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
- Do not start execution without a task that passes the readiness standard.
- Do not mark a task done without verification evidence.
