One-line: rendered fenced code / CLI output inside the reading canvas.

```jsx
<CodeBlock label="queue.jsonl" reservedHeight="9rem" code={payload} />
```

Always pass `reservedHeight` for async-filled blocks — the spec drives layout shift toward CLS = 0.
