# michaelschreiber.net — Instructions for Claude

The complete agent handbook (including the Trello-backed ticket workflow,
documentation structure, and important files) is located in
[docs/agent-handbook.md](docs/agent-handbook.md). Read it before working on
this project. Trello is the authoritative ticket, requirement, dependency, and
delivery-progress system; do not use local ticket artifacts as a fallback.

The Vue 3 + TypeScript + Vite application is located in `app/`.

## Agent Definitions (Claude)

`.claude/agents/*.md` are symlinks to the canonical definitions in
[docs/agents/](docs/agents/) (shared with Copilot).

| Agent | Definition |
|-------|------------|
| `architect` | [.claude/agents/architect.md](.claude/agents/architect.md) → [docs/agents/architect.md](docs/agents/architect.md) |
| `developer` | [.claude/agents/developer.md](.claude/agents/developer.md) → [docs/agents/developer.md](docs/agents/developer.md) |
| `tester` | [.claude/agents/tester.md](.claude/agents/tester.md) → [docs/agents/tester.md](docs/agents/tester.md) |

## Skills

`.claude/commands/*.md` point to the canonical skill definitions in
[.github/skills/](.github/skills/) (shared with Copilot).

| Skill | Definition |
|-------|------------|
| `michaelschreibernet-open-tickets` | [.claude/commands/michaelschreibernet-open-tickets.md](.claude/commands/michaelschreibernet-open-tickets.md) → [.github/skills/michaelschreibernet-open-tickets/SKILL.md](.github/skills/michaelschreibernet-open-tickets/SKILL.md) |
| `michaelschreibernet-implement-next-ticket` | [.claude/commands/michaelschreibernet-implement-next-ticket.md](.claude/commands/michaelschreibernet-implement-next-ticket.md) → [.github/skills/michaelschreibernet-implement-next-ticket/SKILL.md](.github/skills/michaelschreibernet-implement-next-ticket/SKILL.md) |
