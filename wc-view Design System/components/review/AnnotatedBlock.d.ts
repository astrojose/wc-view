import type { ReactNode, HTMLAttributes } from 'react';

/**
 * Wraps a rendered document element (paragraph, code block, table, Mermaid node) that carries annotations.
 * Highlight is the spec's subtle indicator: 3px champagne left rule + 6% tint.
 */
export interface AnnotatedBlockProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of attached notes; 0 renders no indicator. */
  count?: number;
  /** Anchor-resolution state; `orphaned` switches to a dashed muted rule. */
  status?: 'unresolved' | 'in_progress' | 'resolved' | 'orphaned';
  /** Currently focused for review — stronger tint. */
  active?: boolean;
  /** Keyboard-reachable (Enter/Space opens the annotation editor). */
  selectable?: boolean;
  onSelect?: (e: unknown) => void;
  children: ReactNode;
}
export function AnnotatedBlock(props: AnnotatedBlockProps): JSX.Element;
