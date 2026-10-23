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
 *
 * Testing concept (MS-20 — Redesign onepager), see docs/architecture/MS-20-tests.md
 *
 * - D1: the four section routes `/`, `/projects`, `/about`, `/contact` resolve
 *   to their names, `meta.section` and the one `LandingPage` component (the
 *   old page URLs keep working and the instance is reused).
 * - D15: every section route carries `pageMetadata.home`; after navigating to
 *   a section route the canonical URL and `og:url` are the site root, while
 *   the legal pages keep their own canonical path.
 * - D2: `router.options.scrollBehavior` is called directly with resolved
 *   routes (deterministic, no waiting for the router's own scroll tick):
 *   every returned position carries an explicit `behavior` (without one
 *   `window.scrollTo` would follow `html { scroll-behavior: smooth }`).
 *   Smooth (`'auto'`) only between two section routes; first navigation
 *   (`START_LOCATION`) and every move to/from imprint/privacy is `'instant'`.
 *   Saved positions win (with that behavior), section targets scroll via
 *   `scrollToSection` and return `false`, legal pages return
 *   `{ top: 0, behavior: 'instant' }`.
 *   jsdom has no `scrollIntoView`: it is stubbed on `Element.prototype`.
 * - R5 (review round 2): a silent URL sync (`replaceSectionSilently`) does not
 *   scroll — the real router runs its `scrollBehavior` after the replace and
 *   `consumeSilentSectionSync` makes it return `false`. A normal push
 *   afterwards scrolls again, the marker only matches its own section, and a
 *   first navigation to `/contact` still jumps instantly. The module-level
 *   marker is reset before each of these tests.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { START_LOCATION } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import router from '@/router'
import { consumeSilentSectionSync, replaceSectionSilently } from '@/composables/useSectionUrlSync'
import LandingPage from '@/views/LandingPage.vue'
import { pageMetadata } from '@/seo'
import ImpressumPage from '@/views/ImpressumPage.vue'
import DataProtectionPage from '@/views/DataProtectionPage.vue'

const initialHead = document.head.innerHTML

function canonicalHref(): string | null | undefined {
  return document.querySelector('link[rel="canonical"]')?.getAttribute('href')
}

const scrollIntoView = vi.fn()

beforeEach(() => {
  Element.prototype.scrollIntoView = scrollIntoView
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

afterEach(async () => {
  await router.push('/')
  // The router scrolls in a later tick; let it run while the stubs are active.
  await flushPromises()
  document.head.innerHTML = initialHead
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
  scrollIntoView.mockReset()
  vi.restoreAllMocks()
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

describe('section routes (MS-20, D1)', () => {
  it.each([
    ['/', 'home'],
    ['/projects', 'projects'],
    ['/about', 'about'],
    ['/contact', 'contact'],
  ])('resolves %s to the route named %s', (path, name) => {
    expect(router.resolve(path).name).toBe(name)
  })

  it.each([
    ['/', 'home'],
    ['/projects', 'projects'],
    ['/about', 'about'],
    ['/contact', 'contact'],
  ])('marks %s with meta.section %s', (path, section) => {
    expect(router.resolve(path).meta.section).toBe(section)
  })

  it.each(['/', '/projects', '/about', '/contact'])('renders %s with LandingPage', (path) => {
    expect(router.resolve(path).matched[0]?.components?.default).toBe(LandingPage)
  })

  it.each(['/', '/projects', '/about', '/contact'])('carries the home SEO metadata on %s', (path) => {
    expect(router.resolve(path).meta.seo).toEqual(pageMetadata.home)
  })

  it.each(['/imprint', '/privacy'])('has no meta.section on %s', (path) => {
    expect(router.resolve(path).meta.section).toBeUndefined()
  })

  it('no longer has a route named landing', () => {
    expect(router.hasRoute('landing')).toBe(false)
  })
})

describe('section routes SEO (MS-20, D15)', () => {
  it.each(['/projects', '/about', '/contact'])('uses the site root as canonical URL on %s', async (path) => {
    await router.push(path)

    expect(canonicalHref()).toBe(`${window.location.origin}/`)
  })

  it.each(['/projects', '/about', '/contact'])('uses the site root as og:url on %s', async (path) => {
    await router.push(path)

    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(
      `${window.location.origin}/`,
    )
  })

  it.each(['/projects', '/about', '/contact'])('sets the home title on %s', async (path) => {
    await router.push(path)

    expect(document.title).toBe(pageMetadata.home.title)
  })

  it('keeps the own canonical path on the imprint page', async () => {
    await router.push('/imprint')

    expect(canonicalHref()).toBe(`${window.location.origin}/#/imprint`)
  })

  it('keeps the own canonical path on the privacy page', async () => {
    await router.push('/privacy')

    expect(canonicalHref()).toBe(`${window.location.origin}/#/privacy`)
  })
})

describe('scrollBehavior (MS-20, D2)', () => {
  const scrollBehavior = router.options.scrollBehavior!
  let sections: HTMLElement[] = []

  /** A resolved route as scrollBehavior receives it (normalized routes always have a name or undefined). */
  function route(path: string): RouteLocationNormalized {
    const { name, ...resolved } = router.resolve(path)
    return { ...resolved, name: name ?? undefined }
  }

  function addSection(id: string): HTMLElement {
    const element = document.createElement('section')
    element.id = id
    document.body.append(element)
    sections.push(element)
    return element
  }

  afterEach(() => {
    sections.forEach((element) => element.remove())
    sections = []
  })

  it('restores a saved position on back/forward', () => {
    expect(scrollBehavior(route('/about'), route('/'), { left: 0, top: 640 })).toEqual({
      left: 0,
      top: 640,
      behavior: 'auto',
    })
  })

  it('does not scroll itself when a saved position exists', () => {
    addSection('about')

    scrollBehavior(route('/about'), route('/'), { left: 0, top: 640 })

    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('returns false for a section target (it scrolls by itself)', () => {
    addSection('about')

    expect(scrollBehavior(route('/about'), route('/'), null)).toBe(false)
  })

  it('scrolls the target section into view', () => {
    const about = addSection('about')

    scrollBehavior(route('/about'), route('/'), null)

    expect(scrollIntoView.mock.contexts).toEqual([about])
  })

  it('defers to the CSS scroll behaviour (auto) within the onepage', () => {
    addSection('contact')

    scrollBehavior(route('/contact'), route('/projects'), null)

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'auto' })
  })

  it('jumps instantly when coming from a legal page', () => {
    addSection('projects')

    scrollBehavior(route('/projects'), route('/imprint'), null)

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'instant' })
  })

  it('jumps instantly on the initial navigation', () => {
    addSection('about')

    scrollBehavior(route('/about'), START_LOCATION, null)

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'instant' })
  })

  it('scrolls the window to the top for home within the onepage', () => {
    scrollBehavior(route('/'), route('/about'), null)

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })

  it('returns false for home as well', () => {
    expect(scrollBehavior(route('/'), route('/about'), null)).toBe(false)
  })

  it('starts the imprint page at the top', () => {
    expect(scrollBehavior(route('/imprint'), route('/about'), null)).toEqual({
      top: 0,
      behavior: 'instant',
    })
  })

  it('starts the privacy page at the top', () => {
    expect(scrollBehavior(route('/privacy'), route('/'), null)).toEqual({
      top: 0,
      behavior: 'instant',
    })
  })

  it('does not scroll a section when opening a legal page', () => {
    addSection('about')

    scrollBehavior(route('/privacy'), route('/about'), null)

    expect(scrollIntoView).not.toHaveBeenCalled()
  })
  // Revised D2 (review round 1): explicit behavior for every case.
  const saved = { left: 0, top: 640 }
  const from = (path: string) => (path === 'START' ? START_LOCATION : route(path))

  it.each([
    ['/about', '/projects'],
    ['/', '/contact'],
  ])('restores a saved position smoothly (auto) from %s back to section %s', (to, fromPath) => {
    expect(scrollBehavior(route(to), from(fromPath), saved)).toEqual({ ...saved, behavior: 'auto' })
  })

  it.each([
    ['/about', 'START'],
    ['/imprint', 'START'],
    ['/about', '/imprint'],
    ['/', '/privacy'],
    ['/imprint', '/about'],
    ['/privacy', '/imprint'],
  ])('restores a saved position instantly on %s from %s', (to, fromPath) => {
    expect(scrollBehavior(route(to), from(fromPath), saved)).toEqual({ ...saved, behavior: 'instant' })
  })

  it.each([
    ['/projects', '/about', 'auto'],
    ['/contact', '/', 'auto'],
    ['/projects', 'START', 'instant'],
    ['/projects', '/imprint', 'instant'],
    ['/contact', '/privacy', 'instant'],
  ])('scrolls section %s from %s with behavior %s', (to, fromPath, behavior) => {
    addSection(to.slice(1))

    scrollBehavior(route(to), from(fromPath), null)

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior })
  })

  it.each([
    ['/projects', 'auto'],
    ['START', 'instant'],
    ['/imprint', 'instant'],
  ])('scrolls home to the top from %s with behavior %s', (fromPath, behavior) => {
    scrollBehavior(route('/'), from(fromPath), null)

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior })
  })

  it.each([
    ['/imprint', 'START'],
    ['/imprint', '/'],
    ['/privacy', '/contact'],
    ['/privacy', '/imprint'],
  ])('starts legal page %s from %s instantly at the top', (to, fromPath) => {
    expect(scrollBehavior(route(to), from(fromPath), null)).toEqual({ top: 0, behavior: 'instant' })
  })
})

describe('silent URL sync (MS-20, R5)', () => {
  const scrollBehavior = router.options.scrollBehavior!
  let sections: HTMLElement[] = []

  function route(path: string): RouteLocationNormalized {
    const { name, ...resolved } = router.resolve(path)
    return { ...resolved, name: name ?? undefined }
  }

  function addSection(id: string): HTMLElement {
    const element = document.createElement('section')
    element.id = id
    document.body.append(element)
    sections.push(element)
    return element
  }

  beforeEach(async () => {
    await router.push('/')
    await flushPromises()
    scrollIntoView.mockClear()
    consumeSilentSectionSync(undefined)
  })

  afterEach(() => {
    sections.forEach((element) => element.remove())
    sections = []
    consumeSilentSectionSync(undefined)
  })

  it('changes the URL to the section', async () => {
    addSection('about')

    await replaceSectionSilently(router, 'about')

    expect(router.currentRoute.value.fullPath).toBe('/about')
  })

  it('does not scroll the section into view', async () => {
    addSection('about')

    await replaceSectionSilently(router, 'about')
    await flushPromises()

    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('does not scroll the window when the URL returns to home', async () => {
    await router.push('/about')
    await flushPromises()
    vi.mocked(window.scrollTo).mockClear()

    await replaceSectionSilently(router, 'home')
    await flushPromises()

    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('consumes the marker, so the next push scrolls again', async () => {
    addSection('about')
    const contact = addSection('contact')
    await replaceSectionSilently(router, 'about')
    await flushPromises()

    await router.push('/contact')
    await flushPromises()

    expect(scrollIntoView.mock.contexts).toEqual([contact])
  })

  it('scrolls to a section whose click overtakes a pending silent replace', async () => {
    addSection('about')
    const contact = addSection('contact')

    const silent = replaceSectionSilently(router, 'about')
    const click = router.push('/contact')
    await Promise.all([silent, click])
    await flushPromises()

    expect(scrollIntoView.mock.contexts).toEqual([contact])
  })

  it('ends at the overtaking route', async () => {
    const silent = replaceSectionSilently(router, 'about')
    const click = router.push('/contact')
    await Promise.all([silent, click])

    expect(router.currentRoute.value.fullPath).toBe('/contact')
  })

  it('still jumps instantly to #contact on the first navigation', () => {
    addSection('contact')

    scrollBehavior(route('/contact'), START_LOCATION, null)

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'instant' })
  })
})
