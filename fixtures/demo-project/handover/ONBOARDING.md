# recipe-box

> recipe-box is a little command-line notebook for recipes: you type a recipe in
> once, and from then on you can list everything you have or ask "what can I make
> with eggs?".

## What it's for

Recipes tend to scatter — some in a notes app, some as screenshots, some
bookmarked and never found again. recipe-box gives them a single home on your own
computer. There is no account, no cloud service and no app to open: you work from
the terminal, and the whole collection lives in one ordinary file that is easy to
copy, back up or sync however you like. It is built for people who are comfortable
typing a command and want speed and ownership over polish.

## The main pieces

The project is deliberately small: three source files and one data file.

**The command desk (`src/cli.js`).** The front door. It reads what you typed after
the program name, decides whether you asked to add, list or find, and coordinates
the other pieces to make that happen. It is also the only piece that prints
results back to you. If you ever wonder "where does my command land first?", the
answer is always here.

**The store (`src/store.js`).** The memory of the application. It knows where the
recipe file lives, how to read every saved recipe from it, and how to write the
collection back safely. Nothing else in the project touches the file directly —
every read and write passes through the store, on purpose (see "Things to know").

**The search helper (`src/search.js`).** A small specialist: given the full list
of recipes and an ingredient, it returns the recipes whose ingredient lists
contain it. Matching ignores upper and lower case and also matches partial words,
so searching for "egg" finds recipes that use "eggs".

**The recipe file (`recipes.json`).** The single source of truth for your data. It
is a plain text file in JSON format (a structured, human-readable way of writing
data) sitting in the project root. Each entry has a name and a list of
ingredients. Delete this file and you start fresh; copy it and you have a full
backup. It does not exist until the first recipe is added.

## How the work flows

**Adding a recipe.** When you run the add command with a name and ingredients, the
command desk unpacks what you typed, asks the store for the current collection,
appends the new recipe, and hands the whole collection back to the store to save.
The store writes the data to a temporary file first and only then swaps it into
place — so even if the program is interrupted halfway, your existing file is never
left half-written. Finally the command desk confirms what was added.

**Listing everything.** The simplest journey: the command desk asks the store to
load the collection, then prints each recipe with its ingredients, one per line.
Nothing is modified.

**Finding by ingredient.** When you search, the command desk loads the collection
through the store, passes it to the search helper together with the ingredient you
typed, and prints the names of the recipes that come back. The store and the
search helper never talk to each other directly — the command desk is always the
middleman.

## Where to start

Read these in order:

1. `README.md` — the three commands the tool supports, with examples.
2. `src/cli.js` — the whole control flow in one short file.
3. `src/store.js` — how the data is loaded and safely saved.

To try it, from the project root run:

    node src/cli.js add "Carbonara" --ingredients "eggs,guanciale,pecorino"
    node src/cli.js list
    node src/cli.js find eggs

## Things to know

- **Never write `recipes.json` directly.** The file has been corrupted in the past
  by interrupted direct writes. All saving must go through the store's save
  routine, which writes atomically. This is the project's one hard rule.
- **There are no automated tests.** Team convention: before committing any change
  to `src/store.js`, run the manual smoke flow — add, then list, then find —
  against a scratch data file.
- **The data format is documented in the README, not in a schema registry.** If
  you change the shape of a recipe entry, the README is the place to update.
