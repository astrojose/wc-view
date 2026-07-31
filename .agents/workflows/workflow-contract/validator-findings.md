# Validator Findings Guide

Use this guide to remediate validation failures from:

```bash
make -C .agents/workflows/workflow-contract validate
```

Script fallback:

```bash
python3 .agents/workflows/workflow-contract/scripts/validate_workflow.py
```

## STRUCTURE

Sample finding:

```text
STRUCTURE:docs/implementation/tasks:missing-required-directory
```

Meaning:

- A required directory or file from `repo.config.json` is missing.
- Or a disallowed directory/file exists.

Fix:

1. Compare repo tree against `required_directories` and `required_files`.
2. Create missing required paths.
3. Remove or rename disallowed paths.
4. Re-run validator.

## METADATA

Sample finding:

```text
METADATA:docs/implementation/project.md:missing-sections:Current Priorities,Active Phases
```

Meaning:

- A doc file is missing required headings expected by the metadata validator.

Fix:

1. Open the flagged file.
2. Add the missing `##` headings exactly as required.
3. Use templates from `.agents/workflows/workflow-contract/templates/` for shape alignment.
4. Re-run validator.

## TRANSITIONS

Sample finding:

```text
TRANSITIONS:docs/changes/proposed/my-proposal.md:invalid-proposal-status:accepted
```

Meaning:

- Proposal status under `## Status` is not listed in `statuses.proposal.allowed`.

Fix:

1. Replace status with an allowed value.
2. Or update `repo.config.json` status policy if intentionally changing process.
3. Re-run validator.

## REFERENCES

Sample finding:

```text
REFERENCES:docs/implementation/tasks/backlog.md:legacy-reference-found
```

Meaning:

- A forbidden legacy path pattern from `legacy_reference_patterns` was found.

Fix:

1. Remove or replace the stale reference in the flagged file.
2. Keep references aligned to current docs map.
3. Re-run validator.

## Upgrade Remediation

Use when a contract upgrade makes existing docs fail validation — renamed paths, changed required structure, tightened metadata, or new legacy patterns.

Core rule:

> The validator is the gate, not the authority on content. Preserve intent. Relocate and repair; never delete a doc to satisfy a finding.

Procedure:

1. Read the matching migration guide in `compatibility/migrate-*.md` before touching docs. It states what moved and why.
2. For each finding, identify the doc's intent first, then remediate:
   - `STRUCTURE` (path moved/removed): move the file's content to the new location. Do not delete the source until its content lives at the target.
   - `REFERENCES` (legacy path): repoint the reference to the current path. Do not delete the sentence that carries the intent.
   - `METADATA` (missing/renamed headings): add or rename headings to the current template shape, keeping existing body content under the correct heading.
   - `STRUCTURE` design subdirectories: `docs/design/*` subdirectories are on-demand. Do not recreate old empty ones. If content exists, keep it where it is — older names (`domain`, `data-models`) remain valid. Do not rename existing subdirectories to match new suggestions.
3. Reorganize only enough to pass. Do not merge, split, or rewrite approved design truth as part of an upgrade — that is a separate, human-approved change captured in `docs/changes/proposed/`.
4. Re-run the validator. Confirm `WORKFLOW:ok`.

Forbidden during upgrade remediation:

- Deleting a doc, section, or reference solely to clear a finding.
- Collapsing distinct design truth into a template just to satisfy `METADATA`.
- Introducing net-new behavior while "reorganizing". New behavior goes to `docs/changes/proposed/`.

## Final Check

Successful run should end with:

```text
WORKFLOW:ok
```
