<div align="center">

# knowledge-transfer: AI-Powered Project Handover for Claude Code

**knowledge-transfer is a Claude Code skill that hands a project over from one developer to the next, including what the AI learned along the way.** Unlike wiki pages that go stale or an unstructured Q&A with an AI that has never seen the project, it produces a short onboarding document the newcomer reads over one coffee, and transfers the outgoing developer's Claude memories: privacy-filtered on the way out, verified against the current code on the way in.

[![License: MIT](https://img.shields.io/badge/License-MIT-3B82F6.svg)](LICENSE)
[![Works with](https://img.shields.io/badge/works%20with-Claude%20Code-D97757.svg)](https://claude.com/claude-code)
[![Type](https://img.shields.io/badge/type-agent%20skill-6EA8FE.svg)](SKILL.md)
[![Dependencies](https://img.shields.io/badge/dependencies-zero-16A34A.svg)](#install)
[![Status: beta](https://img.shields.io/badge/status-beta-F59E0B.svg)](#project-status)

</div>

---

## What is knowledge-transfer?

When a developer leaves a project, two kinds of knowledge walk out the door: the human kind (what the pieces are, how work flows, what to watch out for) and the AI kind (the Claude memories built up across months of sessions: the gotchas, the conventions, the decisions that never made it into code). The replacement inherits neither. They get a repo, a "good luck", and an AI assistant that knows nothing about the project.

**knowledge-transfer** packages both kinds of knowledge into a `handover/` folder that is committed to the repo and travels with it. The next developer starts oriented, and their AI starts informed.

> **The core guarantee: nothing personal leaves the machine, and nothing stale enters yours.** Memories about the person are never exported, every exported memory is rewritten in neutral voice, and the import re-verifies each one against the current code, file by file, before the new developer's AI learns it.

### At a glance

| Question | Answer |
|---|---|
| **Input** | The project (code, docs, CLAUDE.md) + the outgoing developer's Claude memories |
| **Output** | `handover/` in the repo: a 1-2 page non-technical `ONBOARDING.md`, portable memories, a manifest with the export commit |
| **Works with** | Claude Code, native plugin install or plain `git clone` |
| **Best for** | Offboarding, onboarding, rotating maintainers, agency-to-client handoffs |
| **Privacy model** | Personal memories (`type: user`) never leave the machine; every exclusion is counted in the manifest, so filtering is visible |
| **Cost of adoption** | Zero dependencies, zero config, zero code: a pure prompt skill, markdown all the way down |

---

## Why not just ask the AI?

You can clone an unknown project and ask an AI to "explain everything". What you get is an unstructured tour, generated from scratch, by an assistant that can only see what is written in the code. It cannot tell you that `recipes.json` once got corrupted by a direct write, that the team smoke-tests the store by hand before every commit, or why that one module must never be touched on Fridays. Those facts lived in your colleague's head and in their AI's memory.

knowledge-transfer flips the order. Orientation arrives structured: one short document that names the main pieces and narrates how work flows, written for a human to read first. Technical depth arrives as memories: installed into the new developer's own AI, pre-verified, ready the first time they ask a real question.

---

## The two phases

| Phase | Who runs it | What happens |
|---|---|---|
| **`/knowledge-transfer export`** | The developer leaving | Analyzes the project, reads their Claude memories, filters them ([strict rules](references/privacy-filter.md)), writes `handover/` into the repo |
| **`/knowledge-transfer import`** | The developer arriving | Verifies every memory against the *current* code (renamed files? changed areas since the export commit?), installs the valid ones into their own Claude memory, presents the onboarding doc |

Run without arguments, the skill detects which side of the handover you are on: `handover/` present means import, absent means export.

What the export writes:

```
handover/
  ONBOARDING.md     # 1-2 pages, non-technical: the main pieces + how work flows
  memories/         # portable, filtered, neutral-voice memories
  manifest.json     # export date, commit SHA, exported/excluded counts
```

Commit it, and the handover travels with the repo. No server, no service, no export to lose in a Slack thread.

---

## Install

### Claude Code (recommended)

```text
/plugin marketplace add ferdinandobons/knowledge-transfer
/plugin install knowledge-transfer@knowledge-transfer
```

### Manual (Claude Code or any agent that reads SKILL.md)

```bash
git clone https://github.com/ferdinandobons/knowledge-transfer.git \
  ~/.claude/skills/knowledge-transfer
```

Restart Claude Code (or start a new session) and `/knowledge-transfer` is available.

---

## Quick start

**Leaving a project?** From the project root:

```text
/knowledge-transfer export
```

Review the package it proposes (the exclusion report shows exactly what was filtered out and why), then commit `handover/`.

**Joining one?** Clone the project, then:

```text
/knowledge-transfer import
```

Read the onboarding doc, and let your AI absorb the verified memories. Stale ones are updated when the fix is obvious, discarded with a one-line reason when it is not. Your existing memories are never overwritten.

---

## Example

[`fixtures/demo-project/`](fixtures/demo-project/) is a tiny fake project with fake memories, including a deliberately personal one. Its [`handover/`](fixtures/demo-project/handover/) folder is real output of the export phase: the personal memory is absent, the other three survived in neutral voice, and the manifest shows `excluded: 1`. [`TESTING.md`](TESTING.md) documents the end-to-end test that produced it.

---

## Project status

**Beta.** The skill is young but tested end to end: both phases were executed against the fixture project with assertions on privacy filtering, document length and structure, manifest integrity, and memory installation (see [TESTING.md](TESTING.md)). The package format is versioned (`manifest.version`), so future changes stay backward compatible.

## License

[MIT](LICENSE) © 2026 Ferdinando Bonsegna
