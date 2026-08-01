# wc-view: UX Design System

## Context

- `wc-view` is an AI-driven dynamic visualization and review surface. Rather than just viewing static Markdown, agents use `wc-view` to synthesize and render interactive visual artifacts (flowcharts, state machines, wireframes) from complex prompts, enabling a collaborative human-in-the-loop review process.
- `wc-view Design System/` is the authoritative source for visual design system tokens, typography, CSS variables, components, and layout contracts.
- Markdown, Mermaid, and explicit human acceptance are authoritative; browser feedback is unapproved input.

## Requirements

- **Minimalist Canvas Layout**: Full-width centered document reading area (`68-76ch`) with zero sidebars.
- **Sleek Minimal Design System & Theme Adaptation**:
  - Shortest-path theme strategy: CSS Custom Properties bound to native `@media (prefers-color-scheme)` queries and a lightweight `[data-theme="dark"|"light"]` attribute toggle.
  - Typography: Sans (`Inter`), Mono (`JetBrains Mono`), Serif accent (`Playfair Display`), with tight `0.01em` tracking.
  - Geometry: `0.5rem` (8px) radius, `0.25rem` (4px) grid spacing, soft ambient shadows (`0 6px 15px rgba(0,0,0,0.30)`).
- **Core Web Vitals & Accessibility (a11y)**:
  - Accessibility guidelines achieve this design goal: clear, descriptive element names, predictable interaction patterns, logical page hierarchy, semantic HTML, ARIA standards. These are accessibility fundamentals that the design community has understood, albeit often deprioritized, for years.
  - Zero external CDN dependencies; pre-compiled CSS and system fallback font stacks (`font-display: swap`).
  - Fast interaction: target INP well inside Google's "good" threshold of ≤ 200 ms (p75); drive layout shift toward CLS = 0 — comfortably inside the "good" CLS threshold of ≤ 0.1 — by pre-reserving element heights for SVGs and code blocks.
  - Meet WCAG 2.2 AA. Use native HTML controls before ARIA; use semantic landmarks for document, review queue, composer, and status.
  - Preserve reading-order focus. The document remains reachable without entering review controls; a visible native "Add review note" control and an optional documented shortcut focus the composer.
  - Make every annotation keyboard-reachable. Enter or Space opens its editor; queued notes are a navigable list with remove and edit actions.
  - Treat the floating composer as non-modal. It never traps focus. Escape closes an annotation editor, preserves its draft, and returns focus to the invoking text or control.
  - Use a correctly labelled modal dialog only for destructive confirmation. Trap focus while open, provide a visible Cancel control, and restore invoking focus on close.
  - Announce submitted, claimed, response-proposed, orphaned, and failed feedback changes through a concise `aria-live="polite"` status region. Never convey state by color alone.
  - Provide visible focus indicators, 44 CSS-pixel minimum targets for pointer controls, keyboard-equivalent alternatives for every pointer action, and reduced-motion support.

## Decisions

- Palette (Dark Default): Base (`#121212`), surface cards (`#1C1C1C`), subtle borders (`#2C2C2C`), warm champagne ring accents (`#D1CFC0`), and accent highlights (`#F26A4B`, `#D9CFC2`, `#8E8A83`).
- Palette (Light Mode): Base (`#FCFCFC`), surface cards (`#FFFFFF`), subtle borders (`#E4E4E7`), dark slate ring accents (`#18181B`), and subtle zinc accents.
- Highlight annotated elements with a subtle visual indicator (`border-left: 3px solid var(--ring-accent); background: rgba(209, 207, 192, 0.06)`).

## Contracts

- Full token specifications, CSS variable names, typography scales, and elevation rules beyond what is listed above are not yet defined — see `docs/changes/proposed/wc-view-open-decisions.md`.
- System-level flow: `docs/design/architecture/wc-view-system-flow.md`.

## Acceptance Criteria

- Reading column renders at `68-76ch` with no persistent sidebar present.
- Dark and light palettes match the hex values above exactly.
- INP and CLS budgets and WCAG 2.2 AA conformance are verified before this design is treated as delivered.
