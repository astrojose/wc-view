# Migrate v0.3.0 to v0.4.0

This is a breaking pre-1.0 migration. Complete document migration before enabling all validators.

## Procedure

1. Copy the consumer `repo.config.json` and preserve custom paths, reference patterns, validation switches, and migration debt.
2. Upgrade to schema version `2`, then reapply those consumer-specific values to the corresponding v2 keys.
3. Add required task sections without deleting or rewriting existing intent: Work Classification, Authority, Investigation, Cross-Repository Coordination, and Reconciliation.
4. Assign unique `AC-NN` identifiers to existing acceptance criteria. Never invent historical evidence.
5. Reconcile existing states:
   - complete verifiable evidence may become `done` with `reconciled-and-verified`;
   - insufficient proof becomes `blocked` with `implemented-unverified`;
   - implemented work awaiting design acceptance becomes `blocked` with `decision-required`;
   - reverted or superseded work becomes `cancelled`.
6. Add proposal approval-boundary fields, phase/status sections, and the reviews directory.
7. Re-enable `METADATA`, `READINESS`, and `RECONCILIATION` only after documents are migrated.
8. Run `make -C .agents/workflows/workflow-contract check` and review every finding.

`WORKFLOW:ok` confirms structural and mechanically checkable consistency. It does not prove product behavior, validate evidence truth, or infer approval.
