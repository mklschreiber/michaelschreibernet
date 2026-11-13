---
type: AI Review
title: Review for Fix canonical domain mismatch and legacy 404s reported by Google Search Console
description: Round 1 positive — history routing, per-route HTML plugin, legacy redirects/hash translation, apex-only SEO and sitemap match the concept; checks pass; two non-blocking notes.
tags: [MS-22, review]
timestamp: 2026-11-13T07:52:20+07:00
verdict: positive
---

## Round 1 — 2026-11-13T07:52:20+07:00

### Scope

- Concept `MS-22-canonical-host-and-history-routing.md` (D1–D11, revised after
  the user's scope change to clean URLs) and testing concept `MS-22-tests.md`.
  No design copy exists for MS-22.
- Uncommitted changes on
  `bug/MS-22-fix-canonical-domain-mismatch-and-legacy-404s-reported-by-google-search-console`:
  `app/src/router/index.ts`, new `app/src/router/legacyHash.ts`, new
  `app/src/staticPages.ts`, `app/src/seo.ts`, `app/vite.config.ts`,
  `app/tsconfig.node.json`, `app/src/components/AppFooter.vue`,
  `app/public/sitemap.xml`, new `app/public/{impressum,datenschutz}/index.html`,
  the docs updates (`seo.md`, MS-16/MS-20 notes, `index.md`, `log.md`).
- Tests: new `legacyHash.spec.ts`, changed `seo.spec.ts`, `router.spec.ts`,
  `App.spec.ts`, `useSectionNavigation.spec.ts`.
- Checks in `app/`: `npm run test:unit -- --run` (26 files, 1351 tests,
  pass), `npm run lint:check` (clean), `npm run build` (`vue-tsc --build` +
  `vite build`, pass).

Verified specifically:

- **GitHub Pages behaviour / trailing slashes.** All non-root route records use
  the slash form; `resolve({ name })` gives `/projects/`, `/imprint/`, …;
  footer links are `/imprint/`, `/privacy/`; slash-less `/imprint` still
  resolves (non-strict) and gets the record-path canonical `/imprint/`. The
  build writes `dist/{imprint,privacy,projects,about,contact}/index.html`, so
  GitHub Pages answers `/x/` with 200 and `/x` with its 301. All asset, favicon
  and image references in the copied HTML and in components are root-absolute
  (`/assets/…`, `/favicon.svg`, `/profile-picture.jpeg`), so the subdirectory
  copies load correctly.
- **Vite plugin output and failure mode.** Diffed `dist/privacy/index.html`
  against `dist/index.html`: only title, description, og:title,
  og:description, og:url and canonical differ; JSON-LD, robots, og:image,
  `#app` unchanged. Section copies keep home metadata with canonical/og:url
  `https://michaelschreiber.net/`. In a scratch copy of `app/` the build
  exits with code 1 both for a colliding `public/about/index.html`
  (`static page collides with …`) and for a missing canonical tag in
  `index.html` (`renderStaticPage: expected exactly one link[rel="canonical"],
  found 0`) — Rollup propagates the `closeBundle` error, so drift fails loudly.
- **SEO correctness.** Runtime `canonicalUrl` uses `new URL(path, base)`
  without `#`; sitemap lists exactly `/`, `/imprint/`, `/privacy/` and is
  test-synced to `staticPages`; redirect pages have instant meta refresh,
  `location.replace`, target canonical, fallback link, `lang="de"`, and no
  `noindex`/robots meta.
- **Legacy hash translation.** `translateLegacyHashUrl()` runs at module load
  before `createWebHistory`; protocol-relative hashes (`#//…`, `#/\…`) return
  `null` and `replaceState` is wrapped in `try/catch`, so the cross-origin
  crash found by the tester cannot block mounting. Regression tests cover both.
- **MS-20 scroll/section URL sync.** `useSectionUrlSync` and `goToSection` work
  on route names (`router.replace({ name })`, `router.push({ name })`), and
  every in-app section anchor calls `preventDefault()` on unmodified clicks,
  so the plain `href="/projects/"` never triggers a full page load under web
  history. `scrollBehavior` is unchanged.
- **No `www.michaelschreiber`** anywhere in `app/` source, `public/` or the
  built `dist/` (only in docs and in the guard test itself).

### Findings

None blocking. Non-blocking notes (no action required for this round):

1. `app/src/__tests__/LandingPage.spec.ts` (header comment, line 28) still says
   "Integration with the real router (hash history)"; the app router now uses
   web history. Stale comment only, test behaviour unaffected (tester, on next
   touch).
2. `app/vite.config.ts` `staticPagesPlugin.closeBundle` builds the output
   directory with `join(config.root, config.build.outDir)`; an absolute
   `build.outDir` would be mis-joined (`path.resolve` would handle both). The
   project uses the default relative `dist`, so there is no current impact
   (developer, optional hardening).

### Verdict

positive
