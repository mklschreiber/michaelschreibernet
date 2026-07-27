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
