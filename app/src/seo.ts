import type { PageMetadata } from './staticPages'

export { pageMetadata } from './staticPages'
export type { PageMetadata } from './staticPages'

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
  return new URL(path, new URL(import.meta.env.BASE_URL, window.location.origin)).href
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
