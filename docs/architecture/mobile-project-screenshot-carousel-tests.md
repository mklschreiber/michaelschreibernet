---
type: Test Concept
title: Tests for Mobile Project Screenshot Carousel (Project Page Scaling Bug)
description: Covers the ProjectCard one-image-at-a-time carousel (active class, looping arrows, localized labels and live status, lightbox index, mobile sizes entry), the CSS overflow fix via raw-source assertions, and the two new chevron icons.
tags: [mobile-project-screenshot-carousel, tests]
timestamp: 2026-09-23T07:10:00+02:00
---

## Requirements Authority

Trello card: https://trello.com/c/Ha7XlAGu/13-scaling-but-on-mobile-phones-project-page

The Trello card description is canonical for requirements and acceptance
criteria. Architecture: [mobile-project-screenshot-carousel.md](mobile-project-screenshot-carousel.md).

- AC-1: Fix the scaling issue by showing only one picture at a time on small
  devices.
- AC-2: Show navigation arrows like the ones in the picture detail view.

## Scope

jsdom does not lay out pages and does not apply scoped SFC styles, so the
tests are split into two levels:

- **Component level** (Vue Test Utils, real `de`/`en` locales): tests the
  Vue behavior that drives the carousel. This covers the
  `project-image--active` class, prev/next navigation with wrap-around,
  conditional rendering of the arrows and status, localized `aria-label`s and
  status text, the lightbox index, and the responsive `sizes` attribute.
- **Source level** (raw SFC through `?raw`, same approach as the existing
  `.tech-badge` check): tests the CSS contract that fixes the overflow and
  shows one image at a time. This covers `min-width: 0` on `.project-card`,
  `minmax(0, 1fr)` on `.projects-grid`, the rules inside
  `@media (max-width: 768px)`, the desktop `display: none` for the arrows and
  status, and the `MOBILE_BREAKPOINT = 768` constant that must stay in sync
  with the media query.
- **Icons**: `IconChevronLeft` and `IconChevronRight` join the existing
  `icons.spec.ts` table (one svg, `viewBox="0 0 24 24"`,
  `fill="currentColor"`, `aria-hidden="true"`).

Not covered by automated tests: real rendering at phone widths, meaning the
card width compared with the header, the absence of horizontal page scroll,
and the arrow appearance. See Untested Areas.

## Test Cases

| Module | Test Case | Level | Status |
|--------|----------|-------|--------|
| ProjectCard | marks only the first image as active initially | Component | ✅ |
| ProjectCard | keeps every image in the DOM so CSS decides what is visible | Component | ✅ |
| ProjectCard | renders a previous and a next native button for multiple images | Component | ✅ |
| ProjectCard | orders the gallery as prev arrow, image row, next arrow, status (tab order, D7) | Component | ✅ |
| ProjectCard | renders chevron icons that are hidden from assistive technology | Component | ✅ |
| ProjectCard | labels the arrows with the German texts | Component | ✅ |
| ProjectCard | labels the arrows with the English texts | Component | ✅ |
| ProjectCard | moves the active image forward on next | Component | ✅ |
| ProjectCard | reaches the last image after two nexts | Component | ✅ |
| ProjectCard | wraps from the last image back to the first on next | Component | ✅ |
| ProjectCard | wraps from the first image to the last on previous | Component | ✅ |
| ProjectCard | moves the active image backward on previous | Component | ✅ |
| ProjectCard | announces the position in a polite live region | Component | ✅ |
| ProjectCard | shows the initial German position status ("Screenshot 1 von 3") | Component | ✅ |
| ProjectCard | updates the German status text after next ("Screenshot 2 von 3") | Component | ✅ |
| ProjectCard | updates the English status text after previous wraps around ("Screenshot 3 of 3") | Component | ✅ |
| ProjectCard | opens the lightbox at the active image when it is clicked | Component | ✅ |
| ProjectCard | opens the lightbox at the active image on Enter | Component | ✅ |
| ProjectCard | does not open the lightbox when an arrow is clicked | Component | ✅ |
| ProjectCard | renders no arrows for a single image | Component | ✅ |
| ProjectCard | renders no position status for a single image | Component | ✅ |
| ProjectCard | marks the only image as active for a single image | Component | ✅ |
| ProjectCard | renders the placeholder without arrows or status for a project without images | Component | ✅ |
| ProjectCard | advertises the mobile content width first, then the unchanged desktop sizes | Component | ✅ |
| ProjectCard | lets the card shrink below its min-content width (`min-width: 0`) | Source | ✅ |
| ProjectCard | lets long unbreakable card titles wrap instead of widening the card (`.project-card h2 { overflow-wrap: anywhere; }`, review round 1) | Source | ✅ |
| ProjectOverviewPage | lets the project grid track shrink (`minmax(0, 1fr)`) | Source | ✅ |
| ProjectCard | hides every non-active image inside the 768px media query | Source | ✅ |
| ProjectCard | drops the 220px image min-width inside the 768px media query | Source | ✅ |
| ProjectCard | hides the arrows and the status outside the media query | Source | ✅ |
| ProjectCard | shows the arrows inside the 768px media query | Source | ✅ |
| ProjectCard | keeps the TypeScript breakpoint in sync with the CSS media query | Source | ✅ |
| IconChevronLeft | flat solid-fill svg contract, `aria-hidden` | Component | ✅ |
| IconChevronRight | flat solid-fill svg contract, `aria-hidden` | Component | ✅ |

Results from `app/`: `npm run test:unit` passed 13 files and 106 tests
(previously 70). The count includes the title-wrap test added after AI
review round 1. `npm run lint` passed, and `npm run build` passed, including
`vue-tsc` type-check.

## Untested Areas

- **Real layout at phone widths (AC-1 end to end).** jsdom has no layout
  engine, so it cannot measure whether the card is wider than the header.
  The source-level tests cover the declarations that break the min-content
  chain. Check the result manually in Chrome DevTools in portrait at 280px,
  320px, 360px, 390px, and 768px. The card must not be wider than the
  navigation header, the page must not scroll horizontally, one image must be
  visible with both arrows, and tapping the image must open the lightbox at
  that image. At 320px and 280px, the "michaelschreiber.net" card title must
  wrap inside the card rather than overflow it (review round 1,
  `overflow-wrap: anywhere`). At
  1024px or wider, the multi-image row must be unchanged. At about 800px, the
  row must scroll inside the card without page overflow.
- **Arrow visuals (AC-2 look).** The white chevron, 0.6/1 opacity, dark
  circular backdrop, and 4px edge offset are cosmetic and only exist inside
  the media query, so they are checked manually rather than pinned
  declaration by declaration. Only `display: inline-flex` is asserted, as the
  switch that makes the arrows appear.
- **i18n key parity.** The repository has no locale key-parity test. Parity
  for the three new keys is enforced at compile time, because both locale
  files are typed as `MessageSchema`, and the type-check in `npm run build`
  passes. The component tests also resolve the new keys from both real
  locale files.
- **Space-key activation and lightbox internals.** These are unchanged,
  pre-existing handlers or third-party behavior. Enter is covered as the
  representative keyboard path.
