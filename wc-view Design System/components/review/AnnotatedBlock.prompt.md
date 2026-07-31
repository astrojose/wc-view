One-line: marks a rendered doc element as annotated and makes it keyboard-reachable for review.

```jsx
<AnnotatedBlock count={2} status="unresolved" onSelect={openEditor}>
  <p>Bind each annotation with a layered anchor…</p>
</AnnotatedBlock>
```

Never use a heavier highlight than the tint + 3px rule — the document must stay the focus. `status="orphaned"` dashes the rule when the quote anchor no longer resolves.
