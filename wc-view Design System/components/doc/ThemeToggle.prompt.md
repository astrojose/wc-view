One-line: the single chrome control on the review surface — toggles `[data-theme]`.

```jsx
<ThemeToggle theme={theme} onChange={(t) => { setTheme(t); document.documentElement.dataset.theme = t; }} />
```

Label always states the destination theme. Pass Lucide `sun`/`moon` nodes to replace the fallback glyphs.
