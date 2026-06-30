# Handover package format

The export phase writes a local staging folder and a transfer archive into the
root of the target project:

```
handover.zip               # transfer artifact to send to the next colleague
handover/
  ONBOARDING.md          # onboarding document (see onboarding-template.md)
  memories/
    <slug>.md            # one file per exported memory
  omissions.json         # privacy-safe omitted-memory accounting
  manifest.json          # export metadata
```

`handover/` is a working folder created where the export runs. `handover.zip` is
the artifact to pass to the next person. Do not commit either file by default;
only commit them if the team explicitly decides to store handovers in the repo.

The zip archive must contain the top-level `handover/` directory, not just its
contents:

```
handover.zip
└── handover/
    ├── ONBOARDING.md
    ├── manifest.json
    ├── omissions.json
    └── memories/
        └── <slug>.md
```

The zip wrapper is separate from the package schema. The folder format inside
the archive is versioned by `manifest.version`. New exports use version `2`.
Importers should support version `1` as a legacy format when possible.

## manifest.json

```json
{
  "version": 2,
  "exported_at": "2026-06-10",
  "author": "Jane Doe",
  "commit": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
  "language": "en",
  "memories": {
    "exported": 3,
    "excluded": 1
  },
  "artifacts": {
    "omissions": "omissions.json"
  }
}
```

Field rules:

- `version` — `2` for new exports. Importers must refuse unknown versions. Version
  `1` packages may omit `omissions.json`, source hashes, and claim metadata.
- `exported_at` — ISO date of the export.
- `author` — from `git config user.name`. Omit the field if unavailable. (The privacy
  filter applies to memory *content*, not to git metadata already public in the repo.)
- `commit` — full SHA of `HEAD` at export time. Omit if the project is not a git repo.
  The import phase uses it to diff what changed since the export.
- `language` — ISO 639-1 code of the language ONBOARDING.md is written in.
- `memories.exported` / `memories.excluded` — counts after the privacy filter. They let
  the importer (and the team) see that filtering happened.
- `artifacts.omissions` — relative path to the privacy-safe omissions manifest.

## omissions.json

Privacy-safe accounting for memories that were excluded or materially redacted.
It must never include the omitted private content itself.

```json
{
  "version": 1,
  "policy": "aggregate categories only; no omitted private content",
  "total_omitted": 2,
  "categories": [
    {
      "category": "personal_profile",
      "count": 1,
      "reason": "User-specific preference or identity data is not project knowledge."
    },
    {
      "category": "secret",
      "count": 1,
      "reason": "Secrets are excluded entirely, not redacted into the package."
    }
  ]
}
```

Allowed categories:

- `personal_profile` — outgoing colleague identity, preferences, role, or personal
  operating style.
- `secret` — token, password, key, credential, or secret-bearing URL.
- `private_link` — personal dashboard, private gist, private document, or
  non-team-accessible pointer.
- `machine_path` — absolute local path outside the repo that cannot be made
  repo-relative.
- `not_project_knowledge` — unrelated project memory or generic user habit.
- `other_private` — use sparingly when a safer category does not fit.

Safe omission rules:

- Include counts and generic categories only.
- Do not include original text, names, emails, usernames, domains that expose a
  private system, token prefixes, or file paths outside the repo.
- If a one-line reason would reveal the omitted content, use the category's
  generic reason instead.

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
  source_id: sha256:<12 hex chars>
  source_hash: sha256:<64 hex chars>
  redactions:
    count: 2
    categories:
      - personal_identifier
      - machine_path
  claims:
    - "Repo-relative file path src/api/client.ts defines the API client used by the dashboard."
    - "npm run test is the project test command documented in package.json."
---

<body>
```

Constraints:

- Type `user` NEVER appears in a package (see privacy-filter.md).
- Bodies are rewritten in neutral, impersonal voice — no names, no personal data.
- `source_id` and `source_hash` are derived from the privacy-normalized source
  memory before final rewrite. Private values must be removed or replaced before
  hashing. Include hashes only for exported memories, never for omitted private
  or secret-bearing memories.
- `redactions.categories` uses safe category names only, never private values.
- `claims` is a short list of concrete facts the import phase can verify against
  the current repo.
- Every memory must be verifiable: if it cites files, paths, or identifiers, they must
  exist in the project at export time.
- `[[name]]` links between memories are allowed only if the target memory is also
  exported; otherwise remove the link syntax and keep plain text.
- Importers may adapt the storage wrapper or index to Claude, Codex, or another
  agent, but must preserve the verified project fact in the memory body.

## Import artifacts

Import creates local audit files inside the extracted `handover/` folder. They are
not present in the original export archive.

```
handover/
  import-plan.json
  import-report.json
  import-receipts/
    <slug>.json
```

### import-plan.json

Written before any memory store is modified. This is the dry-run output.

```json
{
  "version": 1,
  "generated_at": "2026-06-10T12:00:00Z",
  "mode": "dry-run",
  "package_commit": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
  "candidates": [
    {
      "memory_file": "memories/api-client.md",
      "source_id": "sha256:7f83b1657ff1",
      "source_hash": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
      "claims": ["src/api/client.ts defines the API client."],
      "evidence_checked": ["exists: src/api/client.ts"],
      "proposed_action": "install",
      "reason": "All claims verified against the current repo.",
      "destination": "codex-ad-hoc-memory-note"
    }
  ]
}
```

### import-receipts/<slug>.json

One receipt per candidate memory, including accepted, rewritten, rejected, and
blocked memories.

```json
{
  "version": 1,
  "memory_file": "memories/api-client.md",
  "source_id": "sha256:7f83b1657ff1",
  "source_hash": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
  "export_commit": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
  "claims": ["src/api/client.ts defines the API client."],
  "evidence_checked": ["exists: src/api/client.ts"],
  "stale_or_superseded_findings": [],
  "privacy_redactions": {
    "count": 0,
    "categories": []
  },
  "destination": "codex-ad-hoc-memory-note",
  "final_action": "installed",
  "reason": "All claims verified and memory was written through the approved memory-update mechanism."
}
```

`final_action` must be one of:

- `installed`
- `rewritten`
- `rejected`
- `blocked`

### import-report.json

Summary file with counts and receipt paths:

```json
{
  "version": 1,
  "installed": 2,
  "rewritten": 1,
  "rejected": 1,
  "blocked": 0,
  "receipts": [
    "import-receipts/api-client.json"
  ]
}
```
