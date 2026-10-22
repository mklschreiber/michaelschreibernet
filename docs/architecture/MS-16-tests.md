---
type: Test Concept
title: Tests for Consistent Routing — English Route Paths
description: Verifies that all pages use English route paths (/imprint, /privacy), that the new routes keep their pages and SEO metadata, that the old German paths redirect with the new canonical URL, and that the footer links point to the new paths.
tags: [MS-16, tests]
timestamp: 2026-10-21T20:40:00+02:00
---

## Scope

Jira: MS-16 — https://mklschreiber.atlassian.net/browse/MS-16
Concept: [MS-16-consistent-routing.md](MS-16-consistent-routing.md)

Tested:

- The real route table in `app/src/router/index.ts`: every page route
  (all records without `redirect`) has an English path. This guards AC-1
  against new German paths.
- `/imprint` and `/privacy`: route name, `meta.seo` (the renamed
  `pageMetadata.imprint` / `pageMetadata.privacy` keys) and the matched
  component (`ImpressumPage` / `DataProtectionPage`).
- The legacy redirects `/impressum` → `/imprint` and `/datenschutz` →
  `/privacy`: they have no name, navigation ends at the new path, and the
  `afterEach` SEO hook sets the title and the canonical URL of the
  redirect target (`#/imprint`, `#/privacy`).
- `AppFooter.vue` inside `App.vue`: the "Impressum" / "Datenschutz" links
  have hrefs ending in `#/imprint` / `#/privacy`, and the German labels
  stay.

Not tested (unchanged by this story): page content of `ImpressumPage.vue`
and `DataProtectionPage.vue` (covered by their existing specs), the
`updatePageMetadata` mechanism itself (covered by `seo.spec.ts`), unknown
paths / 404 behaviour (out of scope).

Router tests use the real router singleton. After each test they push
back to `/` and reset `document.head`, like `seo.spec.ts`. Navigation is
awaited (`await router.push`), with no fixed delays.

## Test Cases

| Class / Module | Test Case | Level | Status |
|--------|----------|-------|--------|
| router (`router.spec.ts`) | uses only English paths for all pages | Unit | ✅ |
| router | keeps the legacy German paths only as unnamed redirects | Unit | ✅ |
| router | `/imprint` resolves to the route named `imprint` | Unit | ✅ |
| router | `/imprint` carries the imprint SEO metadata | Unit | ✅ |
| router | `/imprint` renders the `ImpressumPage` component | Unit | ✅ |
| router | `/privacy` resolves to the route named `privacy` | Unit | ✅ |
| router | `/privacy` carries the privacy SEO metadata | Unit | ✅ |
| router | `/privacy` renders the `DataProtectionPage` component | Unit | ✅ |
| router | redirects `/impressum` to `/imprint` | Unit | ✅ |
| router | redirects `/datenschutz` to `/privacy` | Unit | ✅ |
| router | sets the imprint title after opening `/impressum` | Unit | ✅ |
| router | sets the privacy title after opening `/datenschutz` | Unit | ✅ |
| router | uses `#/imprint` as canonical URL after opening `/impressum` | Unit | ✅ |
| router | uses `#/privacy` as canonical URL after opening `/datenschutz` | Unit | ✅ |
| App (`App.spec.ts`) | shows the footer with legal links (existing, German labels) | Component | ✅ |
| App | links the Impressum footer entry to `/imprint` | Component | ✅ |
| App | links the Datenschutz footer entry to `/privacy` | Component | ✅ |
| AboutPage (`AboutPage.spec.ts`) | existing tests with stub routes `/imprint`, `/privacy` | Component | ✅ |
| ImpressumPage, DataProtectionPage, seo | existing specs, unchanged | Unit / Component | ✅ |

Check results: `npm run test:unit -- --run` (16 files, 647 tests),
`npm run lint` and `npm run build` pass.

## Untested Areas

- Browser address-bar behaviour and the back button after a redirect are
  not automated (Vue Router's `redirect` replaces the history entry; jsdom
  does not reflect this meaningfully). Optional manual check with
  `npm run dev`: the footer links show `#/imprint` / `#/privacy`; opening
  `#/impressum` and `#/datenschutz` directly lands on the new URL with the
  correct page; the back button does not loop.
