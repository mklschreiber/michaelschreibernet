---
type: Test Concept
title: Tests for myStandby - New Marketing Images
description: Covers the new image order of the myStandby entry (Desk, Bedroom, Kitchen, then the old screenshots), the responsive variants and originals of the three new images, their de/en alt texts, the rendered first card, and the sizes hint for galleries of five or more images.
tags: [MS-14, tests]
timestamp: 2026-10-18T12:00:00+02:00
---

## Requirements Authority

Jira: MS-14 — https://mklschreiber.atlassian.net/browse/MS-14. Architecture:
[MS-14-mystandby-new-images.md](MS-14-mystandby-new-images.md).

- AC-1: myStandby_Desk is the 1st image.
- AC-2: myStandby_Bedroom is the 2nd image.
- AC-3: myStandby_Kitchen is the 3rd image.
- AC-4: All old images are behind the new images.
- AC-5: All images are scaled to different sizes to limit data usage
  (concept D3: responsive width variants, not crops).

## Scope

- **Data level** (`projects.spec.ts`, `projects.json` import): the myStandby
  app is still the first entry (id 1). Its `images` array equals the
  six-element array from the concept (D1). Separate cases check Desk 1st
  (AC-1), Bedroom 2nd (AC-2), Kitchen 3rd (AC-3), and the three old
  screenshots behind them in their old order (AC-4).
- **Asset level** (`projects.spec.ts`, Node `fs`): the existing data-driven
  tests from MS-1 pick up the three new bases with no change. They check that
  all six variants (320–1920) exist and that each JPEG has the pixel width in
  its suffix (AC-5). That adds 36 cases. New cases check that the unsuffixed
  originals of the three new bases are committed and are wider than 1920px,
  so every variant is a real downscale (D3, D4).
- **i18n level** (`projects.spec.ts`): the existing key-resolution test picks
  up the three new alt keys in de and en (6 cases). New cases pin the exact
  de/en texts from D6.
- **Page level** (`projects.spec.ts`, Vue Test Utils, `AppNavigation`
  stubbed): the first card on `ProjectOverviewPage` renders six
  `img.project-image` elements whose `src` values follow the data order
  (`-960.jpg`). The Desk image is the active carousel image. The first image
  has the localized Desk alt text (de and en) and a `srcset` with all six
  Desk variants. The carousel status reads "Screenshot 1 of 6".
- **Component level** (`ProjectCard.spec.ts`): the `sizes` fix (D5). A
  6-image gallery gets `(max-width: 768px) calc(100vw - 128px), 220px` on
  every image. The boundary is covered on both sides: 5 images already get
  the short value, and 4 images keep the full four-entry value. The existing
  3-image `sizes` test is unchanged and still passes.

Not tested: the JPEG quality setting and file sizes (an encoding detail, not
behavior), and which `srcset` candidate the browser picks.

## Test Cases

| Class / Module | Test Case | Level | Status |
|--------|----------|-------|--------|
| projects.json | keeps the myStandby app as the first entry | Unit | ✅ |
| projects.json | lists Desk, Bedroom and Kitchen first, then the old screenshots in their old order | Unit | ✅ |
| projects.json | shows the Desk image first (AC-1) | Unit | ✅ |
| projects.json | shows the Bedroom image second (AC-2) | Unit | ✅ |
| projects.json | shows the Kitchen image third (AC-3) | Unit | ✅ |
| projects.json | keeps all old screenshots behind the new images (AC-4) | Unit | ✅ |
| app/public | commits the unsuffixed original of desk / bedroom / kitchen (3 cases) | Unit | ✅ |
| app/public | keeps each original wider than the largest variant (3 cases) | Unit | ✅ |
| app/public | has every `<base>-<w>.jpg` variant (existing, now 10 bases × 6 widths = 60 cases) | Unit | ✅ |
| app/public | scales every variant to the width in its suffix (existing, now 60 cases) | Unit | ✅ |
| de.ts / en.ts | resolves every key used by projects.json in de and en (existing, parameterized, +6 cases) | Unit | ✅ |
| en.ts | describes the Desk image in English | Unit | ✅ |
| de.ts | describes the Desk image in German | Unit | ✅ |
| en.ts | describes the Bedroom image in English | Unit | ✅ |
| de.ts | describes the Bedroom image in German | Unit | ✅ |
| en.ts | describes the Kitchen image in English | Unit | ✅ |
| de.ts | describes the Kitchen image in German | Unit | ✅ |
| ProjectOverviewPage | renders the six images in data order on the first card | Component | ✅ |
| ProjectOverviewPage | makes the Desk image the active carousel image on the first card | Component | ✅ |
| ProjectOverviewPage | shows the English Desk alt text on the first image | Component | ✅ |
| ProjectOverviewPage | shows the German Desk alt text on the first image | Component | ✅ |
| ProjectOverviewPage | offers width-suffixed variants of the Desk image | Component | ✅ |
| ProjectOverviewPage | starts the carousel status at screenshot 1 of 6 | Component | ✅ |
| ProjectCard | advertises only the mobile width and the 220px min-width for six images | Component | ✅ |
| ProjectCard | gives every image of a six-image gallery the same sizes value | Component | ✅ |
| ProjectCard | switches to the short sizes value from five images on | Component | ✅ |
| ProjectCard | keeps the full desktop sizes value for four images | Component | ✅ |
| ProjectCard | advertises the mobile content width first, then the unchanged desktop sizes (existing, 3 images) | Component | ✅ |

Check results: `npm run test:unit -- --run` (14 files / 329 tests; 28 new
explicit cases plus 42 new data-driven cases), `npm run lint`, and
`npm run build` (including `vue-tsc`) all pass.

## Untested Areas

- **Real layout and network behavior.** jsdom does not lay out pages, apply
  scoped styles or load images. Manual browser check in `npm run dev`: the
  myStandby card shows Desk, Bedroom and Kitchen first and the old
  screenshots after them in the scrolling row. At phone width the carousel
  starts at Desk, says "Screenshot 1 of 6", and loops. The lightbox opens the
  clicked image. The network panel shows only width-suffixed variants, never
  an original.
- **Visual crop by the `3 / 2` box.** Whether the phone and stand stay
  visible in the `object-fit: cover` box is a visual judgment. It is part of
  the manual check above.
- **Alt text wording.** The tests pin the D6 texts. Whether they describe the
  photos well is a review decision, not a test.
