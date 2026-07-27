import { afterEach, describe, expect, it } from 'vitest'
import { pageMetadata, updatePageMetadata } from '@/seo'

const initialHead = document.head.innerHTML

afterEach(() => {
  document.head.innerHTML = initialHead
})

describe('updatePageMetadata', () => {
  it('sets route-specific title, descriptions, and canonical URL', () => {
    updatePageMetadata(pageMetadata.projects, '/projects')

    expect(document.title).toBe('Projekte von Michael Schreiber | Senior Software Engineer')
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      pageMetadata.projects.description,
    )
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(
      pageMetadata.projects.title,
    )
    expect(document.querySelector('meta[property="og:description"]')?.getAttribute('content')).toBe(
      pageMetadata.projects.description,
    )
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${window.location.origin}/#/projects`,
    )
  })

  it('uses the root URL as canonical URL for the landing page', () => {
    updatePageMetadata(pageMetadata.landing, '/')

    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${window.location.origin}/`,
    )
  })
})
