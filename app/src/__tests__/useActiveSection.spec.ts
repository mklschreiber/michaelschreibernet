/**
 * Testing concept — MS-20 Redesign onepager (useActiveSection scroll spy)
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-20
 * Architecture: docs/architecture/MS-20-redesign-onepager.md (D3).
 * Test concept: docs/architecture/MS-20-tests.md.
 *
 * Composable level: a harness component renders the four section elements
 * (attached to `document.body`, because the composable looks them up with
 * `document.getElementById`) and calls `useActiveSection()`.
 * `IntersectionObserver` does not exist in jsdom; a deterministic stub
 * records the constructor options, the observed elements and `disconnect`,
 * and keeps the callback so tests can fire intersection entries
 * synchronously. Covered: default `home`, one observer with the 40% band
 * (`rootMargin: '-40% 0px -59% 0px'`, threshold 0), observation of every
 * existing section, the active id following intersecting entries only,
 * foreign ids ignored, disconnect on unmount, and a graceful no-op without
 * `IntersectionObserver`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import type { Ref } from 'vue'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { useActiveSection } from '@/composables/useActiveSection'
import type { SectionId } from '@/composables/useSectionNavigation'

let observerCallback: IntersectionObserverCallback | undefined
let observerOptions: IntersectionObserverInit | undefined
let observerCount = 0
const observe = vi.fn()
const disconnect = vi.fn()

class IntersectionObserverStub {
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    observerCallback = callback
    observerOptions = options
    observerCount++
  }
  observe = observe
  unobserve = vi.fn()
  disconnect = disconnect
  takeRecords = () => []
}

let wrappers: VueWrapper[] = []

function mountSpy(sectionIds: string[] = ['home', 'projects', 'about', 'contact']) {
  let activeSection: Readonly<Ref<SectionId>> | undefined
  const Harness = defineComponent({
    setup() {
      activeSection = useActiveSection().activeSection
      return { sectionIds }
    },
    template: '<div><section v-for="id in sectionIds" :id="id" :key="id" /></div>',
  })
  const wrapper = mount(Harness, { attachTo: document.body })
  wrappers.push(wrapper)
  return { wrapper, activeSection: activeSection! }
}

function entry(id: string, isIntersecting: boolean): IntersectionObserverEntry {
  return {
    target: document.getElementById(id) ?? Object.assign(document.createElement('div'), { id }),
    isIntersecting,
  } as unknown as IntersectionObserverEntry
}

function fire(...entries: IntersectionObserverEntry[]) {
  observerCallback?.(entries, {} as IntersectionObserver)
}

beforeEach(() => {
  observerCallback = undefined
  observerOptions = undefined
  observerCount = 0
  vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)
})

afterEach(() => {
  wrappers.forEach((wrapper) => wrapper.unmount())
  wrappers = []
  observe.mockReset()
  disconnect.mockReset()
  vi.unstubAllGlobals()
})

describe('useActiveSection', () => {
  it('starts with home as the active section', () => {
    const { activeSection } = mountSpy()

    expect(activeSection.value).toBe('home')
  })

  it('creates exactly one observer', () => {
    mountSpy()

    expect(observerCount).toBe(1)
  })

  it('observes a 1%-high band at 40% of the viewport', () => {
    mountSpy()

    expect(observerOptions).toEqual({ rootMargin: '-40% 0px -59% 0px', threshold: 0 })
  })

  it('observes the four section elements in page order', () => {
    mountSpy()

    expect(observe.mock.calls.map(([element]) => (element as Element).id)).toEqual([
      'home',
      'projects',
      'about',
      'contact',
    ])
  })

  it('skips sections that are not in the document', () => {
    mountSpy(['home', 'contact'])

    expect(observe.mock.calls.map(([element]) => (element as Element).id)).toEqual([
      'home',
      'contact',
    ])
  })

  it('activates the section that crosses the band', () => {
    const { activeSection } = mountSpy()

    fire(entry('about', true))

    expect(activeSection.value).toBe('about')
  })

  it('ignores a section that leaves the band', () => {
    const { activeSection } = mountSpy()
    fire(entry('projects', true))

    fire(entry('projects', false))

    expect(activeSection.value).toBe('projects')
  })

  it('uses the entering section when one leaves and one enters in the same batch', () => {
    const { activeSection } = mountSpy()
    fire(entry('projects', true))

    fire(entry('projects', false), entry('about', true))

    expect(activeSection.value).toBe('about')
  })

  it('ignores intersecting elements whose id is not a section id', () => {
    const { activeSection } = mountSpy()

    fire(entry('imprint', true))

    expect(activeSection.value).toBe('home')
  })

  it('updates the rendered value reactively', async () => {
    const { activeSection } = mountSpy()
    const seen: SectionId[] = []
    const Probe = defineComponent({
      setup: () => () => {
        seen.push(activeSection.value)
        return null
      },
    })
    wrappers.push(mount(Probe))

    fire(entry('contact', true))
    await nextTick()

    expect(seen).toEqual(['home', 'contact'])
  })

  it('disconnects the observer on unmount', () => {
    const { wrapper } = mountSpy()

    wrapper.unmount()
    wrappers = []

    expect(disconnect).toHaveBeenCalledTimes(1)
  })

  it('stays on home without IntersectionObserver support', () => {
    vi.stubGlobal('IntersectionObserver', undefined)

    const { activeSection } = mountSpy()

    expect(activeSection.value).toBe('home')
  })
})
