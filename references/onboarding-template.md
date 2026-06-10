# ONBOARDING.md template

Audience: someone joining the project who has never seen it. They may not be deeply
technical — a product manager should follow every section. The goal is that after
reading they know what the main pieces are and how work flows, BEFORE they ask the
AI anything technical.

**Length: 600–1000 words. Hard cap: 2 pages.** Cutting is part of the job: pick what
matters, drop the rest.

**Language:** the project's dominant language. Detect it from README, docs, and
recent commit messages. If mixed or unclear, use English.

## Required structure

```markdown
# <Project name>

> One sentence: the project explained to a colleague over coffee.

## What it's for

The problem it solves and for whom. 2–4 sentences. No architecture here.

## The main pieces

The 3–7 components that matter. For each: its everyday name, what it does in plain
words (2–3 sentences), and where it lives (folder/file in backticks — name it, don't
explain the code). Skip utilities and glue.

## How the work flows

2–3 end-to-end flows narrated in plain language: "When a user does X, the <piece>
does Y, then hands off to <piece> which does Z." Pick the flows someone will
actually trace in their first week. No code, no sequence diagrams.

## Where to start

The 2–4 files to read first and why. How to run the project (the actual commands,
this is the one place commands are allowed).

## Things to know

Gotchas, conventions, and historical decisions that cannot be deduced from the code
— sourced from the exported memories and CLAUDE.md. Each item: one or two sentences,
plain language. If a gotcha has a memory in the package, this is a summary, not a
duplicate.
```

## Tone rules

- No unexplained jargon. If a term is unavoidable, gloss it in parentheses.
- No exhaustive inventories — this is a map, not a census.
- Plain verbs over nominalizations ("the store saves recipes" not "persistence is
  handled by the storage layer").
- Never paste code. Name files; explain behavior in words.
