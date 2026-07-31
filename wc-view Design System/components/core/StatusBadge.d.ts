import type { ReactNode, HTMLAttributes } from 'react';

/**
 * Feedback-lifecycle state for an annotation. Never conveys state by colour alone — the label is always rendered.
 */
export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: 'unresolved' | 'in_progress' | 'resolved' | 'orphaned';
  /** Override the default label text. */
  children?: ReactNode;
}
export function StatusBadge(props: StatusBadgeProps): JSX.Element;
