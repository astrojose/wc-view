import type { ReactNode, HTMLAttributes } from 'react';

/** Compact top toast carrying ONLY the agent's latest message/status; expandable on click. */
export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  message: ReactNode;
  /** Secondary line: timestamp, doc name, or queue counts. */
  meta?: ReactNode;
  expanded?: boolean;
  onToggle?: () => void;
  /** Rendered only when expanded. */
  actions?: ReactNode;
}
export function Toast(props: ToastProps): JSX.Element;
