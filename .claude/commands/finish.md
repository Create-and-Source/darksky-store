---
name: finish
description: Push changes and update CLAUDE.md
---

1. Read the current CLAUDE.md
2. Check what files changed since the last commit: git diff --name-only HEAD~1
3. Update CLAUDE.md to reflect any new pages, components, features, localStorage keys, or routes that were added or changed
4. git add . && git commit -m "update CLAUDE.md" && git push
