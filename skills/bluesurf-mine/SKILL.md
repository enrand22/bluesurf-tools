---
name: bluesurf-mine
description: Lists the Blue Surf tickets assigned to you across every sprint, newest sprint first. Read-only; writes nothing to the vault. Use for /bluesurf-mine, "my tickets", "what's assigned to me", or "what's still open" in Surf.
---

Repo: `~/Projects/bluesurf-tools`. Session is `.surf-cookies.json` there, loaded into headless Chromium.

**Expired session:** if a command fails with "session expired", sign in again yourself; don't just tell the user to. Run `npm run login` from the repo (allow up to 6 minutes). It opens a Chromium window and exits by itself once the user is signed in; no Enter needed. Tell the user to finish SSO in that window. When it prints `Signed in`, retry the original command once. If login exits non-zero (window closed or timed out), stop and tell the user.

1. From the repo: `npm run mine -- --json` (add `--all` to include DONE tickets).
2. Parse the JSON: an array of `{ sprint, items[] }`, newest sprint first, `No sprint` last. Each item has `code`, `title`, `status`, `priority`, `estimatedHours`, `type`, `tags`, `sprint`.
3. Answer the user from that list. Open means any status without `DONE` (in progress, blocked, backlog).

Do not pull or write a ticket note unless they ask; that is `bluesurf-ticket`.
