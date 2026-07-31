# Contributing

## Scope

This repository owns canonical workflow policy and reusable validation/templates.
Consumer repositories own domain docs and implementation planning artifacts.

## Documentation Tone

All authored and generated docs must follow the content style in `spec/workflow-spec.md`:

- brevity: remove words that add length without adding precision
- structure: headings, bullets, tables — no narrative paragraphs
- directness: state what must happen, not what might or could
- agent-executable: every sentence is a directive, constraint, or fact

## Releases

- Use tagged releases for consumer stability.
- Consumers pin submodule SHAs and upgrade through reviewed PRs.
- Backward-incompatible changes require a version bump and a migration guide in `compatibility/`.
