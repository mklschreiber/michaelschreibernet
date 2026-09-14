# Agent Handbook

## Project Baseline

This repository contains a Vue 3 + TypeScript website. The application is in
[`app/`](../app/); it is built with Vite and deployed to GitHub Pages.

## Working on the Application

Work from `app/` when installing dependencies or running project scripts:

| Purpose | Command |
|---|---|
| Development server | `npm run dev` |
| Production type-check and build | `npm run build` |
| Unit tests | `npm run test:unit` |
| Lint | `npm run lint` |

`npm run build` runs Vue type checking and the Vite production build. `npm run
lint` uses ESLint and may apply fixes because its configured script includes
`--fix`.

The source uses Vue single-file components, the Composition API, and
TypeScript. The documented project stack and tool configuration are in
[`docs/architecture/stack.md`](architecture/stack.md).

## Ticket Tracking

Trello is the sole source of truth for ticket requirements, dependencies, state,
and delivery progress. Do not use Git, `app/.ai-docs/`, or any local file as a
fallback backlog, ticket specification, dependency graph, or phase-status
record.

Each work card is named `MSNET-XXXX: <title>` and its description is the
canonical requirements record:

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

The user story and acceptance criteria are mandatory. Dependencies are either
`None` or unique MSNET IDs linked to their cards. Requirement changes are made
on the Trello card, never in a local ticket file.

The approved board has exactly one active list named `TBD`, `Open`,
`In Progress`, `Review`, and `Done`. `TBD` holds ideas that are not yet ready
for implementation; like a `Templates` list, it is excluded from ticket
queries. A ticket is ready only when it is in `Open`, has a valid
description, and every referenced dependency is in `Done`. The first ready
card by Trello list and card `pos` order is the next ticket. `In Progress`
and `Review` work is resumed only when the coordinator explicitly identifies
it. There is no `Blocked` list; a card that cannot proceed stays where it is
and the reason is recorded as a workflow comment instead.

Before using a workflow skill, the operator must provide `TRELLO_BOARD_ID`,
`TRELLO_API_KEY`, and `TRELLO_TOKEN`, and have `curl` and `jq` available. The
key and token are secrets: inject them through the environment or a secret
manager, do not commit, print, put in `.env` files, or include them in prompts
or Trello comments. The token needs board read/write access. The workflow
skills validate the board and fail rather than using stale local data.

Workflow comments, not the description, record claims and progress:

```text
[msnet-workflow] phase=<claim|architecture|implementation|testing|blocked|ready-for-review>
actor=<role> at=<ISO-8601 timestamp> outcome=<success|blocked|failed>

<concise result, changed files/test command results, and durable-document link if applicable>
```

The coordinator moves a selected ready card to `In Progress`, confirms the
move, and runs the Architect → Developer → Tester flow. On success, it moves
the card to `Review`, posts a `ready-for-review` comment, and asks the user
directly in chat for a review verdict. A positive verdict bumps the version
in `app/package.json` and opens a GitHub pull request for the ticket branch
(`gh pr create`), recorded in a follow-up comment. A negative verdict is
recorded as a comment with the requested changes, and the card moves back to
`In Progress` while the relevant phase is resumed. The coordinator never
moves a card to `Done`; only the user does that, manually, after reviewing
and typically merging the pull request. On a failed phase, keep the card in
its current list and post a failure comment — there is no `Blocked` list to
move it to.

Use the root Trello skills for ticket discovery and implementation:

- [`michaelschreibernet-open-tickets`](../.github/skills/michaelschreibernet-open-tickets/SKILL.md)
- [`michaelschreibernet-implement-next-ticket`](../.github/skills/michaelschreibernet-implement-next-ticket/SKILL.md)

## Architecture Documentation

`docs/architecture/` is the source for current, durable architecture concepts:

- [`stack.md`](architecture/stack.md) records the verified project baseline.
- [`index.md`](architecture/index.md) lists current concept documents.
- [`log.md`](architecture/log.md) records material architecture-documentation
  decisions.

Create a focused concept document only when a change needs a durable
architecture decision. Add it to the index and record the decision in the log.
Concepts and test concepts link to their Trello card and state that Trello is
canonical for requirements; they are not ticket artifacts or status records.
Do not treat removed historical documents as implementation guidance.

## Delivery

The GitHub Pages workflow runs from `app/` on pushes to `main` and manually
dispatchable runs. It installs dependencies, runs `npm run build`, and deploys
`app/dist`. Keep changes compatible with that build path.
