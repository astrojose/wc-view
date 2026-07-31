# Weekly Status

## 2026-08-01

- Adopted technical stack architecture in `docs/design/architecture/tech-stack.md` (Node.js 18+ ESM, TypeScript, Commander, Marked, native HTTP loopback server).
- Explicitly designated `wc-view Design System/` in `AGENTS.md` as the authoritative source for the UI/UX design system (tokens, components, typography, colors, layout).
- Initialized Node.js TypeScript project scaffolding (`package.json`, `tsconfig.json`, `tsup.config.ts`, `src/`).
- Completed Phase 01 (Canvas & Theme Foundation): Implemented `DocCanvas` centered reading column (`clamp(68ch, 100%, 76ch)`), `ThemeToggle` (`data-theme` attribute override), CSS tokens from `wc-view Design System/`, and semantic landmark accessibility contracts.
- Completed Phase 02 (Floating Bar & Composer): Implemented `FloatingComposer` (sticky bottom bar, selection chip badge `[ 🏷️ N notes attached ]`), `AnnotationEditor` (inline popovers), `StatusRegion` (`aria-live="polite"` status region), and `ConfirmDialog` (modal dialog with focus trap & focus restoration).
- Passed 7/7 Vitest unit tests and verified 52ms ESM production build generation.
- Phase 03 and Phase 04 remain blocked on open decisions in `docs/changes/proposed/wc-view-open-decisions.md`.
