export const SITE_ORIGIN = 'https://michaelschreiber.net'

export interface PageMetadata {
  title: string
  description: string
}

export const pageMetadata = {
  home: {
    title: 'Michael Schreiber | Senior Software Engineer',
    description:
      'Michael Schreiber, Senior Software Engineer: Projekte wie myStandby, beruflicher Werdegang und Kontakt auf einer Seite.',
  },
  imprint: {
    title: 'Impressum | michaelschreiber.net',
    description: 'Impressum von michaelschreiber.net.',
  },
  privacy: {
    title: 'Datenschutz | michaelschreiber.net',
    description: 'Datenschutzerklärung von michaelschreiber.net.',
  },
} satisfies Record<string, PageMetadata>

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
  { path: '/imprint/', metadata: pageMetadata.imprint, canonicalPath: '/imprint/', sitemap: true },
  { path: '/privacy/', metadata: pageMetadata.privacy, canonicalPath: '/privacy/', sitemap: true },
  { path: '/projects/', metadata: pageMetadata.home, canonicalPath: '/', sitemap: false },
  { path: '/about/', metadata: pageMetadata.home, canonicalPath: '/', sitemap: false },
  { path: '/contact/', metadata: pageMetadata.home, canonicalPath: '/', sitemap: false },
]

export function canonicalUrlFor(path: string): string {
  return `${SITE_ORIGIN}${path}`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

interface TagReplacement {
  label: string
  pattern: RegExp
  replacement: string
}

function replaceExactlyOnce(html: string, { label, pattern, replacement }: TagReplacement): string {
  const matches = html.match(pattern) ?? []

  if (matches.length !== 1) {
    throw new Error(`renderStaticPage: expected exactly one ${label}, found ${matches.length}`)
  }

  return html.replace(pattern, () => replacement)
}

function metaTagPattern(attribute: 'name' | 'property', key: string): RegExp {
  return new RegExp(`<meta\\s+${attribute}="${key}"\\s+content="[^"]*"\\s*/?>`, 'g')
}

export function renderStaticPage(indexHtml: string, page: StaticPage): string {
  const title = escapeHtml(page.metadata.title)
  const description = escapeHtml(page.metadata.description)
  const url = escapeHtml(canonicalUrlFor(page.canonicalPath))

  const replacements: TagReplacement[] = [
    {
      label: '<title>',
      pattern: /<title>[^<]*<\/title>/g,
      replacement: `<title>${title}</title>`,
    },
    {
      label: 'meta[name="description"]',
      pattern: metaTagPattern('name', 'description'),
      replacement: `<meta name="description" content="${description}">`,
    },
    {
      label: 'meta[property="og:title"]',
      pattern: metaTagPattern('property', 'og:title'),
      replacement: `<meta property="og:title" content="${title}">`,
    },
    {
      label: 'meta[property="og:description"]',
      pattern: metaTagPattern('property', 'og:description'),
      replacement: `<meta property="og:description" content="${description}">`,
    },
    {
      label: 'meta[property="og:url"]',
      pattern: metaTagPattern('property', 'og:url'),
      replacement: `<meta property="og:url" content="${url}">`,
    },
    {
      label: 'link[rel="canonical"]',
      pattern: /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/g,
      replacement: `<link rel="canonical" href="${url}">`,
    },
  ]

  return replacements.reduce(replaceExactlyOnce, indexHtml)
}
