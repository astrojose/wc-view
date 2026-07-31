import React from 'react';

const tokens = {
  unresolved: { label: 'unresolved', color: 'var(--status-unresolved)' },
  in_progress: { label: 'in progress', color: 'var(--status-in-progress)' },
  resolved: { label: 'resolved', color: 'var(--status-resolved)' },
  orphaned: { label: 'orphaned', color: 'var(--status-orphaned)' }
};

export function StatusBadge({ status, children, style, ...rest }) {
  const t = tokens[status] || tokens.unresolved;
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
        font: 'var(--type-code)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase', color: t.color,
        border: 'var(--border-width) solid currentColor', borderRadius: 'var(--radius-sm)',
        padding: '0 var(--space-2)', background: 'transparent', ...style
      }}
      {...rest}
    >
      <span aria-hidden="true" style={{ width: '0.375rem', height: '0.375rem', borderRadius: 'var(--radius-pill)', background: 'currentColor', ...(status === 'orphaned' ? { background: 'transparent', border: '1px solid currentColor' } : null) }} />
      {children || t.label}
    </span>
  );
}
