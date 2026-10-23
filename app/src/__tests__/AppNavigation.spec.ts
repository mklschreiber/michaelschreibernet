/**
 * Testing concept — MS-18 Animated Header Title (AppNavigation)
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-18
 * Architecture: docs/architecture/MS-18-animated-header-title.md (D2a, D3, D4–D8).
 * Test concept: docs/architecture/MS-18-tests.md.
 *
 * - Component level (Vue Test Utils, memory router, real de/en locales,
 *   `vi.useFakeTimers()`, `resetBrandTitleIntro()` before each test): the
 *   brand link's template contract — a visually hidden `.brand__sr` that is
 *   always `michaelschreiber.net` (stable accessible name), an `aria-hidden`
 *   `.brand__title[data-phase]`, a `.brand__ghost` that always holds the full
 *   text plus a cursor (layout reservation), and a `.brand__typed` with the
 *   visible text and exactly one cursor that blinks if and only if the phase
 *   is `idle`. Both ghost and typed text consist of exactly
 *   `.brand__first` / `.brand__strong` / `.brand__tld` / `.brand__cursor`
 *   with no text nodes between them (D2a).
 * - Behaviour through real DOM events (`trigger('pointerenter' | 'pointerleave')`
 *   with a `pointerType`): intro (AC 1, AC 3), delete on hover (AC 4), retype
 *   from the current character on leave (AC 5), the blinking cursor during the
 *   800 ms intro lead (D4 lead phase), reversal mid-intro, touch and
 *   focus ignored (D8), reduced motion (D7, stubbed `matchMedia`), timer
 *   cleanup on unmount, remount without intro replay (D5).
 * - Regression: the four navigation links, the menu button toggle and the
 *   close-on-click behaviour are unchanged.
 * - Source level (`AppNavigation.vue?raw`, jsdom applies no scoped CSS): the
 *   underscore cursor (AC 2), the blink keyframes with `steps(1, end) infinite`,
 *   the segment weights (`schreiber` bold, `michael`/`.net` normal), no colour
 *   on `.brand__tld`, no `--color-primary` in brand rules, no weight on
 *   `.brand__name` (D2a),
 *   the reduced-motion `animation: none` after the blink rule, the hidden ghost
 *   and the visually-hidden pattern.
 *
 * Testing concept — MS-20 Redesign onepager (AppNavigation app bar)
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-20
 * Architecture: docs/architecture/MS-20-redesign-onepager.md (D3, D4, D9, D10).
 * Test concept: docs/architecture/MS-20-tests.md.
 *
 * - Component level (memory router returned to the test, real timers so
 *   `flushPromises` can await click-triggered navigation): localized
 *   `nav` label and id, the menu button's `type`, `aria-controls` and
 *   menu/close icon, the active state (`is-active` + `aria-current="true"`)
 *   driven only by the `activeSection` prop (none by default), section link
 *   clicks navigating with the default prevented, the brand link going home
 *   and scrolling to the top when home is already current (D2 duplicated
 *   navigation), and the menu closing on Escape (focus back to the menu
 *   button; `attachTo` for real focus), on route change, and staying put for
 *   other keys or a closed menu. The keydown listener is removed on unmount.
 * - Source level: the mobile panel is opaque (`background:
 *   var(--color-surface)`) and has no `backdrop-filter` (D10).
 * - User review round 1: the brand mark tile with `/logo_simple_white.svg`
 *   and no plain `/logo.svg` (R2; template source, because Vite inlines public
 *   assets in tests), the tile CSS (48px/8px, mobile 40px/6px,
 *   `--radius-md`, `--gradient-brand-mark`) and the `.nav-container` box
 *   model (max width = content width + 2 × page padding, R4). Alignment
 *   itself is a manual browser check.
 * `window.scrollTo` is spied in every test (jsdom does not implement it).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter } from 'vue-router'
import AppNavigation from '@/components/AppNavigation.vue'
import IconMenu from '@/components/icons/IconMenu.vue'
import IconClose from '@/components/icons/IconClose.vue'
import appNavigationSource from '@/components/AppNavigation.vue?raw'
import { resetBrandTitleIntro } from '@/composables/useBrandTitle'
import type { SectionId } from '@/composables/useSectionNavigation'
import de from '@/i18n/locales/de'
import en from '@/i18n/locales/en'
import type { MessageSchema } from '@/i18n/types'

const TITLE = 'michaelschreiber.net'
const INTRO_FIRST_CHAR_MS = 1000
const INTRO_END_MS = 5180
const DELETE_DELAY_MS = 60

const styleSource = appNavigationSource.slice(appNavigationSource.indexOf('<style'))
const templateSource = appNavigationSource.slice(
  appNavigationSource.indexOf('<template'),
  appNavigationSource.indexOf('<style'),
)

let wrappers: VueWrapper[] = []

async function mountNavigation(locale: 'de' | 'en' = 'de') {
  const i18n = createI18n<[MessageSchema], 'de' | 'en'>({
    legacy: false,
    locale,
    messages: { de, en },
  })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { render: () => null } },
      { path: '/about', name: 'about', component: { render: () => null } },
      { path: '/projects', name: 'projects', component: { render: () => null } },
      { path: '/contact', name: 'contact', component: { render: () => null } },
    ],
  })
  await router.push('/')
  const wrapper = mount(AppNavigation, { global: { plugins: [i18n, router] } })
  wrappers.push(wrapper)
  return wrapper
}

async function advance(ms: number) {
  vi.advanceTimersByTime(ms)
  await nextTick()
}

async function mountAfterIntro() {
  const wrapper = await mountNavigation()
  await advance(INTRO_END_MS)
  return wrapper
}

function typed(wrapper: VueWrapper): string {
  return wrapper.get('.brand__typed').text()
}

function phase(wrapper: VueWrapper): string | undefined {
  return wrapper.get('.brand__title').attributes('data-phase')
}

function stubReducedMotion() {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({ matches: true, media: query }) as unknown as MediaQueryList),
  )
}

beforeEach(() => {
  vi.useFakeTimers()
  resetBrandTitleIntro()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

afterEach(() => {
  wrappers.forEach((wrapper) => wrapper.unmount())
  wrappers = []
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('AppNavigation — brand markup and accessible name (D3)', () => {
  it('renders exactly one visually hidden brand name', async () => {
    const wrapper = await mountNavigation()

    expect(wrapper.findAll('a.brand .brand__name > .brand__sr')).toHaveLength(1)
  })

  it('keeps the accessible name michaelschreiber.net at mount', async () => {
    const wrapper = await mountNavigation()

    expect(wrapper.get('.brand__sr').text()).toBe(TITLE)
  })

  it('keeps the accessible name michaelschreiber.net mid-typing', async () => {
    const wrapper = await mountNavigation()

    await advance(2000)

    expect(wrapper.get('.brand__sr').text()).toBe(TITLE)
  })

  it('keeps the accessible name michaelschreiber.net when fully deleted', async () => {
    const wrapper = await mountAfterIntro()

    await wrapper.get('a.brand').trigger('pointerenter', { pointerType: 'mouse' })
    await advance(19 * DELETE_DELAY_MS)

    expect([typed(wrapper), wrapper.get('.brand__sr').text()]).toEqual(['', TITLE])
  })

  it('hides the animated title from assistive technology', async () => {
    const wrapper = await mountNavigation()

    expect(wrapper.get('.brand__title').attributes('aria-hidden')).toBe('true')
  })

  it('keeps the logo mark hidden from assistive technology', async () => {
    const wrapper = await mountNavigation()

    expect(wrapper.get('.brand__mark').attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('img.brand__mark-image').attributes('alt')).toBe('')
  })

  // Vite inlines public assets in the test transform, so the src is read from the template source.
  it('shows the white simple logo inside the brand mark tile (R2)', () => {
    expect(templateSource).toMatch(
      /<span class="brand__mark" aria-hidden="true">\s*<img class="brand__mark-image" src="\/logo_simple_white\.svg" alt="" \/>\s*<\/span>/,
    )
  })

  it('renders no plain /logo.svg image in the header (R2)', () => {
    expect(templateSource).not.toMatch(/src="\/logo\.svg"/)
  })

  it('renders exactly one image in the brand link (R2)', async () => {
    const wrapper = await mountNavigation()

    expect(wrapper.findAll('a.brand img')).toHaveLength(1)
  })

  it('does not put an aria-label on the brand link', async () => {
    const wrapper = await mountNavigation()

    expect(wrapper.get('a.brand').attributes('aria-label')).toBeUndefined()
  })

  it('has no aria-live region in the brand', async () => {
    const wrapper = await mountNavigation()

    expect(wrapper.findAll('a.brand [aria-live]')).toHaveLength(0)
  })

  it('links the brand to the home route', async () => {
    const wrapper = await mountNavigation()

    expect(wrapper.get('a.brand').attributes('href')).toBe('/')
  })
})

describe('AppNavigation — layout reservation (D3)', () => {
  it('puts the ghost and the typed text inside the title', async () => {
    const wrapper = await mountNavigation()

    expect(wrapper.findAll('.brand__title > .brand__ghost, .brand__title > .brand__typed')).toHaveLength(2)
  })

  it('keeps the full text in the ghost when the title is empty', async () => {
    const wrapper = await mountNavigation()

    expect([typed(wrapper), wrapper.get('.brand__ghost').text()]).toEqual(['', TITLE])
  })

  it('keeps the full text in the ghost when fully deleted', async () => {
    const wrapper = await mountAfterIntro()

    await wrapper.get('a.brand').trigger('pointerenter', { pointerType: 'mouse' })
    await advance(19 * DELETE_DELAY_MS)

    expect(wrapper.get('.brand__ghost').text()).toBe(TITLE)
  })

  it('reserves the cursor width in the ghost', async () => {
    const wrapper = await mountNavigation()

    expect(wrapper.findAll('.brand__ghost > .brand__cursor')).toHaveLength(1)
  })

  it('never makes the ghost cursor blink', async () => {
    const wrapper = await mountAfterIntro()

    expect(wrapper.get('.brand__ghost .brand__cursor').classes()).not.toContain('brand__cursor--blinking')
  })

  it('renders no whitespace between the typed characters and the cursor', async () => {
    const wrapper = await mountAfterIntro()

    expect(wrapper.get('.brand__typed').element.textContent).toBe(TITLE)
  })
})

describe('AppNavigation — intro (AC 1, AC 3)', () => {
  it('starts with an empty title', async () => {
    const wrapper = await mountNavigation()

    expect(typed(wrapper)).toBe('')
  })

  it('is idle from mount on, during the lead (D4 lead phase)', async () => {
    const wrapper = await mountNavigation()

    expect(phase(wrapper)).toBe('idle')
  })

  it('is still idle at 799 ms', async () => {
    const wrapper = await mountNavigation()

    await advance(799)

    expect([phase(wrapper), typed(wrapper)]).toEqual(['idle', ''])
  })

  it('switches to typing at 800 ms', async () => {
    const wrapper = await mountNavigation()

    await advance(800)

    expect([phase(wrapper), typed(wrapper)]).toEqual(['typing', ''])
  })

  it('shows "m" after 1000 ms', async () => {
    const wrapper = await mountNavigation()

    await advance(INTRO_FIRST_CHAR_MS)

    expect(typed(wrapper)).toBe('m')
  })

  it('grows the title over time', async () => {
    const wrapper = await mountNavigation()

    await advance(3000)

    expect(typed(wrapper)).toBe('michaelsch')
  })

  it('shows michaelschreiber.net after 5180 ms', async () => {
    const wrapper = await mountNavigation()

    await advance(INTRO_END_MS)

    expect(typed(wrapper)).toBe(TITLE)
  })

  it('returns to idle after the intro', async () => {
    const wrapper = await mountNavigation()

    await advance(INTRO_END_MS)

    expect(phase(wrapper)).toBe('idle')
  })
})

describe('AppNavigation — segments (D2a)', () => {
  const SEGMENT_ORDER = ['brand__first', 'brand__strong', 'brand__tld', 'brand__cursor']

  function childNodeKinds(element: Element): string[] {
    return Array.from(element.childNodes, (node) =>
      node.nodeType === Node.ELEMENT_NODE ? (node as Element).classList[0]! : `#${node.nodeName}`,
    )
  }

  function segmentTexts(wrapper: VueWrapper, container: string): string[] {
    return ['.brand__first', '.brand__strong', '.brand__tld'].map((segment) =>
      wrapper.get(`${container} > ${segment}`).text(),
    )
  }

  it('renders michael, schreiber and .net in their segments after the intro', async () => {
    const wrapper = await mountAfterIntro()

    expect(segmentTexts(wrapper, '.brand__typed')).toEqual(['michael', 'schreiber', '.net'])
  })

  it('renders only the typed part of each segment mid-intro (count 10)', async () => {
    const wrapper = await mountNavigation()

    await advance(2990)

    expect(segmentTexts(wrapper, '.brand__typed')).toEqual(['michael', 'sch', ''])
  })

  it('renders the full segments in the ghost while the title is empty', async () => {
    const wrapper = await mountNavigation()

    expect(segmentTexts(wrapper, '.brand__ghost')).toEqual(['michael', 'schreiber', '.net'])
  })

  it('builds the typed text from first, strong, tld and cursor with no text nodes between', async () => {
    const wrapper = await mountAfterIntro()

    expect(childNodeKinds(wrapper.get('.brand__typed').element)).toEqual(SEGMENT_ORDER)
  })

  it('builds the ghost from first, strong, tld and cursor with no text nodes between', async () => {
    const wrapper = await mountNavigation()

    expect(childNodeKinds(wrapper.get('.brand__ghost').element)).toEqual(SEGMENT_ORDER)
  })

  it('keeps the segment structure while the title is empty', async () => {
    const wrapper = await mountNavigation()

    expect(childNodeKinds(wrapper.get('.brand__typed').element)).toEqual(SEGMENT_ORDER)
  })
})

describe('AppNavigation — underscore cursor (AC 2, AC 3, D6)', () => {
  it('renders exactly one cursor in the typed text', async () => {
    const wrapper = await mountNavigation()

    expect(wrapper.findAll('.brand__typed .brand__cursor')).toHaveLength(1)
  })

  it('renders the cursor as an empty element, not as a character', async () => {
    const wrapper = await mountAfterIntro()

    expect(wrapper.get('.brand__typed .brand__cursor').text()).toBe('')
  })

  it('blinks at the start position during the lead (0–799 ms)', async () => {
    const wrapper = await mountNavigation()

    await advance(799)

    expect([typed(wrapper), wrapper.get('.brand__typed .brand__cursor').classes('brand__cursor--blinking')]).toEqual([
      '',
      true,
    ])
  })

  it('is solid during the 200 ms hesitation before "m" (800–999 ms)', async () => {
    const wrapper = await mountNavigation()

    await advance(INTRO_FIRST_CHAR_MS - 1)

    expect([typed(wrapper), wrapper.get('.brand__typed .brand__cursor').classes('brand__cursor--blinking')]).toEqual([
      '',
      false,
    ])
  })

  it('stays solid while typing', async () => {
    const wrapper = await mountNavigation()

    await advance(2000)

    expect([phase(wrapper), wrapper.get('.brand__typed .brand__cursor').classes('brand__cursor--blinking')]).toEqual([
      'typing',
      false,
    ])
  })

  it('stays after the intro and blinks (AC 3)', async () => {
    const wrapper = await mountAfterIntro()

    expect(wrapper.get('.brand__typed .brand__cursor').classes()).toContain('brand__cursor--blinking')
  })

  it('stays solid while deleting', async () => {
    const wrapper = await mountAfterIntro()

    await wrapper.get('a.brand').trigger('pointerenter', { pointerType: 'mouse' })

    expect([phase(wrapper), wrapper.get('.brand__typed .brand__cursor').classes('brand__cursor--blinking')]).toEqual([
      'deleting',
      false,
    ])
  })

  it('blinks again when the title is fully deleted', async () => {
    const wrapper = await mountAfterIntro()

    await wrapper.get('a.brand').trigger('pointerenter', { pointerType: 'mouse' })
    await advance(19 * DELETE_DELAY_MS)

    expect([phase(wrapper), wrapper.get('.brand__typed .brand__cursor').classes('brand__cursor--blinking')]).toEqual([
      'idle',
      true,
    ])
  })
})

describe('AppNavigation — hover deletes, leave retypes (AC 4, AC 5)', () => {
  it('removes one character at once on mouse enter', async () => {
    const wrapper = await mountAfterIntro()

    await wrapper.get('a.brand').trigger('pointerenter', { pointerType: 'mouse' })

    expect(typed(wrapper)).toBe('michaelschreiber.ne')
  })

  it('removes the next character 60 ms later', async () => {
    const wrapper = await mountAfterIntro()

    await wrapper.get('a.brand').trigger('pointerenter', { pointerType: 'mouse' })
    await advance(DELETE_DELAY_MS)

    expect(typed(wrapper)).toBe('michaelschreiber.n')
  })

  it('empties the title after 19 × 60 ms and goes idle', async () => {
    const wrapper = await mountAfterIntro()

    await wrapper.get('a.brand').trigger('pointerenter', { pointerType: 'mouse' })
    await advance(19 * DELETE_DELAY_MS)

    expect([typed(wrapper), phase(wrapper)]).toEqual(['', 'idle'])
  })

  it('is not yet empty 1 ms before 19 × 60 ms', async () => {
    const wrapper = await mountAfterIntro()

    await wrapper.get('a.brand').trigger('pointerenter', { pointerType: 'mouse' })
    await advance(19 * DELETE_DELAY_MS - 1)

    expect(typed(wrapper)).toBe('m')
  })

  it('keeps the current text on leave mid-delete (no jump back to full)', async () => {
    const wrapper = await mountAfterIntro()
    await wrapper.get('a.brand').trigger('pointerenter', { pointerType: 'mouse' })
    await advance(7 * DELETE_DELAY_MS)

    await wrapper.get('a.brand').trigger('pointerleave', { pointerType: 'mouse' })

    expect([typed(wrapper), phase(wrapper)]).toEqual(['michaelschre', 'typing'])
  })

  it('types onwards from the leave position with the D4 pause (160 ms before "i")', async () => {
    const wrapper = await mountAfterIntro()
    await wrapper.get('a.brand').trigger('pointerenter', { pointerType: 'mouse' })
    await advance(7 * DELETE_DELAY_MS)

    await wrapper.get('a.brand').trigger('pointerleave', { pointerType: 'mouse' })
    await advance(160)

    expect(typed(wrapper)).toBe('michaelschrei')
  })

  it('restores the full title after leaving, idle and blinking', async () => {
    const wrapper = await mountAfterIntro()
    await wrapper.get('a.brand').trigger('pointerenter', { pointerType: 'mouse' })
    await advance(7 * DELETE_DELAY_MS)

    await wrapper.get('a.brand').trigger('pointerleave', { pointerType: 'mouse' })
    await advance(INTRO_END_MS)

    expect([typed(wrapper), phase(wrapper), wrapper.get('.brand__typed .brand__cursor').classes('brand__cursor--blinking')]).toEqual([
      TITLE,
      'idle',
      true,
    ])
  })

  it('retypes from empty after a full delete', async () => {
    const wrapper = await mountAfterIntro()
    await wrapper.get('a.brand').trigger('pointerenter', { pointerType: 'mouse' })
    await advance(19 * DELETE_DELAY_MS)

    await wrapper.get('a.brand').trigger('pointerleave', { pointerType: 'mouse' })
    await advance(200)

    expect(typed(wrapper)).toBe('m')
  })

  it('deletes from the current character when hovered mid-intro', async () => {
    const wrapper = await mountNavigation()
    await advance(3000)

    await wrapper.get('a.brand').trigger('pointerenter', { pointerType: 'mouse' })

    expect([typed(wrapper), phase(wrapper)]).toEqual(['michaelsc', 'deleting'])
  })

  it('reacts to a pen like to a mouse', async () => {
    const wrapper = await mountAfterIntro()

    await wrapper.get('a.brand').trigger('pointerenter', { pointerType: 'pen' })

    expect(typed(wrapper)).toBe('michaelschreiber.ne')
  })

  it('treats a pointer event without pointerType as a mouse', async () => {
    const wrapper = await mountAfterIntro()

    await wrapper.get('a.brand').trigger('pointerenter')

    expect(typed(wrapper)).toBe('michaelschreiber.ne')
  })
})

describe('AppNavigation — touch and keyboard are ignored (D8)', () => {
  it('ignores a touch pointerenter', async () => {
    const wrapper = await mountAfterIntro()

    await wrapper.get('a.brand').trigger('pointerenter', { pointerType: 'touch' })

    expect([typed(wrapper), phase(wrapper)]).toEqual([TITLE, 'idle'])
  })

  it('ignores a touch pointerleave', async () => {
    const wrapper = await mountAfterIntro()
    await wrapper.get('a.brand').trigger('pointerenter', { pointerType: 'mouse' })
    await advance(19 * DELETE_DELAY_MS)

    await wrapper.get('a.brand').trigger('pointerleave', { pointerType: 'touch' })
    await advance(INTRO_END_MS)

    expect(typed(wrapper)).toBe('')
  })

  it('ignores keyboard focus', async () => {
    const wrapper = await mountAfterIntro()

    await wrapper.get('a.brand').trigger('focus')

    expect([typed(wrapper), phase(wrapper)]).toEqual([TITLE, 'idle'])
  })

  it('ignores plain mouseenter (only pointer events act)', async () => {
    const wrapper = await mountAfterIntro()

    await wrapper.get('a.brand').trigger('mouseenter')

    expect(typed(wrapper)).toBe(TITLE)
  })
})

describe('AppNavigation — prefers-reduced-motion (D7)', () => {
  it('shows the full title at once', async () => {
    stubReducedMotion()

    const wrapper = await mountNavigation()

    expect(typed(wrapper)).toBe(TITLE)
  })

  it('schedules no intro timer', async () => {
    stubReducedMotion()

    await mountNavigation()

    expect(vi.getTimerCount()).toBe(0)
  })

  it('keeps the cursor visible (idle) as a steady underscore', async () => {
    stubReducedMotion()

    const wrapper = await mountNavigation()

    expect([phase(wrapper), wrapper.findAll('.brand__typed .brand__cursor')]).toEqual(['idle', [expect.anything()]])
  })

  it('does not delete on hover', async () => {
    stubReducedMotion()
    const wrapper = await mountNavigation()

    await wrapper.get('a.brand').trigger('pointerenter', { pointerType: 'mouse' })
    await advance(INTRO_END_MS)

    expect([typed(wrapper), phase(wrapper)]).toEqual([TITLE, 'idle'])
  })
})

describe('AppNavigation — lifecycle (D4, D5)', () => {
  it('leaves no pending timer when unmounted during the intro', async () => {
    const wrapper = await mountNavigation()
    await advance(2000)

    wrapper.unmount()
    wrappers = []

    expect(vi.getTimerCount()).toBe(0)
  })

  it('leaves no pending timer when unmounted while deleting', async () => {
    const wrapper = await mountAfterIntro()
    await wrapper.get('a.brand').trigger('pointerenter', { pointerType: 'mouse' })

    wrapper.unmount()
    wrappers = []

    expect(vi.getTimerCount()).toBe(0)
  })

  it('shows the full title at once on a remount in the same page load', async () => {
    const first = await mountNavigation()
    await advance(2000)
    first.unmount()
    wrappers = []

    const second = await mountNavigation()

    expect([typed(second), phase(second)]).toEqual([TITLE, 'idle'])
  })

  it('schedules no timer on a remount in the same page load', async () => {
    const first = await mountNavigation()
    first.unmount()
    wrappers = []

    await mountNavigation()

    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('AppNavigation — navigation and menu button', () => {
  it('renders the four German navigation links', async () => {
    const wrapper = await mountNavigation('de')

    expect(wrapper.findAll('nav.navigation a').map((link) => link.text())).toEqual([
      'Home',
      'Projekte',
      'Über mich',
      'Kontakt',
    ])
  })

  it('renders the four English navigation links', async () => {
    const wrapper = await mountNavigation('en')

    expect(wrapper.findAll('nav.navigation a').map((link) => link.text())).toEqual([
      'Home',
      'Projects',
      'About',
      'Contact',
    ])
  })

  it('links the navigation to /, /projects, /about and /contact', async () => {
    const wrapper = await mountNavigation()

    expect(wrapper.findAll('nav.navigation a').map((link) => link.attributes('href'))).toEqual([
      '/',
      '/projects',
      '/about',
      '/contact',
    ])
  })

  it('starts with a closed menu', async () => {
    const wrapper = await mountNavigation()

    expect([wrapper.get('.menu-button').attributes('aria-expanded'), wrapper.get('nav.navigation').classes('is-open')]).toEqual([
      'false',
      false,
    ])
  })

  it('opens the menu on a menu button click', async () => {
    const wrapper = await mountNavigation()

    await wrapper.get('.menu-button').trigger('click')

    expect([
      wrapper.get('.menu-button').attributes('aria-expanded'),
      wrapper.get('nav.navigation').classes('is-open'),
    ]).toEqual(['true', true])
  })

  it('closes the menu on a second menu button click', async () => {
    const wrapper = await mountNavigation()

    await wrapper.get('.menu-button').trigger('click')
    await wrapper.get('.menu-button').trigger('click')

    expect(wrapper.get('nav.navigation').classes('is-open')).toBe(false)
  })

  it('closes the menu when a navigation link is clicked', async () => {
    const wrapper = await mountNavigation()
    await wrapper.get('.menu-button').trigger('click')

    await wrapper.findAll('nav.navigation a')[1]!.trigger('click')

    expect(wrapper.get('nav.navigation').classes('is-open')).toBe(false)
  })

  it('closes the menu when the brand link is clicked', async () => {
    const wrapper = await mountNavigation()
    await wrapper.get('.menu-button').trigger('click')

    await wrapper.get('a.brand').trigger('click')

    expect(wrapper.get('nav.navigation').classes('is-open')).toBe(false)
  })

  it('labels the menu button', async () => {
    const wrapper = await mountNavigation()

    expect(wrapper.get('.menu-button').attributes('aria-label')).toBe('Menü')
  })
})

describe('AppNavigation — cursor and layout CSS (source level, D3, D6, D7)', () => {
  const blinkRuleIndex = styleSource.indexOf('.brand__cursor--blinking {')
  const reducedMotionIndex = styleSource.indexOf('@media (prefers-reduced-motion: reduce)')
  const reducedMotionBlock = styleSource.slice(reducedMotionIndex, styleSource.indexOf('\n}', reducedMotionIndex))

  /** Bodies of all rules whose selector list contains `selector` (grouped selectors included). */
  function rulesFor(selector: string): string {
    return Array.from(styleSource.matchAll(/([^{}]+)\{([^{}]*)\}/g))
      .filter((match) =>
        match[1]!
          .split(',')
          .map((part) => part.trim())
          .includes(selector),
      )
      .map((match) => match[2]!)
      .join('\n')
  }

  /** Bodies of all rules with any `.brand` selector. */
  const brandRules = Array.from(styleSource.matchAll(/([^{}]+)\{([^{}]*)\}/g))
    .filter((match) => /\.brand\b/.test(match[1]!))
    .map((match) => match[2]!)
    .join('\n')

  function ruleBlock(selector: string): string {
    const start = styleSource.indexOf(`${selector} {`)
    return start === -1 ? '' : styleSource.slice(start, styleSource.indexOf('}', start))
  }

  it('draws the cursor as a thin underscore, not a block (AC 2)', () => {
    expect(ruleBlock('.brand__cursor')).toMatch(/width:\s*0\.6em;[\s\S]*height:\s*max\(2px, 0\.1em\);/)
  })

  it('paints the cursor in currentColor on the baseline', () => {
    expect(ruleBlock('.brand__cursor')).toMatch(/background-color:\s*currentColor;[\s\S]*vertical-align:\s*baseline;/)
  })

  it('blinks the cursor with brand-cursor-blink 1s steps(1, end) infinite (AC 3)', () => {
    expect(ruleBlock('.brand__cursor--blinking')).toMatch(/animation:\s*brand-cursor-blink 1s steps\(1, end\) infinite;/)
  })

  it('defines brand-cursor-blink as on at 0% and off at 50%', () => {
    expect(styleSource).toMatch(
      /@keyframes brand-cursor-blink\s*\{\s*0%\s*\{\s*opacity:\s*1;\s*\}\s*50%\s*\{\s*opacity:\s*0;\s*\}\s*\}/,
    )
  })

  it('stops the blink under prefers-reduced-motion', () => {
    expect(reducedMotionBlock).toMatch(/\.brand__cursor--blinking\s*\{\s*animation:\s*none;\s*\}/)
  })

  it('places the reduced-motion rule after the blink rule', () => {
    expect([blinkRuleIndex > -1, reducedMotionIndex > blinkRuleIndex]).toEqual([true, true])
  })

  it('hides the ghost with visibility: hidden', () => {
    expect(ruleBlock('.brand__ghost')).toMatch(/visibility:\s*hidden;/)
  })

  it('stacks ghost and typed text in one grid cell', () => {
    expect(styleSource).toMatch(/\.brand__ghost,\s*\.brand__typed\s*\{\s*grid-area:\s*1 \/ 1;\s*\}/)
  })

  it('lays the title out as an inline grid', () => {
    expect(ruleBlock('.brand__title')).toMatch(/display:\s*inline-grid;/)
  })

  it('hides .brand__sr visually with the clip pattern', () => {
    expect(ruleBlock('.brand__sr')).toMatch(
      /position:\s*absolute;[\s\S]*width:\s*1px;[\s\S]*height:\s*1px;[\s\S]*overflow:\s*hidden;[\s\S]*clip-path:\s*inset\(50%\);/,
    )
  })

  it('sets schreiber bold with --font-weight-bold', () => {
    expect(rulesFor('.brand__strong')).toMatch(/font-weight:\s*var\(--font-weight-bold\);/)
  })

  it('sets michael in normal weight with --font-weight-normal', () => {
    expect(rulesFor('.brand__first')).toMatch(/font-weight:\s*var\(--font-weight-normal\);/)
  })

  it('sets .net in normal weight with --font-weight-normal', () => {
    expect(rulesFor('.brand__tld')).toMatch(/font-weight:\s*var\(--font-weight-normal\);/)
  })

  it('sets no colour on .brand__tld', () => {
    expect(rulesFor('.brand__tld')).not.toMatch(/(^|[\s;])color:/)
  })

  it('does not use --color-primary in any brand rule', () => {
    expect(brandRules).not.toContain('--color-primary')
  })

  it('sets no font weight on .brand__name (no semibold)', () => {
    expect(rulesFor('.brand__name')).not.toMatch(/font-weight|semibold/)
  })

  it('keeps the brand name on one line', () => {
    expect(ruleBlock('.brand__name')).toMatch(/white-space:\s*nowrap;/)
  })
})

describe('AppNavigation — onepage app bar (MS-20)', () => {
  async function mountAppBar(
    options: { activeSection?: SectionId | null; path?: string; locale?: 'de' | 'en' } = {},
  ) {
    const i18n = createI18n<[MessageSchema], 'de' | 'en'>({
      legacy: false,
      locale: options.locale ?? 'de',
      messages: { de, en },
    })
    const page = { render: () => null }
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: page },
        { path: '/projects', name: 'projects', component: page },
        { path: '/about', name: 'about', component: page },
        { path: '/contact', name: 'contact', component: page },
        { path: '/imprint', name: 'imprint', component: page },
      ],
    })
    await router.push(options.path ?? '/')
    const props: { activeSection?: SectionId | null } =
      options.activeSection === undefined ? {} : { activeSection: options.activeSection }
    const wrapper = mount(AppNavigation, {
      props,
      attachTo: document.body,
      global: { plugins: [i18n, router] },
    })
    wrappers.push(wrapper)
    return { wrapper, router }
  }

  function navLink(wrapper: VueWrapper, text: string) {
    return wrapper.findAll('nav.navigation a').find((link) => link.text() === text)!
  }

  function pressKey(key: string) {
    document.dispatchEvent(new KeyboardEvent('keydown', { key }))
  }

  beforeEach(() => {
    vi.useRealTimers()
  })

  it('labels the navigation with the German main navigation label', async () => {
    const { wrapper } = await mountAppBar()

    expect(wrapper.get('nav.navigation').attributes('aria-label')).toBe('Hauptnavigation')
  })

  it('labels the navigation with the English main navigation label', async () => {
    const { wrapper } = await mountAppBar({ locale: 'en' })

    expect(wrapper.get('nav.navigation').attributes('aria-label')).toBe('Main navigation')
  })

  it('labels the menu button in English', async () => {
    const { wrapper } = await mountAppBar({ locale: 'en' })

    expect(wrapper.get('.menu-button').attributes('aria-label')).toBe('Menu')
  })

  it('lets the menu button control the main navigation', async () => {
    const { wrapper } = await mountAppBar()

    expect([
      wrapper.get('.menu-button').attributes('aria-controls'),
      wrapper.get('nav.navigation').attributes('id'),
    ]).toEqual(['main-navigation', 'main-navigation'])
  })

  it('renders the menu button as a non-submitting button', async () => {
    const { wrapper } = await mountAppBar()

    expect(wrapper.get('.menu-button').attributes('type')).toBe('button')
  })

  it('shows the menu icon while the menu is closed', async () => {
    const { wrapper } = await mountAppBar()

    expect([wrapper.findComponent(IconMenu).exists(), wrapper.findComponent(IconClose).exists()]).toEqual([
      true,
      false,
    ])
  })

  it('shows the close icon while the menu is open', async () => {
    const { wrapper } = await mountAppBar()

    await wrapper.get('.menu-button').trigger('click')

    expect([wrapper.findComponent(IconMenu).exists(), wrapper.findComponent(IconClose).exists()]).toEqual([
      false,
      true,
    ])
  })

  it('marks no link as current without an active section', async () => {
    const { wrapper } = await mountAppBar()

    expect(wrapper.findAll('nav.navigation a[aria-current]')).toHaveLength(0)
  })

  it('marks no link as active without an active section', async () => {
    const { wrapper } = await mountAppBar({ activeSection: null })

    expect(wrapper.findAll('nav.navigation a.is-active')).toHaveLength(0)
  })

  it.each([
    ['home', 'Home'],
    ['projects', 'Projekte'],
    ['about', 'Über mich'],
    ['contact', 'Kontakt'],
  ] as const)('marks only the %s link as current', async (activeSection, label) => {
    const { wrapper } = await mountAppBar({ activeSection })

    expect(wrapper.findAll('nav.navigation a[aria-current="true"]').map((link) => link.text())).toEqual([label])
  })

  it('gives the current link the is-active class', async () => {
    const { wrapper } = await mountAppBar({ activeSection: 'about' })

    expect(navLink(wrapper, 'Über mich').classes()).toContain('is-active')
  })

  it('follows a changed active section', async () => {
    const { wrapper } = await mountAppBar({ activeSection: 'home' })

    await wrapper.setProps({ activeSection: 'contact' })

    expect(wrapper.findAll('nav.navigation a[aria-current="true"]').map((link) => link.text())).toEqual(['Kontakt'])
  })

  it('does not derive the active link from the current route', async () => {
    const { wrapper } = await mountAppBar({ path: '/projects' })

    expect(wrapper.findAll('nav.navigation a[aria-current]')).toHaveLength(0)
  })

  it('navigates to the section route when a nav link is clicked', async () => {
    const { wrapper, router } = await mountAppBar()

    await navLink(wrapper, 'Über mich').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('about')
  })

  it('prevents the default link navigation on a plain click', async () => {
    const { wrapper } = await mountAppBar()
    const event = new MouseEvent('click', { button: 0, cancelable: true, bubbles: true })

    navLink(wrapper, 'Kontakt').element.dispatchEvent(event)
    await flushPromises()

    expect(event.defaultPrevented).toBe(true)
  })

  it('leaves a ctrl-click on a nav link to the browser', async () => {
    const { wrapper, router } = await mountAppBar()
    // Stop jsdom from following the href once the component has let the click through.
    document.addEventListener('click', (event) => event.preventDefault(), { once: true })

    await navLink(wrapper, 'Kontakt').trigger('click', { ctrlKey: true })
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('home')
  })

  it('navigates from a legal page to a section', async () => {
    const { wrapper, router } = await mountAppBar({ path: '/imprint' })

    await navLink(wrapper, 'Projekte').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/projects')
  })

  it('links the brand to the home section', async () => {
    const { wrapper } = await mountAppBar()

    expect(wrapper.get('a.brand').attributes('href')).toBe('/')
  })

  it('navigates home when the brand is clicked', async () => {
    const { wrapper, router } = await mountAppBar({ path: '/about' })

    await wrapper.get('a.brand').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('home')
  })

  it('scrolls to the top when the brand is clicked on home', async () => {
    const { wrapper } = await mountAppBar()

    await wrapper.get('a.brand').trigger('click')
    await flushPromises()

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })

  it('closes the open menu on Escape', async () => {
    const { wrapper } = await mountAppBar()
    await wrapper.get('.menu-button').trigger('click')

    pressKey('Escape')
    await nextTick()

    expect(wrapper.get('.menu-button').attributes('aria-expanded')).toBe('false')
  })

  it('returns the focus to the menu button on Escape', async () => {
    const { wrapper } = await mountAppBar()
    await wrapper.get('.menu-button').trigger('click')
    ;(navLink(wrapper, 'Projekte').element as HTMLElement).focus()

    pressKey('Escape')

    expect(document.activeElement).toBe(wrapper.get('.menu-button').element)
  })

  it('does not move the focus on Escape while the menu is closed', async () => {
    const { wrapper } = await mountAppBar()
    const link = navLink(wrapper, 'Projekte').element as HTMLElement
    link.focus()

    pressKey('Escape')

    expect(document.activeElement).toBe(link)
  })

  it('keeps the menu open on other keys', async () => {
    const { wrapper } = await mountAppBar()
    await wrapper.get('.menu-button').trigger('click')

    pressKey('Enter')
    await nextTick()

    expect(wrapper.get('nav.navigation').classes('is-open')).toBe(true)
  })

  it('closes the open menu when the route changes', async () => {
    const { wrapper, router } = await mountAppBar()
    await wrapper.get('.menu-button').trigger('click')

    await router.push('/contact')
    await nextTick()

    expect(wrapper.get('nav.navigation').classes('is-open')).toBe(false)
  })

  it('closes the open menu when a link to the current section is clicked', async () => {
    const { wrapper } = await mountAppBar({ path: '/projects' })
    await wrapper.get('.menu-button').trigger('click')

    await navLink(wrapper, 'Projekte').trigger('click')

    expect(wrapper.get('nav.navigation').classes('is-open')).toBe(false)
  })

  it('removes its keydown listener on unmount', async () => {
    const addSpy = vi.spyOn(document, 'addEventListener')
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    const { wrapper } = await mountAppBar()
    const listener = addSpy.mock.calls.find(([type]) => type === 'keydown')?.[1]

    wrapper.unmount()
    wrappers = wrappers.filter((item) => item !== wrapper)

    expect(removeSpy).toHaveBeenCalledWith('keydown', listener)
  })
})

describe('AppNavigation — mobile menu panel CSS (source level, MS-20 D10)', () => {
  const mobileStart = styleSource.indexOf('@media (max-width: 768px)')
  const mobileBlock = styleSource.slice(mobileStart, styleSource.indexOf('\n}', mobileStart))
  const panelRule = /\.navigation\s*\{([^}]*)\}/.exec(mobileBlock)?.[1] ?? ''

  it('draws the open panel on an opaque surface background', () => {
    expect(panelRule).toMatch(/background:\s*var\(--color-surface\);/)
  })

  it('does not blur the panel', () => {
    expect(panelRule).not.toMatch(/backdrop-filter/)
  })

  it('overlays the page below the bar instead of pushing it', () => {
    expect(panelRule).toMatch(/position:\s*absolute;[\s\S]*top:\s*100%;/)
  })

  it('separates the panel with outline-variant borders on top and bottom', () => {
    expect(panelRule).toMatch(
      /border-top:\s*1px solid var\(--color-outline-variant\);[\s\S]*border-bottom:\s*1px solid var\(--color-outline-variant\);/,
    )
  })

  it('shows the panel only while the menu is open', () => {
    expect([panelRule, mobileBlock]).toEqual([
      expect.stringMatching(/display:\s*none;/),
      expect.stringMatching(/\.navigation\.is-open\s*\{\s*display:\s*flex;\s*\}/),
    ])
  })
})

describe('AppNavigation — brand mark tile and container CSS (source level, MS-20 R2, R4)', () => {
  const mobileStart = styleSource.indexOf('@media (max-width: 768px)')
  const mobileBlock = styleSource.slice(mobileStart, styleSource.indexOf('\n}', mobileStart))
  const desktopStyles = styleSource.slice(0, mobileStart)

  /** Body of the first `selector {` rule in `source`. */
  function ruleIn(source: string, selector: string): string {
    return new RegExp(`${selector.replace(/[.]/g, '\\.')}\\s*\\{([^}]*)\\}`).exec(source)?.[1] ?? ''
  }

  it('fills the brand mark tile with the brand mark gradient', () => {
    expect(ruleIn(desktopStyles, '.brand__mark')).toMatch(/background:\s*var\(--gradient-brand-mark\);/)
  })

  it('sizes the brand mark tile 48×48px with 8px padding on desktop', () => {
    expect(ruleIn(desktopStyles, '.brand__mark')).toMatch(/width:\s*48px;[\s\S]*height:\s*48px;[\s\S]*padding:\s*8px;/)
  })

  it('rounds the brand mark tile with --radius-md', () => {
    expect(ruleIn(desktopStyles, '.brand__mark')).toMatch(/border-radius:\s*var\(--radius-md\);/)
  })

  it('sizes the brand mark tile 40×40px with 6px padding on mobile', () => {
    expect(ruleIn(mobileBlock, '.brand__mark')).toMatch(/width:\s*40px;[\s\S]*height:\s*40px;[\s\S]*padding:\s*6px;/)
  })

  it('fits the logo image into the tile', () => {
    expect(ruleIn(desktopStyles, '.brand__mark-image')).toMatch(
      /width:\s*100%;[\s\S]*height:\s*100%;[\s\S]*object-fit:\s*contain;/,
    )
  })

  it('lets the bar row include the page padding in its max width (R4)', () => {
    expect(ruleIn(desktopStyles, '.nav-container')).toMatch(
      /max-width:\s*calc\(var\(--container-max-width\) \+ 2 \* var\(--page-padding-inline\)\);/,
    )
  })

  it('pads the bar row with the page padding token (R4)', () => {
    expect(ruleIn(desktopStyles, '.nav-container')).toMatch(/padding:\s*0 var\(--page-padding-inline\);/)
  })

  it('keeps the token on the left and 16px on the right on mobile (R4)', () => {
    expect(ruleIn(mobileBlock, '.nav-container')).toMatch(/padding:\s*0 16px 0 var\(--page-padding-inline\);/)
  })
})
