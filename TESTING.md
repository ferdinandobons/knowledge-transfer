# Manual end-to-end test

The skill is prompt-driven, so it is tested by executing it. Two scenarios, run in
Claude Code or Codex with this repo installed as a skill. Use a scratch project or
a real project where a temporary `handover/` folder and `handover.zip` archive are
safe to create.

## Packaging smoke tests

Run these before publishing install-command changes:

```bash
python3 ~/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/knowledge-transfer
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py plugins/knowledge-transfer/skills/knowledge-transfer
claude plugin validate .
claude plugin validate plugins/knowledge-transfer
cmp SKILL.md plugins/knowledge-transfer/skills/knowledge-transfer/SKILL.md
cmp agents/openai.yaml plugins/knowledge-transfer/skills/knowledge-transfer/agents/openai.yaml
diff -qr references plugins/knowledge-transfer/skills/knowledge-transfer/references
```

For a Codex install test, use an empty `CODEX_HOME` and validate the installed
cache, not just the source tree:

```bash
tmpdir="$(mktemp -d)"
CODEX_HOME="$tmpdir" codex plugin marketplace add ferdinandobons/knowledge-transfer --ref main
CODEX_HOME="$tmpdir" codex plugin add knowledge-transfer@knowledge-transfer
python3 ~/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py "$tmpdir/plugins/cache/knowledge-transfer/knowledge-transfer/0.2.0"
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py "$tmpdir/plugins/cache/knowledge-transfer/knowledge-transfer/0.2.0/skills/knowledge-transfer"
```

## Scenario A — export

1. Start from a project root that has a README, at least one source file, and at
   least two project-scoped memories available to the current agent. Include one
   deliberately personal memory in the source set if you are testing the privacy
   filter.
2. Run the export phase of `SKILL.md` end to end.
3. Assert on the produced `handover/` and `handover.zip`:
   - Personal memories are absent from `handover/memories/`.
   - `grep -Eri "<known-name>|<known-email>|<known-username>" handover/` → zero hits.
   - `ONBOARDING.md` is 600–1000 words (`wc -w`) and has the six template sections.
   - `omissions.json` parses, contains only safe categories/counts, and contains
     no private source text.
   - `manifest.json` parses and its memory counts match the actual files.
   - Each exported memory has `metadata.source_id`, `metadata.source_hash`,
     `metadata.redactions`, and at least one verifiable `metadata.claims` entry.
   - Every path cited in exported memories exists under the project root.
   - `python3 -m zipfile -t handover.zip` succeeds.
   - `python3 -m zipfile -l handover.zip` lists `handover/ONBOARDING.md`,
     `handover/manifest.json`, `handover/omissions.json`, and every memory file.

## Scenario B — import

1. Create a scratch memory directory: `mktemp -d`.
2. Treat the project with the generated `handover.zip` as the freshly cloned
   project root and the scratch directory as YOUR memory directory (tell the
   agent this explicitly if the environment allows overriding memory paths).
3. Run `import --dry-run` first.
4. Assert:
   - `handover/import-plan.json` exists before any memory writes.
   - The plan lists every candidate memory with source id/hash, claims, checked
     evidence, proposed action, reason, and destination.
   - No accepted memory has been written during `--dry-run`.
5. Run the import phase with confirmation (or `import --yes`) end to end.
6. Assert:
   - The accepted portable memories are installed in the scratch directory, valid
     frontmatter intact, or surfaced through the approved memory-update artifact.
   - When direct memory writes are allowed, `MEMORY.md` was created there with
     one index line per memory.
   - `handover/import-report.json` exists and counts installed / rewritten /
     rejected / blocked memories.
   - `handover/import-receipts/` contains one receipt per candidate memory with
     source id/hash, claims, checked evidence, destination, final action, and
     reason.
   - In Codex, if direct memory writes are restricted by the active memory policy,
     the accepted memories are written or presented through the approved
     memory-update artifact instead of editing generated indexes directly.
7. Remove the scratch directory.

## Staleness spot-check (optional)

Rename or move a file cited by an exported memory in a scratch branch, re-run
Scenario B, and check that import flags the affected memory as stale instead of
installing blindly. Discard the branch afterwards.
