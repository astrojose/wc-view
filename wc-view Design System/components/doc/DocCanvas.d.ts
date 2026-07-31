import type { ReactNode, HTMLAttributes } from 'react';

/**
 * The full-width centered reading column (68–76ch, zero sidebars) that every review screen is built on.
 */
export interface DocCanvasProps extends HTMLAttributes<HTMLElement> {
  /** Document H1, set in the Playfair Display serif accent. */
  title?: ReactNode;
  /** Monospace meta line: file path, status, last modified. */
  meta?: ReactNode;
  children?: ReactNode;
}
export function DocCanvas(props: DocCanvasProps): JSX.Element;
