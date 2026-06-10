---
name: atomic-writes-store
description: recipes.json must only be written through saveRecipes (atomic temp-file rename)
metadata:
  type: project
---

Writing recipes.json directly has corrupted the store in the past when the CLI was
killed mid-write. All writes must go through `saveRecipes()` in `src/store.js`,
which writes a temp file then renames it atomically. Never call fs.writeFileSync
on recipes.json from anywhere else.
