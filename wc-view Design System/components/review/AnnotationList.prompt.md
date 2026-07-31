One-line: the keyboard-navigable queue of pending notes, revealed from the composer's persistent affordance.

```jsx
<AnnotationList items={notes} onSelect={jumpToAnchor} onRemove={drop} />
```

Each row is quote → comment → scope, with a `StatusBadge` and a labelled remove control. Renders `emptyLabel` instead of an empty container.
