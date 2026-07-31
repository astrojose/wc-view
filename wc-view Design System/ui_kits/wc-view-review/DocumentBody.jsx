const { AnnotatedBlock, CodeBlock } = window.WcViewDesignSystem_136191;

const H = ({ children }) => (
  <h2 style={{ margin: 'var(--space-6) 0 0', font: 'var(--type-heading)', color: 'var(--fg-primary)', letterSpacing: 'var(--tracking-tight)' }}>{children}</h2>
);

const blocks = [
  { id: 'b1', kind: 'h', text: 'Context' },
  { id: 'b2', kind: 'p', text: 'workflow-contract keeps Markdown documents as the authority for proposals, design, planning, and execution.' },
  { id: 'b3', kind: 'p', text: 'CLI-agent users must currently locate and read Markdown in an editor or host-specific artifact UI. The same review surface must work with Codex, Claude Code, Pi, OpenCode, Cursor, and Antigravity.' },
  { id: 'b4', kind: 'h', text: 'Proposed Change' },
  { id: 'b5', kind: 'p', text: 'Render Markdown files or a docs/ tree in a lightweight localhost browser UI. Keep Markdown and explicit human acceptance authoritative — browser feedback is unapproved input.' },
  { id: 'b6', kind: 'p', text: 'Bind each annotation with a layered anchor, resolved by ordered fallback: quote + context first, structural scope as a narrower, position hint only as a re-validated cache.' },
  { id: 'b7', kind: 'code', label: 'queue.jsonl', text: '{"id":"a3f","anchor":{"exact":"layered anchor","prefix":"Bind each annotation with a ","suffix":", resolved by ordered fal"},"scope":"proposed-change#p2","comment":"Name the 32-char window as a constant.","severity":"note","status":"unresolved"}' },
  { id: 'b8', kind: 'h', text: 'Open Decisions' },
  { id: 'b9', kind: 'p', text: 'Feedback retention lifecycle and wc-view gc automatic cleanup triggers.' },
  { id: 'b10', kind: 'p', text: 'Queue mutation model: append-only JSONL with folded state-transition events vs Maildir-style file moves for in-place status changes.' }
];

function DocumentBody({ notesByBlock, activeId, onSelect }) {
  return (
    <>
      {blocks.map((b) => {
        if (b.kind === 'h') return <H key={b.id}>{b.text}</H>;
        const notes = notesByBlock[b.id] || [];
        const status = notes.length ? notes[notes.length - 1].status : 'unresolved';
        return (
          <AnnotatedBlock key={b.id} count={notes.length} status={status} active={activeId === b.id} onSelect={() => onSelect(b)}>
            {b.kind === 'code'
              ? <CodeBlock label={b.label} reservedHeight="7rem" code={b.text} />
              : <p style={{ margin: 0, font: 'var(--type-body)', color: 'var(--fg-secondary)' }}>{b.text}</p>}
          </AnnotatedBlock>
        );
      })}
    </>
  );
}

Object.assign(window, { DocumentBody, docBlocks: blocks });
