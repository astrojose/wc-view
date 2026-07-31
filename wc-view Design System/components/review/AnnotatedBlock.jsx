import React from 'react';

export function AnnotatedBlock({ count = 0, status = 'unresolved', active = false, selectable = true, onSelect, children, style, ...rest }) {
  const annotated = count > 0;
  const orphaned = status === 'orphaned';
  return (
    <div
      role={selectable ? 'button' : undefined}
      tabIndex={selectable ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={selectable && onSelect ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(e); } } : undefined}
      style={{
        position: 'relative', cursor: selectable ? 'text' : 'default',
        borderLeft: 'var(--annotation-bar-width) ' + (orphaned ? 'dashed' : 'solid') + ' ' + (annotated ? (orphaned ? 'var(--status-orphaned)' : 'var(--annotation-bar)') : 'transparent'),
        background: annotated && !orphaned ? (active ? 'var(--annotation-tint-strong)' : 'var(--annotation-tint)') : 'transparent',
        paddingLeft: 'var(--space-4)', marginLeft: 'calc(-1 * var(--space-4) - var(--annotation-bar-width))',
        paddingTop: 'var(--space-1)', paddingBottom: 'var(--space-1)',
        borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
        transition: 'var(--transition-control)', ...style
      }}
      {...rest}
    >
      {children}
      {annotated && (
        <span style={{
          position: 'absolute', top: 'var(--space-1)', right: 'calc(-1 * var(--space-8))',
          font: 'var(--type-code)', fontSize: 'var(--text-xs)',
          color: orphaned ? 'var(--status-orphaned)' : 'var(--ring-accent)'
        }}>{count}</span>
      )}
    </div>
  );
}
