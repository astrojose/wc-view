import React from 'react';
import { StatusBadge } from '../core/StatusBadge.jsx';
import { IconButton } from '../core/IconButton.jsx';

export function AnnotationList({ items = [], onSelect, onRemove, emptyLabel = 'No notes queued.', style, ...rest }) {
  if (!items.length) {
    return <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--fg-muted)', padding: 'var(--space-3)' }}>{emptyLabel}</p>;
  }
  return (
    <ul aria-label="Pending review notes" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', ...style }} {...rest}>
      {items.map((it) => (
        <li key={it.id} style={{
          display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)',
          background: 'var(--surface-inset)', border: 'var(--border-width) solid var(--border-subtle)',
          borderLeft: 'var(--annotation-bar-width) solid var(--annotation-bar)',
          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', padding: 'var(--space-3)'
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <button type="button" onClick={() => onSelect && onSelect(it)} style={{
              background: 'none', border: 0, padding: 0, textAlign: 'left', cursor: 'pointer',
              font: 'var(--type-code)', color: 'var(--fg-secondary)', display: 'block',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%'
            }}>“{it.quote}”</button>
            <p style={{ margin: 'var(--space-1) 0 0', font: 'var(--type-ui)', color: 'var(--fg-primary)', letterSpacing: 'var(--tracking-tight)' }}>{it.comment}</p>
            <p style={{ margin: 'var(--space-1) 0 0', font: 'var(--type-meta)', color: 'var(--fg-muted)' }}>{it.scope}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: '0 0 auto' }}>
            <StatusBadge status={it.status || 'unresolved'} />
            {onRemove && <IconButton size="sm" label={'Remove note on ' + it.quote} icon={<span aria-hidden="true" style={{ font: 'var(--type-code)' }}>×</span>} onClick={() => onRemove(it)} />}
          </div>
        </li>
      ))}
    </ul>
  );
}
