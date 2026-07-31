One-line: the standard text action button — use for composer submit, annotation save, and dialog confirm/cancel.

```jsx
<Button variant="primary" size="md" onClick={submit}>Submit feedback</Button>
<Button variant="ghost" size="sm">Cancel</Button>
```

Variants: `primary` (one per view), `secondary` (default), `ghost` (inline/low-stakes), `danger` (destructive confirm only, outlined not filled). Sizes: `md` (44px, default) and `sm` (32px, popovers only).
