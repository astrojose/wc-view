import React from 'react';

export function DocCanvas({ title, meta, children, style, ...rest }) {
  return (
    <main
      style={{
        width: '100%', maxWidth: 'var(--measure-doc-max)', margin: '0 auto',
        padding: 'var(--space-10) var(--space-6) var(--space-20)',
        font: 'var(--type-body)', color: 'var(--fg-primary)', letterSpacing: 'var(--tracking-tight)',
        display: 'flex', flexDirection: 'column', gap: 'var(--block-flow)', ...style
      }}
      {...rest}
    >
      {(title || meta) && (
        <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {title && <h1 style={{ margin: 0, font: 'var(--type-doc-title)', color: 'var(--fg-primary)' }}>{title}</h1>}
          {meta && <p style={{ margin: 0, font: 'var(--type-code)', color: 'var(--fg-muted)' }}>{meta}</p>}
        </header>
      )}
      {children}
    </main>
  );
}
