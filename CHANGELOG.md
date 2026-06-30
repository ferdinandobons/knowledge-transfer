# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- `knowledge-transfer` skill: export phase (project analysis, memory privacy
  filter, handover package generation) and import phase (verification against
  current code, memory installation, onboarding presentation).
- Reference contracts: package format, privacy filter, onboarding template.
- Agent memory handling contract for Claude Code, Codex, and other agents.
- Codex `agents/openai.yaml` metadata.
- Codex plugin manifest under `plugins/knowledge-transfer/.codex-plugin/plugin.json`.
- Codex `.agents/plugins/marketplace.json` and `plugins/knowledge-transfer`
  marketplace path for `codex plugin marketplace add`.
- Documented manual end-to-end test scenarios.
- Claude Code native plugin install: `.claude-plugin/` manifests
  (`/plugin marketplace add ferdinandobons/knowledge-transfer`).
- Transfer archive workflow: export creates `handover.zip` containing the
  generated `handover/` folder.
- Package format v2 with `omissions.json`, per-memory source hashes,
  redaction metadata, and verifiable claims.
- Import dry-run plan (`import-plan.json`) before writing memories.
- Per-memory import receipts and final import report for installed, rewritten,
  rejected, or blocked memories.

### Changed
- README rewritten: value proposition, core guarantee, at-a-glance table,
  Claude-native install commands first.
- Skill wording generalized from Claude-only memories to agent project memories,
  while preserving the existing `handover/` package format.
- Handover delivery changed from repo-commit guidance to a transferable zip
  archive passed to the next colleague.
- Import flow now requires a dry-run/confirmation step by default and supports
  `import --dry-run` plus explicit `import --yes`.
- Plugin manifests now report `0.2.0` so marketplace installs can discover the
  dry-run/receipt update.
