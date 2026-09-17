---
type: Test Concept
title: Tests for AI Review Gate
description: Verification approach for the new Reviewer agent and AI Review Gate delivery-tooling change — no Vitest coverage applies since no Vue application code changed.
tags: [MSNET-WF-0002, tests, workflow]
timestamp: 2026-09-17T01:35:00Z
---

## Requirements Authority

Trello card: https://trello.com/c/54ANUoSd/10-improve-ai-setup

The Trello card description is canonical for requirements. See
[`msnet-wf-0002-ai-review-gate.md`](msnet-wf-0002-ai-review-gate.md) for the
full architecture decision.

## Scope

This is a delivery-tooling change (new agent definition, updated handbook
and skill documentation, symlinks). No Vue component, composable, store, or
utility code changed, so the standard Vitest/Vue Test Utils test pyramid
does not apply — there is nothing here `npm run test:unit` can exercise.

Verified instead:

- **Symlink integrity.** `.claude/agents/reviewer.md` and
  `.github/agents/reviewer.agent.md` both resolve (`readlink -f`) to
  `docs/agents/reviewer.md`, matching the existing
  architect/developer/tester symlink pattern exactly.
- **Cross-reference consistency.** The renumbered steps in
  `.github/skills/michaelschreibernet-implement-next-ticket/SKILL.md` (AI
  Review Gate inserted as step 7, subsequent steps renumbered 8–11) were
  read end-to-end after editing to confirm every internal step
  cross-reference (e.g. "return to step 8", "continue to step 8", "the
  `pr-opened` comment from step 9") points at the correct renumbered step.
- **Table/list additions render correctly.** `CLAUDE.md`,
  `.github/copilot-instructions.md`, and `docs/architecture/index.md` were
  re-read after editing to confirm the new `reviewer` row and the new
  "AI Review Gate" / "## Reviews" entries are well-formed Markdown in
  context, not just in isolation.
- **No unintended app changes.** `git status`/`git diff --stat` confirm only
  documentation, agent-definition, and symlink files changed — nothing under
  `app/`.

Because no application build/test/lint tooling applies to this change, there
is no `npm run build`/`npm run test:unit`/`npm run lint` run to report here.

## Test Cases

| Module | Test Case | Level | Status |
|--------|----------|-------|--------|
| Symlinks | `.claude/agents/reviewer.md` resolves to `docs/agents/reviewer.md` | Static verification | ✅ |
| Symlinks | `.github/agents/reviewer.agent.md` resolves to `docs/agents/reviewer.md` | Static verification | ✅ |
| SKILL.md | All renumbered step cross-references point at the correct step | Manual read-through | ✅ |
| CLAUDE.md / copilot-instructions.md | New `reviewer` table row renders correctly in context | Manual read-through | ✅ |
| index.md | New concept entry and "## Reviews" section render correctly in context | Manual read-through | ✅ |
| Repository scope | Only docs/agent-definition/symlink files changed, no `app/` files | `git status` / `git diff --stat` | ✅ |

## Untested Areas

- **The Reviewer agent's actual behavior when invoked on a real ticket.**
  This document verifies the agent *definition* and its wiring into the
  skill/handbook; it does not exercise the Reviewer agent end-to-end against
  a live ticket (that will happen naturally the next time the
  `michaelschreibernet-implement-next-ticket` skill runs a ticket through to
  completion). Not exercised here because this ticket's own AC is the setup
  change itself, not a feature ticket to review.
- **Multi-round findings loop.** The `findings` → re-invoke-reviewer →
  `positive` loop described in the concept and skill is untested in
  practice; it mirrors myStandby's proven pattern but has not yet run in
  this repository.
