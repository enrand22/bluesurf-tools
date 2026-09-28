---
name: bluesurf-sprint
description: Writes or rewrites the assigned current-sprint table in BluePeople RLand/Sprints. Use for /bluesurf-sprint, sprint note, or current sprint from Surf.
disable-model-invocation: true
---

Repo: `~/Projects/bluesurf-tools`. Session is `.surf-cookies.json` there, loaded into headless Chromium. On 401, tell the user to run `npm run login`.

1. From the repo: `npm run sprint`.
2. Done when the sprint note exists with **Pending Tickets** and **Done Tickets** tables (ticket, title, estimate, effort, type, status, priority, tags). If that sprint was already captured, the existing file is rewritten.

Stop after the note is written. Pull a single ticket only if they ask.
