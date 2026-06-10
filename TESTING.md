# Manual end-to-end test

The skill is prompt-driven, so it is tested by executing it. Two scenarios, run in
a Claude Code session with this repo installed as a skill.

## Scenario A — export

1. Treat `fixtures/demo-project/` as the project root and `fixtures/memories/` as
   the per-project memory directory (tell Claude this explicitly, since the fixture
   is not a real registered project).
2. Run the export phase of `SKILL.md` end to end.
3. Assert on the produced `fixtures/demo-project/handover/`:
   - `memories/` contains exactly 3 files — `marco-profile` is ABSENT (type `user`).
   - `grep -ri "marco\|rinaldi\|example.com\|marcorinaldi" handover/` → zero hits.
   - `ONBOARDING.md` is 600–1000 words (`wc -w`) and has the six template sections.
   - `manifest.json` parses; `memories.exported == 3`, `memories.excluded == 1`.
   - Every path cited in exported memories exists under `fixtures/demo-project/`.

## Scenario B — import

1. Create a scratch memory directory: `mktemp -d`.
2. Treat `fixtures/demo-project/` as the freshly cloned project root and the
   scratch directory as YOUR memory directory (tell Claude this explicitly).
3. Run the import phase of `SKILL.md` end to end.
4. Assert:
   - The 3 portable memories are installed in the scratch directory, valid
     frontmatter intact.
   - `MEMORY.md` was created there with one index line per memory.
   - The report shows 3 installed / 0 updated / 0 discarded (fixture code is
     unchanged since export).
5. Remove the scratch directory.

## Staleness spot-check (optional)

Rename `fixtures/demo-project/src/search.js` to `src/lookup.js` in a scratch
branch, re-run Scenario B, and check the import flags the affected memory hits
as stale instead of installing blindly. Discard the branch afterwards.
