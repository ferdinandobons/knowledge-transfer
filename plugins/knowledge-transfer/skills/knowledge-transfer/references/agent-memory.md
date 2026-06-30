# Agent memory handling

The handover package stores portable project memories as Markdown. The source and
destination memory stores are agent-specific, so do not assume every user is in
Claude Code.

## Export: find candidate memories

Use the memory paths and policies exposed by the current agent's system prompt or
developer instructions.

| Agent | Candidate source |
|---|---|
| Claude Code | The per-project memory directory for the current project, commonly under `~/.claude/projects/<project-slug>/memory/` when exposed by the environment. |
| Codex | The Codex memory registry under `$CODEX_HOME/memories` or `~/.codex/memories` when exposed. Search `MEMORY.md`/summaries for the current repo path, repo name, and project aliases, then open only the directly relevant memory or rollout files. |
| Other agents | The documented project memory store for that agent. If no path is visible, ask the user for the memory folder or proceed document-only. |

Scope strictly to the project being handed over. Exclude general user preferences,
unrelated projects, old global habits, and memory entries that cannot be tied back
to this repo.

## Import: install accepted memories

Respect the current agent's memory policy. The user invoking import is asking to
install project knowledge, but the agent may still require a specific update path.

| Agent | Installation behavior |
|---|---|
| Claude Code | Write accepted memories into the current project's Claude memory directory and update its `MEMORY.md` index if present. |
| Codex | Do not edit generated memory indexes directly unless the current instructions allow it. Prefer the approved Codex memory-update mechanism, such as an ad-hoc note under `$CODEX_HOME/memories/extensions/ad_hoc/notes/`, containing the accepted portable memories and index summaries. |
| Other agents | Convert the accepted memory bodies to that agent's documented memory format, or present an importable bundle if no writable memory store is available. |

Never bypass a policy that says memory writes are restricted. If direct installation
is blocked, report the accepted memories and the exact reason installation was not
performed.
