---
type: Architecture Concept
title: Consistent Routing — English Route Paths
description: Moves the two German route paths /impressum and /datenschutz to /imprint and /privacy (route names and SEO metadata keys follow), keeps the old paths as client-side redirects so existing bookmarks still work, and leaves the German page content, footer labels and component file names unchanged.
tags: [MS-16, routes, components, tests]
timestamp: 2026-10-21T00:00:00+02:00
status: draft
---

## Story

As a developer, I want all subpages of the website to use English route
paths, so that routing behaves consistently across the whole project. Today
some subpages use German paths, for example the imprint is at `/impressum`.

Jira: MS-16 — https://mklschreiber.atlassian.net/browse/MS-16

Acceptance criteria (Jira):

1. All subpages are reachable under English path information.

No design artifact exists for this story (`docs/design/MS-16/` does not
exist). Nothing visible changes except the URL in the address bar.

### Current state (verified)

`app/src/router/index.ts` uses `createWebHashHistory`. Routes:

| Path | Name | Component | SEO key |
|---|---|---|---|
| `/` | `landing` | `LandingPage` | `landing` |
| `/about` | `about` | `AboutPage` (lazy) | `about` |
| `/projects` | `projects` | `ProjectOverviewPage` | `projects` |
| `/contact` | `contact` | `ContactPage` | `contact` |
| `/impressum` | `impressum` | `ImpressumPage` | `impressum` |
| `/datenschutz` | `datenschutz` | `DataProtectionPage` | `dataProtection` |

References to the two German paths or names in tracked files:

- `app/src/router/index.ts` — the two route records.
- `app/src/seo.ts` — `pageMetadata.impressum`, `pageMetadata.dataProtection`.
- `app/src/components/AppFooter.vue` — `<RouterLink to="/impressum">` and
  `<RouterLink to="/datenschutz">` (the only links to these pages).
- `app/src/__tests__/AboutPage.spec.ts` — stub routes `/impressum`,
  `/datenschutz` in its test router.

Checked and **not** affected:

- No code navigates by route name (no `{ name: … }` links, no
  `router.push` / `useRoute` in `app/src`), so renaming route names is safe.
- `app/public/sitemap.xml` lists only `https://michaelschreiber.net/`;
  `app/public/robots.txt` has no path rules; `app/index.html` has no route
  links. None of them change.
- i18n messages (`app/src/i18n/locales/*.ts`) contain no route paths.
- `AppNavigation.vue`, `LandingPage.vue` and all other views only link to
  `/`, `/about`, `/projects`, `/contact`.
- `docs/architecture/seo.md` describes the mechanism, not the paths.
- `app/.idea/` is untracked IDE state and is ignored.

## Architecture Decisions

### D1. New paths: `/imprint` and `/privacy`

| Old path | New path |
|---|---|
| `/impressum` | `/imprint` |
| `/datenschutz` | `/privacy` |

Why:

- **`/imprint`** is the established English term for the German
  "Impressum" (legal notice of the site operator). `/legal-notice` was
  considered but is two words, while all other paths are one word.
- **`/privacy`** is the common path for a privacy policy on English-language
  sites, and "Datenschutzerklärung" translates to "privacy policy". It is
  one word, like `/about`, `/projects`, `/contact`, `/imprint`.
  `/data-protection` would mirror the component name `DataProtectionPage`,
  but it is a literal translation, longer, and less recognizable as a URL.
  Matching the component name is not a goal for URLs.

### D2. Route names and SEO metadata keys follow the paths

- Route names: `impressum` → `imprint`, `datenschutz` → `privacy`.
- `pageMetadata` keys in `app/src/seo.ts`: `impressum` → `imprint`,
  `dataProtection` → `privacy`.

Why: for the four English routes, path segment, route name and SEO key are
already the same word (`about`/`about`/`about`). Keeping that rule for all
six routes is the "consistent routing" the story asks for. The cost is
small: route names are not used anywhere else, and the SEO keys are used
only in `router/index.ts`.

The **values** of `pageMetadata` (German titles "Impressum |
michaelschreiber.net", "Datenschutz | michaelschreiber.net" and their
descriptions) stay unchanged. They are page content, not routing.

### D3. Component files, CSS classes and visible labels stay unchanged

Not changed:

- `ImpressumPage.vue` and `DataProtectionPage.vue` keep their file and
  component names; their tests `ImpressumPage.spec.ts` and
  `DataProtectionPage.spec.ts` stay as they are.
- The root CSS classes `.impressum-page` / `.datenschutz-page` stay.
- The footer link texts "Impressum" / "Datenschutz" and the German page
  headings stay. They are the legally expected German terms on a German
  site, and the footer is not localized today; localizing it is a different
  story.

Why: the story and its acceptance criterion are about URL paths. Renaming
`ImpressumPage.vue` to `ImprintPage.vue` would touch the view, its test
file, the router import and git history without any user-visible or
routing benefit. `DataProtectionPage` is already English. This keeps the
change proportionate (no gold plating).

### D4. The old German paths redirect to the new ones

Two redirect records are added to the router:

```ts
{ path: '/impressum', redirect: '/imprint' },
{ path: '/datenschutz', redirect: '/privacy' },
```

Why:

- Existing bookmarks, shared links and any external links to
  `https://michaelschreiber.net/#/impressum` or `#/datenschutz` keep
  working. A legally required imprint should never answer with an empty
  page.
- With hash history, an HTTP 301 is impossible (the server never sees the
  part after `#`), so a Vue Router `redirect` is the only option. It
  replaces the history entry, so the back button does not loop.
- The `router.afterEach` hook receives the **target** route, so `to.path`
  is `/imprint` / `/privacy` and the canonical URL becomes
  `https://michaelschreiber.net/#/imprint` (or `#/privacy`) also when the
  page was opened via an old path. The redirect records have no `meta`, and
  the hook never runs for them.
- The redirects are static strings (not a function) and have no `name`,
  so they cannot be confused with real pages. They are placed after the
  real routes, in the same order, under a short comment
  `// Legacy German paths (MS-16): keep old bookmarks working.`

The redirects stay indefinitely; they cost two lines.

No catch-all / 404 route is added. Unknown paths behave as before
(out of scope).

## Affected Components

| File | Change |
|---|---|
| `app/src/router/index.ts` | `/impressum` → `/imprint` (name `imprint`, `meta: { seo: pageMetadata.imprint }`); `/datenschutz` → `/privacy` (name `privacy`, `meta: { seo: pageMetadata.privacy }`); add the two redirect records from D4 after the real routes. Imports of `ImpressumPage` / `DataProtectionPage` unchanged. |
| `app/src/seo.ts` | Rename keys `impressum` → `imprint`, `dataProtection` → `privacy`. Values unchanged. |
| `app/src/components/AppFooter.vue` | `to="/impressum"` → `to="/imprint"`, `to="/datenschutz"` → `to="/privacy"`. Link texts unchanged. |
| `app/src/__tests__/AboutPage.spec.ts` | Stub routes `/impressum`, `/datenschutz` → `/imprint`, `/privacy`. |
| `app/src/__tests__/router.spec.ts` | **New** (Tester) — see "Test Expectations". |
| `app/src/__tests__/App.spec.ts` | Extended (Tester) — footer link targets. |

Not changed: `ImpressumPage.vue`, `DataProtectionPage.vue`, their specs,
`AppNavigation.vue`, i18n locales, `app/public/sitemap.xml`,
`app/public/robots.txt`, `app/index.html`, `docs/architecture/seo.md`.
Historical architecture documents that mention `/impressum` or
`/datenschutz` are records of past decisions and stay as they are.

## Data Flow

```
Footer click                   Old bookmark #/impressum
     │                                 │
     ▼                                 ▼
RouterLink to="/imprint"      router: { path: '/impressum', redirect: '/imprint' }
     │                                 │
     └──────────────┬──────────────────┘
                    ▼
   route { path: '/imprint', name: 'imprint',
           component: ImpressumPage, meta.seo: pageMetadata.imprint }
                    │
                    ▼
   router.afterEach(to) → updatePageMetadata(pageMetadata.imprint, '/imprint')
                    │
                    ▼
   <title>Impressum | michaelschreiber.net</title>,
   canonical https://michaelschreiber.net/#/imprint
```

Same flow for `/privacy` (old `/datenschutz`, `DataProtectionPage`,
`pageMetadata.privacy`).

## Interfaces

Final route table in `app/src/router/index.ts`:

| Path | Name | Component | `meta.seo` |
|---|---|---|---|
| `/` | `landing` | `LandingPage` | `pageMetadata.landing` |
| `/about` | `about` | `AboutPage` (lazy) | `pageMetadata.about` |
| `/projects` | `projects` | `ProjectOverviewPage` | `pageMetadata.projects` |
| `/contact` | `contact` | `ContactPage` | `pageMetadata.contact` |
| `/imprint` | `imprint` | `ImpressumPage` | `pageMetadata.imprint` |
| `/privacy` | `privacy` | `DataProtectionPage` | `pageMetadata.privacy` |
| `/impressum` | — | redirect → `/imprint` | — |
| `/datenschutz` | — | redirect → `/privacy` | — |

`pageMetadata` keys after the change: `landing`, `about`, `projects`,
`contact`, `imprint`, `privacy` (still `satisfies Record<string,
PageMetadata>`). `PageMetadata`, `isPageMetadata`, `updatePageMetadata`
and `canonicalUrl` are unchanged.

## Test Expectations

For the Tester (tests in `app/src/__tests__/`, no fixed delays — await
`router.push` / `router.isReady()`):

1. **New `router.spec.ts`** using the real router from `@/router`:
   - Every non-redirect route path is one of `/`, `/about`, `/projects`,
     `/contact`, `/imprint`, `/privacy` (from `router.getRoutes()`, ignoring
     records with `redirect`) — guards AC-1 against new German paths.
   - `router.resolve('/imprint')` has name `imprint` and `meta.seo` equal to
     `pageMetadata.imprint`; `/privacy` → `privacy` / `pageMetadata.privacy`.
     The matched component is `ImpressumPage` / `DataProtectionPage`.
   - `await router.push('/impressum')` ends at `currentRoute.path ===
     '/imprint'`; `/datenschutz` ends at `/privacy`.
   - After pushing an old path, `document.title` is the imprint/privacy
     title and the canonical link ends with `#/imprint` / `#/privacy`
     (redirect target, not the old path).
   - Reset the head (as `seo.spec.ts` does) and push back to `/` between
     tests to keep them independent.
2. **`App.spec.ts`**: the footer links' `href` attributes end with
   `#/imprint` and `#/privacy`; the texts "Impressum" / "Datenschutz" are
   still shown.
3. **`AboutPage.spec.ts`**: stub routes updated; existing tests pass.
4. Existing `ImpressumPage.spec.ts`, `DataProtectionPage.spec.ts` and
   `seo.spec.ts` pass unchanged.
5. Checks per profile: `npm run test:unit -- --run`, `npm run lint`,
   `npm run build`.
6. Optional manual browser check (`npm run dev`): footer links show
   `#/imprint` / `#/privacy`; opening `#/impressum` and `#/datenschutz`
   directly lands on the new URL with the correct page; the back button
   works.

## Open Questions

None. The path choice (`/imprint`, `/privacy`) and keeping the German
labels can be revisited in user review without affecting the structure.
