/**
 * Testing concept — MS-20 Redesign onepager (useSectionNavigation)
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-20
 * Architecture: docs/architecture/MS-20-redesign-onepager.md (D1, D2, D4).
 * Test concept: docs/architecture/MS-20-tests.md.
 *
 * - Unit level: `SECTION_IDS` order, the `isSectionId` type guard and
 *   `scrollToSection` (home → `window.scrollTo({ top: 0 })`, other sections →
 *   `scrollIntoView({ block: 'start' })` on the section element, the
 *   behaviour passed through unchanged, no error for a missing element).
 * - Composable level (harness component + real Vue Router): `sectionHref`
 *   resolves the route href (`#/projects` under hash history), `goToSection`
 *   pushes the named route and prevents the default for a plain primary
 *   click, leaves modified / non-primary / already-prevented clicks to the
 *   browser, and scrolls itself (`'auto'`) on a duplicated navigation
 *   (D2: Vue Router does not call `scrollBehavior` then).
 * jsdom has no `scrollIntoView`: it is stubbed on `Element.prototype` per
 * test; `window.scrollTo` is spied. Navigation is awaited, no fixed delays.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter, createWebHashHistory } from 'vue-router'
import type { Router, RouterHistory } from 'vue-router'
import {
  SECTION_IDS,
  isSectionId,
  scrollToSection,
  useSectionNavigation,
} from '@/composables/useSectionNavigation'
import type { SectionNavigation } from '@/composables/useSectionNavigation'

const scrollIntoView = vi.fn()
let scrollTo: ReturnType<typeof vi.spyOn>
let sections: HTMLElement[] = []

function addSection(id: string): HTMLElement {
  const element = document.createElement('section')
  element.id = id
  document.body.append(element)
  sections.push(element)
  return element
}

function createTestRouter(history: RouterHistory = createMemoryHistory()): Router {
  const page = { render: () => null }
  return createRouter({
    history,
    routes: [
      { path: '/', name: 'home', component: page },
      { path: '/projects', name: 'projects', component: page },
      { path: '/about', name: 'about', component: page },
      { path: '/contact', name: 'contact', component: page },
      { path: '/imprint', name: 'imprint', component: page },
    ],
  })
}

function useNavigation(router: Router): SectionNavigation {
  let navigation: SectionNavigation | undefined
  const Harness = defineComponent({
    setup() {
      navigation = useSectionNavigation()
      return () => null
    },
  })
  mount(Harness, { global: { plugins: [router] } })
  return navigation!
}

async function routerAt(path: string): Promise<Router> {
  const router = createTestRouter()
  await router.push(path)
  return router
}

function click(init: MouseEventInit = {}): MouseEvent {
  return new MouseEvent('click', { button: 0, cancelable: true, ...init })
}

beforeEach(() => {
  Element.prototype.scrollIntoView = scrollIntoView
  scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

afterEach(() => {
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
  scrollIntoView.mockReset()
  sections.forEach((element) => element.remove())
  sections = []
  vi.restoreAllMocks()
})

describe('SECTION_IDS', () => {
  it('lists the sections in page order', () => {
    expect(SECTION_IDS).toEqual(['home', 'projects', 'about', 'contact'])
  })
})

describe('isSectionId', () => {
  it.each(['home', 'projects', 'about', 'contact'])('accepts %s', (id) => {
    expect(isSectionId(id)).toBe(true)
  })

  it.each([['imprint'], ['privacy'], [''], ['Projects'], [undefined], [null], [1]])(
    'rejects %s',
    (value) => {
      expect(isSectionId(value)).toBe(false)
    },
  )
})

describe('scrollToSection', () => {
  it('scrolls the window to the top for home', () => {
    scrollToSection('home', 'auto')

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })

  it('does not use scrollIntoView for home', () => {
    addSection('home')

    scrollToSection('home', 'instant')

    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('passes the instant behaviour through for home', () => {
    scrollToSection('home', 'instant')

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' })
  })

  it('scrolls the section element into view at its start', () => {
    addSection('projects')

    scrollToSection('projects', 'auto')

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'auto' })
  })

  it('scrolls exactly the element with the section id', () => {
    addSection('projects')
    const about = addSection('about')

    scrollToSection('about', 'instant')

    expect(scrollIntoView.mock.contexts).toEqual([about])
  })

  it('does not scroll the window for a non-home section', () => {
    addSection('contact')

    scrollToSection('contact', 'auto')

    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('does nothing when the section element is missing', () => {
    expect(() => scrollToSection('contact', 'auto')).not.toThrow()
  })
})

describe('useSectionNavigation — sectionHref', () => {
  it.each([
    ['home', '#/'],
    ['projects', '#/projects'],
    ['about', '#/about'],
    ['contact', '#/contact'],
  ] as const)('resolves %s to the hash href %s', (id, href) => {
    const navigation = useNavigation(createTestRouter(createWebHashHistory()))

    expect(navigation.sectionHref(id)).toBe(href)
  })
})

describe('useSectionNavigation — goToSection', () => {
  it('navigates to the section route on a plain click', async () => {
    const router = await routerAt('/')
    const navigation = useNavigation(router)

    await navigation.goToSection('about', click())

    expect(router.currentRoute.value.name).toBe('about')
  })

  it('prevents the browser default on a plain click', async () => {
    const navigation = useNavigation(await routerAt('/'))
    const event = click()

    await navigation.goToSection('about', event)

    expect(event.defaultPrevented).toBe(true)
  })

  it('navigates without an event', async () => {
    const router = await routerAt('/')
    const navigation = useNavigation(router)

    await navigation.goToSection('contact')

    expect(router.currentRoute.value.name).toBe('contact')
  })

  it('navigates from a legal page to a section', async () => {
    const router = await routerAt('/imprint')
    const navigation = useNavigation(router)

    await navigation.goToSection('projects', click())

    expect(router.currentRoute.value.path).toBe('/projects')
  })

  it.each([
    ['metaKey', { metaKey: true }],
    ['ctrlKey', { ctrlKey: true }],
    ['shiftKey', { shiftKey: true }],
    ['altKey', { altKey: true }],
    ['middle button', { button: 1 }],
  ] as const)('leaves a click with %s to the browser (no navigation)', async (_name, init) => {
    const router = await routerAt('/')
    const navigation = useNavigation(router)

    await navigation.goToSection('about', click(init))

    expect(router.currentRoute.value.name).toBe('home')
  })

  it.each([
    ['metaKey', { metaKey: true }],
    ['ctrlKey', { ctrlKey: true }],
    ['shiftKey', { shiftKey: true }],
    ['altKey', { altKey: true }],
    ['middle button', { button: 1 }],
  ] as const)('does not prevent the default of a click with %s', async (_name, init) => {
    const navigation = useNavigation(await routerAt('/'))
    const event = click(init)

    await navigation.goToSection('about', event)

    expect(event.defaultPrevented).toBe(false)
  })

  it('ignores a click whose default was already prevented', async () => {
    const router = await routerAt('/')
    const navigation = useNavigation(router)
    const event = click()
    event.preventDefault()

    await navigation.goToSection('about', event)

    expect(router.currentRoute.value.name).toBe('home')
  })

  it('scrolls to the section itself when the route is already current', async () => {
    addSection('projects')
    const navigation = useNavigation(await routerAt('/projects'))

    await navigation.goToSection('projects', click())

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'auto' })
  })

  it('scrolls to the top on a repeated home click', async () => {
    const navigation = useNavigation(await routerAt('/'))

    await navigation.goToSection('home', click())

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })

  it('leaves scrolling to the router on a normal navigation', async () => {
    addSection('about')
    const navigation = useNavigation(await routerAt('/'))

    await navigation.goToSection('about', click())

    expect(scrollIntoView).not.toHaveBeenCalled()
  })
})
