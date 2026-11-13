# SEO Metadata Architecture

Trello card: [SEO](https://trello.com/c/Fc3uf5vM/3-seo)

Trello remains the canonical source for requirements. This document records the
durable implementation decisions for SEO metadata.

## Decision

The Vite entry document supplies crawlable site-wide metadata, the document
language, a canonical home URL, `robots` directives, Open Graph defaults, and
Person structured data. The Vue router applies a unique title, description,
Open Graph title/description, and canonical URL after every route navigation.

Since MS-22 the application uses history routing (`createWebHistory`) with
clean URLs; every non-root path ends with a slash (`/imprint/`), matching the
GitHub Pages directory form that answers 200. Since MS-20 the site is a single
page: Welcome, Projects, About me and Contact are sections of the onepage at
`/`. The section routes (`/projects/`, `/about/`, `/contact/`) all use the home
metadata and the canonical URL `https://michaelschreiber.net/` (one page, one
canonical); `og:url` is updated with the canonical URL on every navigation.
Imprint and privacy keep their own metadata and canonical URLs
(`/imprint/`, `/privacy/`). The sitemap lists the three indexable pages `/`,
`/imprint/` and `/privacy/`.

The static `index.html` metadata mirrors the home metadata (description kept
in sync with `pageMetadata.home.description`) and adds `og:title`, `og:url`,
`og:locale`, `og:image` and `twitter:card`. The JSON-LD is an `@graph` with a
`WebSite` (`#website`) and the `Person` (`#person`, with `image`, `worksFor`
and `sameAs` profile links).

## Canonical Host (MS-22)

The single canonical host is the apex `https://michaelschreiber.net`. The
GitHub Pages custom domain (`app/public/CNAME`) is the apex; GitHub Pages
redirects `www.michaelschreiber.net` to it. `index.html`, `sitemap.xml`,
`robots.txt`, the redirect pages and the generated per-route pages use only
the apex host; a static test in `app/src/__tests__/seo.spec.ts` guards this.

## Per-Route HTML and Legacy URLs (MS-22)

GitHub Pages is static hosting without an SPA fallback. A small Vite plugin
in `app/vite.config.ts` writes `dist/<route>/index.html` for `imprint`,
`privacy`, `projects`, `about` and `contact` from the built `index.html`, with
the page's title, description, `og:title`, `og:description`, `og:url` and
canonical (pure function `renderStaticPage` in `app/src/staticPages.ts`, the
single source of the page list and `pageMetadata`). The body stays the SPA
mount point. A `404.html` copy is not used because GitHub Pages serves it with
HTTP 404; unknown paths get GitHub's default 404.

The legacy plain paths `/impressum` and `/datenschutz` are static pages
`app/public/<path>/index.html` that redirect to `/imprint/` and `/privacy/`
(instant meta refresh, `location.replace`, target canonical, no `noindex`).
Old hash links (`/#/imprint`, `/#/projects`, …) are rewritten to paths with
`history.replaceState` before the router is created
(`app/src/router/legacyHash.ts`). Redirect pages are not in the sitemap and
must stay crawlable.

## Files

- `app/index.html`: static SEO metadata and WebSite/Person JSON-LD graph
- `app/src/seo.ts`: route metadata registry and document-head updater
- `app/src/router/index.ts`: route metadata and navigation integration
- `app/public/robots.txt`: crawl policy and sitemap discovery
- `app/public/sitemap.xml`: sitemap of the indexable pages
- `app/src/staticPages.ts`: page list, `pageMetadata` and `renderStaticPage`
- `app/vite.config.ts`: build plugin writing the per-route HTML files
- `app/src/router/legacyHash.ts`: translation of old `#/` links
- `app/public/CNAME`: GitHub Pages custom domain (apex)
- `app/public/{impressum,datenschutz}/index.html`: static redirect pages for
  legacy path URLs (MS-22)
- `app/src/__tests__/seo.spec.ts`: static checks for metadata, canonical host
  and redirect pages
