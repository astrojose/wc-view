import React from 'react';

const base = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
  font: 'var(--type-ui)', letterSpacing: 'var(--tracking-tight)', borderRadius: 'var(--radius)',
  border: 'var(--border-width) solid transparent', cursor: 'pointer',
  transition: 'var(--transition-control)', textDecoration: 'none', whiteSpace: 'nowrap'
};

const sizes = {
  sm: { minHeight: '2rem', padding: '0 var(--space-3)' },
  md: { minHeight: 'var(--tap-min)', padding: '0 var(--pad-control-x)' }
};

const variants = {
  primary: { background: 'var(--accent-action)', color: 'var(--accent-action-fg)' },
  secondary: { background: 'var(--surface-raised)', color: 'var(--fg-primary)', borderColor: 'var(--border-strong)' },
  ghost: { background: 'transparent', color: 'var(--fg-secondary)' },
  danger: { background: 'transparent', color: 'var(--status-unresolved)', borderColor: 'var(--status-unresolved)' }
};

export function Button({ variant = 'secondary', size = 'md', disabled = false, icon, children, style, ...rest }) {
  return (
    <button
      type="button"
      disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], opacity: disabled ? 0.45 : 1, cursor: disabled ? 'not-allowed' : 'pointer', ...style }}
      {...rest}
    >
      {icon}{children}
    </button>
  );
}
