/**
 * Testing concept — MS-17 Animated SVG Logo Instead of GIF (LandingPage)
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-17
 * Architecture: docs/architecture/MS-17-animated-svg-logo.md (D7, D9).
 * Test concept: docs/architecture/MS-17-tests.md.
 *
 * - Component level (Vue Test Utils + real de/en locales): the hero logo is
 *   the inline `AnimatedLogo` root (`svg.home-section__logo.animated-logo`), placed
 *   before the `h1`, with the localized `aria-label` (AC 5).
 * - AC 6: no `img` element with the old GIF is rendered, and the GIF file no
 *   longer exists in `app/public/` (Node `fs`).
 *
 * Testing concept — MS-20 Redesign onepager (LandingPage as onepage container)
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-20
 * Architecture: docs/architecture/MS-20-redesign-onepager.md (D1, D3, D6).
 * Test concept: docs/architecture/MS-20-tests.md.
 *
 * - Component level: AC-1 — one `main` with the four sections `home`,
 *   `projects`, `about`, `contact` in that order; the header is rendered
 *   before and outside `main`; one `h1`; every section is labelled by its
 *   own heading. D3 — the scroll spy result reaches the header: the
 *   `IntersectionObserver` stub keeps its callback, a fired entry for
 *   `#about` makes "Über mich" `aria-current`; "Home" is current initially.
 *   jsdom has no `IntersectionObserver`, so it is stubbed in every test;
 *   `attachTo: document.body` because the spy looks sections up by id.
 * - Integration with the real router (hash history) and i18n: moving between
 *   section routes keeps the same `LandingPage` instance and the same
 *   animated logo element (AC-5: the MS-17 animation does not restart).
 *   `scrollIntoView` and `window.scrollTo` are stubbed for `scrollBehavior`.
 * - R5 wiring (review round 2): `LandingPage` feeds the scroll spy result into
 *   `useSectionUrlSync` — a fired entry for `#contact`, a `scroll` event and
 *   the 150 ms idle window (fake `setTimeout`) move a memory-history router
 *   with `meta.section` routes from `/` to `/contact`. The sync rules
 *   themselves are covered in `useSectionUrlSync.spec.ts`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineComponent, nextTick } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter, RouterView } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'
import AppNavigation from '@/components/AppNavigation.vue'
import appRouter from '@/router'
import { consumeSilentSectionSync, SECTION_URL_SYNC_IDLE_MS } from '@/composables/useSectionUrlSync'
import appI18n from '@/i18n'
import de from '@/i18n/locales/de'
import en from '@/i18n/locales/en'
import type { MessageSchema } from '@/i18n/types'

// jsdom gives import.meta.url an http scheme, so resolve from the module directory.
const publicDir = resolve(__dirname, '../../public')

let wrappers: VueWrapper[] = []

function mountLandingPage(locale: 'de' | 'en' = 'de', attach = false) {
  const i18n = createI18n<[MessageSchema], 'de' | 'en'>({
    legacy: false,
    locale,
    messages: { de, en },
  })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: ['home', 'projects', 'about', 'contact'].map((name) => ({
      path: name === 'home' ? '/' : `/${name}`,
      name,
      component: { template: '<div />' },
    })),
  })

  const wrapper = mount(LandingPage, {
    attachTo: attach ? document.body : undefined,
    global: {
      plugins: [i18n, router],
    },
  })
  wrappers.push(wrapper)
  return wrapper
}

let observerCallback: IntersectionObserverCallback | undefined

class IntersectionObserverStub {
  constructor(callback: IntersectionObserverCallback) {
    observerCallback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  observerCallback = undefined
  vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)
})

afterEach(() => {
  wrappers.forEach((wrapper) => wrapper.unmount())
  wrappers = []
  vi.unstubAllGlobals()
})

describe('LandingPage', () => {
  it('renders the hero logo as the inline AnimatedLogo svg', () => {
    const wrapper = mountLandingPage()

    expect(wrapper.find('svg.home-section__logo.animated-logo').exists()).toBe(true)
  })

  it('renders the animated logo above the welcome heading', () => {
    const wrapper = mountLandingPage()
    const logo = wrapper.get('.home-section__logo')
    const heading = wrapper.get('h1')

    expect(logo.element.compareDocumentPosition(heading.element) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0)
  })

  it('labels the logo with the German landing.logoAlt text', () => {
    const wrapper = mountLandingPage('de')

    expect(wrapper.get('.home-section__logo').attributes('aria-label')).toBe(
      'Animiertes michaelschreiber.net Logo als verbundenes IT-Netzwerk',
    )
  })

  it('labels the logo with the English landing.logoAlt text', () => {
    const wrapper = mountLandingPage('en')

    expect(wrapper.get('.home-section__logo').attributes('aria-label')).toBe(
      'Animated michaelschreiber.net logo as a connected IT network',
    )
  })

  it('does not render the old GIF', () => {
    const wrapper = mountLandingPage()

    expect(wrapper.find('img[src="/logo_anim.gif"]').exists()).toBe(false)
  })

  it('does not render any img element in the hero', () => {
    const wrapper = mountLandingPage()

    expect(wrapper.findAll('#home img')).toHaveLength(0)
  })

  it('no longer ships logo_anim.gif in app/public', () => {
    expect(existsSync(resolve(publicDir, 'logo_anim.gif'))).toBe(false)
  })
})

describe('LandingPage — onepage structure (MS-20, AC-1, D6)', () => {
  it('renders the four sections in page order inside one main', () => {
    const wrapper = mountLandingPage()

    expect(wrapper.findAll('main > section').map((section) => section.attributes('id'))).toEqual([
      'home',
      'projects',
      'about',
      'contact',
    ])
  })

  it('renders exactly one main landmark', () => {
    expect(mountLandingPage().findAll('main')).toHaveLength(1)
  })

  it('renders the header outside main', () => {
    expect(mountLandingPage().findAll('main header')).toHaveLength(0)
  })

  it('renders the header before main', () => {
    const wrapper = mountLandingPage()
    const header = wrapper.get('header').element
    const main = wrapper.get('main').element

    expect(header.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0)
  })

  it('renders exactly one h1', () => {
    expect(mountLandingPage().findAll('h1')).toHaveLength(1)
  })

  it.each([
    ['home', 'H1', 'Willkommen'],
    ['projects', 'H2', 'Projekte'],
    ['about', 'H2', 'Über mich'],
    ['contact', 'H2', 'Kontakt'],
  ])('labels the %s section with its %s heading "%s"', (id, tagName, text) => {
    const wrapper = mountLandingPage()
    const headingId = wrapper.get(`section#${id}`).attributes('aria-labelledby')
    const heading = wrapper.get(`#${headingId}`)

    expect([heading.element.tagName, heading.text()]).toEqual([tagName, text])
  })

  it('renders the English section headings', () => {
    const wrapper = mountLandingPage('en')

    expect(wrapper.findAll('main h1, main h2').map((heading) => heading.text())).toEqual([
      'Welcome',
      'Projects',
      'About Me',
      'Contact',
    ])
  })
})

describe('LandingPage — active section in the header (MS-20, D3)', () => {
  function currentLinks(wrapper: VueWrapper): string[] {
    return wrapper.findAll('nav.navigation a[aria-current="true"]').map((link) => link.text())
  }

  it('marks Home as current initially', () => {
    expect(currentLinks(mountLandingPage('de', true))).toEqual(['Home'])
  })

  it('marks the section reported by the scroll spy as current', async () => {
    const wrapper = mountLandingPage('de', true)

    observerCallback?.(
      [{ target: document.getElementById('about'), isIntersecting: true } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )
    await nextTick()

    expect(currentLinks(wrapper)).toEqual(['Über mich'])
  })

  it('passes the active section to AppNavigation', () => {
    const wrapper = mountLandingPage('de', true)

    expect(wrapper.getComponent(AppNavigation).props('activeSection')).toBe('home')
  })
})

describe('LandingPage — section routes with the app router (MS-20, D1, AC-5)', () => {
  const Shell = defineComponent({ components: { RouterView }, template: '<RouterView />' })

  async function mountShell(path: string) {
    await appRouter.push(path)
    await appRouter.isReady()
    const wrapper = mount(Shell, { global: { plugins: [appRouter, appI18n] } })
    wrappers.push(wrapper)
    return wrapper
  }

  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn()
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  afterEach(async () => {
    wrappers.forEach((wrapper) => wrapper.unmount())
    wrappers = []
    await appRouter.push('/')
    // The router scrolls in a later tick; let it run while the stubs are active.
    await flushPromises()
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
    vi.restoreAllMocks()
  })

  it.each(['/projects', '/about', '/contact'])('renders the onepage for the old page URL %s', async (path) => {
    const wrapper = await mountShell(path)

    expect(wrapper.findComponent(LandingPage).exists()).toBe(true)
  })

  it('keeps the same LandingPage instance between section routes', async () => {
    const wrapper = await mountShell('/')
    const uid = wrapper.getComponent(LandingPage).vm.$.uid

    await appRouter.push('/about')
    await flushPromises()

    expect(wrapper.getComponent(LandingPage).vm.$.uid).toBe(uid)
  })

  it('keeps the animated logo element between section routes', async () => {
    const wrapper = await mountShell('/')
    const logo = wrapper.get('svg.animated-logo').element

    await appRouter.push('/projects')
    await appRouter.push('/contact')
    await flushPromises()

    expect(wrapper.get('svg.animated-logo').element).toBe(logo)
  })
})

describe('LandingPage — URL follows scrolling (MS-20, R5)', () => {
  beforeEach(() => {
    consumeSilentSectionSync(undefined)
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  })

  afterEach(() => {
    vi.useRealTimers()
    consumeSilentSectionSync(undefined)
  })

  it('replaces the URL with the section the scroll spy reports after scrolling stops', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: (['home', 'projects', 'about', 'contact'] as const).map((section) => ({
        path: section === 'home' ? '/' : `/${section}`,
        name: section,
        component: { template: '<div />' },
        meta: { section },
      })),
    })
    await router.push('/')
    await router.isReady()
    const i18n = createI18n<[MessageSchema], 'de' | 'en'>({ legacy: false, locale: 'de', messages: { de, en } })
    wrappers.push(mount(LandingPage, { attachTo: document.body, global: { plugins: [i18n, router] } }))

    observerCallback?.(
      [{ target: document.getElementById('contact'), isIntersecting: true } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )
    window.dispatchEvent(new Event('scroll'))
    vi.advanceTimersByTime(SECTION_URL_SYNC_IDLE_MS)
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/contact')
  })
})
