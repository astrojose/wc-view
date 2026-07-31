import type { ReactNode, HTMLAttributes } from 'react';

/** Compact pill shown in the composer for the active selection and attached-note count. */
export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
  icon?: ReactNode;
  /** Trailing monospace numeral, e.g. attached-note count. */
  count?: number;
  /** When provided, renders a labelled remove affordance. */
  onRemove?: () => void;
  tone?: 'neutral' | 'accent';
}
export function Chip(props: ChipProps): JSX.Element;
