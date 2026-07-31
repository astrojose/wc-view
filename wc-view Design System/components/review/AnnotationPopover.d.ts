import type { HTMLAttributes } from 'react';

/**
 * Non-modal editor for one annotation. Shows the resolved quote anchor, never traps focus,
 * and Escape closes it while preserving the draft.
 */
export interface AnnotationPopoverProps extends HTMLAttributes<HTMLDivElement> {
  /** The `exact` quote the anchor resolved to. */
  quote?: string;
  /** Structural scope line, e.g. "§ Proposed Change › paragraph 4". */
  anchorNote?: string;
  value?: string;
  status?: 'unresolved' | 'in_progress' | 'resolved' | 'orphaned';
  onChange?: (v: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
}
export function AnnotationPopover(props: AnnotationPopoverProps): JSX.Element;
