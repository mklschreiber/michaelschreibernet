---
type: Architecture Concept
title: AI Review Gate
description: Adds an independent Reviewer Agent and AI Review Gate between the Tester phase and the user's manual review, synchronizing the michaelschreiber.net delivery workflow with the myStandby project's equivalent gate.
tags: [MSNET-WF-0002, workflow, agents, review]
timestamp: 2026-09-17T01:30:00Z
status: approved
---

## Story

As a maintainer of michaelschreiber.net, I want an independent AI review of
a ticket's architecture concept, implementation, and tests before I am asked
for my own manual review, so that obvious correctness bugs and coverage gaps
are caught and fixed before they reach me.

## Requirements Authority

Trello card: https://trello.com/c/54ANUoSd/10-improve-ai-setup

The Trello card description is canonical for requirements. Note: this card
predates the project's `MSNET-XXXX:` naming/template convention (no ticket
ID prefix, no `## User story` / `## Acceptance criteria` / `## Scope and
technical context` / `## Dependencies` sections). The user explicitly
approved treating it as ready and working from its plain description.
`improve-ai-setup` is used as this document's Trello-facing story reference;
the durable concept itself is filed under the `MSNET-WF-0002` workflow-doc
numbering established by
[`msnet-wf-0001-trello-delivery-workflow.md`](msnet-wf-0001-trello-delivery-workflow.md),
which this concept extends rather than replaces.

Card AC (verbatim):
- AI setup contains synchronized workflow of the mystandby repository

## Architecture Decisions

**1. Add a fourth agent role, Reviewer, functionally mirroring myStandby's
`docs/agents/reviewer.md`, adapted to this project's Vue/Vitest/ESLint
tooling instead of Gradle/JUnit.**
myStandby's multi-agent system inserts an independent AI review between the
Tester phase and the user's manual review. The reviewer reads the
architecture concept, the testing concept, and the actual code diff, runs
the project's verification commands, and reports a `positive` or `findings`
verdict without fixing anything itself — fixing stays with the agent that
owns the affected artifact (architect/developer/tester). This project adopts
the same separation of concerns: a reviewer that only reports, so the
existing three agents keep their single responsibilities.

**2. The reviewer is invoked by the coordinator, not the tester, and has no
Trello access — consistent with how architect/developer/tester already
work.**
All three existing agents in this project report their results back to the
coordinator, which is solely responsible for Trello I/O; none of them call
Trello tools directly. The reviewer follows the same shape: it documents its
round in a local file and reports a verdict back to the coordinator, which
mirrors that verdict into the Trello workflow log. This keeps Trello access
concentrated in one place, unchanged from the existing three-role workflow's
design.

**3. Review rounds are documented in `docs/architecture/<story-id>-review.md`
(new document type, "AI Review"), and indexed under a new "## Reviews"
section in `docs/architecture/index.md` — mirroring myStandby's
`<story-id>-review.md` / `index.md` "## Reviews" pattern exactly.**
This keeps the AI-review artifact in the same durable, OKF-linked location as
architecture and test concepts, rather than only on the ephemeral Trello
card, and gives it a discoverable index entry like every other concept
document.

**4. The workflow-comment phase enum gains `ai-review`, inserted between
`testing` and `blocked`/`ready-for-review`, and every round is logged
regardless of verdict.**
`docs/agent-handbook.md` already defines a closed set of `phase=` values for
the `[msnet-workflow]` comment format
(`claim|architecture|implementation|testing|blocked|ready-for-review|review-feedback|pr-opened`).
Rather than importing myStandby's separate `## KI-Review` card-description
section format, the AI Review Gate is expressed as one more phase in this
project's existing, more structured comment vocabulary — keeping a single
log format instead of two competing ones. Every round (positive or findings)
is logged, matching myStandby's "every round documented" rule and unlike the
user-review outcome, which stays undocumented on a positive verdict.

**5. The gate sits strictly between the Tester phase and the `Review` list
move; a `findings` verdict routes back into the existing Architect →
Developer → Tester phases and re-runs the gate, exactly like myStandby's
loop.**
No new Trello list is introduced. `In Progress` already covers "agents are
working the card"; the AI Review Gate is additional in-progress work, not a
new status. Only a `positive` AI-review verdict allows the coordinator to
move the card to `Review` and ask the user for their own verdict, unchanged
from the existing chat-based human review gate.

**6. Both Claude and Copilot get the reviewer agent, via the existing
symlink-to-`docs/agents/` pattern.**
`docs/agents/reviewer.md` is the canonical definition; `.claude/agents/reviewer.md`
and `.github/agents/reviewer.agent.md` are added as symlinks to it, exactly
like the three existing agents, keeping the two tool-specific instruction
files (`CLAUDE.md`, `.github/copilot-instructions.md`) as thin pointers.

## Affected Components

This is a delivery-tooling change only. It changes no Vue view, component,
composable, store, route, i18n message, data module, or deployment workflow.

| Path | Change |
|---|---|
| `docs/agents/reviewer.md` | New canonical Reviewer Agent definition. |
| `.claude/agents/reviewer.md`, `.github/agents/reviewer.agent.md` | New symlinks to the canonical file above. |
| `CLAUDE.md`, `.github/copilot-instructions.md` | Add the `reviewer` row to the agent-definition table. |
| `docs/agent-handbook.md` | Add the `ai-review` phase to the workflow-comment enum and a new "AI Review Gate" section describing the gate, verdict routing, and traceability rule. |
| `.github/skills/michaelschreibernet-implement-next-ticket/SKILL.md` | Insert the AI Review Gate as a new step between the Tester phase and the move to `Review`; renumber subsequent steps. |
| `.claude/commands/michaelschreibernet-implement-next-ticket.md` | Update the workflow summary to name the Reviewer/AI Review Gate. |
| `docs/architecture/index.md` | Add this concept under "Current Concepts" and add a new "## Reviews" section for future Reviewer Agent entries. |
| `docs/architecture/log.md` | Record this decision. |

## Data Flow

```text
       Tester -> app/src/__tests__/ + docs/architecture/<story>-tests.md
                         |
                         +-- POST phase=testing comment
                         v
                 Reviewer Agent (new)
   reads concept + test concept + `git diff` + runs npm checks
                         |
                         v
              docs/architecture/<story>-review.md (Round N)
                         |
                         +-- POST phase=ai-review comment (every round)
                         |
             +-----------+-----------+
             v                       v
        findings                positive
             |                       |
   route to architect/developer/   move card -> Review
   tester, fix, re-invoke reviewer   ask user for manual review
   (back to Round N+1)               (unchanged from msnet-wf-0001)
```

## Interfaces

No new external contract. The reviewer uses only local tools already
available to the other three agents (`Read`, `Write`, `Bash` — for
`git diff`, `npm run test:unit`, `npm run lint`/`lint:check`, `npm run
build`) and has no Trello or MCP tool access, consistent with
architect/developer/tester.

## Open Questions

1. **Re-review cost on large findings loops.** myStandby's story showed AI
   review loops can run several rounds (e.g. story 18's review reached round
   4). This project has no volume of tickets yet to know whether that is a
   practical concern here; no mitigation beyond the existing "loop until
   positive" rule is adopted now.
2. **Review-doc file limit.** Trello card descriptions have a 2048-character
   limit (encountered while logging the `improve-ci-cd-setup` ticket via the
   Trello MCP tools, which lack a comment-write action in this environment —
   an unrelated, already-worked-around transport gap, not part of this
   ticket's scope). Multi-round `phase=ai-review` comments should stay
   concise (verdict + one-line findings summary + review-file link) rather
   than inlining full finding text, to avoid repeating that constraint.
