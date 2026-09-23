---
type: Architecture Concept
title: Mobile Project Screenshot Carousel (Project Page Scaling Bug)
description: Fixes the project card overflowing the viewport on phones and portrait tablets, and shows a single screenshot with lightbox-style prev/next arrows below 768px.
tags: [mobile-project-screenshot-carousel, bug, project-overview, components, i18n, css]
timestamp: 2026-09-23T00:00:00+02:00
status: draft
---

## Story

As a visitor opening the project page on a mobile phone or a small tablet in
portrait orientation, I want each project card to fit the screen width and
show one screenshot at a time with navigation arrows, so that the page does not
scale or scroll sideways and I can still browse all screenshots.

## Requirements Authority

Trello card: https://trello.com/c/Ha7XlAGu/13-scaling-but-on-mobile-phones-project-page

The Trello card description is canonical for requirements, acceptance criteria,
dependencies, and ticket state. This document covers these acceptance criteria:

- AC-1: Fix the scaling issue by showing only one picture at a time on small
  devices.
- AC-2: Show navigation arrows like the ones in the picture detail view (the
  `vue-easy-lightbox` lightbox).

## Root Cause Analysis

Commit `12e8f44` added the screenshot row to `ProjectCard.vue`:

- `.project-images--gallery` is a flex row with `overflow-x: auto`.
- Each `.project-image` has `flex: 1 1 220px; min-width: 220px`.

The intent was that the row scrolls horizontally inside the card once the
images reach 220px. That never happens on narrow viewports because of how the
card is sized:

1. `ProjectOverviewPage.vue` places cards in `.projects-grid` with
   `grid-template-columns: 1fr`. `1fr` means `minmax(auto, 1fr)`, so the
   track can never be narrower than the **min-content contribution** of its
   grid item.
2. The grid item, `.project-card`, has `overflow: visible` and no `min-width`,
   so its automatic minimum size is its min-content width.
3. `overflow-x: auto` on the gallery row does **not** reduce the row's
   intrinsic min-content width. The row still reports
   `n × 220px + (n − 1) × 8px`, which is 676px for the three myStandby
   screenshots.
4. The card therefore has a minimum width of 676px plus 64px padding plus 2px
   border, about 742px. The grid track grows to that width, and the card
   overflows `.content` and the viewport. On any viewport narrower than about
   806px (742px plus 64px `.content` padding), the card is wider than the
   header or navigation, and mobile browsers zoom out or scroll the whole page
   sideways. That is the reported "scaling" bug.

The two-image michaelschreiber.net card has the same problem at a smaller
threshold of about 448px + 66px + 64px = 578px, so it also overflows on every
phone.

## Architecture Decisions

### D1: Clamp the card's minimum width (the actual overflow fix)

- `ProjectCard.vue`: add `min-width: 0` to `.project-card`.
- `ProjectOverviewPage.vue`: change `.projects-grid` to
  `grid-template-columns: minmax(0, 1fr)`.

**Why:** Either change alone breaks the min-content chain described above.
`min-width: 0` on the card makes the component safe in any grid or flex
parent. `minmax(0, 1fr)` states the intent at the page level. Both are single
declarations that do not affect layouts where the content already fits. With
this fix alone, the existing desktop behavior (the row scrolls inside the card
once images reach 220px) works as originally designed at every width above the
breakpoint.

### D2: Breakpoint is `max-width: 768px`

**Why:** It is the project's single established mobile breakpoint, already
used by `AppNavigation.vue` (hamburger menu), `AppFooter.vue`,
`TimelineEntry.vue`, `AboutPage.vue`, `ContactPage.vue`, `LandingPage.vue`, and
`DataProtectionPage.vue`. It covers phones and small tablets in portrait
orientation (for example, iPad mini portrait at 768px is included because
`max-width` is inclusive). This matches the card's "phones or smaller tablets
(portrait)". Wider portrait tablets (810px or more) keep the desktop row,
which scrolls correctly inside the card because of D1.

A TypeScript constant `MOBILE_BREAKPOINT = 768` is added to `ProjectCard.vue`
for the `sizes` attribute (D6). CSS media queries cannot read custom
properties, so the CSS uses the literal `768px`. A comment next to both must
say they need to stay in sync.

### D3: One image at a time is controlled by CSS; the active index is Vue state

All images stay in the DOM, rendered by the existing `v-for`. A new
`currentIndex` ref marks one image with the class `project-image--active`.
Inside `@media (max-width: 768px)`, every `.project-image` without
`--active` gets `display: none`. The row switches to `overflow: hidden`, and
the active image fills the full row width.

**Why this approach instead of a JS `matchMedia` listener that renders a
different template:**

- There are no resize listeners and no teardown, and nothing can flash with
  the wrong layout before a listener runs. The browser applies the layout
  switch.
- Desktop markup and behavior stay unchanged. `currentIndex` has no visual
  effect above the breakpoint.
- `display: none` removes hidden images from the tab order and the
  accessibility tree, so keyboard and screen-reader users only reach the
  visible image on mobile.
- Hidden images use `loading="lazy"`, and browsers do not fetch lazy images
  that are `display: none`. Mobile users only download the screenshots they
  navigate to.

### D4: Navigation arrows mirror the lightbox's prev/next buttons

`vue-easy-lightbox` only exports its default component and `useEasyLightbox`.
Its internal arrow buttons and SVG sprite cannot be reused. The card therefore
gets its own two `<button>` elements, styled to look and behave like the
lightbox arrows:

| Lightbox (`.vel-btns-wrapper .btn__prev/.btn__next`) | Card (`.gallery-nav`) |
|---|---|
| White chevron icon, `color: #fff` | White chevron icon, `color: #fff` |
| `position: absolute; top: 50%; transform: translateY(-50%)` | Same, relative to `.project-gallery` |
| Mobile offset `left: 4px` / `right: 4px` | `left: var(--spacing-xs)` / `right: var(--spacing-xs)` (4px) |
| `opacity: .6`, `1` on hover | `opacity: .6`, `1` on `:hover` and `:focus-visible` |
| `transition: .15s linear` | `transition: opacity var(--transition-fast)` |
| Sits on the dark modal mask `rgba(0,0,0,.5)` | Circular backdrop `background: rgba(0, 0, 0, 0.5)`, the same color as the lightbox mask. This keeps the white icon readable on light screenshots. |
| `loop` enabled on the lightbox | Navigation wraps around (last → first, first → last), so the buttons are never disabled |

Button box: `width: 40px; height: 40px; border-radius: var(--radius-full);
border: 0; padding: 0; display: inline-flex; align-items: center;
justify-content: center; cursor: pointer; z-index: 2`. The icon is 24px. The
40px target is larger than the WCAG 2.5.8 minimum of 24px. Focus ring:
`:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }`.

Icons are two new flat icon components that follow the existing
`components/icons/` contract (`viewBox="0 0 24 24"`, `fill="currentColor"`,
`aria-hidden="true"`, `svg { width: 100%; height: 100% }`), using the Material
chevron paths:

- `IconChevronLeft.vue`: `M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z`
- `IconChevronRight.vue`: `M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z`

Put each icon inside a `<span class="gallery-nav__icon">` sized to 24px × 24px,
because the icon components fill 100% of their parent.

**Why:** The AC asks for arrows "like on the detail view." Copying the visual
tokens gives the look without depending on the library's private markup.
Separate icon components follow the pattern set by `minor-changes`, which keeps
SVG path data out of view templates.

The arrows are rendered only when `images.length > 1`, because a single image
has nothing to navigate. Outside the media query they are `display: none`, so
desktop is unaffected.

### D5: Clicking or activating the visible image opens the lightbox at the correct index

This needs no logic change. The existing handlers
`@click` / `@keydown.enter` / `@keydown.space.prevent="openLightbox(index)"`
use the `v-for` index. On mobile the only rendered and clickable image is the
one where `index === currentIndex`, so the lightbox always opens at the
screenshot the user sees. The arrows are siblings of the image row, not
children of the images, so clicking an arrow never triggers `openLightbox`.

Lightbox navigation is **not** synced back to `currentIndex`. Closing the
lightbox returns to the image that was visible before. This avoids extra state
coupling that the story does not ask for.

### D6: Responsive `sizes` gets a mobile entry

`sizesFor(count)` gains a leading entry:
`(max-width: ${MOBILE_BREAKPOINT}px) calc(100vw - ${FIXED_HORIZONTAL_SPACING}px)`.
The existing entries follow unchanged.

**Why:** On mobile the single visible image fills the card's content box, about
`100vw − 128px`. Without this entry, the three-image card would advertise
`220px`, because its current scroll breakpoint is about 804px, which is above
768px. The browser would then pick a variant that is too small for 2x/3x
phone screens.

### D7: Accessibility

- The arrows are native `<button type="button">` elements, so Enter and Space
  work, and they have visible focus.
- `aria-label` comes from new i18n keys `projects.previousScreenshot` and
  `projects.nextScreenshot`. The icons are `aria-hidden`.
- DOM order is **prev button → image row → next button → status**, so the
  mobile tab order is Previous → visible image (opens lightbox) → Next.
- A visually hidden status element (`<p class="gallery-status"
  aria-live="polite">`) shows `t('projects.screenshotPosition', { current:
  currentIndex + 1, total: images.length })`. Screen readers then announce
  "Screenshot 2 of 3" when the user activates an arrow, because focus stays on
  the button while the image changes. The element is `display: none` above the
  breakpoint and uses a scoped visually-hidden recipe on mobile (`position:
  absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow:
  hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0`). There is no
  global `sr-only` utility in the project yet, and adding one is out of scope.
- Swipe gestures, dot indicators, and ArrowLeft/ArrowRight shortcuts on the
  card are out of scope. The AC asks only for arrows.

## Affected Components

| File | Change |
|---|---|
| `app/src/components/ProjectCard.vue` | `currentIndex` state plus `showPrevious` / `showNext`; `MOBILE_BREAKPOINT` constant; `sizesFor` mobile entry; wrap the gallery in `.project-gallery` with prev/next buttons and live status; `project-image--active` class binding; CSS: `min-width: 0` on `.project-card`, `.project-gallery`, `.gallery-nav*`, `.gallery-status`, and the `@media (max-width: 768px)` block. |
| `app/src/views/ProjectOverviewPage.vue` | `.projects-grid { grid-template-columns: minmax(0, 1fr); }` |
| `app/src/components/icons/IconChevronLeft.vue` | New flat icon component. |
| `app/src/components/icons/IconChevronRight.vue` | New flat icon component. |
| `app/src/i18n/types.ts` | Add `previousScreenshot`, `nextScreenshot`, `screenshotPosition` to `projects`. |
| `app/src/i18n/locales/de.ts` | German texts (see Interfaces). |
| `app/src/i18n/locales/en.ts` | English texts (see Interfaces). |
| `app/src/__tests__/ProjectCard.spec.ts` | Extend with carousel tests (see Test Guidance). |
| `app/src/__tests__/icons.spec.ts` | Add the two chevron icons to the `describe.each` table. |

No changes to `types/project.ts`, `data/projects.json`, the router, stores, or
dependencies.

## Data Flow

```text
projects.json ──► ProjectOverviewPage (.projects-grid minmax(0,1fr))
                      │ :project
                      ▼
                 ProjectCard
                   currentIndex (ref, 0)          lightboxIndex / lightboxVisible
                      │                                   ▲
   [‹ prev] ──showPrevious()──► currentIndex = (i-1+n)%n  │
   [next ›] ──showNext()──────► currentIndex = (i+1)%n    │
                      │                                   │
                      ▼                                   │
   <img v-for ... :class="{ 'project-image--active': index === currentIndex }">
        │  CSS ≤768px: non-active → display:none         │
        └── click / Enter / Space ── openLightbox(index) ─┘
                      │
                      ▼
   <p class="gallery-status" aria-live="polite"> "Screenshot {current} of {total}"
```

## Interfaces

### ProjectCard.vue script additions

```ts
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue'
import IconChevronRight from '@/components/icons/IconChevronRight.vue'

/** Keep in sync with the `@media (max-width: 768px)` block in <style>. */
const MOBILE_BREAKPOINT = 768

const currentIndex = ref(0)
const imageCount = computed(() => props.project.images?.length ?? 0)

function showPrevious(): void {
  if (imageCount.value < 2) return
  currentIndex.value = (currentIndex.value - 1 + imageCount.value) % imageCount.value
}

function showNext(): void {
  if (imageCount.value < 2) return
  currentIndex.value = (currentIndex.value + 1) % imageCount.value
}
```

In `sizesFor`, add the entry
`` `(max-width: ${MOBILE_BREAKPOINT}px) calc(100vw - ${FIXED_HORIZONTAL_SPACING}px), ` ``
before the existing first entry.

### ProjectCard.vue template (gallery branch only; placeholder branch unchanged)

```html
<div v-if="project.images?.length" class="project-gallery">
  <button
    v-if="imageCount > 1"
    type="button"
    class="gallery-nav gallery-nav--prev"
    :aria-label="t('projects.previousScreenshot')"
    @click="showPrevious"
  >
    <span class="gallery-nav__icon"><IconChevronLeft /></span>
  </button>
  <div class="project-images project-images--gallery">
    <img
      v-for="(image, index) in project.images"
      ...all existing attributes and handlers unchanged...
      :class="['project-image', { 'project-image--active': index === currentIndex }]"
    />
  </div>
  <button v-if="imageCount > 1" type="button" class="gallery-nav gallery-nav--next"
    :aria-label="t('projects.nextScreenshot')" @click="showNext">
    <span class="gallery-nav__icon"><IconChevronRight /></span>
  </button>
  <p v-if="imageCount > 1" class="gallery-status" aria-live="polite">
    {{ t('projects.screenshotPosition', { current: currentIndex + 1, total: imageCount }) }}
  </p>
</div>
```

`VueEasyLightbox` stays where it is, unchanged.

### CSS (scoped)

```css
.project-card { /* existing */ min-width: 0; }

/* margin moves from .project-images to the wrappers so the arrows center on the image */
.project-images { gap: var(--spacing-sm); }
.project-images--placeholder { /* existing */ margin-bottom: var(--spacing-lg); }
.project-gallery { position: relative; margin-bottom: var(--spacing-lg); }

.gallery-nav, .gallery-status { display: none; }

/* Keep in sync with MOBILE_BREAKPOINT in <script>. */
@media (max-width: 768px) {
  .project-images--gallery { overflow: hidden; scroll-snap-type: none; padding-bottom: 0; }
  .project-image { flex: 1 1 100%; min-width: 0; }
  .project-image:not(.project-image--active) { display: none; }
  .gallery-nav { display: inline-flex; /* + D4 box, color, opacity, position */ }
  .gallery-nav--prev { left: var(--spacing-xs); }
  .gallery-nav--next { right: var(--spacing-xs); }
  .gallery-status { display: block; /* + D7 visually-hidden recipe */ }
}
```

Note: `.project-card > *` already sets `position: relative; z-index: 1` on
`.project-gallery`, which is a direct child, so the absolutely positioned
arrows are placed relative to the gallery. The arrows need `z-index: 2` so
they stay above the image when it scales on hover.

### i18n keys (`projects`)

| Key | de | en |
|---|---|---|
| `previousScreenshot` | `Vorheriger Screenshot` | `Previous screenshot` |
| `nextScreenshot` | `Nächster Screenshot` | `Next screenshot` |
| `screenshotPosition` | `Screenshot {current} von {total}` | `Screenshot {current} of {total}` |

## Test Guidance

jsdom does not apply scoped SFC styles. Test the behavior through the DOM, and
test the CSS contract through the raw source. `ProjectCard.spec.ts` already
reads the raw SFC with `?raw`.

- Project with 3 images: two `.gallery-nav` buttons with the localized
  `aria-label`s; the first image has `project-image--active` initially.
- Next moves the active image 0 → 1 → 2 → 0 (wraps). Previous from 0 moves to
  2 (wraps).
- The status text shows `Screenshot 2 von 3` after one Next (de).
- After navigating to index 1, clicking the active image sets the
  `VueEasyLightbox` props to `visible: true` and `index: 1`.
- Project with 1 image: no `.gallery-nav` and no `.gallery-status`.
- Project without images: the placeholder renders and no `.gallery-nav`
  appears.
- Raw-source assertions: `.project-card` contains `min-width: 0`; an
  `@media (max-width: 768px)` block hides `.project-image:not(.project-image--active)`.
- `icons.spec.ts`: add `IconChevronLeft` and `IconChevronRight`.
- Manual check: in Chrome DevTools at 360px, 390px, and 768px (portrait), the
  card is not wider than the navigation header, the page has no horizontal
  scrollbar, one image is shown with the arrows, and tapping the image opens
  the lightbox at that image. At 1024px and above, the multi-image row is
  unchanged. At about 800px, the row scrolls inside the card without page
  overflow.

## Open Questions

None. Swipe support and syncing lightbox navigation back to the card are
deliberately out of scope (see D5 and D7).
