# wc-view: UX Design System

## Context

- `wc-view` is an AI-driven dynamic visualization and review surface.
- `wc-view Design System/` is the authoritative source for visual tokens, typography, CSS variables, components, and layout contracts.
- Markdown and explicit human acceptance are authoritative; browser feedback is unapproved input.

## Requirements

- Full-width centered document reading area (`68-76ch`) with no persistent sidebar.
- CSS custom properties support native dark/light adaptation.
- Use Inter, JetBrains Mono, and Playfair Display with system fallbacks; zero external CDN dependencies.
- Meet WCAG 2.2 AA with semantic landmarks, visible focus, 44 CSS-pixel targets, keyboard equivalents, reduced motion, and `aria-live="polite"` status updates.
- Keep document reading order reachable without entering review controls.
- The floating composer is non-modal. Destructive confirmation alone uses a correctly labelled modal dialog.
- The composer visibly labels the target policy before first submission:
  - `Scratch artifact — automatic update allowed`.
  - `Protected project artifact — result requires your acceptance`.
- The composer announces and displays `queued`, `claimed`, `working`, `response_ready`, `applied`, `awaiting_acceptance`, `resolved`, `failed`, and `orphaned` states without relying only on color.
- The latest agent result is visible by default; batch history remains recoverable through the existing queue affordance.

## Decisions

- Dark palette: base `#121212`, cards `#1C1C1C`, borders `#2C2C2C`, ring `#D1CFC0`, accents `#F26A4B`, `#D9CFC2`, `#8E8A83`.
- Light palette: base `#FCFCFC`, cards `#FFFFFF`, borders `#E4E4E7`, ring `#18181B`, zinc accents.
- Highlight annotated elements with `border-left: 3px solid var(--ring-accent)` and `background: rgba(209, 207, 192, 0.06)`.

## Contracts

- Submission and work-state semantics: `docs/design/interfaces/floating-bar-interaction-spec.md`.
- Batch persistence and state data: `docs/design/data/feedback-schema.md`.
- System-level flow: `docs/design/architecture/wc-view-system-flow.md`.

## Acceptance Criteria

- Reading column renders at `68-76ch` with no persistent sidebar.
- Dark and light palettes match the defined hex values.
- Target policy and non-color work state are available to keyboard and screen-reader users.
- INP ≤ 200 ms (p75), CLS ≤ 0.1, and WCAG 2.2 AA are verified before delivery.
