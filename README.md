<div align="center">

# knowledge-transfer: AI-Powered Project Handover for Claude Code and Codex

**knowledge-transfer is an agent skill that hands a project over from one developer to the next, including what the AI learned along the way.** Unlike wiki pages that go stale or an unstructured Q&A with an AI that has never seen the project, it produces a short onboarding document the newcomer reads over one coffee, and transfers the outgoing developer's project memories from Claude, Codex, or another assistant: privacy-filtered on the way out, verified against the current code on the way in.

[![License: MIT](https://img.shields.io/badge/License-MIT-3B82F6.svg)](LICENSE)
[![Works with](https://img.shields.io/badge/works%20with-Claude%20Code%20%2B%20Codex-D97757.svg)](https://claude.com/claude-code)
[![Type](https://img.shields.io/badge/type-agent%20skill-6EA8FE.svg)](SKILL.md)
[![Dependencies](https://img.shields.io/badge/dependencies-zero-16A34A.svg)](#install)
[![Status: beta](https://img.shields.io/badge/status-beta-F59E0B.svg)](#project-status)

</div>

---

## What is knowledge-transfer?

When a developer leaves a project, two kinds of knowledge walk out the door: the human kind (what the pieces are, how work flows, what to watch out for) and the AI kind (the project memories built up across months of agent sessions: the gotchas, the conventions, the decisions that never made it into code). The replacement inherits neither. They get a repo, a "good luck", and an AI assistant that knows nothing about the project.

**knowledge-transfer** packages both kinds of knowledge into a `handover/` folder that is committed to the repo and travels with it. The next developer starts oriented, and their AI starts informed.

> **The core guarantee: nothing personal leaves the machine, and nothing stale enters yours.** Memories about the person are never exported, every exported memory is rewritten in neutral voice, and the import re-verifies each one against the current code, file by file, before the new developer's AI learns it.

### What are AI memories?

AI memories are the durable notes an assistant builds while working with a developer
across many sessions. They are not a chat transcript. They are the compressed
project knowledge that keeps being useful later: architecture decisions, local
conventions, fragile flows, commands that actually work, files to avoid touching
casually, and the reasons behind choices that may never have been written into the
README.

Over time, those memories become part of the project's working context. Some are
captured deliberately; others emerge indirectly from repeated fixes, reviews, and
debugging sessions. Losing them and starting from zero means losing the context a
colleague built up while doing the work: not just what is in their head, but the
project understanding their AI learned alongside them.

### At a glance

| Question | Answer |
|---|---|
| **Input** | The project (code, docs, agent guidance files) + the outgoing developer's project memories |
| **Output** | `handover/` in the repo: a 1-2 page non-technical `ONBOARDING.md`, portable memories, a manifest with the export commit |
| **Works with** | Claude Code and Codex; manual install also works for agents that read `SKILL.md` |
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
| **`/knowledge-transfer export`**, **`/knowledge-transfer:knowledge-transfer export`**, or **`$knowledge-transfer export`** | The developer leaving | Analyzes the project, reads project memories from the current agent, filters them ([strict rules](references/privacy-filter.md)), writes `handover/` into the repo |
| **`/knowledge-transfer import`**, **`/knowledge-transfer:knowledge-transfer import`**, or **`$knowledge-transfer import`** | The developer arriving | Verifies every memory against the *current* code (renamed files? changed areas since the export commit?), installs the valid ones through the current agent's memory mechanism, presents the onboarding doc |

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

### Claude Code — fastest path

From inside Claude Code:

```text
/plugin marketplace add ferdinandobons/knowledge-transfer
/plugin install knowledge-transfer@knowledge-transfer
/reload-plugins
```

Plugin-installed skills are namespaced, so invoke it as
`/knowledge-transfer:knowledge-transfer`.

### Codex — fastest path

From your terminal:

```bash
codex plugin marketplace add ferdinandobons/knowledge-transfer --ref main
codex plugin add knowledge-transfer@knowledge-transfer
```

Start a new Codex thread, then invoke the plugin explicitly:

```text
@knowledge-transfer export
@knowledge-transfer import
```

### Manual raw skill

Agents that only read raw `SKILL.md` folders can use this repo's `SKILL.md` plus
`references/` in a clean skill directory. Prefer the plugin install above for
Claude Code and Codex.

---

## Quick start

**Leaving a project?** From the project root:

```text
/knowledge-transfer:knowledge-transfer export
# or, in Codex:
@knowledge-transfer export
```

Review the package it proposes (the exclusion report shows exactly what was filtered out and why), then commit `handover/`.

**Joining one?** Clone the project, then:

```text
/knowledge-transfer:knowledge-transfer import
# or, in Codex:
@knowledge-transfer import
```

Read the onboarding doc, and let your AI absorb the verified memories. Stale ones are updated when the fix is obvious, discarded with a one-line reason when it is not. Your existing memories are never overwritten.

---

## Project status

**Beta.** The skill is young and prompt-driven, with a manual validation checklist
for export/import behavior, privacy filtering, document length, manifest integrity,
and memory installation (see [TESTING.md](TESTING.md)). The package format is
versioned (`manifest.version`), so future changes stay backward compatible.
Claude Code uses `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`.
Codex uses `.agents/plugins/marketplace.json` for `codex plugin marketplace add`,
`plugins/knowledge-transfer` as the marketplace plugin path,
`plugins/knowledge-transfer/.codex-plugin/plugin.json` for plugin packaging, and
`plugins/knowledge-transfer/skills/knowledge-transfer/agents/openai.yaml` for
skill UI metadata. The Codex plugin directory intentionally contains real files,
not symlinks, so the installed plugin cache is self-contained.

## License

[MIT](LICENSE) © 2026 Ferdinando Bonsegna
