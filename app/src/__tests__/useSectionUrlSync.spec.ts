/**
 * Testing concept — MS-20 Redesign onepager, user review round 2, R5
 * (the URL follows manual scrolling)
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-20
 * Architecture: docs/architecture/MS-20-redesign-onepager.md (R5).
 * Test concept: docs/architecture/MS-20-tests.md.
 *
 * Composable level: a harness component calls `useSectionUrlSync(ref)` with a
 * plain `ref` as the active section (the scroll spy itself is covered by
 * `useActiveSection.spec.ts`). The router uses `createMemoryHistory` with the
 * four section routes (`meta.section`) and an `imprint` route without one,
 * and no `scrollBehavior`, so only the URL logic is under test.
 * `setTimeout`/`clearTimeout` are faked; the 150 ms idle window is driven
 * with `vi.advanceTimersByTime`, navigation is awaited with `flushPromises`
 * (it uses the real `setImmediate`). No fixed delays.
 *
 * Covered:
 * - a `scroll` event + 150 ms idle replaces the route with the active section
 *   (`replace`, never `push`); nothing before 150 ms; a second `scroll`
 *   restarts the window; no replace when the route already matches; none
 *   on a non-section route (imprint); a navigation during the window cancels
 *   the pending sync; after unmount `scroll` does nothing and the
 *   `beforeEach` guard is removed.
 * - `replaceSectionSilently` / `consumeSilentSectionSync`: the marker is set
 *   for the target, consumed once, cleared on a mismatched id, not set for
 *   no-op calls, and reset when the replace fails.
 * The module-level marker is reset before every test with
 * `consumeSilentSectionSync(undefined)`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import type { Ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import type { Router } from 'vue-router'
import {
  consumeSilentSectionSync,
  replaceSectionSilently,
  SECTION_URL_SYNC_IDLE_MS,
  useSectionUrlSync,
} from '@/composables/useSectionUrlSync'
import { SECTION_IDS } from '@/composables/useSectionNavigation'
import type { SectionId } from '@/composables/useSectionNavigation'

const Empty = { template: '<div />' }

function createTestRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      ...SECTION_IDS.map((id) => ({
        path: id === 'home' ? '/' : `/${id}`,
        name: id,
        component: Empty,
        meta: { section: id },
      })),
      { path: '/imprint', name: 'imprint', component: Empty },
    ],
  })
}

let wrappers: VueWrapper[] = []

async function setup(path = '/', initial: SectionId = 'home') {
  const router = createTestRouter()
  await router.push(path)
  await router.isReady()
  const activeSection: Ref<SectionId> = ref(initial)
  const Harness = defineComponent({
    setup() {
      useSectionUrlSync(activeSection)
      return {}
    },
    template: '<div />',
  })
  const wrapper = mount(Harness, { global: { plugins: [router] } })
  wrappers.push(wrapper)
  const replace = vi.spyOn(router, 'replace')
  const push = vi.spyOn(router, 'push')
  return { router, activeSection, wrapper, replace, push }
}

function scroll(): void {
  window.dispatchEvent(new Event('scroll'))
}

async function idle(ms = SECTION_URL_SYNC_IDLE_MS): Promise<void> {
  vi.advanceTimersByTime(ms)
  await flushPromises()
}

beforeEach(() => {
  consumeSilentSectionSync(undefined)
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
})

afterEach(() => {
  wrappers.forEach((wrapper) => wrapper.unmount())
  wrappers = []
  vi.useRealTimers()
  vi.restoreAllMocks()
  consumeSilentSectionSync(undefined)
})

describe('useSectionUrlSync (MS-20, R5)', () => {
  it('uses an idle window of 150 ms', () => {
    expect(SECTION_URL_SYNC_IDLE_MS).toBe(150)
  })

  it('moves the route to the active section after the scroll idle window', async () => {
    const { router } = await setup('/', 'contact')

    scroll()
    await idle()

    expect(router.currentRoute.value.name).toBe('contact')
  })

  it('updates the route with replace', async () => {
    const { replace } = await setup('/', 'contact')

    scroll()
    await idle()

    expect(replace).toHaveBeenCalledWith({ name: 'contact' })
  })

  it('does not add a history entry (no push)', async () => {
    const { push } = await setup('/', 'contact')

    scroll()
    await idle()

    expect(push).not.toHaveBeenCalled()
  })

  it('returns to home when scrolled back to the top', async () => {
    const { router } = await setup('/contact', 'home')

    scroll()
    await idle()

    expect(router.currentRoute.value.fullPath).toBe('/')
  })

  it('does not replace before the idle window has passed', async () => {
    const { replace } = await setup('/', 'contact')

    scroll()
    await idle(SECTION_URL_SYNC_IDLE_MS - 1)

    expect(replace).not.toHaveBeenCalled()
  })

  it('restarts the idle window on a second scroll event', async () => {
    const { replace } = await setup('/', 'contact')

    scroll()
    await idle(SECTION_URL_SYNC_IDLE_MS - 1)
    scroll()
    await idle(SECTION_URL_SYNC_IDLE_MS - 1)

    expect(replace).not.toHaveBeenCalled()
  })

  it('replaces once the restarted idle window has passed', async () => {
    const { router } = await setup('/', 'contact')

    scroll()
    await idle(SECTION_URL_SYNC_IDLE_MS - 1)
    scroll()
    await idle()

    expect(router.currentRoute.value.name).toBe('contact')
  })

  it('reads the active section when the window ends, not when scrolling starts', async () => {
    const { router, activeSection } = await setup('/', 'projects')

    scroll()
    activeSection.value = 'about'
    await idle()

    expect(router.currentRoute.value.name).toBe('about')
  })

  it('does not sync without a scroll event when the active section changes', async () => {
    const { replace, activeSection } = await setup('/', 'home')

    activeSection.value = 'contact'
    await idle()

    expect(replace).not.toHaveBeenCalled()
  })

  it('does not replace when the active section equals the route', async () => {
    const { replace } = await setup('/about', 'about')

    scroll()
    await idle()

    expect(replace).not.toHaveBeenCalled()
  })

  it('does not replace on a route without a section (imprint)', async () => {
    const { replace } = await setup('/imprint', 'contact')

    scroll()
    await idle()

    expect(replace).not.toHaveBeenCalled()
  })

  it('cancels a pending sync when a navigation starts during the window', async () => {
    const { router, replace } = await setup('/', 'contact')

    scroll()
    await router.push('/projects')
    await idle()

    expect(replace).not.toHaveBeenCalled()
  })

  it('keeps the route of a navigation started during the window', async () => {
    const { router } = await setup('/', 'contact')

    scroll()
    await router.push('/projects')
    await idle()

    expect(router.currentRoute.value.name).toBe('projects')
  })

  it('ignores scroll events after unmount', async () => {
    const { wrapper, replace } = await setup('/', 'contact')

    wrapper.unmount()
    wrappers = []
    scroll()
    await idle()

    expect(replace).not.toHaveBeenCalled()
  })

  it('drops a pending sync on unmount', async () => {
    const { wrapper, replace } = await setup('/', 'contact')

    scroll()
    wrapper.unmount()
    wrappers = []
    await idle()

    expect(replace).not.toHaveBeenCalled()
  })

  it('removes its beforeEach guard on unmount', async () => {
    const router = createTestRouter()
    const addGuard = router.beforeEach.bind(router)
    const removeGuard = vi.fn()
    vi.spyOn(router, 'beforeEach').mockImplementation((guard) => {
      removeGuard.mockImplementation(addGuard(guard))
      return removeGuard
    })
    const Harness = defineComponent({
      setup() {
        useSectionUrlSync(ref<SectionId>('home'))
        return {}
      },
      template: '<div />',
    })

    mount(Harness, { global: { plugins: [router] } }).unmount()

    expect(removeGuard).toHaveBeenCalledOnce()
  })

  it('marks the replace as silent for scrollBehavior', async () => {
    await setup('/', 'contact')

    scroll()
    vi.advanceTimersByTime(SECTION_URL_SYNC_IDLE_MS)

    // The test router has no scrollBehavior, so the marker is still set.
    expect(consumeSilentSectionSync('contact')).toBe(true)
  })
})

describe('replaceSectionSilently / consumeSilentSectionSync (MS-20, R5)', () => {
  let router: Router

  beforeEach(async () => {
    router = createTestRouter()
    await router.push('/')
    await router.isReady()
  })

  it('returns false when no silent sync is pending', () => {
    expect(consumeSilentSectionSync('about')).toBe(false)
  })

  it('replaces the current section route', async () => {
    await replaceSectionSilently(router, 'about')

    expect(router.currentRoute.value.name).toBe('about')
  })

  it('reports the silent target once', async () => {
    await replaceSectionSilently(router, 'about')

    expect(consumeSilentSectionSync('about')).toBe(true)
  })

  it('clears the marker after it was consumed', async () => {
    await replaceSectionSilently(router, 'about')
    consumeSilentSectionSync('about')

    expect(consumeSilentSectionSync('about')).toBe(false)
  })

  it('returns false for a different section', async () => {
    await replaceSectionSilently(router, 'about')

    expect(consumeSilentSectionSync('contact')).toBe(false)
  })

  it('clears the marker on a mismatched section', async () => {
    await replaceSectionSilently(router, 'about')
    consumeSilentSectionSync('contact')

    expect(consumeSilentSectionSync('about')).toBe(false)
  })

  it('clears the marker on a route without a section', async () => {
    await replaceSectionSilently(router, 'about')
    consumeSilentSectionSync(undefined)

    expect(consumeSilentSectionSync('about')).toBe(false)
  })

  it('sets no marker when the route already is the target', async () => {
    await router.push('/about')

    await replaceSectionSilently(router, 'about')

    expect(consumeSilentSectionSync('about')).toBe(false)
  })

  it('does not navigate when the route already is the target', async () => {
    await router.push('/about')
    const replace = vi.spyOn(router, 'replace')

    await replaceSectionSilently(router, 'about')

    expect(replace).not.toHaveBeenCalled()
  })

  it('leaves a route without a section untouched', async () => {
    await router.push('/imprint')

    await replaceSectionSilently(router, 'about')

    expect(router.currentRoute.value.name).toBe('imprint')
  })

  it('sets no marker on a route without a section', async () => {
    await router.push('/imprint')

    await replaceSectionSilently(router, 'about')

    expect(consumeSilentSectionSync('about')).toBe(false)
  })

  it('resets the marker when the replace is aborted', async () => {
    router.beforeEach(() => false)

    await replaceSectionSilently(router, 'about')

    expect(consumeSilentSectionSync('about')).toBe(false)
  })

  it('resets the marker when another navigation cancels the replace', async () => {
    const pending = replaceSectionSilently(router, 'about')
    const overtaking = router.push('/projects')

    await pending
    await overtaking

    expect(consumeSilentSectionSync('about')).toBe(false)
  })
})
