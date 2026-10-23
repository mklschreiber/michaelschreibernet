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
 */
import { afterEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pageMetadata, updatePageMetadata } from '@/seo'

// jsdom gives import.meta.url an http scheme, so resolve from the module directory.
const indexHtml = new DOMParser().parseFromString(
  readFileSync(resolve(__dirname, '../../index.html'), 'utf8'),
  'text/html',
)

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
    updatePageMetadata(pageMetadata.imprint, '/imprint')

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
      `${window.location.origin}/#/imprint`,
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
    updatePageMetadata(pageMetadata.privacy, '/privacy')

    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(
      `${window.location.origin}/#/privacy`,
    )
  })

  it('updates the existing og:url instead of adding a second one', () => {
    updatePageMetadata(pageMetadata.imprint, '/imprint')
    updatePageMetadata(pageMetadata.home, '/')

    expect(document.querySelectorAll('meta[property="og:url"]')).toHaveLength(1)
  })

  it('keeps a single canonical link across updates', () => {
    updatePageMetadata(pageMetadata.imprint, '/imprint')
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
