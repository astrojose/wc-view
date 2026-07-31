import React from 'react';

export function IconButton({ label, icon, active = false, size = 'md', style, ...rest }) {
  const dim = size === 'sm' ? '2rem' : 'var(--tap-min)';
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active || undefined}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: dim, height: dim, flex: '0 0 auto',
        background: active ? 'var(--annotation-tint-strong)' : 'transparent',
        color: active ? 'var(--fg-primary)' : 'var(--fg-muted)',
        border: 'var(--border-width) solid ' + (active ? 'var(--border-strong)' : 'transparent'),
        borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'var(--transition-control)', ...style
      }}
      {...rest}
    >
      {icon}
    </button>
  );
}
