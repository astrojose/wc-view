import React from 'react';

export function CodeBlock({ code, label, reservedHeight, style, ...rest }) {
  return (
    <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', ...style }} {...rest}>
      {label && <figcaption style={{ font: 'var(--type-meta)', color: 'var(--fg-muted)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>{label}</figcaption>}
      <pre style={{
        margin: 0, minHeight: reservedHeight, boxSizing: 'border-box', overflowX: 'auto',
        background: 'var(--surface-inset)', border: 'var(--border-width) solid var(--border-subtle)',
        borderRadius: 'var(--radius)', padding: 'var(--space-4)',
        font: 'var(--type-code)', color: 'var(--fg-secondary)'
      }}><code>{code}</code></pre>
    </figure>
  );
}
