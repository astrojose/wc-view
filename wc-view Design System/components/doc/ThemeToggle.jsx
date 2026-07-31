import React from 'react';
import { IconButton } from '../core/IconButton.jsx';

export function ThemeToggle({ theme = 'dark', onChange, lightIcon, darkIcon, style, ...rest }) {
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', ...style }} {...rest}>
      <IconButton
        label={'Switch to ' + next + ' theme'}
        onClick={() => onChange && onChange(next)}
        icon={theme === 'dark' ? (darkIcon || <span aria-hidden="true" style={{ font: 'var(--type-code)' }}>◐</span>) : (lightIcon || <span aria-hidden="true" style={{ font: 'var(--type-code)' }}>◑</span>)}
      />
      <span style={{ font: 'var(--type-meta)', color: 'var(--fg-muted)' }}>{theme}</span>
    </span>
  );
}
