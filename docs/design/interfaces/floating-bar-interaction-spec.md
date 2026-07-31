# wc-view: Floating Bar Interaction Spec

## Context

- Replaces traditional sidebars with a single floating bottom bar, following the Google Docs + Gemini bottom-bar affordance.
- The removal of a persistent chat sidebar is a **deliberate divergence** from the converged SOTA pattern (Canvas, Artifacts, Cursor, and Copilot all retain a full-history side panel) — justified by this being a focused local review tool rather than a consumer chat product, not a claim that "no sidebar" is itself the SOTA pattern.

## Requirements

- **Element Selection & Robust Spatial Annotations**:
  - Allow users to select text or click elements (paragraphs, code blocks, tables, Mermaid nodes) to attach inline notes.
  - Ground each note to a concrete, robustly-resolvable span so the agent acts on the intended target rather than inferring it — reducing spatial/reference ambiguity (does not eliminate content hallucination).
  - When an anchor no longer resolves (span deleted or rewritten past fuzzy recognition), mark the annotation `orphaned` rather than silently mis-anchoring.
- **Central Floating Bottom Input Bar (deliberate minimal surface)**:
  - Displays only the latest message/status from the agent in a compact top toast (expandable on click), paired with a lightweight persistent affordance to recover prior turns and list all pending annotations, so history is reduced but never lost.
  - Displays active selection chip badges (e.g. `[ 🏷️ 3 notes attached ]`).
  - **Atomic Feedback Batching**: Submits all accumulated inline notes and prompt instructions into a single atomic write to the local queue.

## Decisions

- Anchor resolution binding (element highlight styling) is defined in `docs/design/product/ux-design-system.md`.
- Anchor tiers (primary/secondary/tertiary) are defined in `docs/design/data/feedback-schema.md`.

## Contracts

- Exact composer layout, focus order, keyboard shortcuts beyond Enter/Space/Escape, and modal-vs-non-modal boundaries beyond what is stated above are not yet specified — see `docs/changes/proposed/wc-view-open-decisions.md`.
- System-level flow: `docs/design/architecture/wc-view-system-flow.md`.

## Acceptance Criteria

- Selecting an element and submitting a note results in a single atomic write to the local feedback queue.
- An annotation whose anchor no longer resolves is marked `orphaned`, never silently re-bound.
- The floating bar shows only the latest agent message by default, with an affordance to recover prior turns and pending annotations.
