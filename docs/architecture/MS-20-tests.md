---
type: Test Concept
title: Tests for Redesign Onepager
description: Covers the section routes, scrollBehavior and canonical URL, the useSectionNavigation and useActiveSection composables, the onepage structure, the app bar with active state and mobile menu, the four section components, ProjectCard, the 3 newest CV entries, the contact form, the index.html SEO sync, the global scroll styles and the user review round 1 changes (content width, brand mark tile, timeline fly-in, header/footer alignment), plus the round 2 URL sync while scrolling (R5) and the round 3 continuous timeline line (R6).
tags: [MS-20, tests]
timestamp: 2026-10-23T10:00:00+02:00
---

## Scope

Tested with Vitest, Vue Test Utils and jsdom. All files are in `app/src/__tests__/`.
Concept: [MS-20-redesign-onepager.md](MS-20-redesign-onepager.md). Design:
[docs/design/MS-20-1/README.md](../design/MS-20-1/README.md).

- **Router (D1, D2, D15).** The real `@/router` is used. The four section routes resolve to
  their name, `meta.section`, `LandingPage` and `pageMetadata.home`. After navigating to a section
  route, the canonical URL and `og:url` are the site root. Imprint and privacy keep their own
  canonical path. `router.options.scrollBehavior` is called directly with resolved routes, so the
  tests do not wait for the router's own scroll tick. After review round 1 (revised D2), every
  case asserts an explicit `behavior`; without one, `window.scrollTo` would follow
  `html { scroll-behavior: smooth }`:
  - a saved position wins. It is restored with `'auto'` between two section routes, and with
    `'instant'` on the first navigation and on every move to or from a legal page;
  - a section route reached from another section route scrolls with `'auto'`;
  - a section route reached on the first load (`START_LOCATION`) or from a legal page scrolls with
    `'instant'`;
  - home scrolls with `window.scrollTo({ top: 0, behavior })`;
  - section targets return `false`;
  - legal pages return `{ top: 0, behavior: 'instant' }`, whatever the source route.
- **Composables (D2, D3, D4).**
  - `useSectionNavigation`: `SECTION_IDS`, `isSectionId`, `scrollToSection` and `sectionHref`
    (`#/projects` under hash history). `goToSection` covers a plain click (push and
    `preventDefault`), modified and non-primary clicks, an already-prevented click, and the
    duplicated-navigation fallback that scrolls the section itself.
  - `useActiveSection`: one observer with the 40% band, observation of the existing sections, the
    active id following intersecting entries only, foreign ids ignored, `disconnect` on unmount,
    and no error without `IntersectionObserver`.
- **Onepage (AC-1, AC-5, D3, D6).**
  - `LandingPage` has one `main` with `home`, `projects`, `about` and `contact` in that order. The
    header is before `main` and outside it. The page has one `h1`, and each section is labelled by
    its own heading.
  - The scroll spy result reaches the header as `aria-current`.
  - With the real router, moving between section routes keeps the same `LandingPage` instance and
    the same animated logo element, so the MS-17 animation does not restart.
  - The old URLs `/projects`, `/about` and `/contact` render the onepage.
  - `App` adds no `main` of its own, on the onepage or on the legal pages.
- **App bar (D9, D10).**
  - Labels: the localized nav label and the menu label.
  - Menu button: `aria-controls`/`id`, `type="button"`, and the menu or close icon.
  - Active state: `is-active` and `aria-current="true"` come only from the `activeSection` prop,
    not from the route.
  - Section links: a link click navigates, and a ctrl-click is left to the browser. The brand goes
    home, and on home it scrolls to the top.
  - Menu closing: Escape closes the menu and returns focus to the menu button. Escape on a closed
    menu and other keys change nothing. The menu also closes on a route change and on a click on
    the current section's link. The keydown listener is removed on unmount.
  - Source level: the mobile panel is opaque (`var(--color-surface)`), has no
    `backdrop-filter`, is absolutely positioned and has top and bottom borders.
- **Sections and components.**
  - `HomeSection`: `h1`, subtitle, logo, and the scroll link to `projects` with its localized name.
  - `ProjectsSection`: title, subtitle, the cards in data order, and at source level the 32px gap
    with no mobile override (D12).
  - `AboutSection`: section, profile card, chip texts, no X chip, `latestTimelineEntries` with
    `h3` employers, and the fade connector.
  - `ContactSection` / `ContactForm`: ids, labels, "du" placeholders, the submit button with its
    icon, and the unchanged Formspree submit, success, error and 5 s timeout behaviour.
  - `ProjectCard` (D12): `article`/`h3`, the labelled carousel group, focusable image buttons, one
    `sizes` constant, the lightbox opened by click, Enter or Space at the right index with 1920px
    images, focus scrolling, no arrows or status, the placeholder, the positional tag colours, and
    filled versus outlined links.
  - `TimelineEntry`: `li`, `h3`, and the axis hidden from assistive technology.
  - Legal pages: the shared header with no current link, links back to the sections, one `main`
    and one `h1`.
- **Data and SEO (AC-4, AC-6, D14, D15).**
  - `LATEST_TIMELINE_ENTRY_COUNT` is 3, and `latestTimelineEntries` holds the 3 newest entries;
    the full CV stays as data. The Daimler TSS Senior date uses an en dash.
  - `pageMetadata` has exactly `home`, `imprint` and `privacy`. `og:url` is upserted, never
    duplicated.
  - `index.html` is parsed from disk. Its title, description, `og:title` and `og:description` are
    in sync with `pageMetadata.home`. The static OG and Twitter tags, `theme-color` and the
    JSON-LD `@graph` (`WebSite` + `Person`) are checked as well.
- **Global styles (AC-2, D8, D11), source level.**
  - `scroll-margin-top: var(--nav-height)`, with `--nav-height` at 80px and 72px on mobile.
  - `html` scrolls smoothly and uses `auto` under reduced motion.
  - The focus ring and the shared `.section` / `.card` classes.
  - Inter is self-hosted with `font-display: swap` and no Google Fonts request. Its licence is
    shipped at `public/fonts/Inter-OFL.txt`.
  - `main.ts` imports the styles in the order fonts, variables, base.

- **User review round 1 (R1–R4).**
  - R1: `--container-max-width` is 1180px, `.section__inner` uses it, and `ProjectCard` gives
    every image the new `sizes` string (`… (max-width: 1244px) calc((100vw - 186px) * 0.35),
    371px`).
  - R2: the header template has `span.brand__mark[aria-hidden]` with
    `img.brand__mark-image[src="/logo_simple_white.svg"][alt=""]` and no `/logo.svg`; the brand
    link holds exactly one image. The `src` is checked in the template source, because Vite
    inlines public assets in the test transform. Tile CSS: 48×48px / 8px padding (mobile
    40×40px / 6px), `--radius-md`, `--gradient-brand-mark`, image `object-fit: contain`.
    `--gradient-brand-mark` keeps the old gradient value, and no plain `--gradient-brand`
    remains.
  - R3: source level, `.timeline-entry`, `.timeline-entry--visible` and the axis set no
    `opacity`/`transform`/`transition`. Dot and card start at `opacity: 0;
    translateY(30px)`, move in with `0.6s ease-out var(--delay, 0s)`, and are in place under
    `.timeline-entry--visible`. Under reduced motion they are visible with no transition.
    Component level, `AboutSection` sets `--delay` to `0s`, `0.15s` and `0.3s`. No entry is
    visible before the observer reports, and only the intersecting entry turns visible.
  - R4: source level, `.nav-container` and `.footer-container` have `max-width:
    calc(var(--container-max-width) + 2 * var(--page-padding-inline))` and horizontal padding
    `var(--page-padding-inline)`. On mobile the nav keeps `0 16px 0 var(--page-padding-inline)`
    and the footer keeps `var(--spacing-lg)`. `--page-padding-inline` is 32px, and 24px on
    mobile. The R4 concept planned no unit test; these cheap source checks guard the box-model
    contract. The actual alignment is still a manual check.

- **User review round 2 (R5, the URL follows scrolling).**
  - `useSectionUrlSync` (composable level, harness with a plain `ref` as active section,
    `createMemoryHistory` router with the section routes and `imprint`, fake
    `setTimeout`/`clearTimeout`): a `scroll` event plus 150 ms idle replaces the route with the
    active section via `replace`, never `push`; scrolling back to the top returns to `/`. Nothing
    happens before 150 ms, a second `scroll` restarts the window, the active section is read when
    the window ends, and a change of the active section without a `scroll` event does not sync.
    No replace when the route already matches or on `imprint`. A navigation during the window
    cancels the pending sync and keeps its own route. After unmount `scroll` does nothing, a
    pending sync is dropped and the `beforeEach` guard is removed.
  - `replaceSectionSilently` / `consumeSilentSectionSync`: the marker is set for the target and
    consumed once; a mismatched id or `undefined` returns `false` and clears it; no marker and no
    navigation when the route already is the target or has no section; an aborted
    (`beforeEach → false`) or overtaken replace resets the marker.
  - Router (real `@/router`): after `replaceSectionSilently` neither `scrollIntoView` nor
    `window.scrollTo` (back to home) is called; the next push scrolls again; a click that
    overtakes a pending silent replace still scrolls to its section and ends at its route; the
    first navigation to `/contact` still jumps with `'instant'`.
  - `LandingPage` wiring: a scroll spy entry for `#contact`, a `scroll` event and the idle window
    move the router from `/` to `/contact`.
  - The module-level marker is reset with `consumeSilentSectionSync(undefined)` before and after
    each of these tests.

- **User review round 3 (R6, continuous timeline line).**
  - Component level: the axis contains exactly one child, the dot; no `.timeline-entry__line`
    element is rendered.
  - Source level (`TimelineEntry.vue?raw`): no `.timeline-entry__line` rule remains; rules whose
    selector contains `.timeline-entry__axis` set no `opacity`/`transform`/`transition`; the axis
    is `position: relative`; `.timeline-entry__axis::before` has `content: ''`,
    `position: absolute`, `top: 0`, `bottom: 0`, `left: calc(50% - 1px)`, `width: 2px` and
    `background: var(--color-primary-container)`; the dot has `position: relative`, `z-index: 1`
    and `margin-top: 28px`, the first-child dot `margin-top: 60px`.
  - The missing gap itself (painting order, seam between entries and to the dashed fade) needs
    real layout and is a manual check.

**jsdom gaps.** jsdom has no `scrollIntoView` and no `IntersectionObserver`, and it does not
implement `window.scrollTo`. `scrollIntoView` is set on `Element.prototype` per test and removed
afterwards. `IntersectionObserver` is a stub that keeps its callback and fires entries
synchronously. `window.scrollTo` is spied. Navigation is awaited with `await router.push` or
`flushPromises`. The contact form fakes `setTimeout` for its 5 s message, and the R5 URL sync
fakes `setTimeout`/`clearTimeout` for its 150 ms idle window. There are no fixed delays.

**Not tested here.** The MS-17 and MS-18 animation internals (unchanged, covered by
`AnimatedLogo`, `useBrandTitle` and `useTypewriter` specs) and the dark theme (out of scope).

**Review of the developer's adjusted specs.**
- Tests for features that were removed were dropped correctly: carousel arrows and status,
  `tagColor`, `ContactInformation`, `AboutPage`.
- The renamed selectors (`.menu-button`, `img.brand__logo[alt=""]`, `h3` titles) still test the
  same behaviour; the former timeline axis line segments were replaced in R6 (see above).
- `seo.spec.ts` and `router.spec.ts` were only re-pointed to the new metadata keys. The gaps the
  developer listed are now covered by the tests above.

## Test Cases

| Class / Module | Test Case | Level | Status |
|--------|----------|-------|--------|
| router | section routes `/`, `/projects`, `/about`, `/contact` resolve to name, `meta.section`, `LandingPage`, home SEO | Unit | ✅ |
| router | legal routes have no `meta.section`; no `landing` route | Unit | ✅ |
| router | canonical and `og:url` are the site root on section routes; home title; legal pages keep own canonical | Unit | ✅ |
| router | `scrollBehavior` saved position: `'auto'` between section routes; `'instant'` on first navigation and onepage ↔ legal / legal ↔ legal | Unit | ✅ |
| router | `scrollBehavior` section target: `scrollToSection` with `'auto'` from a section route, `'instant'` on first load or from a legal page; home uses `scrollTo` with the same rule; returns `false` | Unit | ✅ |
| router | `scrollBehavior` legal target: `{ top: 0, behavior: 'instant' }` from first load, section and legal routes | Unit | ✅ |
| router | MS-16 English paths and legacy redirects (existing) | Unit | ✅ |
| useSectionNavigation | `SECTION_IDS` order, `isSectionId` accepts/rejects | Unit | ✅ |
| useSectionNavigation | `scrollToSection` home → `scrollTo`, others → `scrollIntoView({ block: 'start' })` on the right element, missing element no error | Unit | ✅ |
| useSectionNavigation | `sectionHref` gives `#/…` under hash history | Composable | ✅ |
| useSectionNavigation | `goToSection` pushes and prevents default; modified/middle/prevented clicks ignored; duplicated navigation scrolls itself | Composable | ✅ |
| useActiveSection | default `home`; one observer with `-40% 0px -59% 0px` / 0; observes existing sections in order | Composable | ✅ |
| useActiveSection | follows intersecting entries, ignores leaving and foreign ids, reactive; disconnect on unmount; no-op without IO | Composable | ✅ |
| LandingPage | four sections in order in one `main`; header before/outside `main`; one `h1`; sections labelled by headings (de/en) | Component | ✅ |
| LandingPage | Home current initially; scroll spy entry marks "Über mich"; `activeSection` passed to AppNavigation | Component | ✅ |
| LandingPage | real router: old URLs render the onepage; same instance and same logo element across section routes | Integration | ✅ |
| LandingPage | MS-17 animated logo, no GIF (existing) | Component | ✅ |
| App | one `main` on `/`, `/about`, `/imprint`, `/privacy`; header and footer outside `main`; footer nav "Rechtliches"; bold `schreiber` | Component | ✅ |
| AppNavigation | nav label de/en, menu label en, `aria-controls`/`id`, `type="button"`, menu/close icon | Component | ✅ |
| AppNavigation | no current link by default or from the route; exactly one current link per `activeSection`; `is-active`; follows prop changes | Component | ✅ |
| AppNavigation | link click navigates with default prevented; ctrl-click left to browser; legal page → section; brand → home, brand on home scrolls to top | Component | ✅ |
| AppNavigation | Escape closes and returns focus; no effect when closed / other keys; closes on route change and on current-link click; listener removed on unmount | Component | ✅ |
| AppNavigation | mobile panel opaque surface, no `backdrop-filter`, absolute below bar, borders, shown only when open | Source | ✅ |
| AppNavigation | MS-18 brand title behaviour and CSS (existing) | Component / Source | ✅ |
| HomeSection | `#home`, `h1` de/en, subtitle, AnimatedLogo, scroll link href/label de/en, icon hidden, click → projects, `hero-rise` kept | Component / Source | ✅ |
| ProjectsSection | `#projects`, `h2` de/en, subtitle, one card per project in data order | Component | ✅ |
| ProjectsSection | column list with `--spacing-xl` (32px) gap, no media override, projects gradient | Source | ✅ |
| ProjectCard | `article`, `h3`, description | Component | ✅ |
| ProjectCard | carousel group label de/en, all images, 960 src, srcset, shared `sizes`, lazy, `role="button"` + `tabindex`, alt | Component | ✅ |
| ProjectCard | no arrows/status; lightbox closed, opens at index on click/Enter/Space, closes on hide, 1920px images; focus scrolls image into track | Component | ✅ |
| ProjectCard | placeholder without images (hidden from AT); tag colours lilac/sand/rose/lilac; first link filled, others outlined, icon in each | Component | ✅ |
| ProjectCard | MS-1 links, `min-width: 0` (existing) | Component / Source | ✅ |
| AboutSection | `#about`, `h2`, subtitle, `.card` profile, `h3` name, portrait 176×176, chip texts, no X chip | Component | ✅ |
| AboutSection | timeline = `latestTimelineEntries` in order, `h3` employers, no older entries, fade connector hidden | Component | ✅ |
| AboutSection | MS-15 chips, hrefs, labels (existing, moved from AboutPage) | Component | ✅ |
| TimelineEntry | `li`, `h3` employer, axis `aria-hidden`; sides, visibility (existing, adjusted) | Component | ✅ |
| ContactSection | `#contact`, `h2`, subtitle de/en, contains the form | Component | ✅ |
| ContactForm | `contact-` ids with labels, de/en placeholders, email type, required fields, submit label, send icon | Component | ✅ |
| ContactForm | Formspree POST body; success message, reset, hidden after 5 s; error on rejection and network failure; values kept on error | Component | ✅ |
| ImpressumPage / DataProtectionPage | shared header, no current link, links to the four sections, one `main`, one `h1`; tel/mailto links (existing) | Component | ✅ |
| timeline data | `LATEST_TIMELINE_ENTRY_COUNT` 3, the 3 newest entries, full CV kept; en dash in Daimler TSS Senior date | Unit | ✅ |
| seo | `pageMetadata` keys and home texts; `og:url` set and upserted; single canonical | Unit | ✅ |
| index.html | title/description/og:title/og:description = `pageMetadata.home`; canonical/og:url root; og:locale, og:image, twitter:card, theme-color, robots | Static | ✅ |
| index.html | JSON-LD `@graph` with `WebSite` and `Person` (id, image, worksFor, sameAs, existing fields) | Static | ✅ |
| base styles | `scroll-margin-top`, `--nav-height` 80/72, smooth / reduced-motion `auto`, reduced-motion durations | Source | ✅ |
| base styles | focus ring, footer focus colour, `.section__inner` uses `--container-max-width` = 1180px (R1), `.card` gradient border, primary token | Source | ✅ |
| base styles | Inter `@font-face` with swap, bundled woff2 exists, no Google Fonts, base family; `main.ts` import order | Source | ✅ |
| base styles | Inter licence at `app/public/fonts/Inter-OFL.txt`, old `src/assets/fonts/OFL.txt` gone, referenced from `fonts.css` | Source | ✅ |
| icons | new icons `IconMenu`, `IconClose`, `IconArrowDown`, `IconOpenInNew`, `IconSend` follow the icon contract (adjusted) | Component | ✅ |
| projects data | data, images and i18n keys; `ProjectsSection` cards (adjusted from `ProjectOverviewPage`) | Unit / Component | ✅ |
| AppNavigation | R2: brand mark tile with `/logo_simple_white.svg`, `alt=""`, no `/logo.svg`, one image in the brand link | Component / Source | ✅ |
| AppNavigation | R2: tile 48px/8px, mobile 40px/6px, `--radius-md`, `--gradient-brand-mark`, image `object-fit: contain` | Source | ✅ |
| AppNavigation | R4: `.nav-container` max width = container + 2 × page padding, padding token; mobile `0 16px 0 var(--page-padding-inline)` | Source | ✅ |
| AppFooter | R4: `.footer-container` max width = container + 2 × page padding, `var(--spacing-lg) var(--page-padding-inline)`; mobile `var(--spacing-lg)` | Source | ✅ |
| base styles | R2/R4: `--gradient-brand-mark` old value, no `--gradient-brand`; `--page-padding-inline` 32px / mobile 24px | Source | ✅ |
| ProjectCard | R1: `sizes` = `(max-width: 768px) calc((100vw - 98px) * 0.86), (max-width: 1244px) calc((100vw - 186px) * 0.35), 371px` | Component | ✅ |
| TimelineEntry | R3: entry static; dot and card start at opacity 0 / `translateY(30px)`, 0.6s ease-out after `var(--delay, 0s)`, in place when visible; reduced motion shows them without transition | Source | ✅ |
| AboutSection | R3: `--delay` 0s / 0.15s / 0.3s; no entry visible before the observer; only the intersecting entry turns visible | Component | ✅ |
| useSectionUrlSync | R5: `scroll` + 150 ms idle → `replace({ name })` to the active section, no `push`; back to `/` at the top | Composable | ✅ |
| useSectionUrlSync | R5: no replace before 150 ms; second `scroll` restarts the window; active section read at the end; no sync without `scroll` | Composable | ✅ |
| useSectionUrlSync | R5: no replace when route equals the section or on `imprint`; navigation during the window cancels the sync | Composable | ✅ |
| useSectionUrlSync | R5: unmount removes the scroll listener, drops a pending sync and removes the `beforeEach` guard | Composable | ✅ |
| useSectionUrlSync | R5: silent marker consumed once; mismatched / `undefined` id → `false` and cleared; not set for no-op calls; reset on aborted or overtaken replace | Unit | ✅ |
| router | R5: silent replace does not call `scrollIntoView` / `scrollTo`; next push scrolls again; overtaking click scrolls to its section; first load of `/contact` still `'instant'` | Unit | ✅ |
| LandingPage | R5: scroll spy `#contact` + `scroll` + idle window → route `/contact` | Component | ✅ |
| TimelineEntry | R6: axis contains only the dot; no `.timeline-entry__line` element | Component | ✅ |
| TimelineEntry | R6: no `.timeline-entry__line` rules; axis rules not animated; axis `position: relative`; `::before` `content: ''`, absolute, `top: 0` / `bottom: 0`, `left: calc(50% - 1px)`, `width: 2px`, `primary-container` | Source | ✅ |
| TimelineEntry | R6: dot `position: relative`, `z-index: 1`, `margin-top: 28px`; first-child dot `margin-top: 60px` | Source | ✅ |

## Untested Areas

These behaviours depend on real layout, scrolling, compositing or timing, which jsdom does not
provide. Check them manually in a browser (desktop Chrome/Safari and a mobile viewport ≤ 768px):

1. **Section scrolling (AC-2).** Each nav link, the brand and the hero arrow scroll smoothly to the
   section, and the heading sits just below the sticky bar (80px; 72px on mobile). A repeated click
   on the current link while scrolled away scrolls back. Under `prefers-reduced-motion` the jump has
   no animation.
2. **Deep links and legal pages.** Opening `#/about` (also `#/projects` and `#/contact`) directly,
   or a section link from `#/imprint`, lands on the section without a visible smooth run. Images
   that load later must not shift the target. Back and forward restore the scroll position.
3. **Scroll spy (D3).** The highlighted nav item follows manual scrolling through all four
   sections. The short Contact section becomes active at the page bottom. The highlight passing over
   intermediate items during a smooth scroll is accepted.
4. **Mobile menu (D10).** The panel overlays the content without pushing it. It is opaque and
   readable over every section (the projects gradient included), and it closes on a link tap.
5. **Visual design.** Glass project cards, the carousel peek, swipe and scroll-snap, tag chip
   colours, gradient titles, the timeline alternation (left/right/left on desktop, all right on
   mobile) with the dashed fade, the form layout, the footer gradient, the Inter rendering and the
   focus rings, all compared against `docs/design/MS-20-1/screens/*.png`.
6. **Animations (AC-5).** The header typing title and the MS logo animation play once on load and
   do not restart when moving between sections.
7. **Lightbox.** It opens at the clicked image, and its arrows and close work with mouse and
   keyboard.
8. **Content width (R1).** At 1440px the section content is 1180px wide. Project card images
   stay sharp; DevTools shows the 960px source picked for the 371px slot at DPR 2.
9. **Header/footer alignment (R4).** At 1440px, 1244px, 1024px and 390px, the left edge of the
   brand tile, the section titles ("Projekte", "Über mich", "Kontakt") and the footer text lie
   on one vertical line. On desktop the right edge of the nav links and footer links matches the
   right edge of the section content. On mobile the menu button icon sits optically at the 24px
   line.
10. **Brand mark tile (R2).** The coloured gradient tile with the white logo looks as on `main`,
    at 48px on desktop and 40px on mobile.
11. **Timeline fly-in (R3).** The axis line and the dashed fade are visible from the start. When
    the timeline scrolls into view, each card and its dot rise 30px and fade in together over
    0.6s, staggered by 0.15s per entry, once only. Under `prefers-reduced-motion` the cards and
    dots are visible at once with no motion.
12. **Link previews and SEO.** The static `index.html` metadata appears in a link-preview debugger
   after deployment.
13. **URL follows scrolling (R5).**
   - Click "Kontakt", then scroll back up to the hero: the address becomes `#/`, and a reload
     stays at the top.
   - Scroll slowly through all four sections: after each stop the address shows the visible
     section (`#/`, `#/projects`, `#/about`, `#/contact`) without a jump. The back button does
     not walk through these section entries; it only returns to pages reached by clicks.
   - Click a menu item far away (e.g. "Kontakt" from the top): the smooth scroll ends with
     `#/contact` in the address, without flickering through the intermediate sections.
   - Open `#/contact` directly in a new tab: the page lands at Contact and the address stays
     `#/contact`.
   - Open imprint and privacy and scroll there: their addresses stay `#/imprint` and `#/privacy`;
     going back to a section still works as before.
14. **Continuous timeline line (R6).** At desktop width and at 390px, scroll slowly through the
    timeline: the line runs without a gap through every dot while the dots are still hidden and
    while they fly in; once visible, the ring's white fill hides the line inside the ring. The
    dot sits at the same place as before (28px below the entry top, first entry 60px). Between
    entries and into the dashed fade-out there is no seam or offset. Repeat with
    `prefers-reduced-motion: reduce` (dots visible at once, line continuous).
