---
name: knowledge-transfer
description: "Use when a colleague is leaving a project and must hand over knowledge, or when someone new joins a project that contains a handover/ folder. Two phases: export (analyze project + agent project memories from Claude, Codex, or another assistant, then produce a committed handover package: non-technical onboarding doc + filtered portable memories) and import (verify those memories against current code, then install them through the current agent's memory mechanism). Trigger on /knowledge-transfer, /knowledge-transfer:knowledge-transfer, $knowledge-transfer, 'handover', 'knowledge transfer', 'passaggio di consegne', 'onboard a new colleague', or when the user mentions taking over / leaving a project."
---

# knowledge-transfer

Transfer project knowledge between colleagues: a short non-technical onboarding
document plus the AI's accumulated project memories, packaged inside the project
repo so the newcomer starts oriented and their AI starts informed.

## Usage

Claude Code standalone skill:

```
/knowledge-transfer            # auto-detect mode (see below)
/knowledge-transfer export     # outgoing colleague: build the handover package
/knowledge-transfer import     # new colleague: verify + install memories, read the doc
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

1. If `handover/manifest.json` exists in the project root → announce import mode.
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
  `memories: {"exported": 0, "excluded": 0}` in the manifest, and tell the user the
  package contains no memories.

### 3. Filter the memories

Apply `references/privacy-filter.md` strictly to every memory. Produce the portable
versions (rewritten, neutral) and the per-memory exclusion list with reasons.

### 4. Write the package

- If `handover/` already exists, STOP and ask before overwriting.
- Write `handover/ONBOARDING.md` following `references/onboarding-template.md`.
- Write each surviving memory to `handover/memories/<slug>.md` in the portable
  format.
- Write `handover/manifest.json` per the schema (commit SHA from `git rev-parse
  HEAD`; omit `commit` if not a git repo, omit `author` if git config has no name).

### 5. Final checklist — verify before declaring done

- [ ] `grep` the whole `handover/` tree for the colleague's name, email, and
      username: zero hits.
- [ ] No memory of type `user` in `handover/memories/`.
- [ ] ONBOARDING.md is 600–1000 words (`wc -w`) and contains the six template
      sections.
- [ ] Every file/path cited in an exported memory exists in the project.
- [ ] `manifest.json` parses and counts match the actual files.

Report to the user: package contents, exclusion list with reasons, and suggest
committing `handover/` to the repo. Do not commit without asking.

---

## Import phase

Run by the new colleague, from the project root, after cloning.

### 1. Read the package

- Read `handover/manifest.json`, `handover/ONBOARDING.md`, and every file in
  `handover/memories/`.
- `handover/` missing → stop: explain that the outgoing colleague must run
  `/knowledge-transfer export` first, then commit the result.
- `manifest.version` unknown → stop and say the skill is too old for this package.

### 2. Verify each memory against the current code

- If the repo is git and the manifest has `commit`, run
  `git diff --stat <commit>..HEAD` to see which areas changed since the export.
- For each memory, check that the files, paths, and identifiers it cites still
  exist (Glob/Grep, not assumption). Classify:
  - **valid** — everything checks out → install as-is;
  - **stale, obvious fix** — e.g. a cited file was renamed and the new path is
    unambiguous (git log --follow, or a unique search hit) → update the memory body,
    then install;
  - **stale, no obvious fix** — discard, note the one-line reason.

### 3. Install

- Install each accepted memory through the current agent's memory mechanism (see
  `references/agent-memory.md`), keeping the portable memory content intact and
  adapting only the storage wrapper/index if the target agent requires it.
- Slug collision with an existing memory: do NOT overwrite. Report the collision
  and ask the user which to keep.
- If the target memory store has an index file, append one index line per
  installed memory (create it if absent). If the current agent forbids direct
  memory writes, create or present the approved memory-update artifact instead.

### 4. Report

Present to the user, in this order:

1. The full ONBOARDING.md content (it is short by design).
2. The import summary: installed / updated / discarded, one line of reasoning each.
3. A closing note: technical questions can now lean on the imported memories.

---

## Edge cases

| Situation | Behavior |
|---|---|
| No memories at export | Document-only package; say so explicitly. |
| Project is not a git repo | Manifest without `commit`; import verification falls back to existence checks only. |
| `handover/` exists at export | Ask before overwriting. |
| `handover/` missing at import | Stop with instructions for the outgoing colleague. |
| Slug collision at import | Never overwrite; surface and ask. |
| Unknown `manifest.version` | Stop; ask the user to update the skill. |
