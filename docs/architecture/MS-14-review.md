---
type: AI Review
title: Review for myStandby - New Marketing Images
description: Round 1 is positive. The image order, the 21 new assets, the sizesFor fix, the de/en alt texts and the tests match the concept, and all checks pass.
tags: [MS-14, review]
timestamp: 2026-10-18T07:55:00+02:00
verdict: positive
---

## Round 1 — 2026-10-18T07:55:00+02:00

### Scope

- Concept `MS-14-mystandby-new-images.md` (D1–D7, Interfaces) and test
  concept `MS-14-tests.md`, checked against Jira MS-14 AC-1 to AC-5.
- Uncommitted changes on `feature/MS-14-mystandby-new-images` compared to
  `main`: `app/src/data/projects.json`, `app/src/components/ProjectCard.vue`,
  `app/src/i18n/types.ts`, `app/src/i18n/locales/{de,en}.ts`,
  `app/src/__tests__/projects.spec.ts`, `app/src/__tests__/ProjectCard.spec.ts`,
  the 21 new `app/public/mystandby_{desk,bedroom,kitchen}{,-320,-640,-960,-1280,-1600,-1920}.jpg`
  files, and the `index.md` / `log.md` entries.
- Checks:
  - `projects.json` entry id 1 `images` is exactly the six-element array from
    Interfaces: Desk, Bedroom, Kitchen, then `mystandby_1/2/3_phone` in their
    old order. Nothing was removed (AC-1 to AC-4).
  - `cmp` of the three originals against the downloaded Jira attachments:
    byte-identical (D4). `mystandby_bedroom.jpg` is a real JPEG renamed from
    `.jpeg` (D2).
  - `sips -g pixelWidth -g pixelHeight` on all 21 files. Originals are
    2752×1536. Variants are 320/640/960/1280/1600/1920 wide with heights
    178/357/536/714/893/1071, matching the D3 table. File sizes match the
    table within a few KB (for example kitchen-1920 ≈ 421 KB, desk-320 ≈ 20 KB)
    (AC-5).
  - Visual check of the 640px variants: `desk` shows the flip clock on a desk,
    `bedroom` the night clock on a bedside table, `kitchen` the photo stack on
    a kitchen counter. File names, scenes and D6 alt texts match. The phone
    and stand are centered, so the `3 / 2` cover crop does not cut them off.
  - `sizesFor` matches the Interfaces code. Hand-checked: 4 images →
    breakpoint 1032 (full hint unchanged), 5 → 1260 and 6 → 1488 (short hint).
    For 5 or more images, six/five 220px images plus gaps exceed the 1072px
    content width, so the row really always scrolls on desktop. The 3-image
    output is unchanged. No integer count gives exactly 1200, so `>=` vs `>`
    does not matter.
  - i18n: three keys added in `types.ts`, `en.ts` and `de.ts` before
    `screenshotMyStandbyLockScreenAlt` in Desk, Bedroom, Kitchen order, with
    the exact D6 texts.
  - No other place depends on the first myStandby image (`seo.ts`,
    `sitemap.xml`, `index.html` do not reference project images). The
    lightbox and carousel use the array index, so no component change was
    needed for the order.
  - Tests: every row of the test concept exists in the specs. The exact-array
    test and the page-level `src` order test would fail on a wrong order or a
    removed old image. The 4/5/6-image `sizes` tests cover both sides of the
    new branch. The data-driven variant and key tests pick up the new bases
    and keys.
  - `npm run test:unit -- --run`: 14 files / 329 tests pass.
    `npm run lint:check`: clean. `npm run build` (type-check + vite build):
    passes.

### Findings

None.

Non-blocking note for the user review: the concept (D3) reads AC-5 "scaled
to different aspect ratios" as responsive width variants, not crops with
other width:height ratios, in the same way as MS-1 AC-5. This is well argued
(the card shows every image in a fixed `3 / 2` cover box), but the user
should confirm it matches the intent of the AC.

### Verdict

positive
