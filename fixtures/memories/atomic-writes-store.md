---
name: atomic-writes-store
description: recipes.json must only be written through saveRecipes (atomic temp-file rename)
metadata:
  type: project
---

Marco found that writing recipes.json directly corrupted the store when the CLI was
killed mid-write. All writes must go through `saveRecipes()` in `src/store.js`,
which writes a temp file then renames. Never call fs.writeFileSync on recipes.json
from anywhere else.
