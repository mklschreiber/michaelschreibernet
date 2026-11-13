---
type: Architecture Concept
title: Canonical Host and History Routing
description: Locks the apex https://michaelschreiber.net as the single canonical host with a static regression test, switches the router to history mode with trailing-slash paths, writes a real dist/<route>/index.html per route at build time (own title, description, canonical, og:url), redirects the legacy plain paths /impressum and /datenschutz with static pages, and translates old #/ hash links on load.
tags: [MS-22, seo, routes, composables, components, build, static assets, tests]
timestamp: 2026-11-13T14:00:00+01:00
status: draft
---

## Story

As a visitor finding the site via Google, I want michaelschreiber.net to use
one consistent canonical host and to return no 404s for legacy URLs, so that
Google indexes the site correctly.

Jira: MS-22 — https://mklschreiber.atlassian.net/browse/MS-22

No design artifact exists for this story (`docs/design/MS-22/` does not
exist). Nothing visible changes on the page; only the URLs lose the `#`.

### Scope change (user, 2026-11-13)

The first draft of this concept kept hash routing and served `/impressum`,
`/datenschutz`, `/imprint`, `/privacy` as static redirect pages to `/#/…`.
The user then decided to switch to **clean URLs without `#`** within MS-22,
following the pattern of their site eulino.app on GitHub Pages: real
per-route HTML files (`/privacy` → 301 → `/privacy/` → 200 from
`privacy/index.html`), GitHub's default 404 for unknown paths. The hash
redirect pages of the first draft (old D3/D4) are **superseded** by D3–D7
below. This revises MS-20 D1 ("keep hash history") and the URL form of MS-16.

### Findings (Google Search Console + live checks, 2026-11-13)

1. **Canonical host mismatch.** The GitHub Pages custom domain was
   `www.michaelschreiber.net`, while all code uses the apex
   `https://michaelschreiber.net/`. The user has switched the custom domain to
   the apex (confirmed via API). A repo-wide grep finds no
   `www.michaelschreiber` occurrence.
2. **Legacy 404s.** `https://michaelschreiber.net/impressum` returns a real
   HTTP 404. Under hash routing the MS-16 redirect only works as
   `/#/impressum`; the server never sees the fragment.

### Current state (verified)

- `app/src/router/index.ts`: `createWebHashHistory(import.meta.env.BASE_URL)`;
  routes `/`, `/projects`, `/about`, `/contact` (section routes of
  `LandingPage`, MS-20 D1), `/imprint`, `/privacy`, and the redirects
  `/impressum` → `/imprint`, `/datenschutz` → `/privacy`. `afterEach` calls
  `updatePageMetadata(meta.seo, isSectionId(section) ? '/' : to.path)`.
- `app/src/seo.ts`: `pageMetadata` (`home`, `imprint`, `privacy`) and
  `canonicalUrl(path)`, which returns `<base>` for `/` and `<base>#<path>`
  otherwise.
- Links: `AppNavigation.vue` and `HomeSection.vue` use
  `sectionHref(id)` = `router.resolve({ name: id }).href` (today `#/…`);
  `AppFooter.vue` has `<RouterLink to="/imprint">` / `to="/privacy"`. No other
  in-app link and no `#/` string exists in `app/src` outside tests.
- Section scrolling (`scrollBehavior`, `scrollToSection`,
  `useSectionUrlSync` with `router.replace`) is history-agnostic: it works on
  route names and `meta.section`, never on `location.hash`.
- Tests with hash expectations: `seo.spec.ts` (`/#/imprint`, `/#/privacy`),
  `router.spec.ts` (canonical `/#/imprint`, `/#/privacy`), `App.spec.ts`
  (footer hrefs `/#\/imprint$/`, `/#\/privacy$/`),
  `useSectionNavigation.spec.ts` (own test router with
  `createWebHashHistory`, hrefs `#/`, `#/projects`, …).
- Build: `npm run build` = `vue-tsc --build` + `vite build`; `deploy.yml` sets
  `VITE_BASE_URL: '/'` and uploads `app/dist`. Vite copies `app/public/**`
  verbatim. Vue Router is 4.6.4, Vite 7.3.3.

## Architecture Decisions

### D1 — Canonical host is the apex `https://michaelschreiber.net` (unchanged)

The code already uses the apex everywhere and the GitHub Pages custom domain is
now the apex; GitHub Pages redirects `www` to it as long as the `www` DNS record
points to GitHub Pages (hosting, not code). `CNAME` and the host in
`index.html` / `robots.txt` stay as they are.

### D2 — Regression guard for the host in `seo.spec.ts` (extended)

A static test asserts that `CNAME` is exactly `michaelschreiber.net` and that
every site URL in `index.html`, `public/sitemap.xml`, `public/robots.txt`, the
two legacy redirect pages (D6) **and the HTML generated for every static page
by `renderStaticPage` (D4)** is exactly `https://michaelschreiber.net` and that
none contains `www.michaelschreiber`. The generated files only exist after a
build, so the guard runs on the output of the pure render function applied to
the source `index.html` — the same function the build uses. Details in
Interfaces. The guard must not forbid `www.` in general
(`https://www.linkedin.com/…` is legitimate).

### D3 — Router: `createWebHistory`, all non-root paths with a trailing slash

`createWebHistory(import.meta.env.BASE_URL)` replaces `createWebHashHistory`.

**Trailing slash everywhere except `/`.** GitHub Pages serves
`dist/imprint/index.html` at `/imprint/` and answers `/imprint` with a 301 to
`/imprint/`. So the slash form is the URL that returns 200 directly; it is the
canonical form, the form in the sitemap and the form of every in-app link
(no redirect hop for crawlers following links, and a reload of the current
address bar URL never goes through a 301).

Route records (paths with trailing slash; Vue Router's default non-strict
matching also accepts the form without slash, verified with 4.6.4:
`/imprint` and `/imprint/` both resolve to `imprint`, and
`resolve({ name: 'imprint' }).href` is `/imprint/`):

| Path | Name | Component | `meta.section` | `meta.seo` |
|---|---|---|---|---|
| `/` | `home` | `LandingPage` | `home` | `home` |
| `/projects/` | `projects` | `LandingPage` | `projects` | `home` |
| `/about/` | `about` | `LandingPage` | `about` | `home` |
| `/contact/` | `contact` | `LandingPage` | `contact` | `home` |
| `/imprint/` | `imprint` | `ImpressumPage` | — | `imprint` |
| `/privacy/` | `privacy` | `DataProtectionPage` | — | `privacy` |
| `/impressum` | — | redirect `/imprint/` | — | — |
| `/datenschutz` | — | redirect `/privacy/` | — | — |
| `/:pathMatch(.*)*` | — | redirect `/` | — | — |

- **Section routes stay routes** (MS-20 D1 remains valid apart from the
  history type): they keep old links working, the scroll spy URL sync (MS-20
  R5) keeps writing them, and nothing in `scrollBehavior`,
  `useSectionNavigation` or `useSectionUrlSync` changes. Since R5 writes
  `/projects/` etc. into the address bar, a reload or a shared link must
  answer 200, so they **get their own HTML files** (D4) — but their canonical
  is the root `https://michaelschreiber.net/` (one page, one canonical, MS-20
  D15) and they are **not** in the sitemap.
- Raw fragments like `#contact` are still not used as links (unchanged).
- The legacy redirects `/impressum`, `/datenschutz` stay as client-side
  redirects (needed for translated hash links, D7). They match with and without
  trailing slash.
- **Catch-all redirect to `/`** (new): with history routing and the hash
  translation (D7), an unknown in-app path (e.g. an old `/#/foo` bookmark)
  would otherwise render an empty `RouterView`. Direct requests to unknown
  paths never reach the app on GitHub Pages (they get GitHub's 404), so this
  does not create soft-404s.
- The canonical passed to `updatePageMetadata` comes from the **route record
  path**, not from `to.path`, so `/imprint` (no slash, e.g. after a hash
  translation) still gets the canonical `/imprint/`:
  `isSectionId(to.meta.section) ? '/' : (to.matched.at(-1)?.path ?? to.path)`.

### D4 — One real HTML file per route, written by a small Vite plugin

**Chosen: a tiny build plugin in `vite.config.ts`** that, after the bundle is
written (`closeBundle`, `apply: 'build'`), reads `dist/index.html` and writes
`dist/<route>/index.html` for every static page, with per-page `<title>`,
`meta[name=description]`, `og:title`, `og:description`, `og:url` and
`link[rel=canonical]`. The body stays the empty `#app` mount point; the SPA
renders as today and the router's `afterEach` keeps the head in sync.

**Rejected: full prerender (vite-ssg / SSR).** It would need SSR-safe
components (Material Web custom elements, `IntersectionObserver`, `window`
scroll handling), a new dependency and a different entry; the story only needs
crawlable metadata and a 200 per URL, which the head-only copies provide. The
home page already works this way today (static head, client-rendered body).

**Rejected: `404.html` copy of `index.html`.** GitHub Pages serves it with
HTTP 404; Google keeps reporting 404 (unchanged from the first draft).

Single source for the page list and metadata: a new **DOM-free** module
`app/src/staticPages.ts` (no `document`, no `import.meta.env`, no `@/` alias)
that holds `SITE_ORIGIN`, `PageMetadata`, `pageMetadata` (moved from `seo.ts`),
the `staticPages` list and the pure `renderStaticPage` function. `seo.ts`
re-exports `pageMetadata` / `PageMetadata`, so all existing imports keep
working. `vite.config.ts` imports it with a relative path
(`./src/staticPages`) and `tsconfig.node.json` lists it in `include`;
`vue-tsc --build` then also checks it in the node project (no DOM lib), which
is why it must stay DOM-free.

Static pages (root `/` is the built `index.html` itself and is not rewritten;
its head already equals `pageMetadata.home` with canonical `/`, guarded by the
existing `seo.spec.ts` tests):

| Path | File | Metadata | Canonical | Sitemap |
|---|---|---|---|---|
| `/` | `dist/index.html` (Vite) | `home` | `https://michaelschreiber.net/` | yes |
| `/imprint/` | `dist/imprint/index.html` | `imprint` | `https://michaelschreiber.net/imprint/` | yes |
| `/privacy/` | `dist/privacy/index.html` | `privacy` | `https://michaelschreiber.net/privacy/` | yes |
| `/projects/` | `dist/projects/index.html` | `home` | `https://michaelschreiber.net/` | no |
| `/about/` | `dist/about/index.html` | `home` | `https://michaelschreiber.net/` | no |
| `/contact/` | `dist/contact/index.html` | `home` | `https://michaelschreiber.net/` | no |

The plugin fails the build (throws) if a tag to replace is missing or if a
target file already exists (e.g. a stray `app/public/imprint/`), so drift
cannot ship silently. Values are HTML-escaped (`&`, `<`, `>`, `"`).

JSON-LD (`WebSite` + `Person`) and `og:image`, `og:locale`, `robots`
(`index, follow`) stay identical on all copies. The section copies may keep
`index, follow`: their canonical points to `/`.

`npm run dev` needs nothing: Vite's dev server has an SPA fallback, so
`/imprint/` works in dev without generated files. `npm run preview` serves the
built files.

### D5 — Runtime canonical without `#`

`canonicalUrl(path)` in `seo.ts` becomes `new URL(path, baseUrl).href`
(`/` → `https://…/`, `/imprint/` → `https://…/imprint/`). In production
`window.location.origin` is the apex, so runtime and static canonicals match.

### D6 — Legacy plain paths `/impressum`, `/datenschutz`: static redirect pages

| URL | File | Target |
|---|---|---|
| `/impressum` (→ 301 → `/impressum/`) | `app/public/impressum/index.html` | `/imprint/` |
| `/datenschutz` (→ 301 → `/datenschutz/`) | `app/public/datenschutz/index.html` | `/privacy/` |

Same pattern as the first draft, but with clean targets: instant meta refresh
(`0; url=/imprint/`, treated by Google as a permanent redirect), inline
`location.replace('/imprint/')`, `<link rel="canonical"
href="https://michaelschreiber.net/imprint/">`, a visible fallback link, **no
`noindex`** (Google advises against mixing it with a redirect/canonical
signal). A static page is preferred over a generated app copy for these paths
because a real redirect consolidates the old URL into the new one instead of
creating a duplicate page. They are not in the sitemap and must stay
crawlable. `/imprint` and `/privacy` need **no** redirect pages any more: they
are real pages from D4 (the first draft's `app/public/imprint/` and
`app/public/privacy/` must not be created).

### D7 — Old hash links are translated on load

Old links and bookmarks such as `/#/imprint`, `/#/impressum`, `/#/privacy`,
`/#/datenschutz`, `/#/projects`, `/#/about`, `/#/contact`, `/#/` reach the
server as `/` and load `index.html`. Before the router is created, a small
function rewrites a hash that starts with `#/` into a path with
`history.replaceState` (no reload, no history entry):

```
/#/imprint      → /imprint      → route imprint (non-strict), canonical /imprint/
/#/impressum    → /impressum    → redirect /imprint/
/#/datenschutz  → /datenschutz  → redirect /privacy/
/#/projects     → /projects     → section route projects, scrolls to section
/#/             → /             → home
/#/foo          → /foo          → catch-all → /
/#contact       → unchanged (not a hash route; no section link uses it)
```

It must run **before** `createWebHistory(...)` is called, because the history
reads `window.location` when it is created. It therefore lives in
`app/src/router/legacyHash.ts` and is called at the top of
`app/src/router/index.ts`, before `createRouter`. The path part is split into
a pure function for unit tests. Query and the rest of the hash path are kept
(`#/imprint?x=1` → `/imprint?x=1`).

Scrolling for a translated section link works as for a direct load: the first
navigation runs `scrollBehavior`, which jumps `'instant'` to the section
(MS-20 D2, unchanged).

### D8 — Sitemap lists every indexable page

`app/public/sitemap.xml` stays a static file and lists exactly
`https://michaelschreiber.net/`, `https://michaelschreiber.net/imprint/`,
`https://michaelschreiber.net/privacy/` (the pages whose canonical is their own
URL). A unit test asserts that its `<loc>` values equal the canonical URLs of
`staticPages` entries with `sitemap: true` plus the root, so the file cannot
drift from the page list. `robots.txt` is unchanged.

### D9 — 404 for unknown paths: GitHub's default

No `404.html`. Unknown direct paths get GitHub Pages' default 404 with a real
404 status, which is correct for Google. A custom 404 page is not needed for
the story.

### D10 — Build and deploy compatibility

`deploy.yml`, `ci.yml`, `VITE_BASE_URL: '/'` and `app/dist` are unchanged; the
plugin writes into Vite's resolved `build.outDir`. Generated files sit next to
Vite's output and `public/` copies and are uploaded with the artifact. The
plugin and the hash translation assume base `/` (the only deployed base); the
router keeps passing `import.meta.env.BASE_URL` to `createWebHistory`.

### D11 — Manual steps after deploy (user, out of scope for code)

In GSC: resubmit `sitemap.xml`, "Validate fix" on the 404 report, inspect
`/impressum`, `/imprint/`, `/privacy/`. Check that
`https://www.michaelschreiber.net/` answers with a 301 to the apex.

## Affected Components

New:

- `app/src/staticPages.ts` — `SITE_ORIGIN`, `PageMetadata`, `pageMetadata`
  (moved from `seo.ts`), `staticPages`, `renderStaticPage` (DOM-free).
- `app/src/router/legacyHash.ts` — `legacyHashPath`, `translateLegacyHashUrl`.
- `app/public/impressum/index.html`, `app/public/datenschutz/index.html` —
  static redirect pages (D6).
- `app/src/__tests__/legacyHash.spec.ts` — unit tests for D7.

Changed:

- `app/src/router/index.ts` — `createWebHistory`, trailing-slash paths,
  redirect targets `/imprint/` / `/privacy/`, catch-all, canonical from record
  path, `translateLegacyHashUrl()` before `createRouter`.
- `app/src/seo.ts` — re-export `pageMetadata` / `PageMetadata` from
  `./staticPages`; `canonicalUrl` without `#`.
- `app/vite.config.ts` — `staticPagesPlugin()` (D4).
- `app/tsconfig.node.json` — add `"src/staticPages.ts"` to `include`, so the
  node project lists the file it imports explicitly (avoids "file is not
  listed within the file list of project" under `vue-tsc --build`). The file
  stays in `tsconfig.app.json` via `src/**/*` as well.
- `app/src/components/AppFooter.vue` — `to="/imprint/"`, `to="/privacy/"`.
- `app/public/sitemap.xml` — three URLs (D8).
- Tests: `seo.spec.ts` (canonicals without `#`, D2 guard incl. rendered pages,
  `renderStaticPage`, redirect pages, sitemap sync), `router.spec.ts` (paths
  with slash, redirects to `/imprint/` / `/privacy/`, catch-all, canonicals
  `/imprint/` / `/privacy/`, canonical `/imprint/` after opening `/imprint`
  without slash), `App.spec.ts` (footer hrefs `/imprint/`, `/privacy/`),
  `useSectionNavigation.spec.ts` (`createWebHistory`, hrefs `/`,
  `/projects/`, `/about/`, `/contact/`; its test route table uses the slash
  paths). `AppNavigation.spec.ts` uses its own stub routes and only needs a
  change if it asserts `#/` hrefs.
- Docs: `docs/architecture/seo.md` (done by the architect).

Unchanged: `scrollBehavior` logic, `useSectionNavigation.ts`,
`useSectionUrlSync.ts`, `useActiveSection`, `AppNavigation.vue`,
`HomeSection.vue` (they use `sectionHref` / route names), `index.html`,
`robots.txt`, `CNAME`, `deploy.yml`, `ci.yml`, `package.json`.

## Data Flow

```
Build (npm run build)
  vite build → dist/index.html (+ assets, public/** copied)
  staticPagesPlugin.closeBundle:
    for page in staticPages: renderStaticPage(dist/index.html, page)
      → dist/imprint/index.html, dist/privacy/index.html,
        dist/projects/index.html, dist/about/index.html, dist/contact/index.html

Request (GitHub Pages, apex)
  GET /imprint      → 301 /imprint/ → 200 dist/imprint/index.html
                      (head: Impressum title/description, canonical /imprint/)
                      → app boots, history router resolves /imprint/ → ImpressumPage
  GET /projects/    → 200 dist/projects/index.html (canonical /) → onepage, scroll to #projects
  GET /impressum    → 301 /impressum/ → 200 public redirect page
                      → meta refresh / location.replace → /imprint/
  GET /#/privacy    → 200 dist/index.html → translateLegacyHashUrl: replaceState /privacy
                      → router resolves privacy → afterEach canonical /privacy/
  GET /unknown      → GitHub default 404
  GET https://www.michaelschreiber.net/… → 301 apex (hosting)
```

## Interfaces

### `app/src/staticPages.ts`

```ts
export const SITE_ORIGIN = 'https://michaelschreiber.net'

export interface PageMetadata {
  title: string
  description: string
}

export const pageMetadata = { home: {…}, imprint: {…}, privacy: {…} } // moved verbatim from seo.ts
  satisfies Record<string, PageMetadata>

export interface StaticPage {
  /** Route path with trailing slash, e.g. '/imprint/'. Output: dist/imprint/index.html. */
  path: string
  metadata: PageMetadata
  /** Path of the canonical URL: own path for indexable pages, '/' for section pages. */
  canonicalPath: string
  /** Listed in sitemap.xml. */
  sitemap: boolean
}

export const staticPages: readonly StaticPage[] = [
  { path: '/imprint/',  metadata: pageMetadata.imprint, canonicalPath: '/imprint/', sitemap: true },
  { path: '/privacy/',  metadata: pageMetadata.privacy, canonicalPath: '/privacy/', sitemap: true },
  { path: '/projects/', metadata: pageMetadata.home,    canonicalPath: '/',         sitemap: false },
  { path: '/about/',    metadata: pageMetadata.home,    canonicalPath: '/',         sitemap: false },
  { path: '/contact/',  metadata: pageMetadata.home,    canonicalPath: '/',         sitemap: false },
]

/** SITE_ORIGIN + path, e.g. canonicalUrlFor('/imprint/') === 'https://michaelschreiber.net/imprint/'. */
export function canonicalUrlFor(path: string): string

/**
 * Returns indexHtml with <title>, meta[name="description"], og:title,
 * og:description, og:url and link[rel="canonical"] replaced for the page.
 * Each tag must occur exactly once; otherwise it throws Error naming the tag.
 * Attribute values are HTML-escaped. Regexes must allow whitespace/newlines
 * between attributes (index.html splits the description meta over lines).
 */
export function renderStaticPage(indexHtml: string, page: StaticPage): string
```

The section and legal route records in `router/index.ts` keep their own
`path` literals (no generation of routes from `staticPages`); a router test
asserts that every `staticPages` path resolves to a named route, which keeps
both in sync.

### Plugin in `app/vite.config.ts`

```ts
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'
import { renderStaticPage, staticPages } from './src/staticPages'

function staticPagesPlugin(): Plugin {
  let config: ResolvedConfig
  return {
    name: 'msnet-static-pages',
    apply: 'build',
    configResolved(resolved) { config = resolved },
    closeBundle() {
      const outDir = join(config.root, config.build.outDir)
      const indexHtml = readFileSync(join(outDir, 'index.html'), 'utf8')
      for (const page of staticPages) {
        const dir = join(outDir, page.path)
        const file = join(dir, 'index.html')
        if (existsSync(file)) throw new Error(`static page collides with ${file}`)
        mkdirSync(dir, { recursive: true })
        writeFileSync(file, renderStaticPage(indexHtml, page))
      }
    },
  }
}
```

Added to `plugins` in `defineConfig`. `vitest.config.ts` merges the Vite
config; `apply: 'build'` keeps the plugin inactive in tests and in dev.

### `app/src/router/legacyHash.ts`

```ts
/** '#/imprint?x=1' → '/imprint?x=1'; '#/' → '/'; '#contact', '' → null. */
export function legacyHashPath(hash: string): string | null

/** If location.hash is a legacy hash route, replaceState to that path (keeps history.state). */
export function translateLegacyHashUrl(): void
```

`translateLegacyHashUrl` uses `window.history.replaceState(window.history.state, '', path)`.
In `router/index.ts`: call `translateLegacyHashUrl()` after the imports and
before `createRouter(...)`.

### Router `afterEach`

```ts
router.afterEach((to) => {
  const metadata = to.meta.seo
  if (isPageMetadata(metadata)) {
    const recordPath = to.matched.at(-1)?.path ?? to.path
    updatePageMetadata(metadata, isSectionId(to.meta.section) ? '/' : recordPath)
  }
})
```

### `app/src/seo.ts`

```ts
export { pageMetadata } from './staticPages'
export type { PageMetadata } from './staticPages'

function canonicalUrl(path: string): string {
  return new URL(path, new URL(import.meta.env.BASE_URL, window.location.origin)).href
}
```

### Legacy redirect page (`app/public/impressum/index.html`)

`datenschutz/index.html` differs only in title (`Datenschutz | michaelschreiber.net`),
target (`/privacy/`) and link text (`Weiter zur Datenschutzerklärung`).

```html
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Impressum | michaelschreiber.net</title>
    <link rel="canonical" href="https://michaelschreiber.net/imprint/">
    <meta http-equiv="refresh" content="0; url=/imprint/">
    <script>location.replace('/imprint/')</script>
  </head>
  <body>
    <p><a href="/imprint/">Weiter zum Impressum</a></p>
  </body>
</html>
```

### `app/public/sitemap.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://michaelschreiber.net/</loc>
  </url>
  <url>
    <loc>https://michaelschreiber.net/imprint/</loc>
  </url>
  <url>
    <loc>https://michaelschreiber.net/privacy/</loc>
  </url>
</urlset>
```

### Tests (summary for developer and tester)

`seo.spec.ts`:

- Existing `updatePageMetadata` tests: canonical/og:url become
  `${origin}/imprint/` and `${origin}/privacy/` (call with `'/imprint/'`,
  `'/privacy/'`).
- `describe('canonical host (MS-22)')`: `CNAME` trimmed is
  `michaelschreiber.net`; for `index.html`, `sitemap.xml`, `robots.txt`, both
  redirect pages and `renderStaticPage(indexHtml, page)` for every
  `staticPages` entry: all matches of
  `/https?:\/\/[^\s"'<>/]*michaelschreiber\.net/gi` equal
  `https://michaelschreiber.net` (at least one match), no match of
  `/www\.michaelschreiber/i`; `robots.txt` contains
  `Sitemap: https://michaelschreiber.net/sitemap.xml`; `SITE_ORIGIN` is
  `https://michaelschreiber.net`.
- `describe('sitemap (MS-22)')`: `<loc>` values equal
  `['https://michaelschreiber.net/', ...staticPages.filter(sitemap).map(canonical)]`
  i.e. `/`, `/imprint/`, `/privacy/`.
- `describe('renderStaticPage (MS-22)')`, `it.each` over `staticPages`, parse
  the output with `DOMParser`: title, description, og:title, og:description
  equal the page metadata; canonical and og:url equal
  `canonicalUrlFor(page.canonicalPath)`; exactly one of each tag; JSON-LD and
  `#app` unchanged. One test that it throws when a tag is missing, one that
  `"`/`&` in metadata are escaped.
- `describe('legacy redirect pages (MS-22)')`, `it.each`
  `[['impressum', '/imprint/'], ['datenschutz', '/privacy/']]`: refresh
  `0; url=<target>`, script contains `location.replace('<target>')`,
  canonical `https://michaelschreiber.net<target>`, anchor href `<target>`, no
  `meta[name="robots"]`, `lang="de"`. And: `public/imprint`, `public/privacy`
  (and the section paths) do **not** exist (they would collide with D4).

`legacyHash.spec.ts`: `legacyHashPath` table (`#/imprint`, `#/impressum`,
`#/datenschutz`, `#/projects`, `#/`, `#/imprint?x=1`, `#contact` → null,
`''` → null); `translateLegacyHashUrl` with jsdom
(`history.replaceState` to `/#/privacy` first, then call, then
`location.pathname === '/privacy'` and `location.hash === ''`; no-op for
`#contact`). Reset the URL to `/` after each test.

`router.spec.ts`: route table paths now with trailing slash (the
"English paths only" test must ignore the catch-all); legacy redirects target
`/imprint/`, `/privacy/`; `/imprint` (no slash) resolves to `imprint` and sets
canonical `${origin}/imprint/`; `/foo` redirects to `home`; every
`staticPages` path resolves to a named route; section routes still
canonicalize to `${origin}/`.

## Open Questions

None. DNS for `www` and the GSC actions are manual user steps (D11).
