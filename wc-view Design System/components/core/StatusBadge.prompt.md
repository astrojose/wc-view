One-line: shows an annotation's reconcile-loop state (`unresolved → in_progress → resolved`, plus `orphaned`).

```jsx
<StatusBadge status="in_progress" />
<StatusBadge status="orphaned">anchor lost</StatusBadge>
```

Always keeps its text label (WCAG: no colour-only state). `orphaned` uses a hollow dot and the muted stone tone.
