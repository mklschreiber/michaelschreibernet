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
- [Relaxed Ticket Naming and Description-Based Workflow Log](msnet-wf-0003-relaxed-tickets-and-description-log.md) —
  drops the mandatory `MSNET-XXXX:` card-naming/template convention
  project-wide and moves all `[msnet-workflow]` log entries from Trello
  comments to the card description, since the connected Trello MCP tools
  have no comment-write action.
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
- [Minor Changes — Profile Card Links, Contact Email, Avatar, Flat Icons](minor-changes.md) —
  adds LinkedIn and GitHub links, standardizes the public contact email on
  `info@michaelschreiber.net`, replaces the About page's text-initials avatar
  with the supplied profile photo, replaces emoji link icons with four new
  solid-fill flat SVG icon components under `components/icons/`, and (Round 2)
  turns the phone number and email address in Impressum, Kontakt, and Profil
  into clickable `tel:`/`mailto:` links.
- [Tests for Minor Changes](minor-changes-tests.md) — records the
  `AboutPage.vue` business-card coverage for the new LinkedIn/GitHub links,
  the corrected email, and the photo avatar, plus the four new icon
  components' shared render contract, and (Round 2) first-time coverage for
  `ImpressumPage.vue`, `DataProtectionPage.vue`, and `ContactInformation.vue`
  asserting their new `tel:`/`mailto:` links.
- [Styling Improvements — Imprint and Data Protection Header/Card
  Alignment](styling-improvements.md) — aligns `ImpressumPage.vue`'s and
  `DataProtectionPage.vue`'s `.content h1` page headers with the
  gradient-text heading recipe already used by `ContactPage.vue` and
  `ProjectOverviewPage.vue`, and their `.section` content cards with
  `AboutPage.vue`'s bordered, shadowed, gradient-trimmed
  `.about-page__card` recipe. CSS-only change in two view files' `<style
  scoped>` blocks; no new shared component or design token.

## Reviews

<!-- New entries will be added here by the Reviewer Agent -->
<!-- Format: * [Review for Ticket Title](story-id-review.md) - Short description of the latest verdict -->
* [Review for Improve AI Setup](msnet-wf-0002-ai-review-gate-review.md) -
  Round 1: positive — symlinks, the `ai-review` phase enum, SKILL.md step
  renumbering/cross-references, and all index/handbook/CLAUDE.md wiring
  verified correct; one non-blocking wording note left for a future touch of
  `SKILL.md`.
* [Review for Minor Changes](minor-changes-review.md) -
  Round 2: positive — Round 1's five ACs (LinkedIn link, GitHub link,
  consistent `info@michaelschreiber.net` email, circular photo avatar, flat
  SVG icons) and Round 2's clickable `tel:`/`mailto:` links in Impressum,
  Kontakt, and Profil (including the verified `tel:+4915679724718` trunk-
  prefix math and the `DataProtectionPage.vue` drive-by cleanup) all verified
  in code and tests; unit tests, lint, and build all pass.
* [Review for Styling Improvements](styling-improvements-review.md) -
  Round 1: positive — the `.content h1` and `.section`/`.section > *`/
  `.section::before` rules added to `ImpressumPage.vue` and
  `DataProtectionPage.vue` verified byte-for-byte against the
  `ContactPage.vue`/`ProjectOverviewPage.vue` header recipe and
  `AboutPage.vue`'s `.about-page__card` recipe; diff confined to the two
  `<style scoped>` blocks with no template/script fallout; the no-new-tests
  judgment call for this CSS-only change is sound; unit tests (70/70), lint,
  and build all pass. One non-blocking note: this "Current Concepts" entry
  is missing its usual paired "Tests for ..." bullet linking
  `styling-improvements-tests.md`, unlike every other ticket in this index.

When a feature requires a durable architecture decision, add a concise
Markdown concept document here, list it in this section, and record the
decision in [log.md](log.md).
