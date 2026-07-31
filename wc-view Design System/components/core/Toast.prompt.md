One-line: the single latest-agent-message toast at the top of the review surface — history lives in the queue affordance, not here.

```jsx
<Toast message="Claimed 3 notes in §Proposed Change" meta="2 unresolved remaining" expanded={open} onToggle={() => setOpen(!open)} />
```

Truncates to one line when collapsed. Carries `role="status"` + `aria-live="polite"`; never stack more than one.
