import React from 'react';

export function Chip({ children, icon, count, onRemove, tone = 'neutral', style, ...rest }) {
  const accent = tone === 'accent';
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
        font: 'var(--type-meta)', letterSpacing: 'var(--tracking-tight)',
        color: accent ? 'var(--fg-primary)' : 'var(--fg-secondary)',
        background: accent ? 'var(--annotation-tint-strong)' : 'var(--surface-inset)',
        border: 'var(--border-width) solid var(--border-subtle)',
        borderRadius: 'var(--radius-pill)', padding: 'var(--space-1) var(--space-3)', ...style
      }}
      {...rest}
    >
      {icon}
      <span>{children}</span>
      {typeof count === 'number' && (
        <span style={{ font: 'var(--type-code)', color: 'var(--ring-accent)' }}>{count}</span>
      )}
      {onRemove && (
        <button
          type="button" aria-label={'Remove ' + (typeof children === 'string' ? children : 'chip')}
          onClick={onRemove}
          style={{ background: 'none', border: 0, color: 'var(--fg-muted)', cursor: 'pointer', font: 'var(--type-code)', lineHeight: 1, padding: 0 }}
        >×</button>
      )}
    </span>
  );
}
