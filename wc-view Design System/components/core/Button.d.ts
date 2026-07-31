import type { ReactNode, ButtonHTMLAttributes } from 'react';

/**
 * Primary text action used across the review surface: composer submit, popover save, dialog confirm.
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual intent. `primary` is the single coral (dark) / near-black (light) action per view. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** `md` meets the 44px pointer target; `sm` only inside popovers with keyboard equivalents. */
  size?: 'sm' | 'md';
  disabled?: boolean;
  /** Optional leading glyph (Lucide `<i data-lucide>` or inline svg). */
  icon?: ReactNode;
  children?: ReactNode;
}
export function Button(props: ButtonProps): JSX.Element;
