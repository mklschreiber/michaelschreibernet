/*
 * Testing concept (MS-16 — Consistent routing)
 *
 * What: the real router from `@/router` after moving `/impressum` and
 * `/datenschutz` to `/imprint` and `/privacy`.
 * Level: unit tests against the router instance (no component mount needed).
 * Why:
 * - AC-1 "All subpages are reachable under English path information" is a
 *   property of the route table, so it is guarded directly on
 *   `router.getRoutes()`; a new German path would fail the test.
 * - The new paths must resolve to the same pages and SEO metadata as before.
 * - The legacy German paths must redirect (bookmarks keep working), and the
 *   SEO hook must use the redirect target for title and canonical URL.
 * Isolation: the head is reset and the router is pushed back to `/` after
 * every test; navigation is awaited, no fixed delays.
 */
import { afterEach, describe, expect, it } from 'vitest'
import router from '@/router'
import { pageMetadata } from '@/seo'
import ImpressumPage from '@/views/ImpressumPage.vue'
import DataProtectionPage from '@/views/DataProtectionPage.vue'

const initialHead = document.head.innerHTML

function canonicalHref(): string | null | undefined {
  return document.querySelector('link[rel="canonical"]')?.getAttribute('href')
}

afterEach(async () => {
  await router.push('/')
  document.head.innerHTML = initialHead
})

describe('route table', () => {
  it('uses only English paths for all pages', () => {
    const pagePaths = router
      .getRoutes()
      .filter((route) => !route.redirect)
      .map((route) => route.path)

    expect(pagePaths.sort()).toEqual(
      ['/', '/about', '/projects', '/contact', '/imprint', '/privacy'].sort(),
    )
  })

  it('keeps the legacy German paths only as unnamed redirects', () => {
    const redirects = router
      .getRoutes()
      .filter((route) => route.redirect)
      .map((route) => ({ path: route.path, name: route.name, redirect: route.redirect }))

    expect(redirects).toEqual([
      { path: '/impressum', name: undefined, redirect: '/imprint' },
      { path: '/datenschutz', name: undefined, redirect: '/privacy' },
    ])
  })
})

describe('/imprint', () => {
  it('resolves to the route named imprint', () => {
    expect(router.resolve('/imprint').name).toBe('imprint')
  })

  it('carries the imprint SEO metadata', () => {
    expect(router.resolve('/imprint').meta.seo).toEqual(pageMetadata.imprint)
  })

  it('renders the ImpressumPage component', () => {
    expect(router.resolve('/imprint').matched[0]?.components?.default).toBe(ImpressumPage)
  })
})

describe('/privacy', () => {
  it('resolves to the route named privacy', () => {
    expect(router.resolve('/privacy').name).toBe('privacy')
  })

  it('carries the privacy SEO metadata', () => {
    expect(router.resolve('/privacy').meta.seo).toEqual(pageMetadata.privacy)
  })

  it('renders the DataProtectionPage component', () => {
    expect(router.resolve('/privacy').matched[0]?.components?.default).toBe(DataProtectionPage)
  })
})

describe('legacy German paths', () => {
  it('redirects /impressum to /imprint', async () => {
    await router.push('/impressum')

    expect(router.currentRoute.value.path).toBe('/imprint')
  })

  it('redirects /datenschutz to /privacy', async () => {
    await router.push('/datenschutz')

    expect(router.currentRoute.value.path).toBe('/privacy')
  })

  it('sets the imprint title after opening /impressum', async () => {
    await router.push('/impressum')

    expect(document.title).toBe(pageMetadata.imprint.title)
  })

  it('sets the privacy title after opening /datenschutz', async () => {
    await router.push('/datenschutz')

    expect(document.title).toBe(pageMetadata.privacy.title)
  })

  it('uses the new imprint path as canonical URL after opening /impressum', async () => {
    await router.push('/impressum')

    expect(canonicalHref()).toBe(`${window.location.origin}/#/imprint`)
  })

  it('uses the new privacy path as canonical URL after opening /datenschutz', async () => {
    await router.push('/datenschutz')

    expect(canonicalHref()).toBe(`${window.location.origin}/#/privacy`)
  })
})
