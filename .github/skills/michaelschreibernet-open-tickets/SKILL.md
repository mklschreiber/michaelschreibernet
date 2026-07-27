---
name: mystandby-open-tickets
description: Fetch all cards from the Trello board myStandby that are in a list named "Open". Use this when the user asks for open tickets, open tasks, or the current backlog on the myStandby Trello board.
---

Fetch all cards from the Trello board **michaelschreiber.net** (Board ID: `ari:cloud:trello::board/workspace/690594d4b29a847f8633b4a8/6a1853062ea9d0814e39023a`) that are in a list named "Open".

Steps:
1. Call the `trelloReadCard` tool with `action: "list_by_board"` and the board ID above.
2. Filter the returned cards to those where `list.name` equals "Open".
3. Display the results as a table with columns: Title, Label(s), URL.
4. If no open tickets are found, report: "No open tickets in the myStandby board."
