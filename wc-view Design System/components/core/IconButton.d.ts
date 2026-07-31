import type { ReactNode, ButtonHTMLAttributes } from 'react';

/** Square glyph-only control (theme toggle, popover dismiss, note remove). Always requires `label`. */
export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  /** Accessible name — also used as the tooltip. Required. */
  label: string;
  icon: ReactNode;
  /** Toggled state; renders `aria-pressed`. */
  active?: boolean;
  /** `md` = 44px target. `sm` only where a keyboard equivalent exists. */
  size?: 'sm' | 'md';
}
export function IconButton(props: IconButtonProps): JSX.Element;
