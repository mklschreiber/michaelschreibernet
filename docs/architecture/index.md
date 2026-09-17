# Architecture Documentation

This directory holds current, durable architecture concepts for the web
application in `app/`. It is not a history of the removed legacy mobile-project
material.

## Baseline

- [Technology Stack and Tooling](stack.md) — verified Vue 3, TypeScript, Vite,
  test, lint, and deployment baseline.

## Current Concepts

- [Trello-Backed Delivery Workflow](msnet-wf-0001-trello-delivery-workflow.md) —
  makes Trello the authoritative ticket, dependency, and delivery-progress
  system, replacing local ticket files.
- [Animated Landing-Page Logo](animated-logo.md) — defines the self-contained
  SVG drawing sequence and landing-page integration.
- [Tests for Animated Landing-Page Logo](animated-logo-tests.md) — records the
  automated coverage and manual visual check for the SVG animation.
- [Colored Project Tags](colored-tags.md) — defines the deterministic,
  hash-to-hue HSL color derivation for project technology tags in
  `ProjectCard.vue`, keeping backgrounds light and text in the regular font
  color.
- [Tests for Colored Project Tags](colored-tags-tests.md) — records the unit
  coverage for `getTagColor` and the `ProjectCard.vue` badge integration.
- [CI Checks for Pull Requests](improve-ci-cd-setup.md) — defines a new
  `.github/workflows/ci.yml` with independent lint, unit-test, and build jobs
  triggered on pull requests, and a non-mutating `lint:check` npm script so
  the lint job actually gates on violations instead of silently
  auto-fixing them.
- [Tests for CI Checks for Pull Requests](improve-ci-cd-setup-tests.md) —
  records the local re-verification of `lint:check`, `test:unit -- --run`,
  and `build`, plus a static correctness review of the workflow YAML.
- [AI Review Gate](msnet-wf-0002-ai-review-gate.md) — adds a fourth agent
  role, Reviewer, and an independent AI review round between the Tester
  phase and the user's manual review, synchronized with the myStandby
  project's equivalent gate.
- [Tests for AI Review Gate](msnet-wf-0002-ai-review-gate-tests.md) —
  records the static/manual verification approach for this delivery-tooling
  change, since no Vue application code changed.

## Reviews

<!-- New entries will be added here by the Reviewer Agent -->
<!-- Format: * [Review for Ticket Title](story-id-review.md) - Short description of the latest verdict -->
* [Review for Improve AI Setup](msnet-wf-0002-ai-review-gate-review.md) -
  Round 1: positive — symlinks, the `ai-review` phase enum, SKILL.md step
  renumbering/cross-references, and all index/handbook/CLAUDE.md wiring
  verified correct; one non-blocking wording note left for a future touch of
  `SKILL.md`.

When a feature requires a durable architecture decision, add a concise
Markdown concept document here, list it in this section, and record the
decision in [log.md](log.md).
