One-line: the floating bottom composer that replaces the chat sidebar — chips, instruction field, atomic submit, queue toggle.

```jsx
<FloatingComposer value={prompt} onChange={setPrompt} onSubmit={submitBatch}
  noteCount={notes.length} selection="layered anchor"
  queueOpen={open} onToggleQueue={() => setOpen(!open)}>
  <AnnotationList items={notes} onRemove={drop} />
</FloatingComposer>
```

Never add a persistent side panel alongside it. Submit is disabled only when there is neither text nor an attached note.
