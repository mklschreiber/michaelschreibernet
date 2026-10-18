---
type: Architecture Concept
title: myStandby - New Marketing Images
description: Puts the three new myStandby marketing photos (Desk, Bedroom, Kitchen) in front of the existing screenshots of the myStandby project card, as sips-generated 320-1920px JPEG width variants, and fixes the image sizes hint for galleries that always scroll.
tags: [MS-14, project-overview, data-modules, components, i18n, public-assets, tests]
timestamp: 2026-10-18T00:00:00+02:00
status: draft
---

## Story

As a user, I want to see the new myStandby marketing images in the overview
of the myStandby project, so that I get a good impression of the application.

Jira: MS-14 — https://mklschreiber.atlassian.net/browse/MS-14

Acceptance criteria (from Jira):

- AC-1: myStandby_Desk 1st image
- AC-2: myStandby_Bedroom 2nd image
- AC-3: myStandby_Kitchen 3rd image
- AC-4: All old images behind the new images
- AC-5: All images are scaled to different aspect ratios to limit data usage

## Current State

- The myStandby app is the first entry (id 1) in `app/src/data/projects.json`.
  It has three images: `/mystandby_1_phone`, `/mystandby_2_phone`,
  `/mystandby_3_phone`, with the alt keys
  `projects.screenshotMyStandbyLockScreenAlt`, `…CalendarAlt` and
  `…LockScreenCloseUpAlt`.
- `ProjectCard.vue` renders `project.images` in array order. `src` is
  `${base}-960.jpg`, `srcset` lists `${base}-${w}.jpg` for
  `IMAGE_WIDTHS = [320, 640, 960, 1280, 1600, 1920]`, and the lightbox uses
  `${base}-1920.jpg`. Each image box is `aspect-ratio: 3 / 2` with
  `object-fit: cover`, `flex: 1 1 220px` and `min-width: 220px`. The desktop
  row scrolls horizontally when the images do not fit. Below 768px the card is
  a one-image carousel ([mobile-project-screenshot-carousel.md](mobile-project-screenshot-carousel.md)):
  only the image at `currentIndex` (start: 0) is shown, the others are
  `display: none`.
- Asset convention (see [MS-1-mystandby-landingpage.md](MS-1-mystandby-landingpage.md), D5):
  in `app/public/` the unsuffixed original is committed next to six width
  variants made with `sips -s format jpeg -s formatOptions 80 --resampleWidth <w>`.
  The aspect ratio is kept. The existing myStandby originals are
  2816×1536 JPEGs of about 3 MB each, and they are committed.
- `projects.spec.ts` already checks, for every image `base` of every project,
  that all six variants exist and have the pixel width in their suffix. It
  also checks that every `altKey` resolves in `de` and `en`.

The three new sources (Jira attachments) are 2752×1536 sRGB JPEGs
(~1.79:1, 300 dpi, 2.8–3.9 MB). They show a phone running myStandby on a
MagSafe-style stand: on a desk (flip clock + photo stack), on a bedside table
at night (time and date), and on a kitchen counter (photo stack).

## Architecture Decisions

### D1 — Order: three new images first, old images unchanged behind them (AC-1 to AC-4)

The `images` array of entry id 1 becomes:

1. `/mystandby_desk` (AC-1)
2. `/mystandby_bedroom` (AC-2)
3. `/mystandby_kitchen` (AC-3)
4. `/mystandby_1_phone`
5. `/mystandby_2_phone`
6. `/mystandby_3_phone` (AC-4: old images keep their order, behind the new ones)

No component change is needed for the order. The card renders the array
order. The lightbox index follows the array index. The mobile carousel starts
at index 0, so phones show the Desk image first.

No old image is removed: AC-4 says "behind", not "replace".

### D2 — File names

`mystandby_desk`, `mystandby_bedroom`, `mystandby_kitchen`: the `mystandby_`
prefix like every other myStandby asset, then the scene name from the Jira file
name in lower case. This follows the existing lower-case, underscore style
(`mystandby_1_phone`, `mystandby_landing_macbook`). No device suffix
(`_phone`): these are photos of a scene, not device screenshots. The names do
not clash with existing files.

The Bedroom source is `myStandby_Bedroom.jpeg`. It is committed as
`mystandby_bedroom.jpg` so that every file uses `.jpg`, like all other assets.
`srcsetFor` builds `.jpg` names anyway.

### D3 — Responsive variants and interpretation of AC-5

**Interpretation.** "Scaled to different aspect ratios to limit data usage"
has the same meaning as MS-1 AC-5 ("scaled for the different aspect ratios").
It means: each image is available in several **sizes**, and the browser loads
only the smallest one that is big enough for the current screen width and
pixel density. It does **not** mean cropped versions with different
width:height ratios. Reasons:

- The card already shows every image in a fixed `3 / 2` box with
  `object-fit: cover`. Separately cropped files would not change what is
  visible, and they would not save data.
- The established, tested mechanism for data usage is `srcset` + `sizes`
  with the six width variants. A second mechanism (`<picture>` with
  art-direction crops) would be new code without any user benefit for this
  story.
- "All images" is already met for the old images. They already have the six
  variants, and `projects.spec.ts` checks this for every image.

**Generation.** For each of the three sources, the six widths 320, 640, 960,
1280, 1600 and 1920 are made with `sips`, JPEG quality 80, aspect ratio kept,
no cropping. This is the same command as in MS-1. All sources are wider than
1920, so every variant is a real downscale. `cwebp`/WebP is **not** used:
`ProjectCard.vue` builds `.jpg` names only. A WebP set would need a `<picture>`
element or a second naming scheme for 3 of 9 images. JPEG at quality 80
already reduces the 1920 variant from about 3 MB to 300–420 KB.

Run from the repository root (`S` is the folder with the downloaded Jira
attachments):

```sh
S=/private/tmp/claude-501/-Users-schreiber-Projekte-michaelschreibernet/1f9e65f5-f436-46b3-ab82-7e3ae999106f/scratchpad/ms14-attachments
cd app/public
cp "$S/myStandby_Desk.jpg"      mystandby_desk.jpg
cp "$S/myStandby_Bedroom.jpeg"  mystandby_bedroom.jpg
cp "$S/myStandby_Kitchen.jpg"   mystandby_kitchen.jpg
for name in mystandby_desk mystandby_bedroom mystandby_kitchen; do
  for w in 320 640 960 1280 1600 1920; do
    sips -s format jpeg -s formatOptions 80 --resampleWidth "$w" "$name.jpg" --out "$name-$w.jpg"
  done
done
```

Expected result: 21 new files (3 originals + 18 variants). A dry run of this
exact command gave these sizes (height px / file size). Check them with
`sips -g pixelWidth -g pixelHeight mystandby_desk* mystandby_bedroom* mystandby_kitchen*`:

| Width | desk | bedroom | kitchen |
|---|---|---|---|
| 320 | 178 / 19 KB | 178 / 16 KB | 178 / 22 KB |
| 640 | 357 / 52 KB | 357 / 50 KB | 357 / 67 KB |
| 960 | 536 / 96 KB | 536 / 95 KB | 536 / 132 KB |
| 1280 | 714 / 146 KB | 714 / 144 KB | 714 / 198 KB |
| 1600 | 893 / 215 KB | 893 / 227 KB | 893 / 307 KB |
| 1920 | 1071 / 296 KB | 1071 / 324 KB | 1071 / 420 KB |

The ~1.79:1 sources are cropped only on screen by the `3 / 2` box, a little at
the sides, like the existing ~1.83:1 `mystandby_N_phone` images. In all three
photos the phone and stand are in the center, so nothing important is cut off.

### D4 — Commit the full-size originals

The originals are committed unchanged (byte copies of the attachments) next to
the variants. The app never references them.

- The existing pattern already decides this: all 7 existing image bases,
  including the three ~3 MB myStandby originals, are committed in
  `app/public/`.
- They are the only source for regenerating variants later, for example if
  `IMAGE_WIDTHS` changes. The Jira attachment is not a reliable long-term
  source.
- Cost: about 10 MB more in the repository (`.git` is about 22 MB now), and
  10 MB more in the GitHub Pages deploy. Visitors never download them because
  no URL points to them. This is acceptable for a personal site, and it is the
  same cost per image that was accepted for the existing images.

Leaving the originals out would make these three images the only ones without
a source, and it would break the pattern for an unclear gain. Moving all
originals out of `app/public/` would be a separate, repository-wide decision
that this story does not need.

### D5 — Correct `sizes` for galleries that always scroll on desktop

With six images, `sizesFor(6)` gives a wrong hint today:

```
fixedWidth       = 128 + 8 * 5        = 168
scrollBreakpoint = 220 * 6 + 168      = 1488   (> CONTAINER_MAX_WIDTH 1200)
maxImageWidth    = (1200 - 168) / 6   = 172
→ "(max-width: 768px) calc(100vw - 128px), (max-width: 1488px) 220px,
   (max-width: 1200px) calc((100vw - 168px) / 6), 172px"
```

The third entry can never match, because the second one already covers all
widths up to 1488px. Above 1488px the hint says 172px, but the images are
really 220px wide: six 220px images plus gaps (1360px) never fit into the
1072px content width, so the row scrolls and every image stays at its
`min-width`. The browser can then pick a variant that is too small, for
example 320w at 1.5× density where 330px is needed. This happens for any
gallery with 5 or more images, and this story creates the first one.

**Decision:** when `scrollBreakpoint >= CONTAINER_MAX_WIDTH`, the row scrolls
at every desktop width, so `sizesFor` returns only the mobile entry and
`${IMAGE_MIN_WIDTH}px`:

```
(max-width: 768px) calc(100vw - 128px), 220px
```

For galleries with 4 or fewer images (`scrollBreakpoint < 1200`) the output
does not change. The existing 3-image test value stays valid. This is the
smallest correct fix. It is in scope because the story's six-image gallery
causes the problem, and AC-5 asks for correctly sized images.

On phones nothing changes: only the active carousel image is displayed, and
`loading="lazy"` together with `display: none` means hidden images are not
loaded until they are shown.

### D6 — Alt texts and i18n

Three new keys in `projects`. They follow the existing `screenshot…Alt` key
family, so all image alt keys stay together and follow one naming pattern,
even though these images are photos:

| Key | en | de |
|---|---|---|
| `screenshotMyStandbyDeskAlt` | `myStandby on a smartphone in a charging stand on a desk, showing a flip clock and a photo stack` | `myStandby auf einem Smartphone in einer Ladestation auf dem Schreibtisch, mit Klappuhr und Fotostapel` |
| `screenshotMyStandbyBedroomAlt` | `myStandby on a smartphone on a bedside table at night, showing the time and date` | `myStandby auf einem Smartphone auf dem Nachttisch bei Nacht, mit Uhrzeit und Datum` |
| `screenshotMyStandbyKitchenAlt` | `myStandby on a smartphone in a charging stand on a kitchen counter, showing a photo stack` | `myStandby auf einem Smartphone in einer Ladestation auf der Küchenarbeitsplatte, mit Fotostapel` |

Add them to `MessageSchema` (`app/src/i18n/types.ts`) as `string`, and to
`en.ts` and `de.ts`. Put them directly **before**
`screenshotMyStandbyLockScreenAlt`, in the order Desk, Bedroom, Kitchen. This
matches the image order. Use the same position in all three files. The alt
text is also the lightbox title (existing behavior).

### D7 — Out of scope

- The carousel labels "Previous/Next screenshot" and "Screenshot X of 6" stay
  as they are, even though three of the images are now photos. Changing these
  shared labels affects every card and is not asked for.
- The existing myStandby description ("managing on-call duties") still does not
  match the product shown in the photos (see MS-1 D6). This story does not
  change it.
- No change to `IMAGE_WIDTHS`, the CSS, the lightbox, `seo.ts` or
  `sitemap.xml`. No WebP/AVIF and no `<picture>` element.

## Affected Components

| File | Change |
|---|---|
| `app/public/mystandby_desk{,-320,-640,-960,-1280,-1600,-1920}.jpg` | New (D3, D4). |
| `app/public/mystandby_bedroom{,-320,-640,-960,-1280,-1600,-1920}.jpg` | New (D3, D4). |
| `app/public/mystandby_kitchen{,-320,-640,-960,-1280,-1600,-1920}.jpg` | New (D3, D4). |
| `app/src/data/projects.json` | Entry id 1: insert three images at the start of `images` (D1). |
| `app/src/components/ProjectCard.vue` | `sizesFor`: early return for always-scrolling galleries (D5). |
| `app/src/i18n/types.ts` | 3 new `string` keys in `projects` (D6). |
| `app/src/i18n/locales/en.ts`, `de.ts` | 3 new keys with the texts from D6. |
| `app/src/__tests__/projects.spec.ts` | New cases for the myStandby image order and the alt texts (see Testing Notes). |
| `app/src/__tests__/ProjectCard.spec.ts` | New case for the `sizes` value of a 6-image gallery (see Testing Notes). |

## Data Flow

```
Jira attachments ──cp + sips (q80, 320..1920)──> app/public/mystandby_{desk,bedroom,kitchen}[-w].jpg

projects.json (id 1).images
  [desk, bedroom, kitchen, 1_phone, 2_phone, 3_phone]
        │ ProjectOverviewPage → ProjectCard (v-for, array order)
        ▼
  <img src=base-960.jpg srcset=base-{320..1920}.jpg sizes=sizesFor(6) alt=t(altKey)>
        │ browser picks the smallest sufficient variant
        ├─ desktop: scrolling row, 220px per image → "220px"
        ├─ phone:   carousel, index 0 = desk, calc(100vw - 128px)
        └─ lightbox: base-1920.jpg
```

## Interfaces

`app/src/data/projects.json`, entry id 1, `images` (target content; all other
fields and entries unchanged):

```json
"images": [
  { "base": "/mystandby_desk", "altKey": "projects.screenshotMyStandbyDeskAlt" },
  { "base": "/mystandby_bedroom", "altKey": "projects.screenshotMyStandbyBedroomAlt" },
  { "base": "/mystandby_kitchen", "altKey": "projects.screenshotMyStandbyKitchenAlt" },
  { "base": "/mystandby_1_phone", "altKey": "projects.screenshotMyStandbyLockScreenAlt" },
  { "base": "/mystandby_2_phone", "altKey": "projects.screenshotMyStandbyCalendarAlt" },
  { "base": "/mystandby_3_phone", "altKey": "projects.screenshotMyStandbyLockScreenCloseUpAlt" }
]
```

`app/src/components/ProjectCard.vue`, `sizesFor` (target; signature unchanged):

```ts
/** Mirrors the project-images row: it grows to fill `count` columns until images hit
 *  their min-width, then the row scrolls horizontally instead of shrinking further. */
function sizesFor(count: number): string {
  const fixedWidth = FIXED_HORIZONTAL_SPACING + IMAGE_GAP * (count - 1)
  const scrollBreakpoint = IMAGE_MIN_WIDTH * count + fixedWidth
  const mobileSize = `(max-width: ${MOBILE_BREAKPOINT}px) calc(100vw - ${FIXED_HORIZONTAL_SPACING}px)`
  if (scrollBreakpoint >= CONTAINER_MAX_WIDTH) {
    // Too many images to ever fit: the row always scrolls and every image stays at its min-width.
    return `${mobileSize}, ${IMAGE_MIN_WIDTH}px`
  }
  const maxImageWidth = Math.round((CONTAINER_MAX_WIDTH - fixedWidth) / count)
  return (
    `${mobileSize}, ` +
    `(max-width: ${scrollBreakpoint}px) ${IMAGE_MIN_WIDTH}px, ` +
    `(max-width: ${CONTAINER_MAX_WIDTH}px) calc((100vw - ${fixedWidth}px) / ${count}), ` +
    `${maxImageWidth}px`
  )
}
```

For `count = 3` this returns exactly the current string
(`…, (max-width: 804px) 220px, (max-width: 1200px) calc((100vw - 144px) / 3), 352px`).

i18n: the 3 keys and texts from D6.

## Testing Notes

These are suggestions for the Tester. The Tester owns the test concept.

- Already covered without changes: the data-driven variant tests in
  `projects.spec.ts` (existence + real pixel width) pick up the three new
  bases automatically (18 new variant files). The key-resolution test also
  picks up the three new alt keys. Both must pass.
- `projects.spec.ts` (new cases):
  - The myStandby entry (id 1) `images` equals the six-element array from
    Interfaces: Desk, Bedroom, Kitchen first (AC-1 to AC-3), then the three
    old images in their old order (AC-4).
  - The en and de alt texts of the three new keys equal the D6 texts.
  - Page level: the first card on `ProjectOverviewPage` renders six
    `img.project-image` elements whose `src` values are, in order,
    `/mystandby_desk-960.jpg`, `/mystandby_bedroom-960.jpg`,
    `/mystandby_kitchen-960.jpg`, `/mystandby_1_phone-960.jpg`,
    `/mystandby_2_phone-960.jpg`, `/mystandby_3_phone-960.jpg`, and the first
    image has the localized Desk alt text.
  - Optional: the unsuffixed originals of the three new bases exist (D4).
- `ProjectCard.spec.ts`: a 6-image project gets
  `sizes="(max-width: 768px) calc(100vw - 128px), 220px"` (D5). The existing
  3-image `sizes` test must stay unchanged and green.
- Manual check (`npm run dev`): the myStandby card shows the Desk, Bedroom and
  Kitchen photos first, and the old screenshots after them in the scrolling
  row. On a phone-width viewport, the carousel starts at Desk, says
  "Screenshot 1 of 6", and loops. The lightbox opens the clicked image. The
  network panel shows width-suffixed variants only, never an original.

## Open Questions

None. The decisions above are final for the Developer. The alt texts in D6
were written by the architect from the image content. The user can change
them in review without any structural change.
