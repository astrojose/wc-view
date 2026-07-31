One-line: glyph-only square control for toggles and dismissals; never ship one without `label`.

```jsx
<IconButton label="Toggle theme" icon={<i data-lucide="sun" />} onClick={toggle} />
<IconButton label="Show review queue" icon={<i data-lucide="list" />} active={open} />
```

Default 44px (`md`); `sm` (32px) is allowed only inside popovers. `active` tints the background and emits `aria-pressed`.
