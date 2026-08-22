# wc-view Design System

**wc-view** is a proposed independent CLI that renders local Markdown (a file or a `docs/` tree) in a
lightweight localhost browser UI so humans can *review* agent-authored documents — proposals, design
docs, plans — and hand precise, spatially-anchored feedback back to a terminal agent (Codex, Claude
Code, Pi, OpenCode, Cursor, Antigravity, …). Markdown and explicit human acceptance stay authoritative;
browser feedback is explicitly **unapproved input**.

## Sources this system was built from

- GitHub: **https://github.com/astrojose/wc-view** (branch `main`)
  - **Primary spec:** `docs/design/product/ux-design-system.md` — palette, type,
    geometry, motion, layout, component behaviour, and accessibility contract.
  - `AGENTS.md` and `docs/design/*` — repository guidance and product truth.

Read the repository for deeper grounding, especially the UX design-system document. This design system
is a reference implementation of that written specification; where the specification leaves an open
decision, this system leaves a hole rather than inventing an answer.

### What is deliberately absent
- **No logo or brand mark** — the sources contain none. The name is always set as type: lowercase
  `wc-view`, JetBrains Mono 500, hyphen intact.
- **No docs-tree / tab navigation** — "single-document view vs docs-tree navigation tabs in V1" is an
  open decision upstream.
- **No sidebars of any kind** — removing the persistent chat panel is the spec's deliberate divergence
  from converged tools; do not add one back.

## Product surfaces
1. **Review surface** (browser, localhost) — the centered reading canvas + annotation + floating
   composer. Recreated in `ui_kits/wc-view-review/`.
2. **CLI** (`wc-view serve`, `wc-view feedback --unresolved [--format …]`, `wc-view gc`) — terminal
   output styled with the mono token set; shown inside the kit's CLI panel.

---

## Content fundamentals

The voice is **spec-register technical prose**: declarative, present tense, no marketing.

- **Sentence case everywhere.** Headings are sentence case; token names and CLI verbs stay lowercase
  (`unresolved`, `wc-view gc`). SCREAMING labels appear only as small-caps-style uppercase meta labels
  (`REVIEW NOTE`) with `--tracking-wide`.
- **No "I", almost no "you".** Copy describes the system, not the reader: "Browser feedback is unapproved
  input." "Escape closes an annotation editor, preserves its draft, and returns focus." Imperative mood is
  used for rules ("Use native HTML controls before ARIA"), never for cheerleading.
- **Nouns are precise and reused verbatim.** *annotation*, *anchor*, *quote + context*, *review note*,
  *queue*, *reconcile loop*, *orphaned*. Never swap in a synonym ("comment thread", "highlight") — the
  vocabulary is part of the contract.
- **State words are the literal lifecycle values**: `unresolved`, `in_progress`, `resolved`, `orphaned`.
  UI labels may space them (`in progress`) but never rename them.
- **Numbers and paths are concrete**: "68–76ch", "~32-char prefix/suffix", "≤ 200 ms (p75)",
  `~/.wc-view/feedback/queue.jsonl`. Prefer a number to an adjective.
- **Honest hedging is part of the tone.** The spec says what a mechanism does *not* do — "reducing
  spatial/reference ambiguity (it does not eliminate content hallucination)". Keep that discipline in
  UI copy: "not yet submitted", "anchor no longer resolves".
- **Emoji:** effectively none. The spec uses exactly one, in a chip mock (`[ 🏷️ 3 notes attached ]`);
  this system renders that as a Lucide `tag` glyph instead. Do not introduce emoji.
- **Microcopy examples** (use these as the register):
  - `Add an instruction for the agent…` (composer placeholder)
  - `What should the agent change here?` (note placeholder)
  - `3 notes written to ~/.wc-view/feedback/queue.jsonl` (status)
  - `Discard 3 queued notes? Unsubmitted notes are never written to the feedback queue.` (dialog)
  - `No notes queued — click a paragraph in the document to start.` (empty state)

---

## Visual foundations

**The document is the interface.** Every visual decision protects reading: one column, one accent, one
shadow, one radius. Chrome is subtractive.

- **Layout.** Full-width centered reading column, 68–76ch (`--measure-doc` 72ch), zero sidebars. The only
  fixed elements are the compact status toast (sticky top) and the floating composer (sticky bottom,
  `min(46rem,100%)`, 1.5rem inset). Content flows at `--block-flow` 1.5rem. Annotated blocks hang their
  3px rule into the left gutter.
- **Colour.** Dark is the **default** theme: base `#121212`, cards `#1C1C1C`, hairline borders `#2C2C2C`.
  Text is warm off-white `#EDEBE4` over champagne `#D1CFC0` and stone `#8E8A83` — never pure white on
  pure black. Exactly one saturated colour, coral `#F26A4B`, and only for the single primary action per
  view and the `unresolved` state. Light mode is zinc-neutral (`#FCFCFC`/`#FFFFFF`/`#E4E4E7`) with a
  near-black `#18181B` ring accent and action. Themes are bound to `prefers-color-scheme` plus a
  `[data-theme]` override.
- **Type.** Inter for everything structural, JetBrains Mono for code/CLI/quotes/counts/paths, Playfair
  Display for the document title only — one serif line per screen, as an accent, never for headings or
  body. Tracking is a constant `0.01em`; body is 0.9375rem/1.65.
- **Backgrounds.** Flat colour only. **No gradients** (the one exception is a short
  `linear-gradient(var(--bg-base) 70%, transparent)` protection fade under the sticky toast), no images,
  no illustration, no texture, no grain, no noise. There is no imagery in this product at all — if a
  visual is needed, it is a Mermaid diagram rendered from the Markdown itself.
- **Borders vs shadows.** In-flow surfaces use a 1px hairline border and **no shadow**. Only floating
  things (composer, popover, toast, modal) get `--shadow-ambient: 0 6px 15px rgba(0,0,0,0.30)` plus the
  stronger `#3A3A3A` edge. There are no inner shadows, no double shadows, no glows.
- **Radii.** `0.5rem` (8px) is the house radius; `0.25rem` for inputs and code blocks; `0.75rem` for the
  composer shell; pill only for chips and the count/dot indicators. Annotated blocks are square on their
  ruled edge (`0 8px 8px 0`).
- **Cards.** `--surface-card` fill + 1px `--border-subtle` + 8px radius + 1rem padding. Flat when in flow;
  shadowed only when floating. No coloured left-border cards except the annotation rule, which is a
  functional indicator, not decoration.
- **Annotation highlight.** `border-left: 3px solid var(--ring-accent)` + `rgba(209,207,192,0.06)` tint,
  exactly as specified; the active block goes to 12% tint; `orphaned` switches to a **dashed** stone rule
  with no tint. A mono count sits in the right gutter.
- **Transparency & blur.** Transparency is used only for the two annotation tints and the modal scrim
  (`rgba(0,0,0,0.5)`). **No backdrop blur anywhere** — blur costs paint time and blurs the text this tool
  exists to read.
- **Animation.** 80/120/180ms, `cubic-bezier(0.2,0,0.2,1)`. Only opacity and a 4px `translateY` entrance
  (`--lift-enter`). No bounce, no spring, no scale-in, no skeleton shimmer. `prefers-reduced-motion`
  zeroes every duration.
- **States.** Hover = one step up the surface ramp (`--surface-card` → `--surface-raised`) plus border
  `--border-subtle` → `--border-strong`; ghost controls hover by going `--fg-muted` → `--fg-primary`.
  Press = no transform, no shrink — colour only. Disabled = `opacity: 0.45` and `not-allowed`. Focus is
  always a visible 2px `--focus-ring` outline with 2px offset; it is never removed.
- **Density & targets.** Pointer controls are ≥ 44px (`--tap-min`); `sm` (32px) variants exist only inside
  popovers where a keyboard equivalent is guaranteed. Spacing is a strict 0.25rem grid.
- **Performance posture is a visual rule:** heights are pre-reserved for code blocks and diagrams
  (`reservedHeight`) to drive CLS toward 0; no CDN-loaded webfont in production (self-host with
  `font-display: swap`).

---

## Iconography

- The repo ships **no icon font, no SVG sprite, and no image assets** — there is no code yet. `assets/`
  is therefore intentionally empty of brand art.
- **Substitution (flagged):** the kit and cards use **Lucide 0.454.0 from CDN**
  (`unpkg.com/lucide@0.454.0`) — 1px-stroke outline, 24px grid, `currentColor` — as the closest match to
  the spec's restrained, text-weight aesthetic. Icons used: `tag`, `list`, `terminal`, `send`, `trash-2`,
  `x`, `sun`, `moon`. **This is a substitution, not the product's chosen set.** Replace it if the real
  implementation picks otherwise.
- Icons are always ~1rem, monochrome, inherit `currentColor`, and never carry meaning alone — every
  `IconButton` has a text label, and every status has a word next to its dot.
- **Unicode glyphs are used as deliberate fallbacks** where an icon would be overkill: `≡` (queue),
  `×` (remove), `›` (status line), `◐/◑` (theme). These are always `aria-hidden`.
- **Emoji are not used.** The spec's one `🏷️` is rendered as the Lucide `tag` glyph.

---

## Index

| Path | What it is |
| --- | --- |
| `styles.css` | Global entry — `@import` list only |
| `tokens/fonts.css` | Font families + webfont loading (CDN here; self-host in production) |
| `tokens/colors.css` | Base palette, semantic surfaces/text/accents, status colours, light theme |
| `tokens/typography.css` | Scale, leading, tracking, composite type roles, measure |
| `tokens/spacing.css` | 0.25rem grid, layout insets, 44px tap minimum |
| `tokens/geometry.css` | Radii, border widths, ambient shadow, focus ring |
| `tokens/motion.css` | Durations, easing, reduced-motion overrides |
| `guidelines/*.card.html` | 16 foundation specimen cards (Colors, Type, Spacing, Geometry, Motion, Brand) |
| `components/core/` | `Button`, `IconButton`, `Chip`, `StatusBadge`, `Toast` |
| `components/review/` | `AnnotatedBlock`, `AnnotationPopover`, `AnnotationList`, `FloatingComposer`, `ConfirmDialog`, `StatusRegion` |
| `components/doc/` | `DocCanvas`, `CodeBlock`, `ThemeToggle`, `ShortcutsDialog` |
| `templates/review-surface/` | Reusable Design Component template of the review layout |
| `ui_kits/wc-view-review/` | Interactive recreation of the review surface + CLI payload panel |
| `thumbnail.html` | Homepage tile |
| `SKILL.md` | Agent-Skills entry point |
| `github.md` | Upstream source association for one-click sync |

### Component inventory rationale
The proposal defines the surface behaviourally rather than as a component list, so the inventory above is
a **direct one-to-one mapping of the spec's named UI elements**: minimal centered canvas → `DocCanvas`;
element selection + subtle highlight → `AnnotatedBlock`; inline notes → `AnnotationPopover`; "navigable
list with remove and edit actions" → `AnnotationList`; floating bottom bar with selection chips and atomic
batch submit → `FloatingComposer` + `Chip`; compact top toast → `Toast`; `aria-live` status → `StatusRegion`;
"modal dialog only for destructive confirmation" → `ConfirmDialog`; lifecycle states → `StatusBadge`;
pre-reserved code blocks → `CodeBlock`; `[data-theme]` toggle → `ThemeToggle`.

**Intentional additions:** `ShortcutsDialog` — the spec calls for "an optional documented shortcut" in a UI with no menus or sidebars, so the shortcut set needs a discoverable home (Shift + ?). It is the only non-destructive dialog in the system: Escape and scrim click close it, focus returns to the invoker, and it never carries state. `Button` and `IconButton` — the spec requires "native HTML controls" with 44px
targets and visible focus but names no button component; these exist so those rules are enforced in one
place. No Avatar, Tabs, Tooltip, Select, or Table primitive is provided, because the source defines none.
