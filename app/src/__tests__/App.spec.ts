/**
 * Testing concept — App shell (footer legal links, MS-16); MS-20
 * (docs/architecture/MS-20-tests.md, D6): App renders no `main` of its own,
 * so every page has exactly one `main` with the header outside it; the
 * footer has the "Rechtliches" nav and the bold "schreiber" copyright.
 * The real router and i18n are used; `IntersectionObserver`,
 * `scrollIntoView` and `window.scrollTo` are stubbed (jsdom lacks them).
 */
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'

import { flushPromises, mount } from '@vue/test-utils'
import App from '../App.vue'
import router from '../router'
import i18n from '../i18n'

class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)
  Element.prototype.scrollIntoView = vi.fn()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

afterEach(async () => {
  await router.push('/')
  // The router scrolls in a later tick; let it run while the stubs are active.
  await flushPromises()
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

async function mountApp(path = '/') {
  await router.push(path)
  await router.isReady()

  return mount(App, {
    global: {
      plugins: [router, i18n],
    },
  })
}

function legalLinkHref(wrapper: Awaited<ReturnType<typeof mountApp>>, text: string) {
  return wrapper
    .findAll('.legal-link')
    .find((link) => link.text() === text)
    ?.attributes('href')
}

describe('App', () => {
  it('shows the footer with legal links', async () => {
    const wrapper = await mountApp()

    expect(wrapper.text()).toContain('Impressum')
    expect(wrapper.text()).toContain('Datenschutz')
    expect(wrapper.text()).toContain('Copyright 2026 - michaelschreiber.net')
  })

  // MS-16: footer links point to the English paths; labels stay German.
  it('links the Impressum footer entry to the English /imprint path', async () => {
    const wrapper = await mountApp()

    expect(legalLinkHref(wrapper, 'Impressum')).toMatch(/#\/imprint$/)
  })

  it('links the Datenschutz footer entry to the English /privacy path', async () => {
    const wrapper = await mountApp()

    expect(legalLinkHref(wrapper, 'Datenschutz')).toMatch(/#\/privacy$/)
  })
})

describe('App — page structure (MS-20, D6)', () => {
  it.each(['/', '/about', '/imprint', '/privacy'])('renders exactly one main on %s', async (path) => {
    const wrapper = await mountApp(path)

    expect(wrapper.findAll('main')).toHaveLength(1)
  })

  it.each(['/', '/imprint'])('renders the header outside main on %s', async (path) => {
    const wrapper = await mountApp(path)

    expect([wrapper.findAll('header').length, wrapper.findAll('main header').length]).toEqual([1, 0])
  })

  it('renders the footer outside main', async () => {
    const wrapper = await mountApp()

    expect(wrapper.findAll('main footer')).toHaveLength(0)
  })

  it('labels the footer navigation "Rechtliches"', async () => {
    const wrapper = await mountApp()

    expect(wrapper.get('footer nav').attributes('aria-label')).toBe('Rechtliches')
  })

  it('sets schreiber bold in the copyright', async () => {
    const wrapper = await mountApp()

    expect(wrapper.get('.copyright strong').text()).toBe('schreiber')
  })
})
