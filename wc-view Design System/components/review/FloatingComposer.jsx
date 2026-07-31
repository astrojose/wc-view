import React from 'react';
import { Button } from '../core/Button.jsx';
import { Chip } from '../core/Chip.jsx';
import { IconButton } from '../core/IconButton.jsx';

export function FloatingComposer({ value = '', onChange, onSubmit, noteCount = 0, selection, queueOpen = false, onToggleQueue, queueIcon, children, style, ...rest }) {
  return (
    <div
      role="region" aria-label="Review composer"
      style={{
        position: 'sticky', bottom: 'var(--composer-inset)', zIndex: 20,
        width: 'min(46rem,100%)', margin: '0 auto',
        background: 'var(--surface-card)', border: 'var(--border-width) solid var(--border-strong)',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-composer)',
        padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', ...style
      }}
      {...rest}
    >
      {(noteCount > 0 || selection) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-inline)', alignItems: 'center' }}>
          {noteCount > 0 && <Chip tone="accent" count={noteCount}>notes attached</Chip>}
          {selection && <Chip>“{selection}”</Chip>}
        </div>
      )}
      {queueOpen && children}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
        {onToggleQueue && (
          <IconButton label={queueOpen ? 'Hide review queue' : 'Show review queue'} active={queueOpen} onClick={onToggleQueue}
            icon={queueIcon || <span aria-hidden="true" style={{ font: 'var(--type-code)' }}>≡</span>} />
        )}
        <textarea
          value={value} onChange={(e) => onChange && onChange(e.target.value)}
          rows={1} placeholder="Add an instruction for the agent…"
          style={{
            flex: 1, resize: 'none', minHeight: 'var(--tap-min)', boxSizing: 'border-box',
            background: 'var(--surface-inset)', color: 'var(--fg-primary)',
            border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius)',
            padding: 'var(--space-3)', font: 'var(--type-body)', letterSpacing: 'var(--tracking-tight)'
          }}
        />
        <Button variant="primary" onClick={onSubmit} disabled={!value.trim() && noteCount === 0}>Submit</Button>
      </div>
    </div>
  );
}
