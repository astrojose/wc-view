One-line: destructive-confirmation modal — the single place a modal is allowed.

```jsx
<ConfirmDialog title="Discard 3 queued notes?" description="Unsubmitted notes are not written to the feedback queue."
  confirmLabel="Discard" onConfirm={clear} onCancel={close} />
```

Do not use it for annotation editing (that popover is non-modal). Positions itself against the nearest positioned ancestor.
