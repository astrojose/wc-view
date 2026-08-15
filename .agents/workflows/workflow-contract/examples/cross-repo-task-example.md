# Cross-Repository Task Example

```md
## Work Classification

- Class: planned
- Coordination: cross-repo
- Reclassified from: not applicable

## Cross-Repository Coordination

- Participating repositories: api, mobile
- Shared contracts: `POST /auth/login` response schema
- Invariants: existing clients remain compatible
- Integration owner: API maintainer
- Dependency order: API contract, API implementation, mobile adoption
```
