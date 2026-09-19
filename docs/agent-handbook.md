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

A card's title and description are the canonical requirements record. Cards
are **not** required to carry an `MSNET-XXXX:` title prefix or follow a fixed
description template — write whatever title and description make the work
clear. The structured template below is a useful default, not a requirement:

```markdown
## User story
As ... I want ... so that ...

## Acceptance criteria
- AC-01: ...

## Scope and technical context
...

## Dependencies
- None
<!-- or: - <card title> — https://trello.com/c/... -->
```

A user story and acceptance criteria — in whatever form the card actually
uses — are mandatory. Dependencies are either `None` or links to their cards.
Requirement changes are made on the Trello card, never in a local ticket file.

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

Workflow log entries record claims and progress. Each entry is **appended to
the end of the card's description** (never posted as a Trello comment),
separated from the existing content by a `---` line, so every prior entry
survives as a running changelog below the requirements:

```text
[msnet-workflow] phase=<claim|architecture|implementation|testing|ai-review|blocked|ready-for-review|review-feedback|pr-opened>
actor=<role> at=<ISO-8601 timestamp> outcome=<success|blocked|failed>

<concise result, changed files/test command results, and durable-document link if applicable>
```

The coordinator moves a selected ready card to `In Progress`, confirms the
move, and runs the Architect → Developer → Tester flow.

## AI Review Gate

After the Tester phase succeeds, and **before** the card moves to `Review`
and the user is asked for a manual review, the coordinator invokes the
**Reviewer** agent (`docs/agents/reviewer.md`) for an independent AI review:

1. **Invoke the reviewer.** It reads the architecture concept, the testing
   concept, and the actual code changes, runs the relevant `npm run` checks
   from `app/`, and documents the round in
   `docs/architecture/<story-id>-review.md`, ending with a verdict of
   `positive` or `findings`.
2. **Record on the card, every round.** The coordinator appends a
   `phase=ai-review` workflow log entry to the card description with the
   round's verdict and findings (or "No findings." if positive). Unlike the
   user-review outcome below, every AI review round is recorded, regardless
   of verdict, for traceability.
3. **On `findings`:** the coordinator routes each finding to the responsible
   agent — architect for concept gaps, developer for implementation bugs,
   tester for coverage gaps — has it addressed, then re-invokes the reviewer
   for another round (appending to the same review file and posting another
   `phase=ai-review` comment) until the verdict is `positive`.
4. **On `positive`:** the coordinator proceeds to move the card to `Review`.

The reviewer has no Trello access; the coordinator is responsible for
mirroring its verdict into the workflow log.

On success, the coordinator moves the card to `Review`, appends a
`ready-for-review` workflow log entry to the description, and asks the user
directly in chat for a review verdict.

The review verdict itself is only ever documented on the card when it is
**not** positive: a positive verdict gets no `review-feedback` log entry at
all, only the `pr-opened` entry described below — successful reviews leave
no trace on the card beyond the version bump and PR link. A negative verdict
is recorded as a `phase=review-feedback` log entry with the requested
changes, and the card moves back to `In Progress` while the relevant phase
is resumed.

A positive verdict bumps the version in `app/package.json` (and the mirrored
fields in `app/package-lock.json`) following Semantic Versioning — MAJOR for
a breaking change, MINOR for a backward-compatible feature, PATCH for a bug
fix only — classified from the ticket/diff, asking the user when it is
genuinely ambiguous, and opens a GitHub pull request for the ticket branch
(`gh pr create`), recorded in a `phase=pr-opened` log entry. The coordinator
never moves a card to `Done`; only the user does that, manually, after
reviewing and typically merging the pull request. On a failed phase, keep
the card in its current list and append a failure log entry — there is no
`Blocked` list to move it to.

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
