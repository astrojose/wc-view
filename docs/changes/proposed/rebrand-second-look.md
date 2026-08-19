# Rebrand to Second Look

## Status

proposed

## Context

- Current product name: `wc-view`.
- Current npm package: `@astrojose/wc-view`.
- Current CLI binary: `wc-view`.
- Current user-local state root: `~/.wc-view/`.
- Current scratch artifact names: `.wc-view-scratch.md` and `.wc-view-scratch.html`.
- Current design-system folder: `wc-view Design System/`.
- The product has expanded from Markdown viewing into an interactive review and visualization surface for documents, HTML artifacts, agent feedback, and acceptance workflows.

## Problem

- `wc-view` is functional but not memorable.
- `wc-view` does not clearly communicate interactive review, idea visualization, or second-pass critique.
- The product identity should match the intended use: giving documents, plans, artifacts, and generated ideas a focused second look before acceptance.

## Proposed Change

- Rebrand the product to **Second Look**.
- Use `second-look` as the primary CLI binary.
- Use `@astrojose/second-look` as the primary npm package.
- Use `~/.second-look/` as the primary user-local state root.
- Use `.second-look-scratch.md` and `.second-look-scratch.html` as primary scratch artifact names.
- Keep `wc-view` as a compatibility CLI alias for one transition period.
- Keep reading legacy state from `~/.wc-view/` through an explicit compatibility path or migration command.
- Keep supporting `.wc-view-scratch.md` and `.wc-view-scratch.html` as legacy scratch artifact names during the transition period.
- Keep `wc-view Design System/` unchanged during the first migration phase; rename it only in a later dedicated branding sweep.
- Keep `@astrojose/wc-view` available for existing users until `@astrojose/second-look` is published and documented.

## Decision Required

- Decide whether to adopt **Second Look** as the product name.
- Decide whether `second-look`, `@astrojose/second-look`, `~/.second-look/`, and `.second-look-scratch.*` become the primary public contracts.
- Decide whether `wc-view`, `@astrojose/wc-view`, `~/.wc-view/`, and `.wc-view-scratch.*` remain transition-period compatibility contracts.
- Decide whether `wc-view Design System/` stays unchanged during the first migration phase.

## Approval Boundary

- Approval authorizes adopting the rebrand decision into `docs/design/` and preparing implementation tasks.
- Approval does not authorize code changes, package publishing, git push, release tags, GitHub release creation, npm deprecation, or automatic mutation/deletion of legacy user state.

## Compatibility

- `second-look` is the documented primary command.
- `wc-view` remains available as an alias during the transition period.
- Existing feedback queues under `~/.wc-view/` are not deleted or automatically mutated.
- Legacy scratch artifact names continue to render.
- Release tooling must prevent accidental npm package contents from including operational repo paths or the design-system source folder.

## Adoption Targets

If accepted, update approved truth in:

- `docs/design/architecture/tech-stack.md`
- `docs/design/interfaces/cli-contract.md`
- `docs/design/data/feedback-schema.md`
- `docs/design/product/ux-design-system.md`

Then plan implementation tasks for:

- package metadata and CLI binary migration;
- state path and legacy compatibility;
- scratch artifact name compatibility;
- README, AGENTS, plugin manifests, skills, release workflow, and changelog updates;
- tests, build, workflow validation, and release preflight updates.

## Acceptance Criteria

- Proposal records the target product name, CLI, npm package, state root, scratch names, compatibility aliases, and design-system folder handling.
- Proposal does not authorize implementation, package publishing, git push, release tags, or GitHub release creation.
- Adoption into `docs/design/` requires explicit human acceptance after proposal review.
