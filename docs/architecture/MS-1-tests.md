---
type: Test Concept
title: Tests for myStandby - LandingPage Project Entry
description: Covers the new myStandby - LandingPage entry in projects.json (position, links, tags, images), the link-list rendering in ProjectCard, the responsive image variants on disk with their real pixel widths, the new de/en texts, and the card on the rendered project page.
tags: [MS-1, tests]
timestamp: 2026-10-05T12:00:00+02:00
---

## Requirements Authority

Jira: MS-1 — https://mklschreiber.atlassian.net/browse/MS-1. Architecture:
[MS-1-mystandby-landingpage.md](MS-1-mystandby-landingpage.md).

- AC-1: "myStandby - LandingPage" is listed on the project page.
- AC-2: The project has a short description. After user review round 1 it is
  the user's own wording (concept D4).
- AC-3: https://www.mystandby.app is referenced.
- AC-4: https://github.com/mklschreiber/myStandby-LandingPage is referenced.
- AC-5: The pictures are scaled for different sizes.

## Scope

The tests cover four levels:

- **Data level** (`projects.spec.ts`, `projects.json` import): the new entry
  exists, is second, has id 3 and the ids are not renumbered (D2). It also
  checks the description key (AC-2), the links in order, website first and
  GitHub second (AC-3, AC-4, D1), the tech tags (D3), and the two image bases
  and alt keys (D5). The existing entries keep their URLs after the
  `link` → `links` migration, and no entry still has `link`/`linkTextKey`.
- **Asset level** (`projects.spec.ts`, Node `fs`): for every image `base` of
  every project, each of the six widths (320–1920) exists as
  `app/public/<base>-<w>.jpg`. Each file's real pixel width, read from the
  JPEG SOF header, equals its suffix (AC-5). This applies to all projects, so
  it also protects future entries against missing or mis-scaled variants.
- **i18n level** (`projects.spec.ts`): every `titleKey`, `descriptionKey`,
  link `textKey` and image `altKey` used in `projects.json` resolves to a
  non-empty string in `de` and `en`. The new title, website link text and
  description match the texts in D3/D4 exactly.
- **Component/page level** (Vue Test Utils):
  - `ProjectCard.spec.ts`: one `a.project-link` per entry, in data order,
    inside one `.project-links` wrapper. Each link has `href`,
    `target="_blank"`, `rel="noopener noreferrer"`, the external-link icon,
    and localized text (de and en). There is no wrapper when `links` is
    missing or empty. Raw-source checks confirm that the top margin moved
    from `.project-link` to `.project-links` and that the wrapper uses
    `flex-wrap: wrap`. jsdom does not apply scoped styles, so these checks
    read the source.
  - `projects.spec.ts`: `ProjectOverviewPage` (with `AppNavigation`
    stubbed) renders three cards. The second card shows the landing page
    title, the de/en description, both link URLs in order with the German
    link texts, and both screenshots as `-960.jpg` variants (AC-1).

Not tested: the image quality setting and file sizes (a `sips` encoding
detail, not behavior), and which `srcset` candidate the browser picks.

## Test Cases

| Class / Module | Test Case | Level | Status |
|--------|----------|-------|--------|
| projects.json | contains the myStandby - LandingPage entry | Unit | ✅ |
| projects.json | lists the entry second, directly after the myStandby app | Unit | ✅ |
| projects.json | uses id 3 without renumbering the existing ids | Unit | ✅ |
| projects.json | references its short description key | Unit | ✅ |
| projects.json | links the website first and the GitHub repository second | Unit | ✅ |
| projects.json | uses the same tech tags as michaelschreiber.net | Unit | ✅ |
| projects.json | shows the MacBook screenshot first and the phone screenshot second | Unit | ✅ |
| projects.json | keeps the Play Store link of the myStandby app | Unit | ✅ |
| projects.json | keeps the GitHub link of michaelschreiber.net | Unit | ✅ |
| projects.json | no longer uses the removed `link` / `linkTextKey` field (2 cases) | Unit | ✅ |
| app/public | has every `<base>-<w>.jpg` variant (7 bases × 6 widths = 42 cases) | Unit | ✅ |
| app/public | scales every variant to the width in its suffix (42 cases) | Unit | ✅ |
| de.ts / en.ts | resolves every key used by projects.json in de and en (parameterized) | Unit | ✅ |
| de.ts / en.ts | uses the untranslated product name as the title in both locales | Unit | ✅ |
| en.ts | has the English website link text | Unit | ✅ |
| de.ts | has the German website link text | Unit | ✅ |
| en.ts | describes the landing page in English | Unit | ✅ |
| de.ts | describes the landing page in German | Unit | ✅ |
| ProjectOverviewPage | renders three project cards | Component | ✅ |
| ProjectOverviewPage | shows the landing page title on the second card | Component | ✅ |
| ProjectOverviewPage | shows the English description on the second card | Component | ✅ |
| ProjectOverviewPage | shows the German description on the second card | Component | ✅ |
| ProjectOverviewPage | links the website and the GitHub repository on the second card | Component | ✅ |
| ProjectOverviewPage | shows the German link texts on the second card | Component | ✅ |
| ProjectOverviewPage | renders both screenshots with width-suffixed variants on the second card | Component | ✅ |
| ProjectCard | renders one link per entry | Component | ✅ |
| ProjectCard | renders all links inside a single .project-links wrapper | Component | ✅ |
| ProjectCard | renders the links in data order with their URLs | Component | ✅ |
| ProjectCard | opens every link in a new tab | Component | ✅ |
| ProjectCard | sets rel="noopener noreferrer" on every link | Component | ✅ |
| ProjectCard | shows the German link texts | Component | ✅ |
| ProjectCard | shows the English link texts | Component | ✅ |
| ProjectCard | keeps the external-link icon in every link | Component | ✅ |
| ProjectCard | renders a single link for a project with one link | Component | ✅ |
| ProjectCard | renders no link wrapper when links is missing | Component | ✅ |
| ProjectCard | renders no link wrapper when links is empty | Component | ✅ |
| ProjectCard.vue (source) | puts the top margin on the .project-links wrapper | Unit (raw source) | ✅ |
| ProjectCard.vue (source) | lets the links wrap on narrow screens | Unit (raw source) | ✅ |
| ProjectCard.vue (source) | no longer puts a top margin on each .project-link | Unit (raw source) | ✅ |

Check results: `npm run test:unit -- --run` (14 files / 259 tests),
`npm run lint`, and `npm run build` (including `vue-tsc`) all pass.

## Untested Areas

- **Real layout and network behavior.** jsdom does not lay out pages or load
  images. Manual browser check in `npm run dev`: the new card is second and
  shows two screenshots, the lightbox opens, and the two links sit side by
  side on desktop, wrap on a narrow phone, and open in a new tab. The network
  panel shows a width-suffixed variant, not the unsuffixed original.
- **Authorship of the description (AC-2).** After user review round 1 the
  description is the user's own wording; who wrote it is a process fact. The
  tests pin the exact de/en texts from the concept (D4).
- **The unsuffixed originals** (`mystandby_landing_{macbook,phone}.jpg`). The
  app never references them. They are kept only as regeneration sources.
