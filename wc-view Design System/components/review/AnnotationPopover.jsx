import React from 'react';
import { Button } from '../core/Button.jsx';
import { StatusBadge } from '../core/StatusBadge.jsx';

export function AnnotationPopover({ quote, anchorNote, value = '', status, onChange, onSave, onCancel, style, ...rest }) {
  return (
    <div
      role="dialog" aria-label="Add review note" aria-modal="false"
      onKeyDown={(e) => { if (e.key === 'Escape' && onCancel) onCancel(); }}
      style={{
        width: '26rem', maxWidth: '100%', background: 'var(--surface-card)',
        border: 'var(--border-width) solid var(--border-strong)', borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-popover)', padding: 'var(--pad-card)',
        display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', ...style
      }}
      {...rest}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
        <span style={{ font: 'var(--type-meta)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>Review note</span>
        {status && <StatusBadge status={status} />}
      </div>
      {quote && (
        <blockquote style={{
          margin: 0, paddingLeft: 'var(--space-3)', borderLeft: 'var(--annotation-bar-width) solid var(--annotation-bar)',
          font: 'var(--type-code)', color: 'var(--fg-secondary)'
        }}>{quote}</blockquote>
      )}
      {anchorNote && <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--fg-muted)' }}>{anchorNote}</p>}
      <textarea
        value={value} onChange={(e) => onChange && onChange(e.target.value)}
        placeholder="What should the agent change here?"
        rows={3}
        style={{
          resize: 'vertical', width: '100%', boxSizing: 'border-box',
          background: 'var(--surface-inset)', color: 'var(--fg-primary)',
          border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-3)', font: 'var(--type-body)', letterSpacing: 'var(--tracking-tight)'
        }}
      />
      <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button size="sm" variant="primary" onClick={onSave} disabled={!value.trim()}>Attach note</Button>
      </div>
    </div>
  );
}
