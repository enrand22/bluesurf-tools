---
name: bluesurf-sprint
description: Writes or rewrites the current-sprint note (pending and done tables of the user's assigned Surf tickets) in the Obsidian vault under RLand/Sprints. Use when the user wants their sprint captured, written, or refreshed in the vault, in any wording: "surf my sprint", "sprint note", "snapshot the sprint", "update my sprint in Obsidian", or /bluesurf-sprint. To just list or ask about tickets without writing a note, use bluesurf-mine instead.
---

Repo: `~/Projects/bluesurf-tools`. Session is the Playwright profile there. On 401, tell the user to run `npm run login`.

1. From the repo: `npm run sprint`.
2. Done when the sprint note exists with **Pending Tickets** and **Done Tickets** tables (ticket, title, estimate, effort, type, status, priority, tags). If that sprint was already captured, the existing file is rewritten. Chromium may open briefly.

Stop after the note is written. Pull a single ticket only if they ask.
