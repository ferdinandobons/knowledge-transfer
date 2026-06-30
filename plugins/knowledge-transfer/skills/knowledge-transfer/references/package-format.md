# Handover package format

The export phase writes this structure into the root of the target project:

```
handover/
  ONBOARDING.md          # onboarding document (see onboarding-template.md)
  memories/
    <slug>.md            # one file per exported memory
  manifest.json          # export metadata
```

## manifest.json

```json
{
  "version": 1,
  "exported_at": "2026-06-10",
  "author": "Jane Doe",
  "commit": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
  "language": "en",
  "memories": {
    "exported": 3,
    "excluded": 1
  }
}
```

Field rules:

- `version` — always `1` for this format. Importers must refuse unknown versions.
- `exported_at` — ISO date of the export.
- `author` — from `git config user.name`. Omit the field if unavailable. (The privacy
  filter applies to memory *content*, not to git metadata already public in the repo.)
- `commit` — full SHA of `HEAD` at export time. Omit if the project is not a git repo.
  The import phase uses it to diff what changed since the export.
- `language` — ISO 639-1 code of the language ONBOARDING.md is written in.
- `memories.exported` / `memories.excluded` — counts after the privacy filter. They let
  the importer (and the team) see that filtering happened.

## memories/<slug>.md

Portable Markdown memory format. It intentionally matches the simple frontmatter
shape used by Claude Code memories and is easy for Codex or another agent to
translate into its own memory-update mechanism:

```markdown
---
name: <slug>
description: <one-line summary used for relevance during recall>
metadata:
  type: project | reference | feedback
---

<body>
```

Constraints:

- Type `user` NEVER appears in a package (see privacy-filter.md).
- Bodies are rewritten in neutral, impersonal voice — no names, no personal data.
- Every memory must be verifiable: if it cites files, paths, or identifiers, they must
  exist in the project at export time.
- `[[name]]` links between memories are allowed only if the target memory is also
  exported; otherwise remove the link syntax and keep plain text.
- Importers may adapt the storage wrapper or index to Claude, Codex, or another
  agent, but must preserve the verified project fact in the memory body.
