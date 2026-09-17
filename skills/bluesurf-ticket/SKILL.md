---
name: bluesurf-ticket
description: Pulls a Blue Surf work item into the BluePeople vault, then stops and asks grill vs implement. Completes the ticket when you say it is complete or commit and push. Use for /bluesurf-ticket, RLD-xxx from Surf, ticket is complete, or commit and push.
disable-model-invocation: true
---

Repo: `~/Projects/bluesurf-tools`. Session is the Playwright profile there. On 401, tell the user to run `npm run login`.

## Pull

1. Take the ticket key from the user (`RLD-336`).
2. From the repo: `npm run ticket -- RLD-336`.
3. Done when `RLand/Tickets/RLD-336/detail.md` exists. Chromium may open briefly.

Then **stop**. Ask grill vs implement via AskQuestion (recommended: grill). Do not start coding.

## Complete

When the user says the ticket is complete, or says to commit and push:

1. Take the ticket key (the one just pulled, or the one they name).
2. If they said commit and push: in the implementation repo, commit with the ticket key in parentheses at the end of the subject (`… (RLD-336)`), then push. That phrase is push permission for this ticket.
3. From bluesurf-tools: `npm run ticket-done -- RLD-336`.
4. Done when `RLand/Tickets/RLD-336/` is gone. If they asked to push, the branch is also on the remote.
