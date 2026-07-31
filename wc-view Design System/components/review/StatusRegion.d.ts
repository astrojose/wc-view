import type { ReactNode, HTMLAttributes } from 'react';

/** Polite live region announcing submitted / claimed / response-proposed / orphaned / failed transitions. */
export interface StatusRegionProps extends HTMLAttributes<HTMLParagraphElement> {
  message: ReactNode;
  tone?: 'neutral' | 'progress' | 'success' | 'warning' | 'error';
}
export function StatusRegion(props: StatusRegionProps): JSX.Element;
