import React from 'react';

export function StatusRegion({ message, tone = 'neutral', style, ...rest }) {
  const colors = { neutral: 'var(--fg-muted)', progress: 'var(--status-in-progress)', success: 'var(--status-resolved)', warning: 'var(--status-orphaned)', error: 'var(--status-unresolved)' };
  return (
    <p
      role="status" aria-live="polite"
      style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', font: 'var(--type-meta)', color: colors[tone], letterSpacing: 'var(--tracking-tight)', ...style }}
      {...rest}
    >
      <span aria-hidden="true" style={{ font: 'var(--type-code)' }}>›</span>{message}
    </p>
  );
}
