---
name: smoke-test-before-store-changes
description: Any change to store.js requires the manual smoke flow first
metadata:
  type: feedback
---

Team convention: before committing any change to `src/store.js`, run the manual
smoke flow (add → list → find), because there are no automated tests.

**Why:** a broken store silently corrupts every user's recipes.json.

**How to apply:** run the three CLI commands from the README against a scratch
recipes.json before committing store changes.
