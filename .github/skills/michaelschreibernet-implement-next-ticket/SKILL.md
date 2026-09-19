---
name: michaelschreibernet-implement-next-ticket
description: Select the first ready card from the michaelschreiber.net Trello board's Open list, move it to "In Progress", and implement it end-to-end using the architect, developer, tester, and reviewer agents. Use this when the user asks to implement the next story, pick up the next ticket, or work off the top of the backlog for michaelschreiber.net.
---

Select the first ready card on the approved **michaelschreiber.net** Trello
board, move it to `In Progress`, and implement it through the project's
Architect → Developer → Tester → Reviewer workflow described in
[docs/agent-handbook.md](../../../docs/agent-handbook.md) and
[docs/architecture/msnet-wf-0001-trello-delivery-workflow.md](../../../docs/architecture/msnet-wf-0001-trello-delivery-workflow.md).
Trello is authoritative; never read a local backlog or ticket artifacts as a
fallback.

## Prerequisites

Confirm `TRELLO_BOARD_ID`, `TRELLO_API_KEY`, `TRELLO_TOKEN`, `curl`, `jq`,
and `gh` (GitHub CLI, authenticated) are available. If any is missing, stop
and report exactly which one — do not select or claim a ticket without them.

## Steps

1. **Fetch ready tickets.** Reuse the
   [`michaelschreibernet-open-tickets`](../michaelschreibernet-open-tickets/SKILL.md)
   skill's board fetch and readiness logic. Select the first **ready** card
   in `Open` by `pos` order. If no ready card exists, report which `Open`
   cards exist and why none are ready (missing description, unresolved
   dependency, etc.) and stop. Do not select an `In Progress` or `Review`
   card — those are only resumed when the user explicitly identifies them.
2. **Re-fetch and claim.** Immediately before claiming, re-fetch the selected
   card and its dependencies to confirm it is still ready (guards against a
   concurrent manual claim). Then:
   ```
   PUT /1/cards/{cardId}?idList={inProgressListId}
   ```
   Re-fetch the card to confirm the move succeeded. If the re-fetch shows a
   different list or an unexpected existing claim, stop and ask the user to
   resolve it manually rather than duplicating work.
3. **Append a claim log entry** to the end of the card's description (never
   as a comment), separated from the existing content by a `---` line:
   ```
   [msnet-workflow] phase=claim actor=coordinator at=<ISO-8601 timestamp> outcome=success

   Claimed <title> — starting Architect → Developer → Tester → Reviewer workflow.
   ```
4. **Create a git branch** in the format `<label>/<ticket-name>`:
   - **`<label>`**: the card's first Trello label name, lowercased (e.g.
     `FEATURE` → `feature`, `BUG` → `bug`). If the card has no label, ask the
     user which prefix to use instead of guessing.
   - **`<ticket-name>`**: the card's title (with any leading `MSNET-XXXX:`
     prefix removed, if the card happens to have one), slugified — lowercase,
     non-alphanumeric characters replaced with `-`, repeated `-` collapsed,
     leading/trailing `-` trimmed.
   - Ensure the working tree is clean, check out the repo's default branch,
     pull the latest changes, then create and check out the new branch
     (`git checkout -b <branch-name>`). If the branch already exists locally
     or remotely, check it out instead and inform the user.
5. **Use the card's description as the canonical user story and acceptance
   criteria.** Cards are not required to follow a fixed template — extract
   the story and acceptance criteria from whatever structure the description
   uses, and ask the user only if they are genuinely missing or ambiguous.
   Include the card URL for traceability.
6. **Run the agent workflow** described in `docs/agent-handbook.md`, using
   `docs/agents/architect.md`, `docs/agents/developer.md`, and
   `docs/agents/tester.md`:
   1. Invoke the **architect** agent with the card URL and description to
      produce/update an architecture concept under `docs/architecture/`. Then
      append a `phase=architecture` workflow log entry linking the concept
      to the card description.
   2. Invoke the **developer** agent with the story and the architecture
      concept to implement the code. Route any architecture question back to
      the architect, apply the answer, then resume the developer. Then
      append a `phase=implementation` workflow log entry to the card
      description.
   3. Invoke the **tester** agent with the story and the implemented code to
      create the testing concept and tests, then run the test suite as
      described in `docs/agents/tester.md`. Then append a `phase=testing`
      workflow log entry to the card description.
   4. On any phase failure, keep the card in its current list and append a
      `phase=blocked` or a failed-outcome workflow log entry to the
      description with the next action. There is no `Blocked` list to move
      it to — surface the stall to the
      user in chat instead.
7. **Run the AI Review Gate**, per "AI Review Gate" in
   `docs/agent-handbook.md`, using `docs/agents/reviewer.md`:
   1. Invoke the **reviewer** agent with the story, the architecture concept,
      and the implemented code and tests. It documents the round in
      `docs/architecture/<story-id>-review.md` and reports a verdict of
      `positive` or `findings`.
   2. **Regardless of verdict**, append a workflow log entry to the card
      description:
      ```
      [msnet-workflow] phase=ai-review actor=coordinator at=<ISO-8601 timestamp> outcome=success

      Round <N> for <title>: <positive, no findings | findings summary>. Review: <path>.
      ```
   3. **If `findings`:** route each finding to the responsible agent —
      architect for concept gaps, developer for implementation bugs, tester
      for coverage gaps — have it addressed, then repeat this step (re-invoke
      the reviewer) until the verdict is `positive`.
   4. **If `positive`:** continue to step 8.
8. **Move to Review and request a verdict.** Once all phases succeed:
   ```
   PUT /1/cards/{cardId}?idList={reviewListId}
   ```
   Append the closing log entry to the card description:
   ```
   [msnet-workflow] phase=ready-for-review actor=coordinator at=<ISO-8601 timestamp> outcome=success

   Architecture, implementation, and tests complete for <title>. Branch: <branch-name>.
   ```
   Then ask the user directly in the chat session for a review verdict —
   this is an in-conversation gate, not a Trello automation.

   The verdict itself is only documented on the card when it is **not**
   positive — a positive review leaves no `review-feedback` log entry, only
   the `pr-opened` entry from step 9.
9. **On a positive verdict:**
   - Bump the version in `app/package.json` and the mirrored `version`
     fields in `app/package-lock.json`, following Semantic Versioning
     (`MAJOR.MINOR.PATCH`):
     - **MAJOR** — a breaking change.
     - **MINOR** — a backward-compatible new feature (the common case).
     - **PATCH** — a backward-compatible bug fix only.
     Classify the change from the ticket/diff; ask the user if it is
     genuinely ambiguous rather than guessing.
   - Open a GitHub pull request for the ticket branch with `gh pr create`.
   - Append a workflow log entry recording the PR URL:
     ```
     [msnet-workflow] phase=pr-opened actor=coordinator at=<ISO-8601 timestamp> outcome=success

     Review approved for <title>. Version bumped to <version>. PR: <PR URL>.
     ```
   - Do not move the card to `Done` — only the user does that, manually,
     typically after merging the PR.
10. **On a negative verdict:**
    - Append a workflow log entry recording the requested changes:
      ```
      [msnet-workflow] phase=review-feedback actor=coordinator at=<ISO-8601 timestamp> outcome=blocked

      Review requested changes for <title>: <feedback, verbatim or summarized>.
      ```
    - Move the card back to `In Progress` and resume the relevant agent
      phase(s) to address the feedback, then return to step 7 (AI Review
      Gate) before step 8.
11. **Summarize the result** for the user: ticket title/URL, branch name,
    architecture concept file, changed files, test results, AI review
    outcome (and review file), and (if opened) the PR URL.
