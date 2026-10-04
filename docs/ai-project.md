# michaelschreiber.net — AI Project Profile

> Project-specific values for the shared ai-base workflow (`.ai-base/handbook.md`).
> On conflict, this file wins over the generic files.

## Project

michaelschreiber.net — Vue 3, TypeScript, Vite website; application in `app/`; deployed to
GitHub Pages (custom domain michaelschreiber.net) from `app/dist` by `deploy.yml` on push to
`main`.

- Keep changes compatible with that build path.
- Work from `app/` for all `npm` commands. The dev server is `npm run dev`.
- Stack details: `docs/architecture/stack.md`.

## Jira

| Setting | Value |
|---|---|
| Site | `https://mklschreiber.atlassian.net` |
| Cloud ID | `8e9f1375-dd39-419a-b3cf-48a86adeb617` |
| Project key | `MS` |
| Board ID | `5` |
| Uses sprints | `yes` |

| Status | Transition ID |
|---|---|
| Open | `11` |
| In Progress | `21` |
| In Review | `31` |
| Done | `41` |

## Branches & Story IDs

Generic rules from the handbook apply.

Docs created before the Jira migration keep their old identifiers (`msnet-wf-000N-…` and card-title-based file names such as `minor-changes.md`). The Jira description of each migrated issue links to its original card.

## Checks

All commands run in `app/`. CI:

- `ci.yml` — every pull request: `npm run lint:check`, `npm run test:unit -- --run`,
  `npm run build`.
- `deploy.yml` — every push to `main`: builds and deploys `app/dist` to GitHub Pages.

`npm run lint` may apply fixes (`--fix`). `npm run lint:check` does not.

### Developer runs

- `npm run lint`
- `npm run build`

### Tester runs

- `npm run test:unit -- --run`
- `npm run lint`
- `npm run build`

### Reviewer runs

- `npm run test:unit -- --run`
- `npm run lint:check`
- `npm run build`

## Versioning

In `app/` run `npm version <patch|minor|major> --no-git-tag-version`. It updates
`app/package.json` and both version fields in `app/package-lock.json`.

### Version source

File: `app/package.json`

Read command (file content on stdin, prints one `X.Y.Z` line or nothing):

```sh
awk -F'"' '/^  "version":/{print $4; exit}'
```

## Documentation

- Index `docs/architecture/index.md`: concepts and testing concepts under
  `## Current Concepts`, AI reviews under `## Reviews`.
- Log `docs/architecture/log.md`: newest first, one row `| <YYYY-MM-DD> | <decision> |` at the
  top of the table.

## Important Files

- `app/package.json` — scripts, dependencies and the version
- `app/src/material-web.ts` — Material Web custom element registration

## Agent: architect

- Affected units: views, components, composables, stores, routes, i18n messages, data
  modules, tests.
- Also read `docs/architecture/stack.md`.
- **Technology stack:** Vue 3 Composition API, TypeScript, Vite, Vue Router, Pinia, Vue I18n, Material Web, Vitest, Vue Test Utils, and ESLint.
- **Project root:** Source code and package scripts are in `app/`. Do not introduce a backend, persistence layer, or abstraction pattern unless the ticket requires it.

## Agent: developer

- **Vue:** Use Vue 3 Composition API with `<script setup lang="ts">`; keep presentation components focused and move reusable stateful behavior into composables where appropriate.
- **TypeScript:** Use explicit types at public boundaries and reuse types from `app/src/types/`.
- **State and navigation:** Use Pinia and Vue Router only when the existing architecture or approved concept requires them.
- **Localization and UI:** Use Vue I18n for user-facing text and register Material Web custom elements through the established `app/src/material-web.ts` integration.

## Agent: tester

Tests live in `app/src/__tests__/`.

### Tech Stack for Tests

- **Vitest** — unit-test runner
- **Vue Test Utils** — Vue component testing utilities
- **jsdom** — browser-like test environment

### Test Pyramid

#### Unit Tests (`app/src/__tests__/`)

- **Composable tests:** Test reactive state changes, events, and cleanup behavior.
- **Data and utility tests:** Test transformations, validation, and error handling.

#### Component Tests (`app/src/__tests__/` with Vue Test Utils)

- Mount components in jsdom and test their rendered behavior, emitted events, props, router interactions, and localized content.

#### Manual Browser Checks

- Record essential browser checks only when a behavior cannot be covered with Vitest and Vue Test Utils.

### Naming Convention

```
<ComponentName>.spec.ts        // Component test
<composableName>.spec.ts       // Composable test
<moduleName>.spec.ts           // Data or utility test
```

### Test Structure (Given / When / Then)

```ts
it('renders the expected content', () => {
  const wrapper = mount(Component, { props: { value: 'test' } })

  expect(wrapper.text()).toContain('test')
})
```

### Asynchronous work

Do not use fixed delays; await Vue updates and mocked asynchronous work deterministically.

## Agent: reviewer

No additional rules.
