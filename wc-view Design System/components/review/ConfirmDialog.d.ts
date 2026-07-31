import type { HTMLAttributes } from 'react';

/**
 * The ONLY modal in the system: destructive confirmation (discard queue, delete note).
 * Traps focus while open, always offers a visible Cancel, restores invoking focus on close.
 */
export interface ConfirmDialogProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}
export function ConfirmDialog(props: ConfirmDialogProps): JSX.Element | null;
