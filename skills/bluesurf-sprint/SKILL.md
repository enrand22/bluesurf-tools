---
name: bluesurf-sprint
description: Writes or rewrites the assigned current-sprint table in BluePeople RLand/Sprints. Use for /bluesurf-sprint, sprint note, or current sprint from Surf.
disable-model-invocation: true
---

Repo: `~/Projects/bluesurf-tools`. Session is `.surf-cookies.json` there, loaded into headless Chromium.

**Expired session:** if a command fails with "session expired", sign in again yourself; don't just tell the user to. Run `npm run login` from the repo (allow up to 6 minutes). It opens a Chromium window and exits by itself once the user is signed in; no Enter needed. Tell the user to finish SSO in that window. When it prints `Signed in`, retry the original command once. If login exits non-zero (window closed or timed out), stop and tell the user.

1. From the repo: `npm run sprint`.
2. Done when the sprint note exists with **Pending Tickets** and **Done Tickets** tables (ticket, title, estimate, effort, type, status, priority, tags). If that sprint was already captured, the existing file is rewritten.

Stop after the note is written. Pull a single ticket only if they ask.
