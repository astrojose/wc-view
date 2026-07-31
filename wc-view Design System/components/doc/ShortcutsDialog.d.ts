import type { HTMLAttributes } from 'react';

export interface ShortcutRow {
  /** Key caps, rendered in order, e.g. `['⌘','Enter']`. */
  keys: string[];
  label: string;
}

/**
 * Subtle help overlay listing the surface's keyboard shortcuts, opened with Shift + ?.
 * The one non-destructive dialog in the system: Escape closes it, focus returns to the invoker,
 * and it never blocks reading state.
 */
export interface ShortcutsDialogProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  /** Override the default shortcut list. */
  items?: ShortcutRow[];
  onClose?: () => void;
}
export function ShortcutsDialog(props: ShortcutsDialogProps): JSX.Element | null;
