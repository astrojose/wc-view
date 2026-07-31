const { DocCanvas, FloatingComposer, AnnotationList, AnnotationPopover, ConfirmDialog, Toast, ThemeToggle, StatusRegion, IconButton, ShortcutsDialog } = window.WcViewDesignSystem_136191;
const Ic = ({ n }) => <i data-lucide={n}></i>;
let seq = 0;

function ReviewSurface() {
  const [theme, setTheme] = React.useState('dark');
  const [notes, setNotes] = React.useState([]);
  const [target, setTarget] = React.useState(null);
  const [draft, setDraft] = React.useState('');
  const [prompt, setPrompt] = React.useState('');
  const [queueOpen, setQueueOpen] = React.useState(false);
  const [cli, setCli] = React.useState(false);
  const [dialog, setDialog] = React.useState(false);
  const [help, setHelp] = React.useState(false);
  const [toast, setToast] = React.useState({ msg: 'Reading docs/changes/proposed/wc-view-local-markdown-review-surface.md', meta: 'proposed · 9.8 kB · watching for changes' });
  const [toastOpen, setToastOpen] = React.useState(false);
  const [status, setStatus] = React.useState({ tone: 'neutral', msg: 'Select any paragraph to attach a review note.' });

  React.useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  React.useEffect(() => { window.lucide && window.lucide.createIcons(); });
  React.useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement && document.activeElement.tagName);
      if (e.key === '?' && !typing) { e.preventDefault(); setHelp(true); }
      if (e.key === 'Escape') setHelp(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const notesByBlock = notes.reduce((acc, n) => { (acc[n.blockId] = acc[n.blockId] || []).push(n); return acc; }, {});

  const attach = () => {
    const quote = target.text.split(' ').slice(0, 4).join(' ');
    setNotes([...notes, { id: 'n' + (++seq), blockId: target.id, quote, prefix: target.text.slice(0, 32), comment: draft, scope: '§ ' + target.id, status: 'unresolved' }]);
    setStatus({ tone: 'success', msg: 'Note attached to “' + quote + '” — not yet submitted.' });
    setTarget(null); setDraft('');
  };

  const submit = () => {
    const n = notes.length;
    setStatus({ tone: 'success', msg: n + ' note(s) + instruction written atomically to ~/.wc-view/feedback/queue.jsonl' });
    setToast({ msg: 'Submitted ' + n + ' annotation(s) to the local queue', meta: 'agent may pull with wc-view feedback --unresolved' });
    setPrompt(''); setQueueOpen(false); setCli(true);
  };

  const claim = () => {
    setNotes(notes.map((x) => ({ ...x, status: x.status === 'unresolved' ? 'in_progress' : x.status })));
    setStatus({ tone: 'progress', msg: 'Agent claimed the batch — status in_progress' });
    setToast({ msg: 'Agent claimed ' + notes.length + ' note(s); proposing document edits', meta: 'reconcile loop: unresolved → in_progress' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-4) var(--space-6) 0', background: 'linear-gradient(var(--bg-base) 70%, transparent)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', width: 'min(46rem,100%)' }}>
          <Toast message={toast.msg} meta={toast.meta} expanded={toastOpen} onToggle={() => setToastOpen(!toastOpen)} />
          <ThemeToggle theme={theme} onChange={setTheme} darkIcon={<Ic n="moon" />} lightIcon={<Ic n="sun" />} />
        </div>
      </div>

      <DocCanvas title="wc-view: local Markdown review surface" meta="docs/changes/proposed/wc-view-local-markdown-review-surface.md · proposed">
        <DocumentBody notesByBlock={notesByBlock} activeId={target && target.id} onSelect={(b) => { setTarget(b); setDraft(''); }} />
        {target && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <AnnotationPopover
              quote={target.text.slice(0, 60) + '…'}
              anchorNote={'§ ' + target.id + ' › ' + (target.kind === 'code' ? 'code block' : 'paragraph')}
              value={draft} onChange={setDraft} onSave={attach} onCancel={() => setTarget(null)} status="unresolved"
            />
          </div>
        )}
        {cli && <CliPanel notes={notes} onClaim={claim} onClose={() => setCli(false)} />}
      </DocCanvas>

      <div style={{ position: 'sticky', bottom: 0, padding: '0 var(--space-6) var(--composer-inset)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
        <div style={{ width: 'min(46rem,100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
          <StatusRegion tone={status.tone} message={status.msg} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <IconButton size="sm" label="Keyboard shortcuts (Shift + ?)" icon={<Ic n="keyboard" />} onClick={() => setHelp(true)} />
            <IconButton size="sm" label="Show CLI payload" active={cli} icon={<Ic n="terminal" />} onClick={() => setCli(!cli)} />
            <IconButton size="sm" label="Discard queued notes" icon={<Ic n="trash-2" />} onClick={() => notes.length && setDialog(true)} />
          </div>
        </div>
        <FloatingComposer
          value={prompt} onChange={setPrompt} onSubmit={submit}
          noteCount={notes.length} selection={target ? target.text.split(' ').slice(0, 4).join(' ') : undefined}
          queueOpen={queueOpen} onToggleQueue={() => setQueueOpen(!queueOpen)} queueIcon={<Ic n="list" />}
        >
          <AnnotationList
            items={notes}
            onSelect={(it) => setTarget(window.docBlocks.find((b) => b.id === it.blockId))}
            onRemove={(it) => setNotes(notes.filter((n) => n.id !== it.id))}
            emptyLabel="No notes queued — click a paragraph in the document to start."
          />
        </FloatingComposer>
      </div>

      <ShortcutsDialog open={help} onClose={() => setHelp(false)} />

      <ConfirmDialog
        open={dialog} title={'Discard ' + notes.length + ' queued note(s)?'}
        description="Unsubmitted notes are never written to ~/.wc-view/feedback/queue.jsonl."
        confirmLabel="Discard"
        onCancel={() => setDialog(false)}
        onConfirm={() => { setNotes([]); setDialog(false); setStatus({ tone: 'warning', msg: 'Queue discarded.' }); }}
      />
    </div>
  );
}

Object.assign(window, { ReviewSurface });
