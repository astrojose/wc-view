import type { ReactNode, HTMLAttributes } from 'react';

/**
 * The central floating bottom bar — the surface's only persistent control cluster (no sidebars).
 * Submitting writes all attached notes plus the instruction as one atomic batch.
 */
export interface FloatingComposerProps extends HTMLAttributes<HTMLDivElement> {
  value?: string;
  onChange?: (v: string) => void;
  /** Atomic batch submit of notes + instruction. */
  onSubmit?: () => void;
  /** Count shown in the accent chip. */
  noteCount?: number;
  /** Quote of the live selection, shown as a neutral chip. */
  selection?: string;
  queueOpen?: boolean;
  onToggleQueue?: () => void;
  queueIcon?: ReactNode;
  /** Queue content (usually `AnnotationList`), rendered only when `queueOpen`. */
  children?: ReactNode;
}
export function FloatingComposer(props: FloatingComposerProps): JSX.Element;
