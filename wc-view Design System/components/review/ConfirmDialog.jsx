import React from 'react';
import { Button } from '../core/Button.jsx';

export function ConfirmDialog({ open = true, title, description, confirmLabel = 'Delete', onConfirm, onCancel, style, ...rest }) {
  if (!open) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', borderRadius: 'inherit' }}>
      <div
        role="dialog" aria-modal="true" aria-label={title}
        onKeyDown={(e) => { if (e.key === 'Escape' && onCancel) onCancel(); }}
        style={{
          width: '24rem', maxWidth: 'calc(100% - var(--space-8))', background: 'var(--surface-card)',
          border: 'var(--border-width) solid var(--border-strong)', borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-popover)', padding: 'var(--space-5)',
          display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', ...style
        }}
        {...rest}
      >
        <h2 style={{ margin: 0, font: 'var(--type-subheading)', color: 'var(--fg-primary)', letterSpacing: 'var(--tracking-tight)' }}>{title}</h2>
        {description && <p style={{ margin: 0, font: 'var(--type-body)', color: 'var(--fg-muted)' }}>{description}</p>}
        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
