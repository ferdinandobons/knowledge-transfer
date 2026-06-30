# Privacy filter for exported memories

The handover package is a transferable zip archive: anyone who receives or forwards
`handover.zip` can read it. Apply this filter to EVERY memory before export. When
in doubt, leave it out — an excluded memory costs a little context; a leaked
personal detail costs trust.

## Per-type rules

| Memory type | Rule |
|---|---|
| `user` | NEVER export. This is the outgoing colleague's identity, role, and personal preferences. |
| `project` | Export (after the rewrite pass below). |
| `reference` | Export, but verify each URL/pointer: team-accessible resources only. Personal dashboards, private gists, or links containing tokens are stripped or the memory is excluded. |
| `feedback` | Export ONLY if it encodes project knowledge (constraints, conventions, gotchas, agreed workflows). Exclude if it encodes personal working style ("prefers short answers", "likes tables"). |

Some agents do not label memories with these exact types. Map them conservatively:
personal profile/preferences behave like `user`; durable repo facts behave like
`project` or `reference`; prior correction about project workflow behaves like
`feedback`.

## Rewrite pass (every exported memory)

1. Remove names, emails, usernames, and any personal identifier.
   - "Marco insisted store.js changes need a smoke test" → "Changes to store.js
     require the smoke test first (team convention)."
   - If removing the person removes the point, the memory was personal — exclude it.
2. Remove machine-specific absolute paths outside the repo (`/Users/<name>/...`).
   Repo-relative paths stay.
3. Secrets: a memory containing a token, password, or API key is NEVER exported —
   not even with the secret redacted. Exclude it entirely and count it as excluded.
4. Neutral third-person voice throughout. The reader is "the team", not "you".
5. Convert relative dates to absolute ("last month" → "2026-05").

## Accounting

Count every exclusion. The export reports `exported` and `excluded` totals in
`manifest.json` and tells the user which memories were excluded and why (one line
each) — that summary stays in the conversation, NOT in the package.
