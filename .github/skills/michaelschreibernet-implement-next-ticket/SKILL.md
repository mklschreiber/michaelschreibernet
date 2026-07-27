---
name: michaelschreibernet-implement-next-story
description: Pick up the topmost open ticket from the myStandby Trello board, move it to "In Progress", and implement it end-to-end using the architect, developer, and tester agents. Use this when the user asks to implement the next story, pick up the next ticket, or work off the top of the backlog.
---

Take the topmost card from the "Open" list on the myStandby Trello board
(Board ID: `ari:cloud:trello::board/workspace/690594d4b29a847f8633b4a8/6a1853062ea9d0814e39023a`),
move it to "In Progress", and implement it through the project's multi-agent workflow
described in [docs/agent-handbook.md](../../../docs/agent-handbook.md).

Steps:

1. **Fetch the open tickets.** Reuse the `michaelschreibernet-open-tickets` skill to get all cards in
   the "Open" list. Take the topmost card (first position in the list) as the ticket to work on.
   If no open tickets are found, report: "No open tickets in the myStandby board." and stop.
2. **Move the ticket to "In Progress".**
   - Call `trelloReadList` with `action: "list_by_board"` on the board ID above to find the list
     named "In Progress" (create it first via `trelloWriteBoard`/ask the user if it does not exist).
   - Call `trelloWriteCard` with `action: "move"`, the card's `cardId`, and the destination
     `listId` of "In Progress".
3. **Create a git branch for the ticket**, in the format `<label>/<ticket-name>`:
   - **First part (`<label>`)**: the card's Trello label name, lowercased (e.g. `FEATURE` → `feature`,
     `BUG` → `bug`). If the card has multiple labels, use the first one. If the card has no label,
     ask the user which prefix to use instead of guessing.
   - **Second part (`<ticket-name>`)**: the card's title, slugified — lowercase, non-alphanumeric
     characters replaced with `-`, collapse repeated `-`, trim leading/trailing `-`
     (e.g. "Simulate-Feature" → `simulate-feature`).
   - Combine as `<label>/<ticket-name>` (e.g. `feature/simulate-feature`).
   - Ensure the working tree is clean, check out the repo's default/main branch, pull the latest
     changes, then create and check out the new branch from it (`git checkout -b <branch-name>`).
   - If a branch with that name already exists locally or remotely, check it out instead of
     creating a new one, and inform the user.
4. **Derive the user story.** Take the card's title and description and phrase them as a user
   story ("As a user, I want ... so that ...") if not already in that form. Include the card's
   URL for traceability.
5. **Run the agent workflow** as described in `docs/agent-handbook.md`, using the agent
   definitions in `docs/agents/architect.md`, `docs/agents/developer.md`, and
   `docs/agents/tester.md`:
   1. Invoke the **architect** agent with the user story to produce/update an architecture
      concept under `docs/architecture/`.
   2. Invoke the **developer** agent with the story and a reference to the architecture concept
      to implement the code. If the developer raises an architecture question, route it back to
      the architect, apply the answer, then resume the developer.
   3. Invoke the **tester** agent with the story and the implemented code to create the testing
      concept and tests, then run the test suite as described in `docs/agents/tester.md`.
6. **Summarize the result** for the user: ticket title/URL, branch name, architecture concept file,
   changed files, and test results. Do not commit, push, mark the ticket done, or move it further —
   those are separate, explicit steps the user can request once they have reviewed the result.