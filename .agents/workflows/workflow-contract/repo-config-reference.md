# repo.config Reference

This file defines validation scope, required structure, and allowed workflow states.

The current schema version is `2`. Schema v1 consumers must follow `compatibility/migrate-v0.3.0-to-v0.4.0.md`; `CONFIG` fails fast before other validators run.

## File Location

- `.agents/workflows/workflow-contract/repo.config.json`

## Bootstrap Mode

Use:

`make -C .agents/workflows/workflow-contract init`

Script fallback:

`python3 .agents/workflows/workflow-contract/scripts/init_workflow_contract.py`

Bootstrap mode creates missing required directories/files from this config before validation. This is what prevents first-run `STRUCTURE` failures in new repos.

## Top-Level Keys

- `version` (required): config schema version.
- `repo` (required): repo metadata (`docs_root`).
- `paths` (required): canonical doc paths used by validators.
- `read_order` (required): layer reading sequence.
- `required_directories` (required): directories that must exist.
- `required_files` (required): files that must exist.
- `disallowed_directories` (optional): directories that must not exist.
- `disallowed_files` (optional): files that must not exist.
- `legacy_reference_patterns` (optional): forbidden path patterns scanned across text/code files.
- `validation` (required): validator toggles.
- `statuses` (required): allowed statuses by artifact type.
- `classification` (required): work classes and coordination profiles.
- `reconciliation` (required): outcomes, evidence results, and status-to-outcome mappings.
- `transitions` (required): allowed proposal, task, and phase transitions.
- `exceptions` (optional): exception-policy requirements.

## Required vs Optional

Required in practice for reliable enforcement:

- `repo`
- `paths`
- `read_order`
- `required_directories`
- `required_files`
- `validation`
- `statuses`
- `classification`
- `reconciliation`
- `transitions`

Optional but recommended:

- `disallowed_directories`
- `disallowed_files`
- `legacy_reference_patterns`
- `exceptions`

## Safe Defaults

- Keep `paths` rooted under `docs/`.
- Do not add `docs/design/*` subdirectories to `required_directories`. Design subdirectories are created on demand per concern (`product`, `architecture`, `interfaces`, `data`, `integrations`); scaffolding them empty is unenforceable and stack-specific.
- Keep `legacy_reference_patterns` limited to workflow-invariant patterns. Append repo-specific legacy paths only in the consumer copy, never in the canonical config.
- Keep every validation flag enabled after document migration, including `enable_reconciliation`.
- Start proposal statuses with: `proposed`, `under-review`, `on-hold`.
- Keep task and phase statuses at `pending`, `in-progress`, `blocked`, `review`, `done`, and `cancelled`.
- Keep work classes at `direct`, `planned`, `decision`, and `incident`; coordination profiles are `single-repo` and `cross-repo`.
- Preserve status/outcome integrity: `done` maps only to `reconciled-and-verified`; `cancelled` maps only to `reverted` or `superseded`.
- Keep `read_order` aligned to layering policy:
  - `docs/design`
  - `docs/implementation`
  - `docs/changes/proposed`

## Common Mistakes

- Path mismatch between `paths` and actual repo tree.
- Adding status values in docs that are not listed under `statuses`.
- Updating templates but forgetting to update metadata checks.
- Adding a status or reconciliation outcome without updating transition and status-outcome maps.
- Replacing consumer config without preserving repo-specific paths, reference patterns, and validation switches.
- Allowing legacy references to old docs paths in markdown or code comments.
- Disabling validators to bypass documentation drift.

## Portability Notes

- Monorepo: keep one shared `docs/` tree unless teams explicitly need per-service docs roots.
- Single-service repo: keep same structure, even if some directories are lightly populated initially.
- Migration from existing docs: map existing truth to `design`, execution tracking to `implementation`, unresolved deltas to `changes/proposed` before enforcing strict disallowed references.
