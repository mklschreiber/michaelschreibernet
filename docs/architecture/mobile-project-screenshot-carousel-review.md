---
type: AI Review
title: Review for Scaling but on mobile phones (project page)
description: Round 2 is positive. The card title now wraps inside the card at 280-1024px, and the project card no longer causes horizontal page overflow at any measured width.
tags: [mobile-project-screenshot-carousel, review]
timestamp: 2026-09-23T07:45:00+02:00
verdict: positive
---

## Round 1 — 2026-09-23T07:20:00+02:00

### Scope

- Trello card: https://trello.com/c/Ha7XlAGu/13-scaling-but-on-mobile-phones-project-page
  (AC-1: on small devices, show one picture at a time to fix scaling; AC-2:
  add navigation arrows like the ones in the picture detail view).
- Architecture concept `mobile-project-screenshot-carousel.md` (status: draft)
  and test concept `mobile-project-screenshot-carousel-tests.md`.
- Uncommitted changes on `bug/scaling-but-on-mobile-phones-project-page`:
  - `app/src/components/ProjectCard.vue` and `app/src/views/ProjectOverviewPage.vue`
  - the new `app/src/components/icons/IconChevronLeft.vue` and `IconChevronRight.vue`
  - `app/src/i18n/types.ts`, `app/src/i18n/locales/de.ts`, and `app/src/i18n/locales/en.ts`
  - `app/src/__tests__/ProjectCard.spec.ts` and `app/src/__tests__/icons.spec.ts`
- Gates run from `app/`:
  - `npm run lint:check` passed. I used the non-fixing variant so the review
    would not change any files.
  - `npx vitest run` passed: 13 files, 105 tests.
  - `npm run build` passed, including `vue-tsc`.
- Real layout check: I ran the production build (`vite preview`) and measured
  `/#/projects` in headless Chrome through CDP, with mobile emulation at 2x
  DPR. Widths: 280, 300, 320, 360, 390, 414, 768, 800, and 1024px. At each
  width I recorded:
  - the document `scrollWidth` compared with the viewport width
  - the card width compared with the navigation header width
  - how many screenshots are visible
  - the computed `display` of the arrows
  - how far the `h2` text reaches

### Verification Summary

- **The root cause is removed.** The concept's diagnosis is correct. `1fr`
  becomes `minmax(auto, 1fr)`, and the gallery row's min-content width of
  `n × 220px + gaps` fed the width of the grid track. Two changes break that
  chain, each on its own:
  - `min-width: 0` on `.project-card`
  - `minmax(0, 1fr)` on `.projects-grid`

  The measurements confirm the fix. At 320, 360, 390, 414, and 768px the
  document `scrollWidth` equals the viewport width, and each card is
  viewport − 64px wide (for example, 296px at 360px). Only one screenshot
  has a computed `display` other than `none`, and both arrows are shown.
- **Hidden images and scroll rules add no width.**
  - Hidden images are `display: none`, so they add nothing to the
    min-content width.
  - Inside the media query, the active image is `flex: 1 1 100%;
    min-width: 0`, and the row is `overflow: hidden` with snapping off.
  - At 800px (desktop row, three images at 220px min width) the row scrolls
    inside the card with no page overflow (`scrollWidth` 800 = viewport).
    At 1024px the desktop row is unchanged, with 3 and 2 images visible.
- **The tags row, description, and link cannot overflow.** `.technologies`
  wraps, and the description and link text have break opportunities. No
  element box extends past the card at any measured width. The one exception
  is the title's text run (Finding 1).
- **The `sizes` math is correct.** On mobile, `.content` padding stays at 32px
  per side because `ProjectOverviewPage.vue` has no mobile override. The card
  adds 32px padding plus a 1px border per side. The real content box is
  therefore 100vw − 130px, and the `sizes` value `calc(100vw - 128px)` is 2px
  wider. That is harmless.
- **The arrows resemble the lightbox's.** I checked `vue-easy-lightbox`'s
  shipped CSS. Its arrows are:
  - white (`#fff`)
  - `opacity: .6`, rising to `1` on hover
  - vertically centered with `top: 50%` and `translateY(-50%)`
  - offset `4px` from the edge at `max-width: 750px`
  - animated with a `.15s` transition

  The card's `.gallery-nav` copies every one of these values, plus a
  `rgba(0,0,0,.5)` circular backdrop. That is the lightbox's mask color, and
  the concept justifies it for readability on light screenshots. The arrows
  use the Material chevrons, which are close to the lightbox's chevron icons.
- **The arrows center on the image.** `top: 50%` resolves against
  `.project-gallery`. On mobile the only in-flow child of the gallery is the
  image row: the row's `padding-bottom` is set to 0, and the status `<p>` is
  `position: absolute`.
- **The lightbox opens at the right image and arrows don't open it.** The
  lightbox opens at `index === currentIndex` because only the active image
  can be clicked. The arrows are siblings of the image row, not children of
  the images, so clicking one does not open the lightbox.
- **Concept conformance.** Everything matches the concept:
  - script: `MOBILE_BREAKPOINT = 768`, `currentIndex`/`imageCount`, and the
    wrap-around `showPrevious`/`showNext`
  - markup and DOM order: prev → row → next → status
  - `v-if="imageCount > 1"`
  - the i18n keys and texts, the icon paths, and the icon contract
  - CSS: the rules match the D4 table and the D7 visually-hidden recipe
- **Test coverage matches the test concept.** Every case in the table exists
  and fails without the fix:
  - wrap-around in both directions
  - the lightbox index after navigating
  - the arrows not opening the lightbox
  - the single-image and no-image branches
  - the exact `sizes` string
  - the source-level CSS contract, including the `minmax(0, 1fr)`
    assertion on `ProjectOverviewPage.vue`

  The source tests pin the declarations that fix the overflow, which is the
  right level for jsdom.
- **Minor, harmless detail.** `.project-card p`, the higher-specificity
  selector, also matches `.gallery-status`, so it gets
  `margin-bottom: var(--spacing-lg)`. The status is absolutely positioned,
  so this does not affect layout.

### Findings

1. **Low: the unbreakable card title still overflows on the narrowest phones.**
   Responsible role: developer. Affected: `app/src/components/ProjectCard.vue`,
   the `.project-card h2` rule.

   The second card's title is "michaelschreiber.net". It is set at 24px
   semibold, and a line cannot break at the `.` between letters (UAX #14
   rule LB29). Its text run is about 235px wide no matter the viewport.
   Measured:

   | Viewport | Card content box | Title text right edge | Card right border | Document `scrollWidth` |
   |---|---|---|---|---|
   | 360px | 230px | 300px (inside the 32px padding) | 328px | 360px (OK) |
   | 320px | 190px | 300px | 288px | 320px |
   | 300px | 170px | 300px | 268px | 301px |
   | 280px | 150px | 300px | 248px | 301px |

   The effects:
   - At 360px the text only reaches into the card padding (300px, well inside
     the 328px border), so there is no page overflow.
   - At 320px (for example, iPhone SE 1st gen and small Androids) the text
     sticks out 12px past the card's right border, over the card edge.
   - Below 301px (for example, Galaxy Fold folded at 280px) the document
     scrolls horizontally again. That is the same symptom the card reports.

   Neither the concept nor the implementation addresses long unbreakable text
   inside the card, even though the brief called it out. AC-1 asks that cards
   fit the screen on phones. The screenshot fix does that, but the title still
   breaks the card's edge at the narrow end.

   Suggested direction, for the developer to decide: add
   `overflow-wrap: anywhere` (or `word-break: break-word`) to
   `.project-card h2`. You could also reduce the font size inside the
   768px query. After the fix, check again at 280 and 320px.

   Test impact (tester): an automated layout test is not possible in jsdom. If
   a rule is added, a raw-source assertion on `.project-card h2`, like the
   existing ones, would pin it. The manual widths in the test concept's
   Untested Areas list should include 320px and 280px.

### Verdict

findings

## Round 2 — 2026-09-23T07:45:00+02:00

### Scope

- Fix for Round 1 Finding 1:
  - `overflow-wrap: anywhere;` added to `.project-card h2` in
    `app/src/components/ProjectCard.vue`
  - a new raw-source test in `app/src/__tests__/ProjectCard.spec.ts`
    ("lets long unbreakable card titles wrap instead of widening the card")
  - the manual checklist in `mobile-project-screenshot-carousel-tests.md`
    now covers 280px and 320px, including the title check
- Gates run from `app/`:
  - `npm run lint:check` passed.
  - `npx vitest run` passed: 13 files, 106 tests (up from 105).
  - `npm run build` passed, including `vue-tsc`.
- Real layout re-check: I ran the production build (`vite preview`) and
  measured it in headless Chrome through CDP, with mobile emulation at 2x
  DPR. Widths: 280, 300, 320, 360, 768, and 1024px. I measured:
  - how many lines the title's text run takes
  - the right edge of the title text compared with the card border
  - `scrollWidth` compared with the viewport width
  - which elements extend past the viewport

### Verification

- **The title now wraps inside the card.** Measured for "michaelschreiber.net":

  | Viewport | Title lines | Title text right edge | Card right border | `h2` scrollWidth = clientWidth |
  |---|---|---|---|---|
  | 280px | 2 | 202px | 248px | 150 = 150 |
  | 300px | 2 | 222px | 268px | 170 = 170 |
  | 320px | 2 | 250px | 288px | 190 = 190 |
  | 360px | 2 | 291px | 328px | 230 = 230 |
  | 768px | 1 | 300px | 736px | yes |
  | 1024px | 1 | 300px | 992px | yes |

  - No element inside either project card extends past the card at any
    measured width.
  - At 320, 360, 768, and 1024px the document `scrollWidth` equals the
    viewport width.
  - The Round 1 behavior still holds: one screenshot with arrows at 768px or
    less, and the unchanged multi-image row at 1024px.
- **Wrapping at 360px is expected.** At 360px the title's 235px text run
  doesn't fit the 230px content box, so it now breaks inside the word instead
  of running into the card padding. This is the expected trade-off of
  `overflow-wrap: anywhere` and has no effect at 390px or wider.
  `overflow-wrap: anywhere` also lowers the `h2`'s min-content contribution.
  That doesn't matter here because `.project-card` already has
  `min-width: 0`.
- **The test pins the fix.** It asserts the declaration inside the
  `.project-card h2` rule body, so it fails if the rule is removed.
- **Correction to Round 1.** At 280 and 300px the document `scrollWidth` is
  still 301px. I traced it with an element and text-node sweep:
  - The overflow comes only from `AppNavigation.vue`'s `.hamburger` button
    and its `.bar` spans, whose right edge is at 301px.
  - The project page content no longer contributes anything.
  - The same 301px nav overflow appears on `/#/` (Landing), and `/#/about`
    and `/#/contact` overflow further at those widths (for example,
    `.timeline-entry__card` reaches 337px and `.contact-info` 346px).

  Round 1 blamed the title for the whole residual 301px at that width.
  In fact, the title pushed its own text to 300px, and the navigation causes
  the 1px page overflow. It was never part of this ticket's project-card
  scope. `AppNavigation.vue` is untouched by this change.

### Findings

None.

Non-blocking note for the coordinator, out of scope for this ticket: below
about 301px (for example, Galaxy Fold folded at 280px) the whole site still
scrolls sideways. The cause is the navigation hamburger, plus the About and
Contact page content. This predates the ticket and does not come from the
project card. If ultra-narrow devices matter, consider a separate ticket.

### Verdict

positive
