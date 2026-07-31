const { CodeBlock, Button, StatusRegion } = window.WcViewDesignSystem_136191;

function CliPanel({ notes, onClaim, onClose }) {
  const payload = JSON.stringify(
    notes.map((n) => ({
      id: n.id,
      anchor: { exact: n.quote, prefix: n.prefix, scope: n.scope },
      comment: n.comment,
      severity: 'note',
      status: n.status
    })),
    null, 1
  );
  return (
    <section aria-label="CLI feedback payload" style={{
      background: 'var(--surface-card)', border: 'var(--border-width) solid var(--border-strong)',
      borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-ambient)', padding: 'var(--pad-card)',
      display: 'flex', flexDirection: 'column', gap: 'var(--space-3)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <span className="mono" style={{ font: 'var(--type-code)', color: 'var(--fg-muted)' }}>$ wc-view feedback --unresolved</span>
        <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
      </div>
      <CodeBlock reservedHeight="10rem" code={notes.length ? payload : '[]'} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <StatusRegion tone={notes.length ? 'progress' : 'neutral'} message={notes.length ? notes.length + ' item(s) pulled by the agent' : 'Queue empty — nothing unresolved'} />
        <Button size="sm" variant="secondary" disabled={!notes.length} onClick={onClaim}>Mark in_progress</Button>
      </div>
    </section>
  );
}

Object.assign(window, { CliPanel });
