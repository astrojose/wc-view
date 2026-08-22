# UI kit — wc-view review surface

Recreation of the review surface defined by the public design docs: a centered Markdown reading canvas with
inline annotation and a floating bottom composer. There is no sidebar, no navigation chrome,
and no docs-tree view — the tree/tabs question is still an open design decision, so it is
deliberately absent rather than invented.

## Files
- `index.html` — interactive entry (dark default, theme toggle).
- `DocumentBody.jsx` — the rendered design-document blocks wrapped in `AnnotatedBlock`.
- `CliPanel.jsx` — `wc-view feedback --unresolved` compact-JSON payload + `Mark in_progress`.
- `ReviewSurface.jsx` — screen composition and review state.

## Click-through
1. Click any paragraph or the code block → non-modal `AnnotationPopover` opens with the quote anchor.
2. Type a note → **Attach note** → composer shows `[ 3 notes attached ]`.
3. Toggle the queue (≡) to review, jump to, or remove pending notes.
4. **Submit** → one atomic write; the toast reports the queue write and the CLI panel opens.
5. **Mark in_progress** in the CLI panel drives the reconcile loop (`unresolved → in_progress`).
6. Trash icon → the system's only modal, `ConfirmDialog`.

Source of truth: `docs/design/product/ux-design-system.md` in `astrojose/wc-view`.
Nothing here is production code; no viewer state is written anywhere.
