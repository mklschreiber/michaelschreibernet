---
name: michaelschreibernet-open-tickets
description: Fetch and report open and ready tickets from the michaelschreiber.net Trello board. Use this when the user asks for open tickets, ready tickets, or the current backlog for michaelschreiber.net.
---

Report the open cards on the approved **michaelschreiber.net** Trello board,
per the board contract in
[docs/agent-handbook.md](../../../docs/agent-handbook.md) and
[docs/architecture/msnet-wf-0001-trello-delivery-workflow.md](../../../docs/architecture/msnet-wf-0001-trello-delivery-workflow.md).
Trello is authoritative; never read a local backlog or ticket artifacts as a
fallback.

## Prerequisites

Confirm `TRELLO_BOARD_ID`, `TRELLO_API_KEY`, `TRELLO_TOKEN`, `curl`, and `jq`
are available in the environment. If any is missing, stop and report exactly
which one before selecting a ticket — do not guess a board by name and do not
fall back to local files.

## Steps

1. **Fetch board lists and open cards.**
   ```
   GET /1/boards/{TRELLO_BOARD_ID}/lists?cards=open&card_fields=id,name,desc,pos,idList,url&fields=id,name
   ```
   authenticated with `key={TRELLO_API_KEY}&token={TRELLO_TOKEN}`.
2. **Validate board setup.** The board must contain exactly one list each
   named `TBD`, `Open`, `In Progress`, `Review`, and `Done`. Fail with a
   clear message if a required list is missing or duplicated, or if any card
   in scope has a duplicate ID. Cards are not required to carry an
   `MSNET-XXXX:` title prefix. Exclude the `TBD` list entirely from the
   results below — it holds ideas that are not yet ready for implementation,
   the same way a `Templates` list would be excluded.
3. **Derive readiness.** For every card in `Open`, parse its `Dependencies`
   section from `desc`. A card is **ready** only if it is in `Open`, has a
   valid description (user story + acceptance criteria present), and every
   referenced dependency is a card currently in `Done`. `None` counts as
   satisfied. A missing, ambiguous, or malformed dependency makes the card
   **not ready** and should be flagged, not silently skipped.
4. **List results in order.** Report all cards from `Open`, `In Progress`,
   and `Review` (i.e. everything except `TBD` and `Done`), in board-list
   order (`Open` → `In Progress` → `Review`) and each list's Trello `pos`
   order within that list.
5. **Display as a table** with columns: Ticket (title), List, Ready?,
   Dependencies, URL.
6. If no cards are found in `Open`, `In Progress`, or `Review`, report:
   "No open tickets on the michaelschreiber.net Trello board."
