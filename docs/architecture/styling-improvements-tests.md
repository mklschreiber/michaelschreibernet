---
type: Test Concept
title: Tests for Styling Improvements — Imprint and Data Protection Header/Card Alignment
description: Confirms the CSS-only header/card restyle of ImpressumPage.vue and DataProtectionPage.vue leaves existing behavior-level tests, lint, and the build unaffected; documents why no new Vitest specs were added.
tags: [styling-improvements, tests]
timestamp: 2026-09-19T09:00:00+02:00
---

## Requirements Authority

Trello card: https://trello.com/c/je22FOXk/12-styling-improvements

The Trello card description is canonical for requirements and acceptance
criteria.

## Scope

The change under test is a CSS-only edit, confined to the `<style scoped>`
blocks of `app/src/views/ImpressumPage.vue` and
`app/src/views/DataProtectionPage.vue` (per
`docs/architecture/styling-improvements.md`): the `.content h1` rule adopts
the gradient-text heading recipe used by `ContactPage.vue` /
`ProjectOverviewPage.vue`, and the `.section` rule adopts the bordered/
shadowed/gradient-trim card recipe used by `AboutPage.vue`'s
`.about-page__card`. No template, script, prop, event, composable, router,
or i18n content changed in either file, and no new CSS class names, DOM
elements, or component boundaries were introduced.

This concept covers:

- Regression verification that the existing `ImpressumPage.spec.ts` and
  `DataProtectionPage.spec.ts` component tests still pass unmodified against
  the restyled components.
- Full-suite regression (`npm run test:unit`), lint (`npm run lint`), and
  production build (`npm run build`) from `app/`, to catch any accidental
  template/script fallout from what should be a style-only diff.

This concept explicitly does not cover new component or unit tests for the
restyle itself — see "Untested Areas" for the reasoning.

## Test Cases

| Module | Test Case | Level | Status |
|--------|----------|-------|--------|
| ImpressumPage | renders the phone number as a tel: link with the unchanged display text | Component | ✅ (pre-existing, unmodified, re-run) |
| ImpressumPage | renders the email address as a mailto: link with the unchanged display text | Component | ✅ (pre-existing, unmodified, re-run) |
| DataProtectionPage | renders the responsible-party phone number as a tel: link with the unchanged display text | Component | ✅ (pre-existing, unmodified, re-run) |
| DataProtectionPage | renders the responsible-party email address as a mailto: link with the unchanged display text | Component | ✅ (pre-existing, unmodified, re-run) |
| Full suite | `npm run test:unit` (13 test files, 70 tests) | Unit + Component | ✅ all pass |
| Full suite | `npm run lint` | Static | ✅ no errors, no unrequested file changes |
| Full suite | `npm run build` (type-check + vite build) | Build | ✅ succeeds |

No new `.spec.ts` files were added for this ticket. The diff was verified
directly (`git diff -- app/src/views/ImpressumPage.vue
app/src/views/DataProtectionPage.vue`) to confirm it touches only
`<style scoped>` content — the same DOM structure, classes, and text that
the existing specs already exercise — before relying on those existing
specs as the regression check.

## Untested Areas

**Visual/CSS rendering of the new heading and card styles is not covered by
a new Vitest test, and this is a deliberate choice, not an oversight:**

- jsdom (the environment `npm run test:unit` runs in) does not implement a
  real CSS layout, paint, or cascade engine. It does not compute used
  values for `background-clip: text`, `box-shadow`, `mask-image`, gradient
  rendering, or pseudo-element (`::before`) content in any way that
  reflects what a browser would actually show. A Vitest assertion checking
  `getComputedStyle(...).background` or similar would only verify that
  jsdom parsed the scoped `<style>` string, not that the page looks
  correct — this is a false sense of coverage that would test the CSS
  author's typing accuracy, not the actual acceptance criteria ("styled
  like the other headers/cards").
- The codebase already establishes this convention: the reference
  components this change copies from (`AboutPage.vue`'s
  `.about-page__card`, `ContactPage.vue`'s `.content h1`,
  `ProjectCard.vue`'s `.project-card`, `TimelineEntry.vue`'s
  `.timeline-entry__card`) have no CSS/visual assertions in their own specs
  (`AboutPage.spec.ts`, `ContactInformation.spec.ts`, etc.) — those specs
  test rendered text, emitted events, classes tied to layout *logic* (e.g.
  `timeline-entry--left`/`--right`, which reflect a computed prop, not raw
  CSS), and routing, never raw style declarations. Adding CSS assertions
  here would be inconsistent with how the rest of the suite treats
  presentational styling.
- The four acceptance criteria ("styled like the other headers/cards") are
  inherently a visual-parity judgment best verified by a human comparing
  rendered pages, or by a dedicated visual-regression tool (e.g.
  Playwright + pixel-diff screenshots) if the project adopts one in the
  future. That tooling does not exist in this repository today, and
  introducing it is out of scope for this ticket ("no gold plating," per
  the architecture concept).

**Recommended manual/visual check** (not automatable with the current
Vitest/jsdom setup): open `/impressum` and `/datenschutz` in a browser
alongside `/about`/`/contact`/`/projects`, and confirm by eye that:

- The `<h1>` on Impressum and Datenschutz renders with the same gradient
  fill, weight, and size as the `<h1>` on About/Contact/Projects.
- Each `.section` card on Impressum and Datenschutz shows the same
  rounded corners, drop shadow, and gradient top-trim fade as
  `.about-page__card` on the About page.
- No layout regression (text overflow, overlapping content, broken link
  clickability) is introduced in either legal page, including at the
  768px mobile breakpoint already defined in `DataProtectionPage.vue`.

This is recorded as an explicit exception per the tester workflow rather
than as a gap: the behavior that automated tests can meaningfully assert on
(rendered text, links, DOM structure) was already covered before this
change and remains covered and green; the behavior this change actually
modifies (visual appearance) is outside what Vitest/jsdom can meaningfully
verify.
