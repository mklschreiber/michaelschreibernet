---
type: Architecture Concept
title: Trello-Backed Delivery Workflow
description: Moves ticket requirements, ticket state, and delivery progress from local AI documentation to the project's Trello board.
tags: [MSNET-WF-0001, workflow, trello, agents, documentation]
timestamp: 2026-07-27T09:14:20+02:00
status: approved
---

## Story

As a delivery-team member, I want Trello to be the single source of truth for
ticket requirements, dependencies, state, and delivery progress so that agents
always work from the complete remote backlog rather than an incomplete local
copy.

The canonical story, scope, and acceptance criteria are the fields on the
Trello card. Architecture and test concepts may link to a card, but must not
be treated as a competing or authoritative copy of its requirements.

## Architecture Decisions

### Trello is the sole ticket system of record

The configured Trello board is authoritative for every ticket. Local files
must never be used as a fallback backlog, dependency graph, ticket
specification, or phase-status record. This resolves the observed divergence
between the five open remote cards and the single local backlog entry.

Each work card has a unique title prefix, `MSNET-XXXX: <title>`, and uses this
description template:

```markdown
## User story
As ... I want ... so that ...

## Acceptance criteria
- AC-01: ...

## Scope and technical context
...

## Dependencies
- None
<!-- or: - MSNET-0007 — https://trello.com/c/... -->
```

The story and acceptance criteria are mandatory. Dependencies must be either
`None` or unique MSNET IDs with links to their cards. Changes to requirements
are made by editing this description on Trello, not by editing a local ticket
file. A Trello template card containing this format may live in a
`Templates` list; that list is not a delivery status and is excluded from
ticket queries.

### Card lists define status; readiness is derived

The board must contain exactly one list with each of these names:

| Trello list | Meaning | Allowed transition |
|---|---|---|
| `TBD` | Ideas and not-yet-ready items; excluded from ticket queries, like a pre-backlog. | `Open` once the card has a complete requirement description. |
| `Open` | Accepted, ready-to-claim work; dependencies may still be incomplete. | `In Progress` only when ready. |
| `In Progress` | One coordinator has claimed the card and agents may work on it. | `Review` after the Tester phase completes. |
| `Review` | Implementation and tests are complete; a human review verdict is pending. | `In Progress` if the coordinator's chat-based review request comes back negative (with feedback recorded as a comment); `Done` only by explicit, manual user action after a positive review. |
| `Done` | Work was accepted and is complete. Done cards remain open on Trello and must not be archived, because they are dependency evidence. | No normal outgoing transition. |

There is no `Blocked` list. A card that cannot proceed stays in its current
list and the reason is recorded as a workflow comment instead of a list move.

`Ready` is deliberately not a Trello list or custom field. A card is ready
when it is in `Open`, has a valid requirement description, and every
referenced dependency card is in `Done`. An unresolved dependency therefore
leaves the card in `Open`; it is not silently selected. A missing, ambiguous,
or malformed dependency is recorded as not ready, with the reason stated.

The open-ticket skill lists all non-`TBD` cards in `Open`, `In Progress`, and
`Review`, in board-list order and each list's Trello `pos` order. The
next-ticket skill considers only ready `Open` cards and selects the first by
`pos`. An explicitly requested card is subject to the same readiness checks.
`In Progress` and `Review` work is resumed only when the coordinator
explicitly identifies it; neither is ever selected as “next”.

Immediately before claiming a selected card, the coordinator re-fetches the
card and all dependency states. It moves the card to `In Progress`, then
re-fetches it to confirm the move. This minimizes, but cannot atomically
eliminate, a concurrent manual claim. If the re-fetch shows a different list
or another recorded owner, agents stop and request a human resolution rather
than duplicate work.

### Review gate, version bump, and pull request

The Architect → Developer → Tester phases run exactly as before. Once the
Tester phase succeeds, the coordinator:

1. Moves the card from `In Progress` to `Review`.
2. Posts the `phase=ready-for-review` workflow comment (format below).
3. Asks the user directly in the chat session for a review verdict — this is
   a synchronous, in-conversation gate, not a Trello field or automation.
4. On a **positive** verdict: bumps the version in `app/package.json` (and
   the mirrored `version` fields in `app/package-lock.json`) following
   Semantic Versioning (`MAJOR.MINOR.PATCH`):
   - **MAJOR** — a breaking change (e.g. removes/renames a public route,
     component prop, or otherwise breaks existing usage).
   - **MINOR** — a backward-compatible new feature (the common case for a
     new ticket, e.g. this workflow's own `gh pr create` step).
   - **PATCH** — a backward-compatible bug fix only.

   The coordinator classifies the change from the ticket/diff; if it is
   genuinely ambiguous, it asks the user rather than guessing. It then opens
   a GitHub pull request for the ticket branch with `gh pr create` and
   records the PR URL in a workflow comment.
5. On a **negative** verdict: records the requested changes as a workflow
   comment, moves the card back to `In Progress`, and resumes the relevant
   agent phase(s) to address the feedback.

The coordinator never moves a card to `Done`. Only the user, after accepting
the review and (typically) merging the PR, moves the card from `Review` to
`Done` themselves.

### Trello comments retain delivery progress and transient artifacts

The card description remains the requirements record. Each agent instead adds
a concise, machine-searchable Trello comment for a claim, completed phase,
block, retry, or handoff:

```text
[msnet-workflow] phase=<claim|architecture|implementation|testing|blocked|ready-for-review>
actor=<role> at=<ISO-8601 timestamp> outcome=<success|blocked|failed>

<concise result, changed files/test command results, and durable-document link if applicable>
```

Phase plans, architecture-review findings, test concepts, code reviews, and
change logs are no longer created in `app/.ai-docs/tickets/`. Their useful
concise result belongs in the corresponding card comment. A detailed,
durable architecture decision remains an OKF concept in
`docs/architecture/`, and a test concept remains there when the Tester Agent
needs one; both link to the Trello card URL and state that the card is
canonical for requirements. They are technical knowledge, not ticket
artifacts or status records.

The existing top-level three-role workflow is the only ticket execution
workflow: Architect, Developer, then Tester. The next-ticket skill moves a
card to `In Progress`, runs those phases, then moves the card to `Review` and
ends with a `ready-for-review` comment plus an in-chat review request (see
"Review gate, version bump, and pull request" above). It does **not** move
the card to `Done`; the user does so manually after reviewing the result and
the opened pull request. This preserves the current skill's explicit
no-auto-completion behavior without a second, incompatible six-phase local
workflow.

### Access is an explicit local prerequisite, not repository configuration

Skills use the Trello REST API through `curl` and `jq`; no unofficial CLI,
application dependency, backend, or persistence layer is introduced. Before
using a workflow skill, the execution environment must provide:

| Variable/tool | Purpose |
|---|---|
| `TRELLO_BOARD_ID` | The target board ID. It must identify the approved michaelschreiber.net board. |
| `TRELLO_API_KEY` | Trello API key. |
| `TRELLO_TOKEN` | A user token with read and write access to that board. |
| `curl`, `jq` | REST calls and deterministic JSON parsing. |

The key and token are secrets. They are supplied through the operator's
environment or secret manager, are never committed, written to `.env` files,
included in agent prompts/comments, or printed in command output. The token
uses the least privilege Trello permits for board read/write and is rotated or
revoked if exposed. `TRELLO_BOARD_ID` may be documented in operator setup if
desired, but it is still injected as configuration so no skill guesses a
board by name.

The skills use Trello's board/list/card endpoints to resolve list IDs by the
exact names above, read cards and descriptions, move a card by `idList`, and
post a card comment. Board setup validation must fail if a required list is
missing or duplicated, card IDs are duplicated, or the requested card is not
on `TRELLO_BOARD_ID`.

### Failure behavior favors stopping over stale local data

- A missing tool, variable, authentication failure (401/403), unavailable
  board, malformed card, or failed read stops before a ticket is selected.
  The agent reports the prerequisite or card fields that need correction; it
  must not fall back to `app/.ai-docs/tickets/`.
- Read-only requests may use bounded retries with backoff. For a timed-out
  write, the coordinator re-fetches first: it checks the target list after a
  move and searches recent card actions for the exact
  `[msnet-workflow]` marker before repeating a comment. It does not blindly
  retry writes, avoiding duplicate claims and progress comments.
- If an agent or a test phase fails after a successful claim, the card stays
  in its current list (`In Progress`, or `Review` if feedback came back
  negative). The coordinator posts a `failed` or `blocked` comment with the
  next action; there is no `Blocked` list to move it to, so a stalled card is
  surfaced to the user in chat instead.
- Only a successful explicit completion action can move a card to `Done`.
  A remote write failure is always surfaced to the user and manually
  reconcilable from the card's Trello action history.

## Affected Components

This is a delivery-tooling change only. It changes no Vue view, component,
composable, store, route, i18n message, data module, package, or deployment
workflow.

| Path | Required implementation change |
|---|---|
| `docs/agent-handbook.md` | Replace local-ticket tracking instructions with the board contract, readiness rule, credentials prerequisite, progress-comment format, and no-local-fallback policy. |
| `.github/skills/michaelschreibernet-open-tickets/SKILL.md` | Replace local Markdown parsing with authenticated Trello board/list/card retrieval; report open and ready cards using the derived-status rule. |
| `.github/skills/michaelschreibernet-implement-next-ticket/SKILL.md` | Select/claim through Trello, pass the card URL and fetched description to agents, record phase comments, and finish at `ready-for-review` without auto-completing. |
| `docs/agents/architect.md` | Require fetching the selected Trello card before architecture work; link the resulting concept in a progress comment and remove local-ticket inputs. |
| `docs/agents/developer.md` | Require the Trello card plus referenced architecture concept as input; report implementation and validation results as a card comment. |
| `docs/agents/tester.md` | Require the Trello card and architecture concept; retain its durable test concept only under `docs/architecture/` and report testing on the card. |
| `.github/agents/architect.agent.md`, `.github/agents/developer.agent.md`, `.github/agents/tester.agent.md` and `.claude/agents/*` | No content edit: these are symlinks to the three canonical files above and receive the changed instructions through their targets. Verify symlinks remain valid. |
| `.github/copilot-instructions.md` and `CLAUDE.md` | Replace references to a local backlog/ticket artifacts with Trello as ticket authority and point to the revised handbook. |
| `app/.github/copilot-instructions.md` | Remove mandatory journal updates and local ticket-artifact expectations; retain only applicable project-documentation reading and direct agents to the Trello workflow in the root handbook. |
| `app/.github/agents/architect.agent.md`, `developer.agent.md`, `documenter.agent.md`, `planner.agent.md`, `reviewer.agent.md`, `tester.agent.md` | Delete the obsolete six-phase, ticket-directory-specific role definitions. They conflict with the canonical three-role workflow and require forbidden local artifacts. |
| `app/.github/prompts/ticket-implementieren.prompt.md` | Delete the obsolete six-phase local-ticket coordinator prompt; its outputs and status mutations are superseded by the root Trello skills. |
| `app/.ai-docs/tickets/_backlog.md` and `app/.ai-docs/tickets/` | Delete the local backlog and all ticket directories/artifacts, including the completed MSNET-0001 record. Git history remains the historical archive; it is not a live requirement source. |
| `app/.ai-docs/dev-journal.md` | Delete it as a delivery-progress journal. Trello comments and list state replace its ticket progress entries. |
| `app/.ai-docs/01-vision.md`, `02-architecture.md`, `03-decitions.md`, `04-glossar.md`, `05-setup.md` | Retain as non-ticket project reference documentation. Remove only any future instructions that make them a ticket status or requirement source. |
| `docs/architecture/index.md` and `docs/architecture/log.md` | Add this concept and its decision-log entry. |

Before deletion, operators must verify that every active requirement has a
complete Trello card and that the remote board contains the five open cards
identified during discovery. Local MSNET-0001 material must not be copied
back into a new local system; if its history is useful, Git provides it.

## Data Flow

```text
Operator environment
  TRELLO_BOARD_ID + TRELLO_API_KEY + TRELLO_TOKEN
                         |
                         v
open-tickets skill -- GET board/lists/cards --> Trello board
                         |                   (requirements, dependencies, status)
                         v
next-ticket skill -- re-fetch + PUT idList --> In Progress card
                         |
          card URL + canonical description
                         v
       Architect -> docs/architecture/<story>.md ---+
                         |                           |
                         +-- POST phase comment ------+--> Trello card actions
                         |
                       Developer -> app/ source
                         |
                         +-- POST implementation comment --> Trello
                         |
                        Tester -> app/src/__tests__/
                         + docs/architecture/<story>-tests.md
                         |
                         +-- POST ready-for-review comment
                         +-- PUT idList --> Review card
                         |
                  ask user for review verdict (chat)
                         |
             +-----------+-----------+
             v                       v
        positive                negative
             |                       |
   bump app/package.json      POST feedback comment
   gh pr create -> PR URL     PUT idList --> In Progress
             |                       |
   POST comment with PR URL    (resume agent phase)
             |
   user reviews/merges PR,
   then manually
   PUT idList --> Done
```

The description and list state travel only from Trello to agents. Git holds
source code and durable technical documentation; it does not mirror a live
backlog or phase artifacts.

## Interfaces

The implementation does not introduce application TypeScript interfaces.
Workflow skills use the following external contract:

```text
GET  /1/boards/{TRELLO_BOARD_ID}/lists
     -> list id/name/pos and open-card id/name/desc/pos/idList/url

GET  /1/cards/{cardId}
     -> current card fields used to revalidate selection and requirements

PUT  /1/cards/{cardId}?idList={targetListId}
     -> card status transition

POST /1/cards/{cardId}/actions/comments?text={workflowComment}
     -> durable workflow progress event
```

Every request authenticates from `TRELLO_API_KEY` and `TRELLO_TOKEN` without
persisting credentials. Skills must model at least this parsed data:

```text
TicketCard {
  id: string
  idList: string
  name: string              // must start with MSNET-XXXX:
  desc: string              // canonical requirement template
  pos: number
  url: string
}

TicketState = Open | InProgress | Review | Done
ReadyTicket = TicketCard where state == Open and dependencies == Done
```

`TBD` cards are pre-backlog ideas: excluded from `TicketState`/ticket queries
entirely, the same way a `Templates` list would be, until moved to `Open`
with a complete description.

## Open Questions

1. ~~Which exact Trello board ID is approved for `TRELLO_BOARD_ID`, and do
   its existing list names match `Backlog`, `In Progress`, `Blocked`,
   `Done`, and optional `Templates`?~~ **Resolved 2026-09-14**: the approved
   board is `https://trello.com/b/LsjRTPAO/michaelschreibernet`
   (`ari:cloud:trello::board/workspace/690594d4b29a847f8633b4a8/6a1853062ea9d0814e39023a`).
   Its actual lists are `TBD`, `Open`, `In Progress`, `Review`, `Done` — not
   `Backlog`/`Blocked`. The board (not this document's original assumption)
   is authoritative; the list contract above and the two Trello skills were
   updated to match it.
2. Do all discovered open cards already have unique MSNET prefixes, complete
   descriptions, and explicit dependency links? Any missing data must be
   corrected on Trello before it is selected as ready.
3. ~~Who is authorized to perform the explicit final review and move an
   `In Progress` card to `Done`?~~ **Resolved 2026-09-14**: the user reviews
   in chat when the coordinator requests it at the `Review` stage, and the
   user alone moves the card from `Review` to `Done`, typically after
   merging the pull request the coordinator opened.
