# Architecture Documentation Log

This log records material decisions made in the current architecture
documentation.

| Date | Decision |
|---|---|
| 2026-09-14 | Reconciled the Trello-backed delivery workflow with the real michaelschreiber.net board setup (`TBD`/`Open`/`In Progress`/`Review`/`Done` instead of `Backlog`/`In Progress`/`Blocked`/`Done`): `Open` replaces `Backlog`, `Blocked` is retired in favor of leaving a stalled card where it is, and a new `Review` stage adds an in-chat review gate — on approval the coordinator bumps `app/package.json`'s version and opens a GitHub PR; the user alone moves a card from `Review` to `Done`. |
| 2026-07-27 | Kept the supplied logo as a animated gif, with the landing page rendering it above the welcome heading. |
| 2026-07-27 | Adopted the Trello-backed delivery workflow concept: Trello is the sole ticket and progress authority; local backlogs, ticket artifacts, and the delivery journal are retired. |
| 2026-07-26 | Reset the architecture baseline from copied mobile-project material to the repository's Vue 3 + TypeScript + Vite application in `app/`. |
| 2026-07-26 | Removed obsolete mobile story and test concepts (8–10). They must not be used as guidance for this web project. |
| 2026-07-26 | Kept `docs/architecture/` as the home for current, feature-specific architecture concepts; the index now starts with the verified web-stack baseline and no active concepts. |
