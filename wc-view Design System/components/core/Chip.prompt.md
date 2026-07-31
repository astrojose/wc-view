One-line: selection / attached-note badge for the floating composer.

```jsx
<Chip tone="accent" count={3} icon={<i data-lucide="tag" />}>notes attached</Chip>
<Chip onRemove={() => drop(id)}>"layered anchor"</Chip>
```

`tone="accent"` for the live count; neutral for quoted spans. Counts render in JetBrains Mono in the champagne ring accent.
