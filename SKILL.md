---
name: knowledge-transfer
description: "Use when a colleague is leaving a project and must hand over knowledge, or when someone new joins a project and receives handover.zip or a handover/ folder. Two phases: export (analyze project + agent project memories from Claude, Codex, or another assistant, then produce a transferable handover.zip archive containing a non-technical onboarding doc + filtered portable memories + a privacy-safe omissions manifest) and import (extract/read the handover package, dry-run the candidate memories, verify every claim against current code, then install accepted memories through the current agent's memory mechanism with per-memory receipts). Trigger on /knowledge-transfer, /knowledge-transfer:knowledge-transfer, $knowledge-transfer, 'handover', 'knowledge transfer', 'passaggio di consegne', 'onboard a new colleague', or when the user mentions taking over / leaving a project."
---

# knowledge-transfer

Transfer project knowledge between colleagues: a short non-technical onboarding
document plus the AI's accumulated project memories, packaged as a local
`handover.zip` archive so the newcomer starts oriented and their AI starts
informed.

## Usage

Claude Code standalone skill:

```
/knowledge-transfer            # auto-detect mode (see below)
/knowledge-transfer export     # outgoing colleague: build handover.zip
/knowledge-transfer import     # new colleague: dry-run, verify, ask, then install
/knowledge-transfer import --dry-run  # verify and show the plan, but write no memories
/knowledge-transfer import --yes      # verify and install without a second prompt
```

Claude Code plugin install:

```
/knowledge-transfer:knowledge-transfer
/knowledge-transfer:knowledge-transfer export
/knowledge-transfer:knowledge-transfer import
```

Codex or another agent that reads `SKILL.md`:

```
$knowledge-transfer            # auto-detect mode
$knowledge-transfer export     # outgoing colleague
$knowledge-transfer import     # new colleague
```

## Mode detection (no argument)

1. If `handover/manifest.json` or `handover.zip` exists in the project root → announce import mode.
2. Otherwise → announce export mode.

State the detected mode in one line and proceed. The user can override at any time.

## Contracts

Read these before producing anything:

- `references/package-format.md` — package structure and manifest schema
- `references/privacy-filter.md` — what may and may not be exported
- `references/onboarding-template.md` — structure, tone, and length of the document
- `references/agent-memory.md` — how to locate and install memories in Claude,
  Codex, or another agent

---

## Export phase

Run from the project root by the colleague leaving the project.

### 1. Analyze the project

- Read README, agent guidance files (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`,
  `.cursor/rules/`, etc. if present), the top-level structure, entry points, and
  main config files. Use subagents for large codebases rather than reading
  everything inline.
- Identify: what the project does, the 3–7 main components, and 2–3 end-to-end
  logical flows worth narrating.
- Detect the project's dominant language (README, docs, recent commit messages);
  the onboarding document is written in that language. Unclear or mixed → English.

### 2. Read the memories

- Locate the current agent's project memory source using
  `references/agent-memory.md`.
- Read only memories scoped to this project or repo. Do not export global user
  preferences or unrelated project history.
- No memory directory or no memories → proceed with the document only, set
  `memories: {"exported": 0, "excluded": 0}` in the manifest, write an empty
  `handover/omissions.json`, and tell the user the package contains no memories.

### 3. Filter the memories

Apply `references/privacy-filter.md` strictly to every memory. Produce:

- portable versions (rewritten, neutral) with `source_id`, `source_hash`,
  `redactions`, and `claims` metadata;
- a per-memory exclusion list with safe categories and short reasons;
- a privacy-safe omissions manifest for the package.

For each exported memory:

- `source_id` is a stable short id, preferably `sha256:<12 hex>` from the
  privacy-normalized source memory content plus the export commit if available.
- `source_hash` is `sha256:<full hash>` of the privacy-normalized source memory
  content before final packaging. Never hash secret-bearing memories or omitted
  private memories into the package.
- `redactions.count` is the number of privacy edits made during rewrite.
- `redactions.categories` uses only safe category names, never private values.
- `claims` is a short list of concrete repo facts the import phase can verify.

### 4. Write the package and archive

- If `handover/` or `handover.zip` already exists, STOP and ask before overwriting.
- Write `handover/ONBOARDING.md` following `references/onboarding-template.md`.
- Write each surviving memory to `handover/memories/<slug>.md` in the portable
  format.
- Write `handover/omissions.json` per `references/package-format.md`. Include
  counts and categories only; never include private source text, names, emails,
  usernames, secrets, or enough detail to reconstruct omitted content.
- Write `handover/manifest.json` per the schema (commit SHA from `git rev-parse
  HEAD`; omit `commit` if not a git repo, omit `author` if git config has no name).
- Create `handover.zip` in the project root containing the full `handover/`
  folder. Prefer `python3 -m zipfile -c handover.zip handover`; if unavailable,
  use an equivalent zip command that preserves the top-level `handover/` directory.
- Do not commit `handover/` or `handover.zip` unless the user explicitly asks.
  The normal workflow is to pass `handover.zip` to the next colleague.

### 5. Final checklist — verify before declaring done

- [ ] `grep` the whole `handover/` tree for the colleague's name, email, and
      username: zero hits.
- [ ] No memory of type `user` in `handover/memories/`.
- [ ] ONBOARDING.md is 600–1000 words (`wc -w`) and contains the six template
      sections.
- [ ] Every exported memory has `source_id`, `source_hash`, `redactions`, and at
      least one verifiable claim.
- [ ] Every file/path cited in an exported memory exists in the project.
- [ ] `omissions.json` contains only safe categories/counts and no omitted
      private content.
- [ ] `manifest.json` parses and counts match the actual files.
- [ ] `handover.zip` exists, passes `python3 -m zipfile -t handover.zip`, and
      contains `handover/ONBOARDING.md`, `handover/manifest.json`,
      `handover/omissions.json`, and every memory file.

Report to the user: package contents, omission category counts, exported memory
count, and suggest passing `handover.zip` to the next colleague. Do not commit the
package unless the user explicitly asks.

---

## Import phase

Run by the new colleague, from the project root, after receiving `handover.zip`
or an already extracted `handover/` folder.

### 1. Read the package

- If `handover.zip` exists and `handover/` is absent, inspect the archive first:
  every entry must start with `handover/`, and no entry may be absolute or contain
  `..`. Then extract it into the project root, for example with
  `python3 -m zipfile -e handover.zip .`.
- Read `handover/manifest.json`, `handover/ONBOARDING.md`,
  `handover/omissions.json` if present, and every file in `handover/memories/`.
- `handover/` and `handover.zip` both missing → stop: explain that the outgoing
  colleague must run `/knowledge-transfer export` first, then send `handover.zip`.
- `manifest.version` unknown → stop and say the skill is too old for this package.
- `manifest.version` 1 → treat `omissions.json`, `claims`, and source hashes as
  optional legacy fields; derive claims from memory bodies during verification.
- `manifest.version` 2 → require `omissions.json`, `source_id`, `source_hash`,
  `redactions`, and `claims` for every memory.

### 2. Verify each memory against the current code

- If the repo is git and the manifest has `commit`, run
  `git diff --stat <commit>..HEAD` to see which areas changed since the export.
- For each memory, verify every claim in `metadata.claims`. If claims are absent
  because this is a legacy package, extract 1–5 concrete claims from the memory
  body before checking.
- Check that the files, paths, and identifiers each claim cites still exist
  (Glob/Grep, not assumption). Record the repo evidence checked: file paths,
  grep queries/hits, git history commands, or the absence that caused rejection.
- Classify:
  - **valid** — everything checks out → install as-is;
  - **stale, obvious fix** — e.g. a cited file was renamed and the new path is
    unambiguous (git log --follow, or a unique search hit) → update the memory body,
    then install;
  - **stale, no obvious fix** — discard, note the one-line reason.

### 3. Dry-run import plan

Before writing to any memory store, create and present a dry-run plan:

- Write `handover/import-plan.json` with one entry per candidate memory:
  `source_id`, `source_hash`, `memory_file`, `claims`, `evidence_checked`,
  `proposed_action` (`install`, `rewrite`, `reject`), `reason`,
  `redactions`, and `destination`.
- Show the full `ONBOARDING.md` content first.
- Then show a concise candidate memory table with the proposed action and reason.
- If the user invoked `import --dry-run`, stop here and write no memories.
- If the user invoked plain `import`, STOP after presenting the plan and ask for
  confirmation before writing memories.
- If the user invoked `import --yes`, continue after presenting the plan.

### 4. Install

- Install each accepted memory through the current agent's memory mechanism (see
  `references/agent-memory.md`), keeping the portable memory content intact and
  adapting only the storage wrapper/index if the target agent requires it.
- Slug collision with an existing memory: do NOT overwrite. Report the collision
  and ask the user which to keep.
- If the target memory store has an index file, append one index line per
  installed memory (create it if absent). If the current agent forbids direct
  memory writes, create or present the approved memory-update artifact instead.
- For every candidate memory, write a per-memory receipt to
  `handover/import-receipts/<slug>.json`, including:
  - `source_id` and `source_hash`;
  - `export_commit` from `manifest.commit` if present;
  - claims the memory made;
  - repo evidence checked;
  - stale or superseded findings;
  - privacy redaction count/categories;
  - destination memory path or update mechanism;
  - final action: `installed`, `rewritten`, `rejected`, or `blocked`;
  - reason.
- Write `handover/import-report.json` summarizing counts and receipt paths.

### 5. Report

Present to the user, in this order:

1. The import summary: installed / rewritten / rejected / blocked.
2. Receipt path for each memory and one line of reasoning.
3. Any omission categories from `omissions.json`, phrased as known gaps rather
   than private details.
4. A closing note: technical questions can now lean on the imported memories.

---

## Edge cases

| Situation | Behavior |
|---|---|
| No memories at export | Document-only package; say so explicitly. |
| Project is not a git repo | Manifest without `commit`; import verification falls back to existence checks only. |
| `handover/` exists at export | Ask before overwriting. |
| `handover.zip` exists at export | Ask before overwriting. |
| `handover.zip` present at import | Validate archive paths, extract to `handover/`, then import. |
| `import --dry-run` | Verify, write/present `import-plan.json`, then stop before memory writes. |
| `handover/` and `handover.zip` missing at import | Stop with instructions for the outgoing colleague. |
| Slug collision at import | Never overwrite; surface and ask. |
| `omissions.json` missing in a v1 package | Continue as legacy import and say omission details are unavailable. |
| `omissions.json` missing in a v2 package | Stop; the package is incomplete. |
| Unknown `manifest.version` | Stop; ask the user to update the skill. |
