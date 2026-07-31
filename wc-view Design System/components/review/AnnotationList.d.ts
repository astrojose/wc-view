import type { HTMLAttributes } from 'react';

export interface AnnotationItem {
  id: string;
  /** Resolved `exact` quote. */
  quote: string;
  comment: string;
  /** Structural scope narrower, e.g. "§ Open Decisions › list item 2". */
  scope?: string;
  status?: 'unresolved' | 'in_progress' | 'resolved' | 'orphaned';
}

/**
 * Navigable list of pending / tracked annotations — the recovery affordance behind the composer.
 */
export interface AnnotationListProps extends HTMLAttributes<HTMLUListElement> {
  items?: AnnotationItem[];
  onSelect?: (item: AnnotationItem) => void;
  onRemove?: (item: AnnotationItem) => void;
  emptyLabel?: string;
}
export function AnnotationList(props: AnnotationListProps): JSX.Element;
