---
title: No push until I say so
---

Never push code to a remote until the developer explicitly asks to push.

This includes git push, force-push, pushing tags, git push --set-upstream, and any command that publishes local commits (including gh pr create or similar flows that would push first).

Commits are allowed when asked. Opening a PR is allowed only if the branch is already on the remote, or the developer also explicitly asked to push.

Do not treat "create a PR", "share this", "I'm done", "ship it", or similar as permission to push.
