---
type: Test Concept
title: Tests for Canonical Host and History Routing
description: Covers the apex host regression guard, renderStaticPage and the static page list, the /impressum and /datenschutz redirect pages, sitemap sync, the legacy #/ hash translation and the history router with trailing-slash paths, slash-less resolution, catch-all and canonical from the record path.
tags: [MS-22, tests]
timestamp: 2026-11-13T15:30:00+01:00
---

## Scope

Tested with Vitest, Vue Test Utils and jsdom. All files are in `app/src/__tests__/`.
Concept: [MS-22-canonical-host-and-history-routing.md](MS-22-canonical-host-and-history-routing.md).
No design artifact exists for MS-22.

- **Host guard (D1, D2).** Static test in `seo.spec.ts`. `public/CNAME` is
  exactly `michaelschreiber.net` and `SITE_ORIGIN` is the apex. In
  `index.html`, `public/sitemap.xml`, `public/robots.txt`, both redirect pages
  and the output of `renderStaticPage(index.html, page)` for every
  `staticPages` entry, every match of
  `/https?:\/\/[^\s"'<>/]*michaelschreiber\.net/gi` is exactly
  `https://michaelschreiber.net` (at least one match per source), and none
  contains `www.michaelschreiber`. `www.` in general stays allowed:
  `index.html` still links `https://www.linkedin.com/...`. `robots.txt` points
  at the apex sitemap.
- **Static pages and `renderStaticPage` (D4).** The pure function runs on the
  real source `index.html`, and its output is parsed with `DOMParser`. For
  every static page it sets the title, description, og:title, og:description,
  canonical and og:url (`canonicalUrlFor(page.canonicalPath)`, which is `/`
  for section pages). Each tag occurs exactly once. JSON-LD, robots, og:image
  and the empty `#app` stay unchanged. `&`, `<`, `>` and `"` are escaped and
  still parse back to the original text. The function throws an error naming
  the tag when any of the six tags is missing or a tag is duplicated. The
  `staticPages` list (paths and canonical paths) is asserted as well.
- **Runtime canonical (D5).** `updatePageMetadata` builds canonical and og:url
  without `#`. The adapted existing assertions expect `/imprint/` and
  `/privacy/`.
- **Legacy redirect pages (D6).** For `public/impressum/index.html` →
  `/imprint/` and `public/datenschutz/index.html` → `/privacy/`, the tests
  check: refresh `0; url=<target>`, `location.replace('<target>')`, apex
  canonical, fallback anchor, no `meta[name="robots"]`, `lang="de"`. The
  `public/` directories `imprint`, `privacy`, `projects`, `about` and
  `contact` must not exist, because they would collide with generated pages.
- **Sitemap (D8).** The `<loc>` values equal the root plus the canonical URLs
  of the `sitemap: true` static pages, and explicitly `/`, `/imprint/`,
  `/privacy/`.
- **Legacy hash translation (D7).** `legacyHash.spec.ts` tests
  `legacyHashPath` with a table of hashes. `translateLegacyHashUrl` runs on
  the real jsdom location: the path is set, the hash is removed, the query is
  kept, no history entry is added, `history.state` is kept, and the function
  does nothing for `#contact` or an address without a hash. Regression for
  the review fix: `#//example.com/x` and `#/\example.com` (protocol-relative
  paths to another origin) give `null`. Translating them does not throw and
  leaves the URL unchanged. A `replaceState` spy that throws is swallowed, so
  the router module still loads. The URL is reset to `/` and mocks are
  restored after each test.
- **History router (D3, D4).** In `router.spec.ts`, the named routes resolve
  to clean hrefs (`/`, `/projects/`, …, `/privacy/`), and the address bar gets
  `/imprint/` without `#`. `/imprint` and `/imprint/` both resolve to
  `imprint`. Opening `/imprint` or `/privacy` without a slash yields the
  canonical / og:url of the record path. Redirects also work for `/impressum/`
  and `/datenschutz/`. Unknown paths (`/foo`, `/foo/bar/`, `/imprint/extra`)
  redirect to `home` with the root canonical. Every `staticPages` path
  resolves to a named route with the same metadata. The adapted existing
  tests cover the route table with the catch-all and the redirect targets.
- **Links.** `App.spec.ts` checks that the footer hrefs end in `/imprint/` and
  `/privacy/` (adapted by the developer). `useSectionNavigation.spec.ts` now
  uses `createWebHistory`, slash paths in its test route table and expects
  hrefs `/`, `/projects/`, `/about/`, `/contact/`.

Not tested: the Vite plugin `staticPagesPlugin` itself (see below), GitHub
Pages behaviour (301 to the slash form, default 404, `www` → apex redirect),
and the GSC steps (D11).

## Test Cases

| Class / Module | Test Case | Level | Status |
|--------|----------|-------|--------|
| legacyHash | `legacyHashPath` translates `#/imprint`, `#/privacy`, `#/impressum`, `#/datenschutz`, `#/projects`, `#/about`, `#/contact`, `#/`, `#/foo`, `#/imprint?x=1` | Unit | ✅ |
| legacyHash | `legacyHashPath` returns null for `#contact`, `#`, `''` | Unit | ✅ |
| legacyHash | `legacyHashPath` returns null for `#//example.com/x`, `#/\example.com` (regression) | Unit | ✅ |
| legacyHash | `translateLegacyHashUrl` moves the hash route into the path | Unit (jsdom) | ✅ |
| legacyHash | removes the hash | Unit (jsdom) | ✅ |
| legacyHash | keeps the query of the hash route | Unit (jsdom) | ✅ |
| legacyHash | replaces the history entry (length unchanged) | Unit (jsdom) | ✅ |
| legacyHash | keeps `history.state` | Unit (jsdom) | ✅ |
| legacyHash | leaves `#contact` unchanged | Unit (jsdom) | ✅ |
| legacyHash | leaves an address without hash unchanged | Unit (jsdom) | ✅ |
| legacyHash | does not throw for `/#//example.com/x`, `/#/\example.com` (regression) | Unit (jsdom) | ✅ |
| legacyHash | leaves the URL unchanged for those hashes (regression) | Unit (jsdom) | ✅ |
| legacyHash | does not throw when `replaceState` throws (spy) | Unit (jsdom) | ✅ |
| seo (host guard) | CNAME is exactly the apex | Static | ✅ |
| seo (host guard) | `SITE_ORIGIN` is the apex | Unit | ✅ |
| seo (host guard) | robots.txt points at the apex sitemap | Static | ✅ |
| seo (host guard) | each source has at least one site URL (index.html, sitemap, robots, 2 redirect pages, 5 rendered pages) | Static | ✅ |
| seo (host guard) | each source uses only the apex host | Static | ✅ |
| seo (host guard) | no source mentions `www.michaelschreiber` | Static | ✅ |
| seo (host guard) | `www.` of other sites (LinkedIn) stays allowed | Static | ✅ |
| seo | `updatePageMetadata` builds the canonical without `#` | Unit | ✅ |
| seo | `updatePageMetadata` canonical / og:url `/imprint/`, `/privacy/` (adapted) | Unit | ✅ |
| staticPages | lists `/imprint/`, `/privacy/`, `/projects/`, `/about/`, `/contact/` | Unit | ✅ |
| staticPages | legal pages canonicalize to themselves, section pages to `/` | Unit | ✅ |
| staticPages | `canonicalUrlFor` uses the apex origin | Unit | ✅ |
| renderStaticPage | sets the title per page | Unit | ✅ |
| renderStaticPage | sets description, og:title, og:description per page | Unit | ✅ |
| renderStaticPage | sets canonical and og:url per page | Unit | ✅ |
| renderStaticPage | keeps exactly one of each replaced tag per page | Unit | ✅ |
| renderStaticPage | keeps JSON-LD, robots, og:image and `#app` per page | Unit | ✅ |
| renderStaticPage | escapes `&`, `<`, `>`, `"` | Unit | ✅ |
| renderStaticPage | escaped metadata parses back to the original text | Unit | ✅ |
| renderStaticPage | throws naming the tag when one of the six tags is missing | Unit | ✅ |
| renderStaticPage | throws when a tag is duplicated | Unit | ✅ |
| redirect pages | meta refresh `0; url=/imprint/` / `/privacy/` | Static | ✅ |
| redirect pages | `location.replace` to the target | Static | ✅ |
| redirect pages | apex canonical of the target | Static | ✅ |
| redirect pages | fallback link to the target | Static | ✅ |
| redirect pages | no robots meta | Static | ✅ |
| redirect pages | `lang="de"` | Static | ✅ |
| redirect pages | no `public/imprint`, `privacy`, `projects`, `about`, `contact` directory | Static | ✅ |
| sitemap | `<loc>` equals root + canonical URLs of `sitemap: true` pages | Static | ✅ |
| sitemap | lists `/`, `/imprint/`, `/privacy/` | Static | ✅ |
| router | named routes resolve to clean hrefs without `#` | Unit | ✅ |
| router | `/imprint` and `/imprint/` resolve to `imprint` | Unit | ✅ |
| router | `/impressum/`, `/datenschutz/` redirect to `/imprint/`, `/privacy/` | Unit | ✅ |
| router | canonical `/imprint/` after opening `/imprint` without slash | Unit | ✅ |
| router | og:url `/privacy/` after opening `/privacy` without slash | Unit | ✅ |
| router | address bar shows `/imprint/` without `#` | Unit (jsdom) | ✅ |
| router | unknown paths redirect to `home` (catch-all) | Unit | ✅ |
| router | root canonical after the catch-all redirect | Unit | ✅ |
| router | every `staticPages` path resolves to a named route | Unit | ✅ |
| router | every `staticPages` path carries the same metadata as the route | Unit | ✅ |
| router | route table with trailing slashes, redirects and catch-all (adapted) | Unit | ✅ |
| router | legacy redirects and canonicals `/imprint/`, `/privacy/` (adapted) | Unit | ✅ |
| App | footer links end in `/imprint/`, `/privacy/` (adapted) | Component | ✅ |
| useSectionNavigation | `sectionHref` resolves `/`, `/projects/`, `/about/`, `/contact/` under web history | Composable | ✅ |
| useSectionNavigation | navigation from `/imprint/` to `/projects/` | Composable | ✅ |

## Untested Areas

- **`staticPagesPlugin` in `vite.config.ts`.** It only runs during
  `vite build` (`apply: 'build'`) and writes files. The rendering logic is
  fully covered through `renderStaticPage`. The file writing was checked by
  running `npm run build`, which produced `dist/imprint/`, `dist/privacy/`,
  `dist/projects/`, `dist/about/`, `dist/contact/` (and the copied
  `dist/impressum/`, `dist/datenschutz/`) with the expected title and
  canonical. The collision check (throw if the file exists) is covered
  indirectly: the test asserts that no colliding `public/` directory exists.
- **Router call order.** That `translateLegacyHashUrl()` runs before
  `createWebHistory` is a module-load side effect of `@/router`. The test
  suite imports the router once, so the order cannot be re-run per test
  without module resets. The function itself is fully covered.
- **Hosting.** The GitHub Pages 301 from `/imprint` to `/imprint/`, the
  default 404, and the `www` → apex redirect cannot be tested in Vitest.
  These are manual post-deploy checks (concept D11).
- **`AppNavigation.spec.ts`** is unchanged. It uses its own memory-history
  stub routes and asserts no `#/` hrefs. The real hrefs are covered through
  `useSectionNavigation.spec.ts` and `router.spec.ts`.
