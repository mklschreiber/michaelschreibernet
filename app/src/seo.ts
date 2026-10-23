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

export function isPageMetadata(value: unknown): value is PageMetadata {
  return (
    typeof value === 'object' &&
    value !== null &&
    'title' in value &&
    typeof value.title === 'string' &&
    'description' in value &&
    typeof value.description === 'string'
  )
}

function upsertMeta(selector: string, attribute: 'name' | 'property', value: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(selector)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, selector.match(/"([^"]+)"/)?.[1] ?? '')
    document.head.append(element)
  }

  element.content = value
}

function canonicalUrl(path: string): string {
  const baseUrl = new URL(import.meta.env.BASE_URL, window.location.origin)

  if (path === '/') {
    return baseUrl.href
  }

  return `${baseUrl.href}#${path}`
}

export function updatePageMetadata(metadata: PageMetadata, canonicalPath: string): void {
  document.title = metadata.title
  upsertMeta('meta[name="description"]', 'name', metadata.description)
  upsertMeta('meta[property="og:title"]', 'property', metadata.title)
  upsertMeta('meta[property="og:description"]', 'property', metadata.description)

  const url = canonicalUrl(canonicalPath)
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')

  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.append(canonical)
  }

  canonical.href = url
  upsertMeta('meta[property="og:url"]', 'property', url)
}
