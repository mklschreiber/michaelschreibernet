---
type: Architecture Concept
title: Relaxed Ticket Naming and Description-Based Workflow Log
description: Drops the mandatory MSNET-XXXX card-naming/template convention project-wide and moves all [msnet-workflow] log entries from Trello comments to the card description, since the connected Trello MCP tools have no comment-write action.
tags: [MSNET-WF-0003, workflow, trello, agents, documentation]
timestamp: 2026-09-19T00:00:00Z
status: approved
---

## Story

As a maintainer of michaelschreiber.net, I want the Trello delivery workflow
to match how the board is actually used and accessed, so that the
coordinator stops failing valid work on a naming technicality and stops
documenting a comment-posting step that the available Trello access method
cannot perform.

## Requirements Authority

There is no Trello card for this change — it is a direct, explicit
instruction from the user in chat during the `styling-improvements` ticket
run, not a delivery ticket itself. It amends the delivery-workflow contract
established by
[`msnet-wf-0001-trello-delivery-workflow.md`](msnet-wf-0001-trello-delivery-workflow.md)
and extended by
[`msnet-wf-0002-ai-review-gate.md`](msnet-wf-0002-ai-review-gate.md), which
this concept further amends rather than replaces.

## Architecture Decisions

**1. The `MSNET-XXXX:` card-title prefix and the fixed description template
are no longer required, board-wide.**
`msnet-wf-0001` required every card to carry an `MSNET-XXXX:` title prefix
and a `## User story` / `## Acceptance criteria` / `## Scope and technical
context` / `## Dependencies` description template, and the open-tickets
skill failed board validation for any card that didn't. In practice, no card
on the board (including every card already in `Done`) actually follows this
convention — the one card encountered in `Open` during the
`styling-improvements` run ("Styling improvements") had a plain title and a
free-form description with an `AC:` bullet list instead. Continuing to
enforce the convention would make every card on the real board permanently
unready. The user explicitly chose to relax the rule rather than rename/
rewrite cards to match it. A card is now ready based on content, not format:
it must be in `Open`, have a user story and acceptance criteria evident in
its description (in whatever structure it uses), and have every referenced
dependency (by card link, not a required ID scheme) in `Done`.

**2. Dependency references use card links, not MSNET IDs.**
Since cards are no longer guaranteed to carry a unique MSNET ID, a
`## Dependencies` entry (where a card uses that section at all) references
the dependency by its title and Trello card URL instead of an `MSNET-XXXX`
ID.

**3. All `[msnet-workflow]` log entries are appended to the card
description, never posted as a Trello comment — for every phase, not just
`ai-review`.**
`msnet-wf-0002`'s Decision 4 deliberately chose Trello comments over
myStandby's card-description-based `## KI-Review` format, to keep one log
vocabulary instead of two. That assumed comment-posting was available. It is
not: the Trello MCP server connected in this environment
(`mcp__trello__trelloWriteCard`/`trelloWriteChecklist`/`trelloWriteInbox`/
`trelloWriteBoard`/`trelloWritePlanner`) has no comment-write action at all,
confirmed directly against its tool schemas. `msnet-wf-0002`'s Open Question
2 already treated this as a transport-specific workaround limited to
`ai-review`; the user has now made it the permanent rule for every phase
(`claim`, `architecture`, `implementation`, `testing`, `ai-review`,
`blocked`, `ready-for-review`, `review-feedback`, `pr-opened`), independent
of which Trello access method (REST API or MCP) is in use. Each entry is
appended to the end of the existing description, separated by a `---` line,
so the full requirements stay at the top and every phase's entries survive
underneath as a running changelog. This is, in effect, adopting the
description-based logging shape `msnet-wf-0002` originally rejected — but
for a different, stronger reason (the write path genuinely doesn't exist for
comments here) rather than a stylistic preference.

**4. Long-running cards should keep log entries concise.**
Trello card descriptions have a working limit in this environment (observed
16384 characters via the connected Trello MCP tool's `desc` field). A card
that accumulates many phases and several AI-review rounds should keep each
entry to a verdict/result summary plus a durable-document link, not full
inlined detail — consistent with the conciseness `msnet-wf-0002` already
asked for in AI-review comments, now generalized to every phase.

## Affected Components

Delivery-tooling documentation only; no Vue view, component, composable,
store, route, i18n message, data module, or deployment workflow changes.

| Path | Change |
|---|---|
| `docs/agent-handbook.md` | Ticket Tracking: drop the mandatory `MSNET-XXXX:` prefix/template; dependencies reference cards by link, not ID. Workflow-log format: entries are appended to the description, not posted as comments. AI Review Gate section: "posts a ... comment" → "appends a ... log entry to the description" throughout. |
| `.github/skills/michaelschreibernet-open-tickets/SKILL.md` | Board validation no longer fails a card for missing the `MSNET-XXXX:` prefix. Results table drops "MSNET id" from the Ticket column. |
| `.github/skills/michaelschreibernet-implement-next-ticket/SKILL.md` | Every workflow-comment step becomes a description-append step; `<MSNET-id>` placeholders become `<title>`; the branch-naming step notes the prefix strip is conditional on the card happening to have one. |
| `docs/agents/architect.md`, `docs/agents/developer.md`, `docs/agents/tester.md` | "Post a Trello progress comment" → "Append a Trello workflow log entry to the end of the card description (never as a comment)". The developer/tester "Do not edit the card description for progress" lines are removed — that is now exactly what progress logging does. |
| `docs/architecture/msnet-wf-0002-ai-review-gate.md` | Requirements Authority note simplified (no longer explains a now-removed convention); Decision 4 keeps its original reasoning with a note that it is superseded by this concept's Decision 3; Open Question 2 updated to reflect that description-based logging is now the permanent design, not a scoped workaround. |
| `docs/architecture/index.md`, `docs/architecture/log.md` | Add this concept and its decision-log entry. |

## Data Flow

Unchanged from `msnet-wf-0001`/`msnet-wf-0002` except the log sink:

```text
Architect/Developer/Tester/Reviewer phase completes
                 |
                 v
      coordinator reads current card `desc`
                 |
                 v
   append "---\n\n[msnet-workflow] phase=... ..." to `desc`
                 |
                 v
        write full `desc` back to the card
   (no POST .../actions/comments — no such write action
    exists on the connected Trello MCP tools)
```

## Interfaces

No new external contract. Where `msnet-wf-0001`'s Interfaces section listed
`POST /1/cards/{cardId}/actions/comments?text={workflowComment}`, workflow
logging now uses the existing card-update operation (`PUT
/1/cards/{cardId}?desc={fullUpdatedDescription}` over the REST API, or the
equivalent `update` action on the connected Trello MCP write tool) with the
appended log entry included in the full description text — there is no
separate append-only field, so the coordinator must read the current
description before writing the extended one back.

## Open Questions

None. Both decisions were explicit, direct instructions from the user in
chat, not open design choices.
