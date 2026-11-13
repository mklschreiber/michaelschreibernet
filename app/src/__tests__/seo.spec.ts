/**
 * Testing concept — MS-20 Redesign onepager (SEO, D15)
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-20
 * Architecture: docs/architecture/MS-20-redesign-onepager.md (D15).
 * Test concept: docs/architecture/MS-20-tests.md.
 *
 * - Unit level: `pageMetadata` has exactly `home`, `imprint`, `privacy` with
 *   the concept's home description; `updatePageMetadata` sets title,
 *   descriptions, canonical URL and the new `og:url` (upserted, never
 *   duplicated).
 * - Static level: `app/index.html` is read from disk (Node `fs`) and parsed
 *   with `DOMParser`. Its title and descriptions must equal
 *   `pageMetadata.home` (the concept's "keep in sync; covered by a test"),
 *   plus the static Open Graph / Twitter tags and the JSON-LD `@graph`
 *   (`WebSite` + `Person`) for crawlers that do not run JavaScript.
 *
 * Testing concept — MS-22 Canonical host and history routing
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-22
 * Architecture: docs/architecture/MS-22-canonical-host-and-history-routing.md
 * (D2, D4, D5, D6, D8). Test concept: docs/architecture/MS-22-tests.md.
 *
 * - D5: `updatePageMetadata` builds canonical / og:url without `#`.
 * - D2 host guard (static): `public/CNAME` is exactly the apex; every site
 *   URL in `index.html`, `sitemap.xml`, `robots.txt`, both legacy redirect
 *   pages and the output of `renderStaticPage` for every static page is the
 *   apex `https://michaelschreiber.net`, and none contains
 *   `www.michaelschreiber`. `www.` in general stays allowed (LinkedIn etc.).
 * - D4 `renderStaticPage` (pure function, applied to the real source
 *   `index.html` and parsed with `DOMParser`): per page title, description,
 *   og:title, og:description, og:url and canonical; exactly one of each tag;
 *   JSON-LD, robots and `#app` unchanged; HTML escaping; throws for a missing
 *   or duplicated tag. The Vite plugin itself is not executed (build-only).
 * - D6 legacy redirect pages `public/impressum/` and `public/datenschutz/`:
 *   meta refresh, `location.replace`, canonical, fallback link, no robots
 *   meta, German language; `public/` holds no directory that would collide
 *   with a generated static page.
 * - D8: the sitemap `<loc>` list equals the root plus the canonical URLs of
 *   the `sitemap: true` static pages.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pageMetadata, updatePageMetadata } from '@/seo'
import {
  SITE_ORIGIN,
  canonicalUrlFor,
  renderStaticPage,
  staticPages,
  type StaticPage,
} from '@/staticPages'

// jsdom gives import.meta.url an http scheme, so resolve from the module directory.
const appRoot = resolve(__dirname, '../..')

function readAppFile(path: string): string {
  return readFileSync(resolve(appRoot, path), 'utf8')
}

function parseHtml(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html')
}

const indexSource = readAppFile('index.html')
const indexHtml = parseHtml(indexSource)

function staticMeta(selector: string): string | null | undefined {
  return indexHtml.querySelector(selector)?.getAttribute('content')
}

interface JsonLdNode {
  '@type': string
  '@id': string
  [key: string]: unknown
}

const jsonLd = JSON.parse(
  indexHtml.querySelector('script[type="application/ld+json"]')?.textContent ?? '{}',
) as { '@context'?: string; '@graph'?: JsonLdNode[] }

function jsonLdNode(type: string): JsonLdNode | undefined {
  return jsonLd['@graph']?.find((node) => node['@type'] === type)
}

const initialHead = document.head.innerHTML

afterEach(() => {
  document.head.innerHTML = initialHead
})

describe('updatePageMetadata', () => {
  it('sets route-specific title, descriptions, and canonical URL', () => {
    updatePageMetadata(pageMetadata.imprint, '/imprint/')

    expect(document.title).toBe('Impressum | michaelschreiber.net')
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      pageMetadata.imprint.description,
    )
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(
      pageMetadata.imprint.title,
    )
    expect(document.querySelector('meta[property="og:description"]')?.getAttribute('content')).toBe(
      pageMetadata.imprint.description,
    )
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${window.location.origin}/imprint/`,
    )
  })

  it('uses the root URL as canonical URL for the home page', () => {
    updatePageMetadata(pageMetadata.home, '/')

    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${window.location.origin}/`,
    )
  })
})

describe('updatePageMetadata — og:url (MS-20)', () => {
  it('sets og:url to the canonical URL', () => {
    updatePageMetadata(pageMetadata.privacy, '/privacy/')

    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(
      `${window.location.origin}/privacy/`,
    )
  })

  it('updates the existing og:url instead of adding a second one', () => {
    updatePageMetadata(pageMetadata.imprint, '/imprint/')
    updatePageMetadata(pageMetadata.home, '/')

    expect(document.querySelectorAll('meta[property="og:url"]')).toHaveLength(1)
  })

  it('keeps a single canonical link across updates', () => {
    updatePageMetadata(pageMetadata.imprint, '/imprint/')
    updatePageMetadata(pageMetadata.home, '/')

    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1)
  })
})

describe('pageMetadata (MS-20)', () => {
  it('has exactly the home, imprint and privacy entries', () => {
    expect(Object.keys(pageMetadata).sort()).toEqual(['home', 'imprint', 'privacy'])
  })

  it('keeps the home title', () => {
    expect(pageMetadata.home.title).toBe('Michael Schreiber | Senior Software Engineer')
  })

  it('describes the whole onepage in the home description', () => {
    expect(pageMetadata.home.description).toBe(
      'Michael Schreiber, Senior Software Engineer: Projekte wie myStandby, beruflicher Werdegang und Kontakt auf einer Seite.',
    )
  })
})

describe('index.html static metadata (MS-20, D15)', () => {
  it('uses the home title', () => {
    expect(indexHtml.title).toBe(pageMetadata.home.title)
  })

  it('keeps the description in sync with pageMetadata.home', () => {
    expect(staticMeta('meta[name="description"]')).toBe(pageMetadata.home.description)
  })

  it('keeps og:description in sync with pageMetadata.home', () => {
    expect(staticMeta('meta[property="og:description"]')).toBe(pageMetadata.home.description)
  })

  it('keeps og:title in sync with pageMetadata.home', () => {
    expect(staticMeta('meta[property="og:title"]')).toBe(pageMetadata.home.title)
  })

  it('points canonical and og:url at the site root', () => {
    expect([
      indexHtml.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      staticMeta('meta[property="og:url"]'),
    ]).toEqual(['https://michaelschreiber.net/', 'https://michaelschreiber.net/'])
  })

  it('declares the German Open Graph locale', () => {
    expect(staticMeta('meta[property="og:locale"]')).toBe('de_DE')
  })

  it('uses the profile picture as og:image', () => {
    expect(staticMeta('meta[property="og:image"]')).toBe(
      'https://michaelschreiber.net/profile-picture.jpeg',
    )
  })

  it('uses the summary Twitter card', () => {
    expect(staticMeta('meta[name="twitter:card"]')).toBe('summary')
  })

  it('uses the primary colour as theme-color', () => {
    expect(staticMeta('meta[name="theme-color"]')).toBe('#4338ca')
  })

  it('keeps the page indexable', () => {
    expect(staticMeta('meta[name="robots"]')).toBe('index, follow')
  })
})

describe('index.html JSON-LD (MS-20, D15)', () => {
  it('uses the schema.org context', () => {
    expect(jsonLd['@context']).toBe('https://schema.org')
  })

  it('describes exactly a WebSite and a Person in the graph', () => {
    expect(jsonLd['@graph']?.map((node) => node['@type'])).toEqual(['WebSite', 'Person'])
  })

  it('describes the German WebSite at the site root', () => {
    expect(jsonLdNode('WebSite')).toEqual({
      '@type': 'WebSite',
      '@id': 'https://michaelschreiber.net/#website',
      name: 'michaelschreiber.net',
      url: 'https://michaelschreiber.net/',
      inLanguage: 'de',
    })
  })

  it('identifies the Person with the #person id', () => {
    expect(jsonLdNode('Person')?.['@id']).toBe('https://michaelschreiber.net/#person')
  })

  it('gives the Person the profile picture as image', () => {
    expect(jsonLdNode('Person')?.image).toBe('https://michaelschreiber.net/profile-picture.jpeg')
  })

  it('names the current employer of the Person', () => {
    expect(jsonLdNode('Person')?.worksFor).toEqual({
      '@type': 'Organization',
      name: 'Mercedes-Benz Tech Innovation',
    })
  })

  it('links the four social profiles of the Person', () => {
    expect(jsonLdNode('Person')?.sameAs).toEqual([
      'https://www.linkedin.com/in/mklschreiber',
      'https://github.com/mklschreiber',
      'https://www.facebook.com/mklschreiber',
      'https://www.instagram.com/mklschreiber/',
    ])
  })

  it('keeps the existing Person fields', () => {
    expect([
      jsonLdNode('Person')?.name,
      jsonLdNode('Person')?.jobTitle,
      jsonLdNode('Person')?.email,
      jsonLdNode('Person')?.url,
    ]).toEqual([
      'Michael Schreiber',
      'Senior Software Engineer',
      'mailto:info@michaelschreiber.net',
      'https://michaelschreiber.net/',
    ])
  })
})

const APEX = 'https://michaelschreiber.net'
const SITE_URL_PATTERN = /https?:\/\/[^\s"'<>/]*michaelschreiber\.net/gi

function siteUrls(text: string): string[] {
  return text.match(SITE_URL_PATTERN) ?? []
}

const hostSources: [string, string][] = [
  ['index.html', indexSource],
  ['public/sitemap.xml', readAppFile('public/sitemap.xml')],
  ['public/robots.txt', readAppFile('public/robots.txt')],
  ['public/impressum/index.html', readAppFile('public/impressum/index.html')],
  ['public/datenschutz/index.html', readAppFile('public/datenschutz/index.html')],
  ...staticPages.map((page): [string, string] => [
    `renderStaticPage ${page.path}`,
    renderStaticPage(indexSource, page),
  ]),
]

describe('canonical host (MS-22, D2)', () => {
  it('uses exactly the apex domain in CNAME', () => {
    expect(readAppFile('public/CNAME').trim()).toBe('michaelschreiber.net')
  })

  it('uses the apex origin as SITE_ORIGIN', () => {
    expect(SITE_ORIGIN).toBe(APEX)
  })

  it('points robots.txt at the apex sitemap', () => {
    expect(readAppFile('public/robots.txt')).toContain(`Sitemap: ${APEX}/sitemap.xml`)
  })

  it.each(hostSources)('contains at least one site URL in %s', (_name, text) => {
    expect(siteUrls(text).length).toBeGreaterThan(0)
  })

  it.each(hostSources)('uses only the apex host for site URLs in %s', (_name, text) => {
    expect(new Set(siteUrls(text))).toEqual(new Set([APEX]))
  })

  it.each(hostSources)('never mentions www.michaelschreiber in %s', (_name, text) => {
    expect(text).not.toMatch(/www\.michaelschreiber/i)
  })

  it('still allows www. hosts of other sites in index.html', () => {
    expect(indexSource).toContain('https://www.linkedin.com/in/mklschreiber')
  })
})

describe('updatePageMetadata — URLs without hash (MS-22, D5)', () => {
  it('builds the canonical URL without a # fragment', () => {
    updatePageMetadata(pageMetadata.imprint, '/imprint/')

    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).not.toContain('#')
  })
})

describe('staticPages (MS-22, D4)', () => {
  it('lists the legal pages and the section pages with trailing slashes', () => {
    expect(staticPages.map((page) => page.path)).toEqual([
      '/imprint/',
      '/privacy/',
      '/projects/',
      '/about/',
      '/contact/',
    ])
  })

  it('canonicalizes the legal pages to themselves and the section pages to the root', () => {
    expect(staticPages.map((page) => [page.path, page.canonicalPath])).toEqual([
      ['/imprint/', '/imprint/'],
      ['/privacy/', '/privacy/'],
      ['/projects/', '/'],
      ['/about/', '/'],
      ['/contact/', '/'],
    ])
  })

  it('builds canonical URLs on the apex origin', () => {
    expect(canonicalUrlFor('/imprint/')).toBe(`${APEX}/imprint/`)
  })
})

describe('renderStaticPage (MS-22, D4)', () => {
  function rendered(page: StaticPage): Document {
    return parseHtml(renderStaticPage(indexSource, page))
  }

  function content(document: Document, selector: string): string | null | undefined {
    return document.querySelector(selector)?.getAttribute('content')
  }

  it.each(staticPages.map((page) => [page.path, page] as const))(
    'sets the page title on %s',
    (_path, page) => {
      expect(rendered(page).title).toBe(page.metadata.title)
    },
  )

  it.each(staticPages.map((page) => [page.path, page] as const))(
    'sets description, og:title and og:description on %s',
    (_path, page) => {
      const document = rendered(page)

      expect([
        content(document, 'meta[name="description"]'),
        content(document, 'meta[property="og:title"]'),
        content(document, 'meta[property="og:description"]'),
      ]).toEqual([page.metadata.description, page.metadata.title, page.metadata.description])
    },
  )

  it.each(staticPages.map((page) => [page.path, page] as const))(
    'sets canonical and og:url on %s',
    (_path, page) => {
      const document = rendered(page)

      expect([
        document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
        content(document, 'meta[property="og:url"]'),
      ]).toEqual([canonicalUrlFor(page.canonicalPath), canonicalUrlFor(page.canonicalPath)])
    },
  )

  it.each(staticPages.map((page) => [page.path, page] as const))(
    'keeps exactly one of each replaced tag on %s',
    (_path, page) => {
      const document = rendered(page)

      expect(
        [
          'title',
          'meta[name="description"]',
          'meta[property="og:title"]',
          'meta[property="og:description"]',
          'meta[property="og:url"]',
          'link[rel="canonical"]',
        ].map((selector) => document.querySelectorAll(selector).length),
      ).toEqual([1, 1, 1, 1, 1, 1])
    },
  )

  it.each(staticPages.map((page) => [page.path, page] as const))(
    'keeps JSON-LD, robots, og:image and the #app mount point on %s',
    (_path, page) => {
      const document = rendered(page)

      expect([
        document.querySelector('script[type="application/ld+json"]')?.textContent,
        content(document, 'meta[name="robots"]'),
        content(document, 'meta[property="og:image"]'),
        document.querySelector('#app')?.outerHTML,
      ]).toEqual([
        indexHtml.querySelector('script[type="application/ld+json"]')?.textContent,
        'index, follow',
        `${APEX}/profile-picture.jpeg`,
        '<div id="app"></div>',
      ])
    },
  )

  it('renders the imprint page with the imprint title', () => {
    expect(rendered(staticPages[0]!).title).toBe('Impressum | michaelschreiber.net')
  })

  it('escapes quotes, ampersands and angle brackets in the metadata', () => {
    const html = renderStaticPage(indexSource, {
      path: '/test/',
      metadata: { title: 'A & B <C>', description: 'Say "hi" & <go>' },
      canonicalPath: '/test/',
      sitemap: false,
    })

    expect([
      html.match(/<title>[^<]*<\/title>/)?.[0],
      html.match(/<meta name="description" content="[^"]*">/)?.[0],
    ]).toEqual([
      '<title>A &amp; B &lt;C&gt;</title>',
      '<meta name="description" content="Say &quot;hi&quot; &amp; &lt;go&gt;">',
    ])
  })

  it('keeps escaped metadata intact for the parser', () => {
    const document = parseHtml(
      renderStaticPage(indexSource, {
        path: '/test/',
        metadata: { title: 'A & B', description: 'Say "hi"' },
        canonicalPath: '/test/',
        sitemap: false,
      }),
    )

    expect([document.title, content(document, 'meta[property="og:description"]')]).toEqual([
      'A & B',
      'Say "hi"',
    ])
  })

  it.each([
    ['<title>', /<title>[^<]*<\/title>/],
    ['meta[name="description"]', /<meta\s+name="description"[^>]*>/],
    ['meta[property="og:title"]', /<meta\s+property="og:title"[^>]*>/],
    ['meta[property="og:description"]', /<meta\s+property="og:description"[^>]*>/],
    ['meta[property="og:url"]', /<meta\s+property="og:url"[^>]*>/],
    ['link[rel="canonical"]', /<link\s+rel="canonical"[^>]*>/],
  ])('throws naming %s when the tag is missing', (label, tag) => {
    const withoutTag = indexSource.replace(tag, '')

    expect(() => renderStaticPage(withoutTag, staticPages[0]!)).toThrow(label)
  })

  it('throws when a tag occurs twice', () => {
    const withDuplicate = indexSource.replace(
      '</head>',
      '<link rel="canonical" href="https://michaelschreiber.net/x/">\n</head>',
    )

    expect(() => renderStaticPage(withDuplicate, staticPages[0]!)).toThrow(
      'link[rel="canonical"]',
    )
  })
})

describe('legacy redirect pages (MS-22, D6)', () => {
  const redirectPages = [
    ['impressum', '/imprint/'],
    ['datenschutz', '/privacy/'],
  ] as const

  function redirectPage(name: string): Document {
    return parseHtml(readAppFile(`public/${name}/index.html`))
  }

  it.each(redirectPages)('refreshes /%s instantly to %s', (name, target) => {
    expect(
      redirectPage(name).querySelector('meta[http-equiv="refresh"]')?.getAttribute('content'),
    ).toBe(`0; url=${target}`)
  })

  it.each(redirectPages)('replaces the location of /%s with %s', (name, target) => {
    expect(redirectPage(name).querySelector('script')?.textContent).toContain(
      `location.replace('${target}')`,
    )
  })

  it.each(redirectPages)('points the canonical of /%s at the apex %s', (name, target) => {
    expect(
      redirectPage(name).querySelector('link[rel="canonical"]')?.getAttribute('href'),
    ).toBe(`${APEX}${target}`)
  })

  it.each(redirectPages)('offers a fallback link from /%s to %s', (name, target) => {
    expect(redirectPage(name).querySelector('body a')?.getAttribute('href')).toBe(target)
  })

  it.each(redirectPages)('keeps /%s crawlable without a robots meta', (name) => {
    expect(redirectPage(name).querySelector('meta[name="robots"]')).toBeNull()
  })

  it.each(redirectPages)('declares German as language of /%s', (name) => {
    expect(redirectPage(name).documentElement.lang).toBe('de')
  })

  it.each(['imprint', 'privacy', 'projects', 'about', 'contact'])(
    'has no public/%s directory that would collide with a generated page',
    (name) => {
      expect(existsSync(resolve(appRoot, 'public', name))).toBe(false)
    },
  )
})

describe('sitemap (MS-22, D8)', () => {
  it('lists exactly the root and the indexable static pages', () => {
    const locs = [...readAppFile('public/sitemap.xml').matchAll(/<loc>([^<]*)<\/loc>/g)].map(
      (match) => match[1],
    )

    expect(locs).toEqual([
      `${APEX}/`,
      ...staticPages.filter((page) => page.sitemap).map((page) => canonicalUrlFor(page.canonicalPath)),
    ])
  })

  it('lists the root, /imprint/ and /privacy/', () => {
    const locs = [...readAppFile('public/sitemap.xml').matchAll(/<loc>([^<]*)<\/loc>/g)].map(
      (match) => match[1],
    )

    expect(locs).toEqual([`${APEX}/`, `${APEX}/imprint/`, `${APEX}/privacy/`])
  })
})
