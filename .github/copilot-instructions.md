# michaelschreiber.net — Instructions for GitHub Copilot

The complete agent handbook (including the Trello-backed ticket workflow,
documentation structure, and important files) is located in
[docs/agent-handbook.md](../docs/agent-handbook.md). Read it before working on
this project. Trello is the authoritative ticket, requirement, dependency, and
delivery-progress system; do not use local ticket artifacts as a fallback.

The Vue 3 + TypeScript + Vite application is located in `app/`.

## Agent Definitions (Copilot CLI)

`.github/agents/*.agent.md` are symlinks to the canonical definitions in
[docs/agents/](../docs/agents/) (shared with Claude).

| Agent | Definition |
|-------|------------|
| `architect` | [.github/agents/architect.agent.md](agents/architect.agent.md) → [docs/agents/architect.md](../docs/agents/architect.md) |
| `developer` | [.github/agents/developer.agent.md](agents/developer.agent.md) → [docs/agents/developer.md](../docs/agents/developer.md) |
| `tester` | [.github/agents/tester.agent.md](agents/tester.agent.md) → [docs/agents/tester.md](../docs/agents/tester.md) |

## Skills

| Skill | Definition |
|-------|------------|
| `michaelschreibernet-open-tickets` | [.github/skills/michaelschreibernet-open-tickets/SKILL.md](skills/michaelschreibernet-open-tickets/SKILL.md) |
| `michaelschreibernet-implement-next-ticket` | [.github/skills/michaelschreibernet-implement-next-ticket/SKILL.md](skills/michaelschreibernet-implement-next-ticket/SKILL.md) |
