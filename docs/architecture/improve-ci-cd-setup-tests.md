---
type: Test Concept
title: Tests for CI Checks for Pull Requests
description: Local re-verification of the lint, unit-test, and build commands the new GitHub Actions PR workflow runs, plus a static correctness check of the workflow YAML itself.
tags: [improve-ci-cd-setup, ci, tests]
timestamp: 2026-09-17T08:00:00+02:00
---

## Requirements Authority

Trello card: https://trello.com/c/QB7a0iw4/9-improve-ci-cd-setup

The Trello card description is canonical for requirements. Card AC
(verbatim):

- Tests are verified in the CI/CD pipeline
- Build is verified in the CI/CD pipeline
- Linting is verified in the CI/CD pipeline

## Scope

This ticket is pure CI/CD infrastructure: `.github/workflows/ci.yml` (new)
and a new `app/package.json` script (`lint:check`). No Vue component,
composable, or utility code changed, so there is nothing here that fits the
normal Vitest/Vue Test Utils unit/component test pyramid — the "unit under
test" is a GitHub Actions YAML workflow, which Vitest cannot execute or
assert on. No Vitest test files were added for this ticket; doing so would
mean testing implementation details (e.g. parsing YAML strings) with no
behavioral value.

Tested instead:

- The three commands the workflow's `lint`, `test`, and `build` jobs run
  (`npm run lint:check`, `npm run test:unit -- --run`, `npm run build`),
  executed locally from `app/` as an independent check on the developer's
  report that they pass.
- A static read of `.github/workflows/ci.yml` for structural/consistency
  correctness: valid YAML, job/step consistency, the `lint:check` script
  existing and being referenced correctly, working-directory consistency
  across jobs, and trigger correctness against the AC.

Explicitly not tested here (see Untested Areas): the workflow's actual
execution behavior on GitHub Actions.

## Test Cases

| Module | Test Case | Level | Status |
|--------|----------|-------|--------|
| app/package.json (`lint:check`) | `npm run lint:check` (from `app/`) exits cleanly with no lint violations reported | CI verification (local re-run) | ✅ |
| app (Vitest suite) | `npm run test:unit -- --run` (from `app/`) completes in run-once mode; 9 test files / 51 tests pass, 0 failed | CI verification (local re-run) | ✅ |
| app (build pipeline) | `npm run build` (from `app/`) completes `vue-tsc --build` type-check and `vite build` with no errors | CI verification (local re-run) | ✅ |
| .github/workflows/ci.yml | YAML parses as valid, well-formed structure (verified with an independent YAML parser, not just visual inspection) | Static config review | ✅ |
| .github/workflows/ci.yml | `on.pull_request.branches` is `['main']`, matching the AC's "verified in the CI/CD pipeline" intent for PRs into `main` | Static config review | ✅ |
| .github/workflows/ci.yml | All three jobs (`lint`, `test`, `build`) share identical `runs-on`, `defaults.run.working-directory: ./app`, checkout/setup-node/`npm ci` steps, so none silently runs against the wrong directory or Node version | Static config review | ✅ |
| .github/workflows/ci.yml | The `lint` job's final step runs `npm run lint:check`, and that script exists in `app/package.json` and does not pass `--fix` | Static config review | ✅ |
| .github/workflows/ci.yml | The `test` job's final step runs `npm run test:unit -- --run`, avoiding implicit `CI`-env watch-mode detection | Static config review | ✅ |
| .github/workflows/ci.yml | The `build` job's final step runs `npm run build`, the existing script (type-check + `vite build`) | Static config review | ✅ |
| .github/workflows/ci.yml | `concurrency.group` is keyed by PR number with `cancel-in-progress: true`; `permissions` is `contents: read` only (no `pages`/`id-token`, matching the read-only, non-deploying intent) | Static config review | ✅ |

## Untested Areas

- **The workflow's actual behavior when run by GitHub Actions** —
  parallel execution of the three jobs, each job reporting its own named PR
  status check ("Lint" / "Unit Tests" / "Build"), the `pull_request` trigger
  actually firing on PR open/synchronize/reopen against `main`, and the
  `concurrency` group correctly cancelling a superseded in-progress run when
  new commits are pushed to a PR — none of this can be executed or observed
  from a local shell or from Vitest. This is inherent to testing CI/CD
  configuration locally, not a gap chosen to be skipped: it can only be
  confirmed by opening a real pull request against `main` and watching the
  checks appear and run in the GitHub Actions UI. This manual verification
  is recommended once this ticket's PR is opened, and again after any future
  change to `ci.yml`.
- **Branch protection enforcement** — whether a red "Lint"/"Unit Tests"/
  "Build" check actually blocks merging depends on a GitHub repository
  branch-protection setting for `main` (selecting the three checks as
  required), which is a repository-settings change outside this workflow
  file's and this ticket's scope (flagged as an Open Question in the
  architecture concept).
- **`deploy.yml` regression** — this ticket does not modify
  `.github/workflows/deploy.yml`; its behavior is unchanged and is not
  re-verified here.
