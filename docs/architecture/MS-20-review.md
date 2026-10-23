---
type: AI Review
title: Review for Redesign Onepager
description: Round 5 positive — user review R6 (one continuous axis ::before line, dot stacked above it via z-index and placed by margin-top) removes the timeline gap in hidden, fly-in and reduced-motion states on desktop and mobile; tests, lint and build pass.
tags: [MS-20, review]
timestamp: 2026-10-23T10:13:00+07:00
verdict: positive
---

## Round 1 — 2026-10-23T08:31:32+07:00

### Scope

- Concept `MS-20-redesign-onepager.md` (status approved, D1–D15, resolved open questions:
  no X chip, no contact info card, no carousel arrows, Material Web kept, no dark theme;
  D10 opaque mobile panel, D12 32px card gap), test concept `MS-20-tests.md`, design copy
  `docs/design/MS-20-1/` (README, HTML, tokens).
- Uncommitted working tree against `main` (`git status`, `git diff main`, untracked files):
  router, `seo.ts`, `index.html`, `main.ts`, `App.vue`, `LandingPage`, legal pages,
  `AppNavigation`, `AppFooter`, `ProjectCard`, `TimelineEntry`, `ContactForm`, the four
  section components, `useSectionNavigation`, `useActiveSection`, new icons,
  `variables.css`, `base.css`, `fonts.css`, `data/timeline.ts`, i18n, deletions (views,
  `ContactInformation`, `Md*Button`, `tagColor`, chevron/location icons, `bg_image*`), and
  the docs (`stack.md`, `seo.md`, `index.md`, `log.md`).
- All new and changed specs in `app/src/__tests__/` (router, composables, LandingPage, App,
  AppNavigation, sections, ProjectCard, TimelineEntry, legal pages, timeline, seo/index.html,
  base styles, icons, projects).
- Self-hosted Inter font: `app/src/assets/fonts/inter-latin-wght-normal.woff2` + `OFL.txt`.
- Checks in `app/`: `npm run test:unit -- --run` (23 files, 1106/1106 passed),
  `npm run lint:check` (clean), `npm run build` (type-check and Vite build pass; the woff2 is
  emitted as a hashed asset).

Verified without findings:

- Routes, `meta.section`, `home` rename, unchanged legal routes and MS-16 redirects (D1);
  `LandingPage` instance reuse across section routes, so MS-17 logo and MS-18 title do not
  restart (AC-5).
- `scrollToSection`, `goToSection` (modified/non-primary/prevented clicks, duplicated
  navigation fallback), `sectionHref` (D2, D4); `useActiveSection` band, default, disconnect,
  no-IO guard (D3).
- One `main` per view, header outside `main`, one `h1`, `aria-labelledby` sections (D6).
- App bar, active state from the prop only, mobile menu (`aria-controls`, Escape with focus
  return, closes on route change and link click, opaque absolute panel without
  `backdrop-filter`) (D9, D10).
- Tokens: every `var(--…)` used in `app/src` is defined; removed names are gone; `--nav-height`
  80/72px, container 1312px (D8). `base.css` `.section`, `.card`, focus ring, reduced motion
  (D11).
- `ProjectCard` glass card, grid, carousel without arrows, shared `sizes`, positional tag
  colours, filled/outlined links; 32px card gap on all viewports (D12).
- About profile chips (no X chip), `latestTimelineEntries` (3 newest) with `h3` employers and
  fade connector; contact form ids, "du" strings, Formspree logic unchanged (D13, D14, AC-6).
- SEO: `pageMetadata` `{ home, imprint, privacy }`, root canonical and `og:url` on section
  routes, `index.html` in sync with `pageMetadata.home`, OG/Twitter tags, `theme-color`,
  JSON-LD `@graph` (D15, AC-4).
- Inter licence: `OFL.txt` is byte-identical to upstream `rsms/inter` `LICENSE.txt`
  (copyright line + full SIL OFL 1.1); `fonts.css` references it; `stack.md` documents it.
  The woff2 `name` table carries the copyright (ID 0) and the licence URL (ID 14), so the
  deployed font keeps its notice in machine-readable metadata as OFL §2 allows. Inter has no
  Reserved Font Name, so the Latin subset needs no rename. No Google Fonts request, so the
  privacy page needs no addition.

### Findings

1. **Saved-position and legal-page scrolls run smoothly over the page** — minor; owner:
   **architect** (D2 prescribes the code), then developer and tester.
   `app/src/router/index.ts` `scrollBehavior` returns `savedPosition` and `{ top: 0 }`
   without a `behavior`. Vue Router 4.6 passes them to `window.scrollTo(position)`, so the
   behaviour is `auto` and follows `html { scroll-behavior: smooth }` from `base.css`. This
   gives three visible smooth runs that D2 wants to avoid ("a smooth run over the whole page
   on load is pointless"):
   - Reload of a section URL after scrolling: `history.state.scroll` is the saved position
     on the first navigation, so the page animates from the top down to it.
   - Browser back from `/imprint` or `/privacy` to the onepage: `LandingPage` mounts at the
     top and animates down to the saved position.
   - Footer link to `/imprint` or `/privacy` from far down the onepage: the scroll is clamped
     to the new, shorter page and then animates up to `{ top: 0 }`.

   Suggested fix: return `{ ...savedPosition, behavior: 'instant' }` when the navigation is
   the first one or crosses between the onepage and a legal page, keep CSS smooth only for
   back/forward within the onepage, and return `{ top: 0, behavior: 'instant' }` for legal
   pages. The `scrollBehavior` tests in `router.spec.ts` ("restores a saved position",
   "starts the imprint/privacy page at the top") currently assert the position without
   `behavior` and should then check it.

Non-blocking observation (no action required): the deployed site ships the woff2 without
`OFL.txt` and relies on the font's embedded copyright and licence URL. That is the common
practice and fits OFL §2. Copying `OFL.txt` into `app/public/` would also ship the full text.

### Verdict

findings

## Round 2 — 2026-10-23T08:36:17+07:00

### Scope

- Full current working tree against `main`, including untracked files. Files changed since
  round 1: `app/src/router/index.ts`, `app/src/assets/styles/fonts.css`, the new
  `app/public/fonts/Inter-OFL.txt` (and the removed `app/src/assets/fonts/OFL.txt`),
  `app/src/__tests__/router.spec.ts`, `app/src/__tests__/baseStyles.spec.ts`, and the docs
  `MS-20-redesign-onepager.md` (D2, D8), `MS-20-tests.md`, `stack.md`, `log.md`.
- Checks in `app/`: `npm run test:unit -- --run` (23 files, 1129/1129 passed),
  `npm run lint:check` (clean), `npm run build` (type-check and build pass;
  `dist/fonts/Inter-OFL.txt` is emitted next to the hashed woff2).

Round 1 finding 1 is resolved:

- `scrollBehavior` now computes `behavior` once: `'auto'` only when both `to` and `from` are
  section routes, otherwise `'instant'`. It returns `{ ...savedPosition, behavior }`, scrolls
  sections via `scrollToSection(…, behavior)` and returns `{ top: 0, behavior: 'instant' }` for
  the legal pages. This matches the revised D2 code block. A reload (`START_LOCATION`, no
  `meta.section`), back from a legal page and a footer link to a legal page now jump; only
  back/forward and clicks within the onepage follow CSS smooth (or `auto` under reduced
  motion, D11).
- `router.spec.ts` asserts the `behavior` on every path: saved positions within the onepage
  (`'auto'`) and across pages or on first load (`'instant'`), section and home scrolls per
  origin, and legal pages `{ top: 0, behavior: 'instant' }`.
- Licence: `app/public/fonts/Inter-OFL.txt` is byte-identical to upstream `rsms/inter`
  `LICENSE.txt`, is the single copy, is shipped with the deployed site, and is referenced from
  `fonts.css`, `stack.md` and concept D8. `baseStyles.spec.ts` checks the file exists, the old
  copy is gone and `fonts.css` points to it.

No other code changed since round 1; the round 1 verification of the rest still holds.

### Findings

None.

### Verdict

positive

## Round 3 — 2026-10-23T09:39:44+07:00

### Scope

- Concept: `MS-20-redesign-onepager.md`, section "User Review Round 1 (2026-10-23)" (R1–R4)
  and the D-table update for `--container-max-width`. Testing concept: `MS-20-tests.md`
  (R1–R4 bullets, coverage rows, manual checks 8–11).
- Code (uncommitted, against `main`): `variables.css` (`--container-max-width: 1180px`,
  `--gradient-brand-mark`), `AppNavigation.vue` (brand mark tile, `.nav-container`),
  `AppFooter.vue` (`.footer-container`), `ProjectCard.vue` (`IMAGE_SIZES`),
  `TimelineEntry.vue` (fly-in on dot and card, reduced motion), `sections/AboutSection.vue`
  (`--delay`), unchanged `useTimelineAnimation`.
- Tests: `AppNavigation.spec.ts`, new `AppFooter.spec.ts`, `baseStyles.spec.ts`,
  `ProjectCard.spec.ts`, `TimelineEntry.spec.ts`, `AboutSection.spec.ts`.
- Checks in `app/`: `npm run test:unit -- --run` (24 files, 1156/1156 passed),
  `npm run lint:check` (clean), `npm run build` (type-check and build pass).

Verification:

- **R1.** `--container-max-width` is 1180px and is the only width token; `.section__inner`
  uses it. `IMAGE_SIZES` matches the concept: 1244px = 1180 + 2 × 32 is the right breakpoint,
  and the desktop cap (1180 − 72 − 2 − 48) × 5/12 × 0.84 ≈ 370.3 rounds up to 371px. Mobile is
  unchanged.
- **R2.** The markup is the same as on `main` (`span.brand__mark[aria-hidden]` with
  `/logo_simple_white.svg`, `alt=""`), and no `/logo.svg` is left in the header. Tile 48px/8px,
  mobile 40px/6px, `--radius-md`, `flex-shrink: 0`, image `object-fit: contain`.
  `--gradient-brand-mark` has the old `--gradient-brand` value, and no plain
  `--gradient-brand` is left.
- **R3.** `.timeline-entry` and `--visible` set no opacity/transform/transition. Only
  `.timeline-entry__dot` and `.timeline-entry__card` start at `opacity: 0; translateY(30px)`
  and use a 0.6s ease-out transition after `var(--delay, 0s)`. The reduced-motion block makes
  both visible with no transition. `AboutSection` sets `--delay` to index × 0.15s on each
  entry. The observer is unchanged (threshold 0.2, `-50px` bottom margin, once per entry).
  The axis lines and the dashed fade are static.
- **R4.** `.nav-container` and `.footer-container` use
  `max-width: calc(var(--container-max-width) + 2 * var(--page-padding-inline))` with the
  page padding token inside, so their content box is 1180px, the same as `.section__inner`
  (global `border-box`). The mobile nav padding `0 16px 0 var(--page-padding-inline)` and the
  mobile footer padding `var(--spacing-lg)` (= 24px = mobile token) match the concept. The
  left edges line up at every width.
- **Regressions.** None found. Menu button, mobile drawer, brand typing animation, footer
  links and the other sections are unchanged apart from the container rules above.
- **Tests.** The source-level checks are specific (exact declarations scoped to the rule and
  to the desktop or mobile block). The R3 component tests check the stagger values, that no
  entry is visible before the observer fires, and that only the intersecting entry turns
  visible. The R4 source tests go beyond the concept, which planned none; this is
  documented in the testing concept. The visual alignment is left to manual checks 8–11, as
  the concept says.

Note (not a finding): while a dot is hidden, its 20px slot leaves a short gap in the
otherwise static axis line until the dot flies in. This follows from "cards + dots animated"
and is visible in manual check 11.

### Findings

None.

### Verdict

positive

## Round 4 — 2026-10-23T09:58:30+07:00

### Scope

- Concept: `MS-20-redesign-onepager.md`, section "User Review Round 2 (2026-10-23)" (R5, D2
  last bullet superseded), Data Flow "Manual scroll (R5)". Testing concept: `MS-20-tests.md`
  (R5 bullets, coverage rows, manual check 13).
- Code (uncommitted, against `main`): new `app/src/composables/useSectionUrlSync.ts`,
  `app/src/views/LandingPage.vue` (`useSectionUrlSync(activeSection)`),
  `app/src/router/index.ts` (`consumeSilentSectionSync` as first `scrollBehavior` line).
- Tests: new `useSectionUrlSync.spec.ts`, `router.spec.ts` ("silent URL sync"),
  `LandingPage.spec.ts` (R5 wiring).
- Library behaviour checked in `node_modules/vue-router` 4.6.4 (`pushWithRedirect`,
  `finalizeNavigation`, `handleScroll`).
- Checks in `app/`: `npm run test:unit -- --run` (25 files, 1195/1195 passed),
  `npm run lint:check` (clean), `npm run build` (type-check and build pass).

Verification:

- **Matches the concept.** Code is the Interfaces block verbatim: 150 ms debounce on a passive
  `window` `scroll` listener, `beforeEach(() => clearTimer())`, no-op on non-section routes or
  equal section, one-shot module marker, reset on navigation failure, full cleanup on unmount.
- **User's bug.** After a click on "Kontakt" the smooth scroll's `scroll` events keep
  restarting the timer; at idle the spy and the route both say `contact` → no-op. Scrolling
  back up: the hero (`min-height: max(560px, 100svh - nav)`) covers the 40% band at
  `scrollY = 0`, so the spy reports `home`, and 150 ms later `replace({ name: 'home' })` makes the
  URL `#/` without a history entry and without a scroll. A reload of `#/` is a first navigation
  → `scrollToSection('home', 'instant')` → top. `.section` has `min-height: 100vh`, so the
  last section (`contact`) can reach the band at the bottom, and a click on "Kontakt" is
  not rewritten to `#/about`. Fixed.
- **No marker leak.** The marker is only set in `replaceSectionSilently`, right before
  `router.replace`. On success `finalizeNavigation` always calls `handleScroll` →
  `scrollBehavior` (browser + option present), which clears it. On cancel/abort no
  `scrollBehavior` runs, and the reset on `isNavigationFailure` clears it. The only remaining
  path is a thrown guard error (rejected promise); the app has no guards that throw
  (only the composable's own `beforeEach`), so this cannot happen today.
- **Note (b), click on the target of a pending silent replace.** The tester is right that in
  this case the click consumes the marker and does not scroll. It cannot happen in a browser:
  the replace starts in the timer task and runs to `scrollBehavior` only in microtasks
  (sync guards, eager `LandingPage`, `nextTick`). A click is a separate task, so it cannot
  run between setting and consuming the marker. The overtaking test (different target)
  shows the cancel/reset path. Not a finding.
- **Note (a), duplicated navigation.** Confirmed: 4.6.4 calls `handleScroll(from, from, true,
  false)` for a duplicate. `scrollBehavior` then runs `scrollToSection(current, 'auto')`, and
  D4's fallback calls `scrollToSection(id, 'auto')` with the same id, in the same microtask
  burst. Two smooth `scrollIntoView` calls to the same target merge into one animation, so
  nothing visible changes. The fallback is redundant with this router version but harmless,
  and it stays as a guard against other router versions. A duplicate skips `beforeEach`, so a
  pending sync timer is not cleared. That is fine: the scroll it starts restarts the timer,
  and at idle the spy equals the route → no-op (also with reduced motion: one instant scroll
  event, then the same no-op). A duplicate cannot consume a marker (see (b)).
- **Back/forward.** A pop calls `beforeEach` (timer cleared) and `scrollBehavior` with a
  saved position and no marker → normal scroll. A synced entry is rewritten in place, and
  Vue Router's `replace` keeps `back`/`forward`/`position` in the state. The next push saves
  the scroll position into the rewritten entry, so going back restores where the user was.
- **Imprint/privacy.** Leaving: `beforeEach` clears the timer, then unmount removes the
  listener and the guard. On a legal page `replaceSectionSilently` returns early (no
  `meta.section`). Coming back via the nav: the `'instant'` jump is followed by an idle no-op.
- **Initial deep link.** `history.scrollRestoration = 'manual'` (set by Vue Router), so
  only the `'instant'` jump scrolls; the spy has reported the target well before 150 ms →
  no-op. The default `'home'` cannot overwrite the URL, because nothing syncs without a
  `scroll` event (tested).
- **SEO.** Each silent replace runs `afterEach` → `updatePageMetadata(home, '/')`. This is
  the same metadata as before and runs at most once per scroll stop.
- **Tests.** They exercise the real logic: fake timers drive the window, `replace` and
  `push` spies, an active section read at the end of the window, no sync without `scroll`,
  cancel by navigation, unmount cleanup including guard removal, and the marker life cycle
  incl. abort and overtake. The router-level tests use the real `scrollBehavior`
  (`scrollIntoView`/`scrollTo` not called; the next push scrolls again). The `LandingPage`
  test wires the real spy into the sync. The user-visible flow (scroll back up, reload)
  remains manual check 13, as planned.

### Findings

None.

### Verdict

positive

## Round 5 — 2026-10-23T10:13:00+07:00

### Scope

User review round 3, fix R6 (concept section "User Review Round 3 (2026-10-23)"):
`app/src/components/TimelineEntry.vue` (template and scoped CSS), the connector
`.timeline__fade-line` in `app/src/components/sections/AboutSection.vue`, the z-index tokens and
the sticky app bar (`AppNavigation.vue`), `app/src/__tests__/TimelineEntry.spec.ts` and the R6
part of `docs/architecture/MS-20-tests.md`. Checks: `npm run test:unit -- --run` (25 files,
1205 tests passed), `npm run lint:check` (clean), `npm run build` (ok).

### Analysis

- **Concept match.** The axis contains only the dot; both line spans and all
  `.timeline-entry__line*` rules are gone. Axis `position: relative`; `::before` with
  `content: ''`, absolute, `top: 0; bottom: 0; left: calc(50% - 1px); width: 2px;
  background: var(--color-primary-container)`, no opacity/transform/transition. Dot
  `position: relative; z-index: 1; margin-top: 28px`, first-child `60px`; size, border, surface
  fill and the R3 fly-in are unchanged.
- **Gap in every state.** The line no longer depends on the dot's flex slot: it covers the full
  axis height, and the axis is stretched to the grid row (default `align-items: stretch`, no
  explicit height). Hidden dot (`opacity: 0`) → line fully visible. Flying in
  (`translateY(30px)`, partly transparent) → the line shows through the translucent ring and
  wherever the ring is not yet; `translateY` does not affect layout, so the line is not
  shortened. Visible → the surface fill hides the line inside the ring, as designed. Reduced
  motion: dot visible at once, line static.
- **Dot position.** `margin-top` 28px / 60px equals the former top-segment heights, and
  `align-items: center` centres it horizontally → same place as before. The translated dot
  (28+30+20 = 78px max) stays inside even the shortest entry (card + padding-bottom).
- **Joins.** Consecutive `<li>` have no margin (`.timeline__list` margin/padding 0), each line runs
  0 → entry bottom, so they meet without a seam. The connector (`width: 0; border-left: 2px`,
  `justify-self: center`) starts directly below the last entry at x = 23px in the 48px column
  (11px in the 24px mobile column), identical to `calc(50% - 1px)` in both widths → seamless.
- **Stacking.** The dot's `z-index: 1` puts it above the positioned `::before` in every phase
  (the transform/opacity stacking context during the fly-in does not change its z-index). It
  cannot paint over the app bar: the sticky nav uses `--z-sticky` (1020) and the mobile menu
  sits inside it; no other z-index exists in `app/src`. The card lives in another grid column
  and does not overlap the axis. Only the card's soft shadow (`0 10px 30px`, alpha 0.12) can
  reach the line; with reduced motion the card is not a stacking context, so the positioned
  line now paints over that faint shadow instead of under it — invisible in practice, not a
  finding.
- **Tests.** The component tests check that the axis holds exactly the dot and that no line
  element exists; the source-level block checks every concept property (containing block,
  pseudo-element, full height, whole-pixel centring, colour, no animation on any axis rule
  incl. the mobile one, dot stacking and both margins). These fail on a regression to
  segments or an animated/shortened line. The visual seam stays manual check 14, as planned.

### Findings

None.

### Verdict

positive
