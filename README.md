# knowledge-transfer

A [Claude Code](https://claude.com/claude-code) skill that hands a project over from
one colleague to another — including what the AI learned along the way.

When someone leaves a project, two kinds of knowledge walk out the door: the human
kind (what the pieces are, how work flows, what to watch out for) and the AI kind
(the Claude memories built up while working with them). This skill packages both
into the project repo, so the next person starts oriented and their AI starts
informed — instead of asking an AI that knows nothing about the project to "explain
everything".

## How it works

**Outgoing colleague** runs `/knowledge-transfer export`. The skill:

1. Analyzes the project (structure, README, CLAUDE.md, entry points).
2. Reads their per-project Claude memories.
3. Filters them for privacy — personal memories never leave the machine, the rest
   is rewritten in neutral voice ([rules](references/privacy-filter.md)).
4. Writes a `handover/` folder into the repo:

```
handover/
  ONBOARDING.md     # 1–2 pages, non-technical: main pieces + how work flows
  memories/         # portable, filtered memories
  manifest.json     # export date, commit SHA, counts
```

Commit it, and the handover travels with the repo.

**New colleague** clones the project and runs `/knowledge-transfer import`. The
skill verifies every memory against the *current* code (files renamed? areas
changed since the export commit?), installs the valid ones into their own Claude
memory, updates the stale-but-fixable ones, discards the rest with reasons — then
presents the onboarding document.

## Install

```bash
git clone https://github.com/ferdinandobons/knowledge-transfer.git \
  ~/.claude/skills/knowledge-transfer
```

Restart Claude Code (or start a new session) and `/knowledge-transfer` is available.

## Usage

```
/knowledge-transfer            # auto-detects: handover/ present → import, else export
/knowledge-transfer export     # build the handover package
/knowledge-transfer import     # verify + install memories, read the onboarding doc
```

## Privacy

The package lands in your team repo, so the filter is strict by design:

- Memories about *the person* (`type: user`) are never exported.
- Feedback memories survive only if they encode project knowledge, not personal style.
- Names, emails, personal paths, and anything secret-shaped are removed; a memory
  containing a secret is excluded entirely.
- The manifest reports how many memories were excluded, so filtering is visible.

Full rules: [references/privacy-filter.md](references/privacy-filter.md).

## Example

[`fixtures/demo-project/`](fixtures/demo-project/) is a tiny fake project with fake
memories; its [`handover/`](fixtures/demo-project/handover/) folder is real output
of the export phase. [`TESTING.md`](TESTING.md) documents the end-to-end test that
produced it.

## License

[MIT](LICENSE)
