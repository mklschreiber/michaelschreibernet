---
type: Architecture Concept
title: Redesign Onepager
description: Merges Welcome, Projects, About me and Contact into one scrolling page under hash routing, with section routes, a scroll spy, the MS-20 design tokens and single-page SEO.
tags: [MS-20, views, components, composables, routes, i18n messages, data modules, styles, seo, tests]
timestamp: 2026-10-23T20:00:00+02:00
status: approved
---

## Story

As a user, I want a single page (onepager) showing the site's content — Welcome, Projects,
About me and Contact — so that the limited content is presented compactly instead of being
spread over multiple pages.

Jira: MS-20 — https://mklschreiber.atlassian.net/browse/MS-20

Acceptance criteria:

- AC-1 Onepager showing the content (Welcome, Projects, About me, Contact).
- AC-2 Clicking a menu item scrolls to the section.
- AC-3 Only imprint and data protection notice stay on separate pages.
- AC-4 SEO optimization.
- AC-5 Animation like before: the typing header title (MS-18, `useBrandTitle`/`useTypewriter`)
  and the animated MS logo (MS-17, `AnimatedLogo`).
- AC-6 Only the newest 3 CV entries are shown.

Design (source of truth for the UI): [docs/design/MS-20-1/README.md](../design/MS-20-1/README.md),
with `screens/Main.dc.html` (desktop), `screens/Mobile.dc.html` (mobile) and
`ds/michaelschreiber-net/tokens.json`. The PNGs are for layout only. Design texts are the
German strings; the app stays localized with Vue I18n (de + en).

## Architecture Decisions

### D1 — Keep hash history; the old page routes become section routes

The router keeps `createWebHashHistory`. Switching to `createWebHistory` would give clean
`/#projects` anchors, but GitHub Pages has no SPA fallback: `/imprint` would need generated
`dist/imprint/index.html` copies or a `404.html` hack, and every old `#/about` bookmark would
need a client-side translator. That is a deployment change the story does not need.

With hash history a raw fragment link such as `href="#projekte"` is read by Vue Router as the
path `/projekte` and matches nothing. So **sections are addressed by routes, not by raw
fragments**:

| Route path | Route name | Component | `meta.section` | SEO metadata |
|---|---|---|---|---|
| `/` | `home` | `LandingPage` | `home` | `pageMetadata.home` |
| `/projects` | `projects` | `LandingPage` | `projects` | `pageMetadata.home` |
| `/about` | `about` | `LandingPage` | `about` | `pageMetadata.home` |
| `/contact` | `contact` | `LandingPage` | `contact` | `pageMetadata.home` |
| `/imprint` | `imprint` | `ImpressumPage` | — | `pageMetadata.imprint` (unchanged) |
| `/privacy` | `privacy` | `DataProtectionPage` | — | `pageMetadata.privacy` (unchanged) |
| `/impressum` | — | redirect `/imprint` | — | (MS-16, unchanged) |
| `/datenschutz` | — | redirect `/privacy` | — | (MS-16, unchanged) |

- The old `/about`, `/projects`, `/contact` URLs (`#/about` …) keep working: they open the
  onepage and scroll to their section. This is the "redirect to the section anchor" from the
  story, without a redirect hop and without changing any bookmarked URL.
- The route name `landing` becomes `home`. `LandingPage.vue` stays the file name of the
  onepage view (it is still the page at `/`).
- All four section routes use the same component record type, so Vue reuses the
  `LandingPage` instance when moving between them; nothing re-mounts and the MS-17 logo
  animation does not restart.
- Section element ids are the English route names `home`, `projects`, `about`, `contact`
  (consistent with MS-16), not the German design ids (`#projekte`, `#ueber-mich`,
  `#kontakt`). The ids are only scroll targets; no link uses them as raw `href` fragments.
- `LandingPage` is imported statically (as today) so the sections exist when the scroll
  runs. No catch-all route is added.

### D2 — Scrolling: `scrollBehavior` + `scroll-margin-top`, one click handler for repeats

Router option:

```ts
scrollBehavior(to, from, savedPosition) {
  // Smooth only when both routes are onepage section routes (in-page move or
  // back/forward between sections). First navigation (from has no section) and every
  // move to/from imprint/privacy jump.
  const inPage = isSectionId(to.meta.section) && isSectionId(from.meta.section)
  const behavior = inPage ? 'auto' : 'instant'        // 'auto' = follow CSS scroll-behavior
  if (savedPosition) return { ...savedPosition, behavior }
  if (isSectionId(to.meta.section)) {
    scrollToSection(to.meta.section, behavior)
    return false                                      // we scrolled ourselves
  }
  return { top: 0, behavior: 'instant' }              // imprint / privacy start at the top
}
```

Vue Router passes the returned position to `window.scrollTo`; without an explicit
`behavior` that follows `html { scroll-behavior: smooth }`, so every returned position
carries one. `START_LOCATION` has no `meta.section`, so reload of `#/projects` jumps.

- `scrollToSection(id, behavior)` calls `window.scrollTo({ top: 0, behavior })` for `home`
  and `document.getElementById(id)?.scrollIntoView({ block: 'start', behavior })` for the
  others. `scrollIntoView` honours CSS `scroll-margin-top`, so the header offset lives in
  one place (CSS, D8), not in the router.
- `'auto'` defers to CSS `scroll-behavior` on `html` (`smooth`, or `auto` under
  `prefers-reduced-motion` — see D11). `'instant'` is used on initial load and when coming
  from imprint/privacy: a smooth run over the whole page on load is pointless.
- A repeat click on the link of the current route (e.g. "Projekte" while the URL is already
  `#/projects` but the user scrolled away) is a duplicated navigation: Vue Router does not
  call `scrollBehavior`. So every section link uses `goToSection(id, event)` (D4), which
  pushes the route and, if the push fails with `NavigationFailureType.duplicated`, calls
  `scrollToSection(id, 'auto')` itself.
- ~~The URL does **not** follow manual scrolling. It shows the last section navigated to,
  like a classic anchor onepage. Updating it on scroll (`router.replace`) would fight with
  `scrollBehavior` and pollute history.~~ **Superseded by R5** (user review round 2): the URL
  follows scrolling via a silent `router.replace` after scroll idle; `scrollBehavior` skips
  that navigation.

### D3 — Active nav state: scroll spy in the onepage, passed to the header as a prop

- New composable `useActiveSection()` (used by `LandingPage`) observes the four section
  elements with one `IntersectionObserver` (`rootMargin: '-40% 0px -59% 0px'`, threshold 0,
  i.e. a 1%-high band at 40% of the viewport height). The section crossing that band is
  active. Sections are contiguous, so exactly one crosses; the short Contact section still
  reaches the band at the page bottom. Default `'home'`. The observer is disconnected on
  unmount.
- `LandingPage` renders `<AppNavigation :active-section="activeSection" />`. Imprint and
  privacy render `<AppNavigation />` (prop default `null`), so no item is active there.
- No Pinia store: the header is rendered by each view (as today), so a prop is enough.
- The active link gets the class `is-active` and `aria-current="true"` (as in the design).
  The `router-link-exact-active` styling is removed.
- During a smooth scroll the highlight passes over the sections in between. That is
  accepted (it shows where the page is going) and needs no suppression logic.

### D4 — Section links are real links with a guarded click handler

`useSectionNavigation()` returns `goToSection(id, event?)` and `sectionHref(id)`:

- `sectionHref(id)` is `router.resolve({ name: id }).href` (e.g. `#/projects`), so links are
  crawlable, can be opened in a new tab and work without the handler.
- `goToSection` does nothing for modified or non-primary clicks (`metaKey`, `ctrlKey`,
  `shiftKey`, `altKey`, `button !== 0`, `defaultPrevented`) so the browser handles them;
  otherwise it calls `event.preventDefault()`, `router.push({ name: id })`, and the
  duplicated-navigation fallback from D2.
- Used by: the four nav links, the brand link (→ `home`), the hero scroll button
  (→ `projects`). Rendered as plain `<a :href="sectionHref(id)" @click="goToSection(id, $event)">`
  instead of `RouterLink`, because `RouterLink` swallows the duplicated navigation.

### D5 — Imprint and privacy link back via the shared header

Imprint and privacy keep their own routes and views and render the same `AppNavigation`.
Its links point to `#/`, `#/projects`, `#/about`, `#/contact`; from a legal page
`goToSection` pushes the section route, `LandingPage` mounts, and `scrollBehavior` jumps
(`'instant'`) to the section. The footer (`/imprint`, `/privacy` links) is unchanged in
target. No extra "back" link is added.

### D6 — Page structure and semantics

- `App.vue` drops its `<main>` wrapper (today it nests a second `<main>` inside every view).
  Each view renders `<AppNavigation />` followed by its own `<main>`; `App.vue` renders
  `RouterView` and `AppFooter` in the `.app-shell` flex column. Header (banner landmark) is
  thus outside `<main>`.
- `LandingPage.vue` becomes a thin container:
  `AppNavigation` + `<main>` with `HomeSection`, `ProjectsSection`, `AboutSection`,
  `ContactSection` (new, `app/src/components/sections/`). Each section renders
  `<section :id="…" class="section" :aria-labelledby="…">`.
- Heading outline: one `h1` ("Willkommen" in the hero), `h2` per section title, `h3` for
  project titles, the profile name and timeline employers (as in the design).
- `AboutPage.vue`, `ProjectOverviewPage.vue`, `ContactPage.vue` are deleted; their content
  moves into the section components.

### D7 — Reuse, refactor, remove

| Unit | Action |
|---|---|
| `AnimatedLogo.vue` (MS-17) | Reused unchanged in `HomeSection` (width 360px, mobile 240px, `margin-bottom` 48px/40px, `color: var(--color-on-surface)`). |
| `useBrandTitle` / `useTypewriter` (MS-18) | Reused unchanged. Brand markup, `.brand__sr` accessible name, ghost and cursor in `AppNavigation` are kept (D9). |
| `AppNavigation.vue` | Refactored: design app bar, `activeSection` prop, section links via `useSectionNavigation`, new menu button (D10). |
| `AppFooter.vue` | Restyled to the design; `<nav aria-label="Rechtliches">`; copyright with bold `schreiber`. |
| `ProjectCard.vue` | Refactored: glass card, `5fr / 7fr` grid, scroll-snap carousel, positional tag colours (D12). Lightbox kept. |
| `TimelineEntry.vue`, `useTimelineAnimation` | Refactored to the design grid timeline (D13); cards and dots fly in, the line is static and continuous behind the dot (R3, R6). |
| `ContactForm.vue` | Restyled to the design; Formspree logic, validation and messages unchanged; ids prefixed `contact-` (`contact-name`, `contact-email`, `contact-message`). |
| `ImpressumPage.vue`, `DataProtectionPage.vue` | Keep content; drop their own top-trim card CSS for the global `.card` / `.section` classes (D8). |
| `LandingPage.vue` | Becomes the onepage container (D6). Background photo, glows and the two CTA buttons are removed; the `hero-rise` entry animation moves to `HomeSection` unchanged. |
| `AboutPage.vue`, `ProjectOverviewPage.vue`, `ContactPage.vue` | Deleted. |
| `ContactInformation.vue`, `icons/IconLocation.vue` | Deleted: the design's Contact section has only the form; e-mail and phone are in the profile chips. |
| `utils/tagColor.ts` | Deleted: the design colours tags by position (supersedes `colored-tags`). |
| `icons/IconChevronLeft.vue`, `icons/IconChevronRight.vue` | Deleted with the carousel arrows (D12). |
| `MdFilledButton.vue`, `MdOutlinedButton.vue` | Deleted (only `LandingPage` used them). `material-web.ts` and the `@material/web` dependency stay (see Open Questions). |
| `app/public/bg_image*.{jpg,png}` (7 files) | Deleted (only the old hero used them). |
| `icons/IconImagePlaceholder.vue` | Kept for projects without images. |
| New icons | `IconMenu`, `IconClose`, `IconArrowDown` (`keyboard_arrow_down`), `IconOpenInNew`, `IconSend` — flat `currentColor` SVGs with `viewBox="0 0 24 24"`, `aria-hidden="true"`, path data from Material Icons (Apache-2.0), following the existing icon contract. No icon font. |

### D8 — Design tokens → `app/src/assets/styles`

`variables.css` is rewritten to the token set (light theme only). Existing variable names are
kept where the role matches 1:1; colours move to the Material 3 role names of `tokens.json`;
names that become unused are removed (the developer greps `app/src` for each removed name).

| Token (`tokens.json`) | CSS variable | Value |
|---|---|---|
| primary / on-primary | `--color-primary` / `--color-on-primary` | `#4338ca` / `#ffffff` |
| primary-container / on-primary-container | `--color-primary-container` / `--color-on-primary-container` | `#e3e0fb` / `#1d1470` |
| secondary | `--color-secondary` | `#1f6fa8` |
| surface | `--color-surface` | `#ffffff` |
| surface-container-low / surface-container | `--color-surface-container-low` / `--color-surface-container` | `#f6f5fc` / `#ecebf7` |
| on-surface / on-surface-variant | `--color-on-surface` / `--color-on-surface-variant` | `#1b1b1f` / `#47464f` |
| outline / outline-variant | `--color-outline` / `--color-outline-variant` | `#79757f` / `#cac4d0` |
| gradient-start / gradient-end | `--color-gradient-start` / `--color-gradient-end` | `#6a3de0` / `#3b8fcf` |
| footer-start / -mid / -end, on-footer | `--color-footer-start` / `--color-footer-mid` / `--color-footer-end`, `--color-on-footer` | `#352b94` / `#4a44d4` / `#3b73a6`, `#ffffff` |
| chip-lilac/-sand/-rose + on-* | `--color-chip-{lilac,sand,rose}`, `--color-on-chip-{lilac,sand,rose}` | as in tokens |
| error / on-error | `--color-error` / `--color-on-error` | `#b3261e` / `#ffffff` (`--color-success` kept for the form message) |
| — (derived) | `--gradient-text` | `linear-gradient(90deg, var(--color-gradient-start), var(--color-gradient-end))` |
| — (derived) | `--gradient-text-inverse` | `linear-gradient(90deg, #ffffff, #5cc8ff)` (Projects title) |
| — (derived) | `--gradient-border` | `linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end))` |
| — (derived) | `--gradient-projects` / `--gradient-footer` | `linear-gradient(135deg \| 90deg, footer-start, footer-mid 55%, footer-end)` |
| shadow-card / shadow-raised | `--shadow-card` / `--shadow-raised` | `0 10px 30px rgba(67,56,202,.12)` / `0 14px 40px rgba(67,56,202,.2)` |
| — (design literal) | `--shadow-glass` | `0 8px 24px rgba(10,5,60,.25), inset 0 1px 0 rgba(255,255,255,.25)` |
| radius-sm/md/lg/xl/full | `--radius-sm` / `--radius-md` / `--radius-lg` / `--radius-xl` / `--radius-full` | 8 / 12 / 16 / 28 / 9999px (sm, lg, full change value; xl is new) |
| space-1…space-8 | `--spacing-xs` 4, `--spacing-sm` 8, `--spacing-md` 16, `--spacing-lg` 24, `--spacing-xl` 32, `--spacing-2xl` 48 (unchanged); new `--spacing-3` 12px, `--spacing-3xl` 64px | |
| space-card | `--spacing-card` | 36px (mobile cards use 24px) |
| nav-height | `--nav-height` | 80px; 72px inside `@media (max-width: 768px)` on `:root` |
| content-max-width | `--container-max-width` | 1200px → 1180px (design 1312px − 10%, user review R1) |
| — | `--page-padding-inline` | 32px; 24px on mobile |
| type styles | `--font-display-lg` (`700 52px/60px`), `--font-display-sm` (`700 44px/52px`, mobile display), `--font-headline-lg` (`700 32px/40px`), `--font-headline-md` (`700 28px/36px`), `--font-title-lg` (`600 22px/28px`), `--font-title-md` (`500 20px/28px`), `--font-body-lg` (`400 22px/32px`), `--font-body-md` (`400 20px/28px`), `--font-body-sm` (`400 18px/28px`), `--font-label-lg` (`600 18px/24px`), `--font-label-md` (`500 18px/24px`), `--font-label-sm` (`500 16px/24px`), `--font-label-xs` (`500 14px/20px`, tag chips) | `font` shorthands, each ending in `var(--font-family-base)`; letter-spacing (`-0.02em` display, `-0.01em` headline-lg/wordmark) is set where used |
| families.sans | `--font-family-base` | `Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |

- Old `--font-size-*`, `--color-text-*`, `--color-bg-*`, `--color-border*`,
  `--color-accent*`, `--gradient-brand*`, `--shadow-sm/md/lg/glow` are removed once unused.
  The `--md-*` Material Web tokens stay, re-pointed to the new role names.
- Px values are taken 1:1 from the tokens for traceability.
- **Inter** is self-hosted: one Latin-subset variable font file
  (`app/src/assets/fonts/inter-latin-wght-normal.woff2`, weights 100–900, SIL OFL; the
  licence text lives only at `app/public/fonts/Inter-OFL.txt` so the deployed site ships it
  next to the font) declared with `@font-face { font-display: swap }` in a new
  `app/src/assets/styles/fonts.css`, imported in `main.ts`. No Google Fonts request (avoids a
  third-party transfer that the privacy page would have to declare) and no npm package.
- New global `app/src/assets/styles/base.css` (imported in `main.ts` after
  `variables.css`) takes the global rules now in `App.vue`'s unscoped `<style>` plus the few
  design classes shared across sections and legal pages, instead of duplicating them per
  component:
  - `.section` — `padding: var(--spacing-3xl) var(--page-padding-inline)` (mobile 48px 24px),
    `scroll-margin-top: var(--nav-height)`; `.section__inner` — `max-width:
    var(--container-max-width); margin: 0 auto`.
  - `.section__title` — `display-lg` (mobile `display-sm`), gradient text via
    `--gradient-text`; `.section__subtitle` — `body-md`, `on-surface-variant`, margin
    `8px 0 48px` (mobile `8px 0 32px`).
  - `.card` — `background: linear-gradient(surface) padding-box, var(--gradient-border)
    border-box; border: 2px solid transparent; box-shadow: var(--shadow-card);
    border-radius: var(--radius-xl)` (mobile `--radius-lg`); hover `--shadow-raised` with a
    `.2s` transition only at `min-width: 769px`.
  - focus ring `:focus-visible { outline: 3px solid var(--color-primary); outline-offset:
    3px }`; inside the footer the outline colour is `--color-on-footer`.
  - the `prefers-reduced-motion` block (D11).
  `App.vue` keeps only its scoped `.app-shell` layout.
- Breakpoint: the existing `max-width: 768px` is the design's "mobile".
- Dark theme (`.ms-dark` token set) is **not** implemented (not in the ACs).

### D9 — App bar (`AppNavigation.vue`)

- `<header>` sticky, `top: 0`, `z-index: var(--z-sticky)`, height `--nav-height`, background
  `color-mix(in srgb, var(--color-surface) 70%, transparent)` with
  `backdrop-filter: blur(16px) saturate(1.4)` (+ `-webkit-`), bottom border 1px
  `--color-outline-variant`. Inner row: `max-width: var(--container-max-width)`, padding
  `0 32px` (mobile `0 16px 0 24px`), `space-between`, gap 24px (mobile 12px).
- Brand link (→ `home`, D4): the coloured gradient tile with the white logo from before
  (user review R2), gap 12px, wordmark 24px/32px (mobile 20px/28px),
  `letter-spacing: -0.01em`. The MS-18 title markup
  (`.brand__sr`, ghost, typed segments, cursor and its blink) is unchanged — "animation like
  before". The design's `aria-label` "… – zum Anfang" is not added, so the MS-18 accessible
  name contract stays.
- Desktop nav: `<nav id="main-navigation" :aria-label="t('nav.mainLabel')">`, gap 8px; links
  48px high, padding `0 16px`, radius full, `label-md` font, colour `on-surface-variant`;
  hover: `primary-container` background, `on-primary-container` text, no underline; active
  (`.is-active`): `primary-container` background, `primary` text.

### D10 — Mobile menu

- At `max-width: 768px` a 48px round icon button replaces the inline nav:
  `type="button"`, `:aria-label="t('nav.menu')"`, `:aria-expanded`,
  `aria-controls="main-navigation"`, icon `IconMenu` / `IconClose` (28px). The current
  three-bar hamburger and its CSS are replaced.
- The open nav is the same `<nav>` element, shown as a panel directly below the bar:
  `position: absolute; top: 100%; left: 0; right: 0`, **opaque** `background:
  var(--color-surface)` and **no** `backdrop-filter`, `border-top` and `border-bottom` 1px
  `outline-variant`, padding `8px 0 16px`. (Nested inside the blurred header, the header is
  the panel's backdrop root in Chromium, so a panel blur would only see the header and look
  like flat 70% white over the page; an opaque surface is simplest and keeps the links
  readable over any section.) It overlays
  the page instead of pushing it (a growing sticky header would make the content jump).
  Links: full width, 56px high, padding `0 24px`, no radius, same active colours.
- It closes on link click (before `goToSection`), on brand click, on `Escape` (focus returns
  to the menu button) and on route change. No focus trap and no body scroll lock.

### D11 — Reduced motion

| Motion | Behaviour under `prefers-reduced-motion: reduce` |
|---|---|
| Header typing title (MS-18) | Unchanged: static full title, no blink (`useBrandTitle` + its CSS). |
| `AnimatedLogo` (MS-17) | Unchanged: end state via its own `animation: none` rule. |
| Section scrolling | Global rule sets `html { scroll-behavior: auto }`; `scrollToSection` passes `'auto'` (in-page) or `'instant'`, never `'smooth'` from JS, so it always follows the CSS. |
| `hero-rise`, timeline reveal, card/button hover transitions | Neutralised by the existing global `*, ::before, ::after` duration rule (moved to `base.css` unchanged). |
| Carousel | No programmatic scrolling; native swipe/scroll only. |

### D12 — Projects section and `ProjectCard`

- `ProjectsSection`: full-width `.section` with `background: var(--gradient-projects)`,
  `color: var(--color-on-footer)`; title gradient `--gradient-text-inverse`; subtitle with
  `opacity: .88`; cards in a column, gap 32px on desktop and mobile (as in `Mobile.dc.html`). Data source unchanged:
  `data/projects.json` in its current order.
- Card (`<article>`): glass — `background: rgba(255,255,255,.52)`, 1px
  `rgba(255,255,255,.75)` border, `backdrop-filter: blur(16px) saturate(1.4)`,
  `--shadow-glass`, `--radius-xl`, padding `--spacing-card`, text `on-primary-container`.
  Desktop grid `minmax(0,5fr) minmax(0,7fr)`, column gap 48px, row gap 24px; title `h3`
  (`headline-md`, `on-surface`) spans both columns; carousel in column 1, rows 2–4;
  description (`body-sm`), tags, links in column 2. Mobile: single column, gap 24px,
  `--radius-lg`, padding 24px. `min-width: 0` on the card and carousel stays (the overflow
  fix of `mobile-project-screenshot-carousel`).
- Carousel: `<div class="project-carousel" role="group" :aria-label="t('projects.galleryLabel', { title })">`,
  `display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory`, hidden
  scrollbar; each image `flex: none; width: 84%` (mobile 86%), `aspect-ratio: 16 / 10`,
  `object-fit: cover`, `--radius-md`, `scroll-snap-align: start`, `loading="lazy"`. The peek
  of the next image is the swipe hint. Images stay `role="button"`, `tabindex="0"` and open
  `vue-easy-lightbox` at their index (Enter/Space/click); focusing an image scrolls it into
  the track. The prev/next arrow buttons, `currentIndex`, the live position status and the
  CSS one-image-at-a-time mode are removed — the design has none, and the lightbox offers
  arrows for mouse users.
- `srcset` unchanged (`320…1920` variants); `sizes` becomes one constant matching the new
  layout: `(max-width: 768px) calc((100vw - 98px) * 0.86), (max-width: 1244px)
  calc((100vw - 186px) * 0.35), 371px` (98 = 2×24 section + 2×24 card + 2×1 border;
  186 = 2×32 + 2×36 + 2×1 + 48 column gap; 0.35 = 5/12 × 0.84; 1244 = 1180 + 2×32;
  371 ≈ (1180 − 122) × 5/12 × 0.84, rounded up; user review R1). `sizesFor` and its constants go away.
- Without images: one 16:10 `surface-container` placeholder with `IconImagePlaceholder`.
- Tags: chips 28px high, padding `0 12px`, `label-xs`, colour by **position**
  `index % 3` → `lilac`, `sand`, `rose` (`.tech-badge--lilac` etc. using the chip tokens).
- Links: plain `<a target="_blank" rel="noopener noreferrer">` pills, 48px high, padding
  `0 24px`, radius full, `label-lg`, gap 8px, trailing `IconOpenInNew` (20px). First link
  filled (`primary` / `on-primary`), following links outlined (1.5px
  `on-primary-container`, text `on-primary-container`). Mobile: full width, stacked, gap
  12px.

### D13 — About section, profile card and timeline (AC-6)

- `AboutSection`: `.section` with `background: linear-gradient(180deg,
  var(--color-surface-container-low), var(--color-surface))`, title/subtitle from
  `about.title` / `about.subtitle`.
- Profile card (`.card`, padding 36px, row, gap 48px; mobile column, centered, padding 24px):
  portrait `/profile-picture.jpeg` 176px (mobile 128px), round, `border: 4px solid
  surface`, `box-shadow: 0 0 0 3px var(--color-gradient-start)`, `width`/`height`
  attributes set, `alt` = `about.businessCard.avatarAlt`; name `h3` `headline-lg`; role
  `title-md` in `primary`.
- Contact chips (36px high, padding `0 16px`, radius full, `label-md`,
  `surface-container-low`, 20px icon, gap 8px; hover: `primary-container` background) from
  a typed list in `AboutSection` in this order: E-Mail (`mailto:info@michaelschreiber.net`),
  Telefon (`tel:+491624337334`), LinkedIn, GitHub, Facebook, Instagram (URLs as today,
  external ones with `target="_blank" rel="noopener noreferrer"`). Visible text: E-Mail and
  Telefon from `about.businessCard.email/phone`; the four networks show their brand name
  ("LinkedIn", …, not translated) and keep the existing localized keys
  (`about.businessCard.linkedin` = "LinkedIn-Profil" …) as `aria-label`, as in the design.
  The design's X chip is not added (see Open Questions).
- Timeline directly below the card, `<ol>` of `TimelineEntry`, data
  `latestTimelineEntries` (D14). Each `<li>` is one grid row:
  - desktop `minmax(0,1fr) 48px minmax(0,1fr)`; entries alternate left / right / left
    (card in column 1 or 3, the other column empty);
  - axis column: a continuous 2px `primary-container` line over the full entry height, with
    a 20px ring dot (`3px solid primary`, `surface` fill) on top of it, 28px below the entry
    top (first entry 60px) — see R6;
  - card cell padding-bottom 32px; first entry additionally padding-top 32px;
  - mobile `24px minmax(0,1fr)`: axis left, every card right;
  - card: `surface`, 1px `outline-variant`, `--radius-lg`, padding 24px, `--shadow-card`;
    date `label-sm` in `primary`; employer `h3` `title-lg`; role `body-sm`
    `on-surface-variant`, `margin: 8px 0 0`.
  - After the list an `aria-hidden` dashed fade-out connector (2px dashed
    `primary-container`, height 120px / mobile 96px, `mask-image: linear-gradient(to bottom,
    #000, transparent)`) in the axis column.
  - Animation: see R3/R6 — axis line and connector are always visible; cards and dots fly
    in, staggered.

### D14 — Data and messages

- `data/timeline.ts`: keep all entries (the full CV stays as data); add
  `export const LATEST_TIMELINE_ENTRY_COUNT = 3` and
  `export const latestTimelineEntries = timelineEntries.slice(0, LATEST_TIMELINE_ENTRY_COUNT)`.
  The array stays ordered newest first (Mercedes-Benz, Daimler TSS Senior, Daimler TSS
  Consultant). Unused older entries keep their i18n keys.
- i18n (`types.ts`, `de.ts`, `en.ts`) — the design texts become the German strings:

| Key | de | en |
|---|---|---|
| `nav.mainLabel` (new) | Hauptnavigation | Main navigation |
| `nav.menu` (new) | Menü | Menu |
| `landing.scrollToProjects` (new) | Zu „Projekte“ scrollen | Scroll to “Projects” |
| `landing.viewProjects`, `landing.getInTouch` | removed | removed |
| `projects.title` | Projekte | Projects |
| `projects.projectTitleMyStandbyLandingPage` | myStandby – LandingPage | myStandby – LandingPage |
| `projects.galleryLabel` (new) | Bildergalerie: {title} | Image gallery: {title} |
| `projects.previousScreenshot`, `nextScreenshot`, `screenshotPosition` | removed | removed |
| `contact.subtitle` | Lass uns in Verbindung treten | Let's get in touch |
| `contact.form.email` | E-Mail | Email |
| `contact.form.namePlaceholder` | Dein Name | Your name |
| `contact.form.emailPlaceholder` | `deine.email{'@'}example.com` | `your.email{'@'}example.com` |
| `contact.form.messagePlaceholder` | Deine Nachricht | Your message |
| `contact.form.successMessage` | Vielen Dank für deine Nachricht! Ich melde mich bald bei dir. | unchanged |
| `contact.form.errorMessage` | Beim Senden der Nachricht gab es ein Problem. Bitte versuche es erneut. | unchanged |
| `contact.contactInfo`, `email`, `emailValue`, `phone`, `phoneValue`, `location`, `locationValue` | removed (only `ContactInformation` used them) | removed |
| `about.timeline.entries.daimlerTssSenior.date` | Mai 2018 – März 2022 (en dash) | en dash as well |

  The design addresses the visitor with "du"; the contact strings switch from "Sie" to "du"
  so the section is consistent. Footer labels and legal pages stay hard-coded German
  (MS-16); the footer `aria-label` "Rechtliches" is hard-coded too.

### D15 — SEO (AC-4)

- `seo.ts`: `pageMetadata` becomes `{ home, imprint, privacy }`. `home`:
  - title `Michael Schreiber | Senior Software Engineer` (unchanged),
  - description `Michael Schreiber, Senior Software Engineer: Projekte wie myStandby,
    beruflicher Werdegang und Kontakt auf einer Seite.`
  All four section routes use `pageMetadata.home`.
- `router.afterEach` passes the canonical path `isSectionId(to.meta.section) ? '/' : to.path`,
  so every section URL has the canonical `https://michaelschreiber.net/` (one page, one
  canonical). `updatePageMetadata` additionally upserts `og:url` with the canonical URL.
- `index.html` (static, for crawlers that do not run JS and for link previews):
  description = `pageMetadata.home.description` (keep in sync; covered by a test);
  `og:title`, `og:url` (`https://michaelschreiber.net/`), `og:locale` `de_DE`,
  `og:image` `https://michaelschreiber.net/profile-picture.jpeg`, `twitter:card`
  `summary`; `theme-color` `#4338ca`. JSON-LD becomes an `@graph` with a `WebSite`
  (`@id …/#website`, `name`, `url`, `inLanguage: "de"`) and the `Person` (`@id …/#person`,
  existing fields plus `image`, `worksFor` `{ "@type": "Organization", "name":
  "Mercedes-Benz Tech Innovation" }` and `sameAs` with the LinkedIn, GitHub, Facebook and
  Instagram URLs).
- `sitemap.xml` and `robots.txt` stay as they are: the only server-resolvable URL is `/`,
  which now holds all content. Hash routes (`#/imprint` …) cannot be listed in a sitemap.
- Content signals: one `h1`, sectioned `h2`/`h3` outline (D6); alt texts on all images;
  `aria-labelledby` on sections; removing the 7 background photos lightens the first paint.

## User Review Round 1 (2026-10-23)

### R1 — Content 10% narrower on desktop

- `--container-max-width: 1180px` (1312px × 0.9 = 1180.8, rounded down to the 4px grid).
- It is the single width token for the **content box**: section content (`.section__inner`)
  is at most 1180px wide, and the app bar and footer inner rows have the same 1180px content
  box (their padding sits inside the `max-width`, see R4), so header, content and footer stay
  aligned. Paddings (32px / mobile 24px) are unchanged; mobile is unaffected.
- `ProjectCard` `sizes` follows (D12): `(max-width: 768px) calc((100vw - 98px) * 0.86),
  (max-width: 1244px) calc((100vw - 186px) * 0.35), 371px`.

### R2 — Keep the coloured header icon

- Markup as on `main`: `<span class="brand__mark" aria-hidden="true"><img
  class="brand__mark-image" src="/logo_simple_white.svg" alt="" /></span>`; the plain
  `/logo.svg` image in the header is removed.
- `.brand__mark`: `display: inline-flex`, centered, 48×48px, `padding: 8px` (mobile 40×40px,
  `padding: 6px`), `border-radius: var(--radius-md)` (12px, unchanged value),
  `background: var(--gradient-brand-mark)`, `flex-shrink: 0`. `.brand__mark-image`:
  `width/height: 100%`, `object-fit: contain`. Same proportion as the old 36px/6px tile,
  scaled to the design's 48px/40px logo slot of the 80px/72px bar.
- `--gradient-brand` no longer exists after the token rewrite. To keep the old look exactly,
  `variables.css` gets one token `--gradient-brand-mark: linear-gradient(135deg, #4f46e5 0%,
  #7c3aed 55%, #06b6d4 100%)` (the old `--gradient-brand` value), used only by the tile.

### R3 — Timeline: line always visible, cards and dots fly in

User clarification: "Karten + Punkte animiert".

- Static, always visible: the axis line (since R6 one continuous line drawn by
  `.timeline-entry__axis::before`; the former `.timeline-entry__line--top/--bottom` segments
  are removed) and the dashed fade-out connector. `.timeline-entry` and `.timeline-entry--visible` set no
  `opacity`/`transform`/`transition`.
- Animated, with the same motion as on `main` (where the whole entry moved), applied to
  `.timeline-entry__dot` **and** `.timeline-entry__card`:
  - start `opacity: 0; transform: translateY(30px)`;
  - `transition: opacity 0.6s ease-out var(--delay, 0s), transform 0.6s ease-out
    var(--delay, 0s)`;
  - `.timeline-entry--visible .timeline-entry__dot` and `.timeline-entry--visible
    .timeline-entry__card` → `opacity: 1; transform: translateY(0)`.
  Card and dot of one entry move together.
- Trigger: unchanged `useTimelineAnimation` (one `IntersectionObserver`, threshold 0.2,
  `rootMargin: '0px 0px -50px 0px'`, once per entry) setting `isVisible` per entry.
- Stagger as on `main`: `AboutSection` sets `--delay: index × 0.15s`.
- Reduced motion: in `TimelineEntry.vue`, `@media (prefers-reduced-motion: reduce) {
  .timeline-entry__dot, .timeline-entry__card { opacity: 1; transform: none; transition:
  none } }` — cards and dots are visible immediately, independent of the observer.

### R4 — Header icon aligned with section headings

User: "setz bitte auch noch das icon im header etwas weiter links sodass es vertikal auf einer
linie mit den überschriften (Projekte etc) ist".

Cause: `box-sizing: border-box` is global. `.section` puts its padding
(`var(--page-padding-inline)`) **outside** `.section__inner` (`max-width: 1180px`), so the
section content box is 1180px. `.nav-container` and `.footer-container` have
`max-width: 1180px` with their 32px padding **inside**, so their content box is only 1116px.
Above 1244px viewport width (1180 + 2 × 32) the brand tile and footer text therefore start
32px right of the section titles. At 1244px and below (and on mobile, 24px everywhere) they
already line up.

Decision: header and footer rows use the same box model as the sections — the max width
includes the page padding.

- `.nav-container` (`AppNavigation.vue`):
  `max-width: calc(var(--container-max-width) + 2 * var(--page-padding-inline))`,
  `padding: 0 var(--page-padding-inline)` (replaces the literal `0 32px`).
  Mobile (`max-width: 768px`): `padding: 0 16px 0 var(--page-padding-inline)` — the left edge
  stays 24px (via the token), the right 16px is intended: the 48px menu button has its own
  inner whitespace, so its icon sits optically at the 24px line.
- `.footer-container` (`AppFooter.vue`): same `max-width` calc,
  `padding: var(--spacing-lg) var(--page-padding-inline)` (replaces `var(--spacing-xl)`
  horizontally; same 32px value). Mobile keeps `padding: var(--spacing-lg)` (24px = token).
- Result: the left edge of the brand tile, the section titles and the footer text is the same
  at every viewport width; on desktop the right edge of the nav links / footer links also
  matches the right edge of the section content. The content width of sections stays 1180px
  (R1 unchanged); `ProjectCard` `sizes` (D12) is unaffected.
- No new token: the calc is used in two places only, and it states the intent ("content width
  plus page padding") directly.
- Tests: no unit test (pure CSS layout, jsdom computes no layout); verified visually at
  1440px, 1244px, 1024px and 390px.

## User Review Round 2 (2026-10-23)

### R5 — The URL follows scrolling

User (bug): after clicking a link the address shows e.g. `#/contact`; scrolling back to the
top keeps `#/contact`, and a reload jumps to Contact again. Chosen behaviour: "URL soll
mitlaufen" — while scrolling, the address silently changes to the visible section, with no
new history entry and no scroll jump; at the top it is the home route `#/`.

Decisions:

- **Source:** the active section of `useActiveSection()` (D3) — the same value as the nav
  highlight. At the top the hero crosses the 40% band, so the target is `home` → `#/`. No
  second observer.
- **Commit on scroll idle only:** the URL is updated `SECTION_URL_SYNC_IDLE_MS = 150` ms
  after the last `scroll` event on `window` (passive listener, debounce timer), never
  directly on an `activeSection` change. Why:
  - A click-triggered smooth scroll fires `scroll` events every frame until it ends, so no
    sync runs while the spy passes over the sections in between. When it ends, the active
    section is the target, the route already is the target → no-op. No "programmatic
    scroll in progress" flag is needed.
  - Initial load of `#/contact`: nothing syncs before the first `scroll` event. The
    `'instant'` jump from `scrollBehavior` fires one; 150 ms later the observer has reported
    `contact`, which equals the route → no-op. The default `'home'` of the spy can never
    overwrite the URL before the jump.
  - Reduced motion (D11): scrolls are instant, so the same idle rule applies; no extra case.
  - `scrollend` is not used (not available in all supported Safari versions); the debounce
    alone covers both cases, so there is one code path.
- **Any navigation cancels a pending sync:** the composable registers
  `router.beforeEach(() => clearTimer())` (removed on unmount). A click, back/forward or a
  legal-page link inside the 150 ms window therefore can never be cancelled by a late
  `replace` (Vue Router cancels a pending navigation when a new one starts).
- **Silent replace:** `replaceSectionSilently(router, id)`:
  1. returns if `router.currentRoute.value.meta.section` is not a section id (only section
     routes sync; imprint/privacy are untouched) or already equals `id` (no duplicated
     navigation, no work);
  2. sets the module-level one-shot marker `silentSyncTarget = id`;
  3. `await router.replace({ name: id })` — `replace`, so no history entry is added;
  4. if the result is a navigation failure, resets `silentSyncTarget = null` (no
     `scrollBehavior` call follows a cancelled/aborted navigation, so the marker must not
     leak into the next navigation).
- **`scrollBehavior` skips the silent replace:** its first statement becomes
  `if (consumeSilentSectionSync(to.meta.section)) return false`.
  `consumeSilentSectionSync(id)` returns `true` iff the marker is set and equals `id`, and
  **always** clears the marker (one-shot; a different navigation that overtook it scrolls
  normally). Returning `false` means "do not scroll", so the page stays where the user
  scrolled to. The marker is checked before `savedPosition` (replace passes none anyway).
  A module-level marker is chosen over `history.state`: `history.state` survives a reload,
  and a reload of a synced `#/contact` must still jump.
- **Unmount:** `LandingPage` unmounts when imprint/privacy opens; the composable removes
  the scroll listener, clears the timer and removes the `beforeEach` guard, so no replace
  runs from a legal page.
- **SEO:** each silent replace runs `router.afterEach` → `updatePageMetadata(home, '/')`.
  All section routes share the same metadata and canonical (D15), so the DOM writes are
  idempotent and happen at most once per scroll stop. No change to `seo.ts` or `afterEach`.
- **History:** back/forward still walk only the click-created entries; a synced entry is
  rewritten in place (e.g. the `#/projects` entry becomes `#/contact` after scrolling down).
- **Unchanged:** D4 click handling incl. the duplicated-navigation fallback (a click on the
  link of the current route, e.g. during the 150 ms window). Note: Vue Router 4.6 also calls
  `scrollBehavior(from, from)` on a duplicated navigation; the silent replace never
  produces one (step 1), so the marker is never consumed by a duplicate.

Code:

- New `app/src/composables/useSectionUrlSync.ts` (interfaces below), used in
  `LandingPage.vue` right after `useActiveSection()`:
  `useSectionUrlSync(activeSection)`.
- `app/src/router/index.ts`: the `consumeSilentSectionSync` line at the top of
  `scrollBehavior`. No other router change.

Tests:

- `useSectionUrlSync.spec.ts` (new; `vi.useFakeTimers()`, router with
  `createMemoryHistory` and the real section routes or stubs, a test host component that
  calls `useSectionUrlSync(ref)`):
  - `scroll` event + 150 ms with `activeSection = 'contact'` on `/` → route `contact`,
    via `replace` (spy: `router.replace` called, `router.push` not).
  - before 150 ms → no replace; a second `scroll` event restarts the timer.
  - active section equals the route → no replace.
  - current route is `imprint` → no replace.
  - a `router.push` during the window → no replace afterwards.
  - after unmount a `scroll` event does nothing.
- `consumeSilentSectionSync` / `replaceSectionSilently` (same spec): marker consumed once;
  mismatched id → `false` and cleared; failed replace resets the marker.
- `router.spec.ts`: after `replaceSectionSilently(router, 'about')`, `scrollIntoView` is not
  called; a normal `push` afterwards scrolls again; first navigation to `/contact` still
  scrolls to `#contact` (`'instant'`).
- `LandingPage.spec.ts`: no change needed beyond the existing `IntersectionObserver` stub.

## User Review Round 3 (2026-10-23)

### R6 — Timeline: continuous line behind the dot

User: "wenn man scrollt sieht man bei der "Lebenslinie" aktuell noch eine kleine Lücke. Sollte
das zu schwierig sein zu fixen können wir auch bei den Punkten auf vollfarbige Punkte
wechseln, dann müsstest du die Linie nicht unterbrechen".

Cause: the axis is a flex column of three items — top segment (28px, first entry 60px), the
20px dot, bottom segment (`flex-grow: 1`). The line therefore exists only above and below the
dot's 20px slot. While the dot is hidden (`opacity: 0`, R3) the slot is empty → a 20px gap;
while it flies in (`translateY(30px)` → 0) part of the slot is empty.

Decision: the axis draws one continuous line itself; the dot sits on top and covers it with
its `surface` fill. The hollow ring dots stay — the user's fallback (filled dots) is not
needed, because the line no longer depends on the dot at all.

- Template (`TimelineEntry.vue`): the axis contains only the dot —
  `<div class="timeline-entry__axis" aria-hidden="true"><span class="timeline-entry__dot"></span></div>`.
  Both `.timeline-entry__line` spans and the `.timeline-entry__line*` rules are removed.
- `.timeline-entry__axis`: keeps `grid-column: 2; grid-row: 1; display: flex;
  flex-direction: column; align-items: center`, adds `position: relative`.
- `.timeline-entry__axis::before`: `content: ''; position: absolute; top: 0; bottom: 0;
  left: calc(50% - 1px); width: 2px; background: var(--color-primary-container)`.
  It spans the full height of the `<li>` (the axis is stretched by the grid row), exactly
  where the top segment started (y = 0) and the bottom segment ended (entry bottom) before,
  so consecutive entries join without a seam. `calc(50% - 1px)` instead of
  `translateX(-50%)`: whole-pixel position in both the 48px (desktop) and 24px (mobile)
  column, no transform on the line. No `opacity`/`transform`/`transition` (static, R3).
- `.timeline-entry__dot`: adds `position: relative; z-index: 1; margin-top: 28px`;
  `.timeline-entry:first-child .timeline-entry__dot { margin-top: 60px }` (replaces the
  former top-segment heights, so the dot stays at the same place). `flex: none`, size,
  border, `background: var(--color-surface)` and the R3 fly-in are unchanged. `z-index`
  keeps the dot above the absolutely positioned pseudo-element in every animation phase
  (a positioned `::before` would otherwise paint over a non-positioned flex item).
- Effect: hidden or half-transparent dot → the line shows through, no gap; once visible the
  ring's surface fill hides the line inside the ring, as in the design.
- Dashed fade-out connector (`.timeline__fade-line` in `AboutSection.vue`): unchanged. The
  last entry's line still ends at the entry bottom, where the connector starts, in the same
  column centre (48px / mobile 24px) → seamless as before.
- Mobile (`24px` axis column): no extra rule; `left: calc(50% - 1px)` centres the line,
  `align-items: center` centres the dot.
- Reduced motion: unchanged (dot visible at once, line static).
- Tests (`TimelineEntry.spec.ts`):
  - replace "renders the axis line segments around the dot" with: the axis contains the dot
    and no `.timeline-entry__line` element;
  - replace the source-level "does not animate the axis line segments" check with: the
    rules whose selector contains `.timeline-entry__axis` set no `opacity`/`transform`/
    `transition`, and the `.timeline-entry__axis::before` rule contains `top: 0`,
    `bottom: 0`, `width: 2px` and `background: var(--color-primary-container)`;
  - source-level: `.timeline-entry__dot` has `margin-top: 28px`, the first-child dot rule
    `margin-top: 60px`.
  The visual seam is verified manually (desktop and 390px, scrolling slowly through the
  timeline, also with reduced motion).

## Affected Components

Created:

- `app/src/components/sections/HomeSection.vue`, `ProjectsSection.vue`, `AboutSection.vue`,
  `ContactSection.vue`
- `app/src/composables/useSectionNavigation.ts` (`SECTION_IDS`, `SectionId`, `isSectionId`,
  `scrollToSection`, `useSectionNavigation`)
- `app/src/composables/useActiveSection.ts`
- `app/src/composables/useSectionUrlSync.ts` (R5)
- `app/src/components/icons/IconMenu.vue`, `IconClose.vue`, `IconArrowDown.vue`,
  `IconOpenInNew.vue`, `IconSend.vue`
- `app/src/assets/styles/base.css`, `app/src/assets/styles/fonts.css`
- `app/src/assets/fonts/inter-latin-wght-normal.woff2`, `app/public/fonts/Inter-OFL.txt`

Changed:

- `app/src/router/index.ts` (D1, D2, D15), `app/src/seo.ts` (D15), `app/index.html` (D15)
- `app/src/App.vue` (D6, D8), `app/src/main.ts` (style imports)
- `app/src/views/LandingPage.vue`, `ImpressumPage.vue`, `DataProtectionPage.vue`
- `app/src/components/AppNavigation.vue`, `AppFooter.vue`, `ProjectCard.vue`,
  `TimelineEntry.vue`, `ContactForm.vue`
- `app/src/assets/styles/variables.css`
- `app/src/data/timeline.ts`
- `app/src/i18n/types.ts`, `locales/de.ts`, `locales/en.ts`
- `docs/architecture/stack.md` (Inter font, `base.css`), `docs/architecture/seo.md`
  (single page, canonical rule, JSON-LD graph)

Deleted:

- `app/src/views/AboutPage.vue`, `ProjectOverviewPage.vue`, `ContactPage.vue`
- `app/src/components/ContactInformation.vue`, `MdFilledButton.vue`, `MdOutlinedButton.vue`
- `app/src/components/icons/IconLocation.vue`, `IconChevronLeft.vue`, `IconChevronRight.vue`
- `app/src/utils/tagColor.ts`
- `app/public/bg_image.png`, `bg_image-{640,960,1280,1920,2560,3200}.jpg`

Tests (`app/src/__tests__/`, details in the test concept): update `router.spec.ts`,
`seo.spec.ts`, `App.spec.ts`, `AppNavigation.spec.ts`, `LandingPage.spec.ts`,
`ProjectCard.spec.ts`, `projects.spec.ts`, `timeline.spec.ts`, `TimelineEntry.spec.ts`,
`icons.spec.ts`, `ImpressumPage.spec.ts`, `DataProtectionPage.spec.ts`; move
`AboutPage.spec.ts` → `AboutSection.spec.ts`; new `ProjectsSection.spec.ts`,
`ContactSection.spec.ts`, `HomeSection.spec.ts`, `useSectionNavigation.spec.ts`,
`useActiveSection.spec.ts`, `useSectionUrlSync.spec.ts` (R5); delete `ContactInformation.spec.ts`, `tagColor.spec.ts`. jsdom
has no `scrollIntoView`/`IntersectionObserver`: stub them per test.

## Data Flow

```
URL #/projects  ──►  Vue Router (hash history)
                      │ route { name: 'projects', meta: { section: 'projects', seo: home } }
                      ├─► afterEach ─► updatePageMetadata(home, canonical '/')
                      ├─► RouterView ─► LandingPage (reused instance across section routes)
                      │                 ├─ AppNavigation :active-section ◄─┐
                      │                 ├─ HomeSection (AnimatedLogo)      │
                      │                 ├─ ProjectsSection (ProjectCard×n) │ useActiveSection
                      │                 ├─ AboutSection (latestTimelineEntries)│ (IntersectionObserver
                      │                 └─ ContactSection (ContactForm) ───┘  on #home…#contact)
                      └─► scrollBehavior ─► scrollToSection('projects', 'auto'|'instant')
                                             └─► #projects.scrollIntoView() (scroll-margin-top)

Click "Projekte" (nav / mobile menu / hero button)
  └─► goToSection('projects', e)
        ├─ modified click → browser default (href #/projects)
        ├─ router.push({ name: 'projects' }) → scrollBehavior as above
        └─ duplicated navigation → scrollToSection('projects', 'auto')

Manual scroll (R5)
  └─► window 'scroll' … 150 ms idle ─► useSectionUrlSync
        └─ activeSection ≠ route section ─► replaceSectionSilently(router, id)
              ├─ silentSyncTarget = id; router.replace({ name: id })  (no history entry)
              ├─ afterEach ─► updatePageMetadata(home, '/')  (idempotent)
              └─ scrollBehavior ─► consumeSilentSectionSync(id) ─► return false (no scroll)

Imprint page ── AppNavigation (activeSection null) ── click "Über mich"
  └─► push /about → LandingPage mounts → scrollBehavior 'instant' to #about
```

## Interfaces

```ts
// app/src/composables/useSectionNavigation.ts
export const SECTION_IDS = ['home', 'projects', 'about', 'contact'] as const
export type SectionId = (typeof SECTION_IDS)[number]
export function isSectionId(value: unknown): value is SectionId
/** home → window.scrollTo top 0; others → element.scrollIntoView({ block: 'start' }). */
export function scrollToSection(id: SectionId, behavior: 'auto' | 'instant'): void
export interface SectionNavigation {
  sectionHref(id: SectionId): string                         // e.g. '#/projects'
  goToSection(id: SectionId, event?: MouseEvent): Promise<void>
}
export function useSectionNavigation(): SectionNavigation

// app/src/composables/useActiveSection.ts
export function useActiveSection(): { activeSection: Readonly<Ref<SectionId>> }

// app/src/composables/useSectionUrlSync.ts (R5)
export const SECTION_URL_SYNC_IDLE_MS = 150
/** scrollBehavior: true once if this navigation is the silent sync to `id`; always clears the marker. */
export function consumeSilentSectionSync(id: SectionId | undefined): boolean
/** No-op off section routes or if already on `id`; else marker + router.replace; marker reset on failure. */
export function replaceSectionSilently(router: Router, id: SectionId): Promise<void>
/** Scroll-idle debounce → replaceSectionSilently(activeSection); beforeEach cancels; cleanup on unmount. */
export function useSectionUrlSync(activeSection: Readonly<Ref<SectionId>>): void

// app/src/components/AppNavigation.vue
defineProps<{ activeSection?: SectionId | null }>()          // default null

// app/src/data/timeline.ts
export const LATEST_TIMELINE_ENTRY_COUNT = 3
export const latestTimelineEntries: TimelineEntry[]

// app/src/router/index.ts — route meta
declare module 'vue-router' {
  interface RouteMeta { seo?: PageMetadata; section?: SectionId }
}

// app/src/seo.ts
export const pageMetadata: { home: PageMetadata; imprint: PageMetadata; privacy: PageMetadata }
export function updatePageMetadata(metadata: PageMetadata, canonicalPath: string): void
```

Section components take no props (they read their data and i18n directly). `TimelineEntry`
keeps its props (`entry`, `side`, `isVisible`). `ProjectCard` keeps `project: Project`.

## Open Questions

All resolved by the user on 2026-10-23:

1. **X chip:** not added.
2. **Contact information card:** dropped as in the design; the location "Leipheim" is no
   longer shown.
3. **Material Web:** stays registered as is; no follow-up ticket.
4. **Carousel arrows:** none, as in the design (D12).
5. **Dark theme:** out of scope; no follow-up ticket.
