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
Consequently, route canonical URLs retain the hash route rather than claiming
that every page is the home page. The sitemap lists only the server-resolvable
home page; route-specific metadata is still available to crawlers that render
the application.

## Files

- `app/index.html`: static SEO metadata and Person JSON-LD
- `app/src/seo.ts`: route metadata registry and document-head updater
- `app/src/router/index.ts`: route metadata and navigation integration
- `app/public/robots.txt`: crawl policy and sitemap discovery
- `app/public/sitemap.xml`: homepage sitemap entry
