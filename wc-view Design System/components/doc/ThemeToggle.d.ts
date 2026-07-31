import type { ReactNode, HTMLAttributes } from 'react';

/** Flips the `[data-theme]` attribute. Dark is default; system preference applies when unset. */
export interface ThemeToggleProps extends HTMLAttributes<HTMLSpanElement> {
  theme?: 'dark' | 'light';
  onChange?: (theme: 'dark' | 'light') => void;
  lightIcon?: ReactNode;
  darkIcon?: ReactNode;
}
export function ThemeToggle(props: ThemeToggleProps): JSX.Element;
