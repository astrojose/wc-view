One-line: the inline note editor that opens from a selected span or `AnnotatedBlock`.

```jsx
<AnnotationPopover quote="layered anchor" anchorNote="§ Proposed Change › paragraph 4"
  value={draft} onChange={setDraft} onSave={attach} onCancel={close} />
```

Non-modal by contract (`aria-modal="false"`): it must not trap focus. Save stays disabled until the note has text.
