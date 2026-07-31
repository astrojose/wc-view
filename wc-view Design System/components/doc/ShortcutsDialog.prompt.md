One-line: the Shift + ? keyboard-shortcut guide — the documented discoverability affordance for a UI with no menus.

```jsx
<ShortcutsDialog open={help} onClose={() => setHelp(false)} />
```

Bind it on `keydown` with `e.key === '?'` and never swallow the key while a text field has focus. Scrim click and Escape both close.
