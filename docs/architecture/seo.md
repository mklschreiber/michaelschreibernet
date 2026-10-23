# SEO Metadata Architecture

Trello card: [SEO](https://trello.com/c/Fc3uf5vM/3-seo)

Trello remains the canonical source for requirements. This document records the
durable implementation decisions for SEO metadata.

## Decision

The Vite entry document supplies crawlable site-wide metadata, the document
language, a canonical home URL, `robots` directives, Open Graph defaults, and
Person structured data. The Vue router applies a unique title, description,
Open Graph title/description, and canonical URL after every route navigation.

The application uses hash-based routing for GitHub Pages compatibility.
Since MS-20 the site is a single page: Welcome, Projects, About me and Contact
are sections of the onepage at `/`. The section routes (`#/projects`,
`#/about`, `#/contact`) all use the home metadata and the canonical URL
`https://michaelschreiber.net/` (one page, one canonical); `og:url` is updated
with the canonical URL on every navigation. Only imprint and privacy keep their
own metadata and a canonical URL with the hash route. The sitemap lists only
the server-resolvable home page, which now holds all content.

The static `index.html` metadata mirrors the home metadata (description kept
in sync with `pageMetadata.home.description`) and adds `og:title`, `og:url`,
`og:locale`, `og:image` and `twitter:card`. The JSON-LD is an `@graph` with a
`WebSite` (`#website`) and the `Person` (`#person`, with `image`, `worksFor`
and `sameAs` profile links).

## Files

- `app/index.html`: static SEO metadata and WebSite/Person JSON-LD graph
- `app/src/seo.ts`: route metadata registry and document-head updater
- `app/src/router/index.ts`: route metadata and navigation integration
- `app/public/robots.txt`: crawl policy and sitemap discovery
- `app/public/sitemap.xml`: homepage sitemap entry
