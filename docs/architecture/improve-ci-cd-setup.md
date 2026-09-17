---
type: Architecture Concept
title: CI Checks for Pull Requests
description: Adds a GitHub Actions workflow that verifies lint, unit tests, and build on every pull request, independent of the existing GitHub Pages deployment workflow.
tags: [improve-ci-cd-setup, ci, github-actions, tooling]
timestamp: 2026-09-17T00:00:00Z
status: draft
---

## Story

As a maintainer of michaelschreiber.net, I want pull requests to automatically
run tests, build, and linting so that I can trust a PR is safe to merge before
looking at it.

## Requirements Authority

Trello card: https://trello.com/c/QB7a0iw4/9-improve-ci-cd-setup

The Trello card description is canonical for requirements, acceptance
criteria, dependencies, and ticket state. Note: this card predates the
project's `MSNET-XXXX:` naming/template convention (no ticket ID prefix, no
`## User story` / `## Acceptance criteria` / `## Scope and technical context`
/ `## Dependencies` sections). The user explicitly approved treating it as
ready and working from its plain description. `improve-ci-cd-setup` is used
as the story-id slug for this document and for the log entry in the absence
of an MSNET id.

Card AC (verbatim):
- Tests are verified in the CI/CD pipeline
- Build is verified in the CI/CD pipeline
- Linting is verified in the CI/CD pipeline

## Architecture Decisions

**1. New, separate workflow file (`.github/workflows/ci.yml`), not an
extension of `deploy.yml`.**
`deploy.yml` is a deployment pipeline: it triggers on push to `main`,
requires `pages`/`id-token` write permissions, and its `build` job exists to
produce a Pages artifact. PR verification has different concerns (read-only,
runs on every PR, must never deploy) and a different trigger. Mixing the two
in one file would force `if:` gating and make both harder to read. A
dedicated `ci.yml` keeps each workflow single-purpose, consistent with the
project's "no gold plating" principle — build both correctly for what they
do, but keep them decoupled.

**2. Trigger: `pull_request` targeting `main` only.**
The card's problem statement is explicitly "does not perform any test/build
on PR creation." `deploy.yml` already builds on every push to `main` (i.e.
after merge), so `ci.yml` does not need a `push` trigger — that would
duplicate the build step deploy.yml already runs and waste Actions minutes.
`pull_request` fires on open, synchronize (new commits), and reopen by
default, which covers "on PR creation" and subsequent pushes to the PR
branch.

**3. Three independent jobs (`lint`, `test`, `build`) instead of one job
with three steps.**
The AC lists three separately-named checks ("Tests are verified", "Build is
verified", "Linting is verified"). GitHub reports one status check per job,
not per step, and branch protection rules require status checks by name at
job granularity. Three jobs give three independently-visible, independently
failable, and independently branch-protection-requirable checks, and they
run in parallel (faster PR feedback) rather than sequentially. The small
duplication of checkout/setup-node/`npm ci` steps across three jobs is
accepted deliberately — a reusable composite action or reusable workflow
would be gold plating for three short jobs in one repository.

**4. Each job mirrors `deploy.yml`'s environment: `ubuntu-latest`, working
directory `./app`, Node 20 via `actions/setup-node@v4` with
`cache: npm` / `cache-dependency-path: ./app/package-lock.json`, and
`npm ci` for installation.**
Reusing the exact Node version and install strategy already verified in
production deployment avoids introducing a second, potentially diverging
toolchain baseline, and keeps `docs/architecture/stack.md`'s Node 20
baseline accurate for both workflows.

**5. Linting in CI must not run with `--fix`. A new, non-mutating
`lint:check` npm script is added; the CI `lint` job runs that script
instead of the existing `lint` script.**
`app/package.json`'s existing `"lint": "eslint . --fix --cache"` silently
rewrites files and then reports success based on the *post-fix* state. In a
CI runner, those fixes are applied to an ephemeral checkout and discarded —
they are never committed back to the PR branch. That means a PR with real,
uncorrected lint violations could still show a green "Lint" check, which
directly contradicts the AC ("Linting is verified"). The reasoned fix: add
`"lint:check": "eslint ."` (no `--fix`) to `app/package.json` and have the
CI job run `npm run lint:check`. This makes the check fail exactly when the
committed code has lint errors, which is the only meaningful definition of
"linting is verified" in an unattended pipeline. The existing `npm run lint`
script is left untouched for local developer use, where auto-fixing on save
is the desired, human-supervised behavior. The `--cache` flag is dropped
for the CI script: `eslint`'s cache file speeds up *repeated local runs on
an unchanged working tree*, but every CI job starts from a fresh checkout
with no prior cache, so caching there has no benefit and is omitted to keep
the script's purpose obvious (no gold plating).

**6. The `test` job runs `npm run test:unit -- --run` rather than bare
`npm run test:unit`.**
`app/package.json`'s `"test:unit": "vitest"` runs in watch mode unless
Vitest detects it is running in CI (it checks the `CI` environment
variable, which GitHub Actions does set). Relying on that implicit
detection to avoid a hanging, never-completing job is fragile and easy to
break (e.g. if the variable is ever overridden by a future step). Passing
`--run` explicitly makes the one-shot behavior unambiguous and independent
of environment-variable inference.

**7. The `build` job runs the existing `npm run build` script unchanged
and without setting `VITE_BASE_URL`.**
`npm run build` already performs `vue-tsc --build` (type-check) followed by
`vite build`, which is sufficient to "verify the build" per the AC — a
failing type-check or a failing Vite build both fail the job. Vite falls
back to base `/` when `VITE_BASE_URL` is unset (per `stack.md`), which is
adequate for a verification build that is never deployed or uploaded as an
artifact; only `deploy.yml`'s production build needs the real base path and
Pages artifact upload.

**8. `permissions: contents: read` at the workflow level; no `pages` or
`id-token` permissions.**
None of the three jobs deploy anything, so the default broad token
permissions are unnecessary. Declaring read-only access explicitly follows
least-privilege and mirrors the intent (if not the exact scope) of
`deploy.yml`'s explicit `permissions:` block.

**9. Concurrency control cancels superseded runs per PR.**
A `concurrency` group keyed on the PR number
(`ci-${{ github.workflow }}-${{ github.event.pull_request.number }}`) with
`cancel-in-progress: true` ensures that pushing new commits to a PR cancels
the previous, now-outdated CI run instead of letting both run to
completion. This is standard, low-risk practice for PR-triggered workflows
and avoids wasted Actions minutes; it does not affect `deploy.yml`'s
separate `pages` concurrency group.

## Affected Components

- `.github/workflows/ci.yml` — new workflow: `lint`, `test`, `build` jobs,
  triggered on `pull_request` to `main`.
- `app/package.json` — add a `"lint:check": "eslint ."` script (no `--fix`,
  no `--cache`); no other scripts change.
- `docs/architecture/stack.md` — not changed by this document; see Open
  Questions for when it should be updated.

## Data Flow

```
PR opened / synchronized against main
        │
        ▼
GitHub Actions evaluates .github/workflows/ci.yml (pull_request trigger)
        │
        ├──► job: lint  ─ checkout → setup-node@20 → npm ci → npm run lint:check
        ├──► job: test  ─ checkout → setup-node@20 → npm ci → npm run test:unit -- --run
        └──► job: build ─ checkout → setup-node@20 → npm ci → npm run build
                (three jobs run in parallel; each reports its own PR status check)
        │
        ▼
GitHub PR shows three independent checks: Lint / Unit Tests / Build
```

`deploy.yml` is untouched and continues to run only on push to `main`
(post-merge), producing and deploying the Pages artifact. `ci.yml` never
uploads an artifact and never deploys.

## Interfaces

`.github/workflows/ci.yml` (shape the Developer should implement):

```yaml
name: CI

on:
  pull_request:
    branches: ['main']

concurrency:
  group: ci-${{ github.workflow }}-${{ github.event.pull_request.number }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./app
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: './app/package-lock.json'
      - run: npm ci
      - run: npm run lint:check

  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./app
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: './app/package-lock.json'
      - run: npm ci
      - run: npm run test:unit -- --run

  build:
    name: Build
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./app
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: './app/package-lock.json'
      - run: npm ci
      - run: npm run build
```

`app/package.json` script addition:

```json
"scripts": {
  "lint": "eslint . --fix --cache",
  "lint:check": "eslint ."
}
```

## Open Questions

1. **Branch protection.** Making these three checks actually *required*
   before merge (so a red check blocks merging) needs a GitHub repository
   admin action under Settings → Branches → branch protection rules for
   `main`, selecting "Lint", "Unit Tests", and "Build" as required status
   checks. This is a repository-settings change, not a file in this repo,
   and is outside the Developer Agent's implementation scope. Flagging so
   the user can perform it once the workflow exists and has run at least
   once (GitHub only lists a check as selectable after it has appeared on a
   PR).
2. **`docs/architecture/stack.md` update.** `stack.md` documents the
   "verified" baseline (its own description says "verified ... build, test,
   and lint ... baseline"). It should gain a short note about `ci.yml` once
   the workflow has been implemented and has actually run green on a PR,
   consistent with how `deploy.yml` is documented there today. This
   document does not update `stack.md` now because the workflow is not yet
   implemented/verified; the Architect will fold in a `stack.md` update
   during the next architecture pass once the Developer confirms the
   workflow's checks are green.
