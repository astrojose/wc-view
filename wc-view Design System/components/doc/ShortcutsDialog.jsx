import React from 'react';
import { Button } from '../core/Button.jsx';

const rows = [
  { keys: ['Shift', '?'], label: 'Show this shortcut guide' },
  { keys: ['Enter'], label: 'Open the note editor on the focused block' },
  { keys: ['Esc'], label: 'Close the editor, keeping the draft' },
  { keys: ['⌘', 'Enter'], label: 'Submit the batch to the local queue' },
  { keys: ['⌘', 'K'], label: 'Focus the composer' },
  { keys: ['J', 'K'], label: 'Move between annotated blocks' }
];

const Key = ({ children }) => (
  <kbd style={{
    font: 'var(--type-code)', fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)',
    background: 'var(--surface-inset)', border: 'var(--border-width) solid var(--border-strong)',
    borderRadius: 'var(--radius-sm)', padding: '0 var(--space-2)', minWidth: '1.25rem',
    display: 'inline-flex', justifyContent: 'center'
  }}>{children}</kbd>
);

export function ShortcutsDialog({ open = false, items, onClose, style, ...rest }) {
  if (!open) return null;
  const list = items || rows;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div
        role="dialog" aria-modal="true" aria-label="Keyboard shortcuts"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => { if (e.key === 'Escape' && onClose) onClose(); }}
        style={{
          width: '26rem', maxWidth: 'calc(100% - var(--space-8))',
          background: 'var(--surface-card)', border: 'var(--border-width) solid var(--border-strong)',
          borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-popover)', padding: 'var(--space-5)',
          display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', ...style
        }}
        {...rest}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
          <h2 style={{ margin: 0, font: 'var(--type-subheading)', color: 'var(--fg-primary)', letterSpacing: 'var(--tracking-tight)' }}>Keyboard shortcuts</h2>
          <span style={{ font: 'var(--type-meta)', color: 'var(--fg-muted)' }}>Shift + ?</span>
        </div>
        <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--space-3) var(--space-4)', alignItems: 'center' }}>
          {list.map((r) => (
            <React.Fragment key={r.label}>
              <dt style={{ display: 'flex', gap: 'var(--space-1)' }}>{r.keys.map((k) => <Key key={k}>{k}</Key>)}</dt>
              <dd style={{ margin: 0, font: 'var(--type-ui)', color: 'var(--fg-secondary)' }}>{r.label}</dd>
            </React.Fragment>
          ))}
        </dl>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button size="sm" variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
