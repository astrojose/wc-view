import React from 'react';

export function Toast({ message, meta, expanded = false, onToggle, actions, style, ...rest }) {
  return (
    <div
      role="status" aria-live="polite"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)',
        maxWidth: '46rem', width: '100%',
        background: 'var(--surface-card)', border: 'var(--border-width) solid var(--border-subtle)',
        borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-ambient)',
        padding: 'var(--space-3) var(--pad-card)', ...style
      }}
      {...rest}
    >
      <span aria-hidden="true" style={{ width: 'var(--annotation-bar-width)', alignSelf: 'stretch', borderRadius: 'var(--radius-pill)', background: 'var(--ring-accent)', flex: '0 0 auto' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, font: 'var(--type-ui)', color: 'var(--fg-primary)', letterSpacing: 'var(--tracking-tight)',
          ...(expanded ? null : { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })
        }}>{message}</p>
        {meta && <p style={{ margin: 'var(--space-1) 0 0', font: 'var(--type-meta)', color: 'var(--fg-muted)' }}>{meta}</p>}
        {expanded && actions && <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>{actions}</div>}
      </div>
      {onToggle && (
        <button
          type="button" onClick={onToggle} aria-expanded={expanded}
          style={{ background: 'none', border: 0, color: 'var(--fg-muted)', font: 'var(--type-meta)', cursor: 'pointer', padding: 'var(--space-1)' }}
        >{expanded ? 'Collapse' : 'Expand'}</button>
      )}
    </div>
  );
}
