---
name: bluesurf-mine
description: Lists the Blue Surf tickets assigned to you across every sprint, newest sprint first. Read-only; writes nothing to the vault. Use for /bluesurf-mine, "my tickets", "what's assigned to me", or "what's still open" in Surf.
---

Repo: `~/Projects/bluesurf-tools`. Session is the Playwright profile there. On 401, tell the user to run `npm run login`.

1. From the repo: `npm run mine -- --json` (add `--all` to include DONE tickets). Chromium may open briefly.
2. Parse the JSON: an array of `{ sprint, items[] }`, newest sprint first, `No sprint` last. Each item has `code`, `title`, `status`, `priority`, `estimatedHours`, `type`, `tags`, `sprint`.
3. Answer the user from that list. Open means any status without `DONE` (in progress, blocked, backlog).

Do not pull or write a ticket note unless they ask; that is `bluesurf-ticket`.
