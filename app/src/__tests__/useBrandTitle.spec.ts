/**
 * Testing concept — MS-18 Animated Header Title (useBrandTitle)
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-18
 * Architecture: docs/architecture/MS-18-animated-header-title.md (D2a, D4, D5, D7, D8).
 * Test concept: docs/architecture/MS-18-tests.md.
 *
 * Unit level: the brand wrapper is mounted in a minimal harness component
 * (it needs `onMounted`) with `vi.useFakeTimers()`; `resetBrandTitleIntro()`
 * runs before each test so the first mount plays the intro. Covered: brand
 * constants (title, 20 delays from the D4 table, sum 4380, word pauses, the
 * three gap-free `BRAND_SEGMENTS`), the intro timing (`idle` during the
 * 800 ms lead, `typing` from 800 ms, `m` at 1000 ms, full at 5180 ms, then
 * idle), once per page load (second instance full at once, no timers),
 * reduced motion via a stubbed `window.matchMedia`, the `first`/`strong`/`tld`
 * split at counts 5, 7, 10, 16, 18 and 20 (D2a), the delete-on-hover and
 * retype-on-leave wiring, the touch filter (`mouse`, `pen` and a missing
 * `pointerType` act), and timer cleanup on unmount.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import {
  BRAND_DELETE_DELAY_MS,
  BRAND_INTRO_DELAY_MS,
  BRAND_SEGMENTS,
  BRAND_TITLE,
  BRAND_TYPE_DELAYS_MS,
  resetBrandTitleIntro,
  useBrandTitle,
} from '@/composables/useBrandTitle'
import type { BrandTitle } from '@/composables/useBrandTitle'

/** D4 table, written out independently of the implementation constant. */
const D4_DELAYS = [200, 170, 210, 190, 230, 180, 200, 450, 190, 170, 220, 180, 160, 240, 190, 200, 400, 220, 180, 200]

/** Intro times (800 ms lead + cumulative D4 pauses) at which count k is first reached. */
const INTRO_COUNT_5_MS = 1800
const INTRO_COUNT_7_MS = 2180
const INTRO_COUNT_10_MS = 2990
const INTRO_COUNT_16_MS = 4180
const INTRO_COUNT_18_MS = 4800
const INTRO_END_MS = 5180

const MOUSE = { pointerType: 'mouse' } as PointerEvent
const TOUCH = { pointerType: 'touch' } as PointerEvent

let wrappers: VueWrapper[] = []

function mountBrandTitle(): BrandTitle {
  let brand: BrandTitle | undefined
  const Harness = defineComponent({
    setup() {
      brand = useBrandTitle()
      return () => h('span')
    },
  })
  wrappers.push(mount(Harness))
  return brand!
}

/** Visible text, joined from the three segment refs (D2a). */
function text(brand: BrandTitle): string {
  return `${brand.first.value}${brand.strong.value}${brand.tld.value}`
}

function segments(brand: BrandTitle): string[] {
  return [brand.first.value, brand.strong.value, brand.tld.value]
}

function stubReducedMotion(matches: boolean) {
  const matchMedia = vi.fn((query: string) => ({ matches, media: query }) as unknown as MediaQueryList)
  vi.stubGlobal('matchMedia', matchMedia)
  return matchMedia
}

beforeEach(() => {
  vi.useFakeTimers()
  resetBrandTitleIntro()
})

afterEach(() => {
  wrappers.forEach((wrapper) => wrapper.unmount())
  wrappers = []
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('useBrandTitle — constants (D4)', () => {
  it('spells michaelschreiber.net', () => {
    expect(BRAND_TITLE).toBe('michaelschreiber.net')
  })

  it('has one typing pause per character', () => {
    expect(BRAND_TYPE_DELAYS_MS).toHaveLength(BRAND_TITLE.length)
  })

  it('uses the MS-17 D4 typing rhythm', () => {
    expect(BRAND_TYPE_DELAYS_MS).toEqual(D4_DELAYS)
  })

  it('types the whole title in 4380 ms', () => {
    expect(BRAND_TYPE_DELAYS_MS.reduce((sum, delay) => sum + delay, 0)).toBe(4380)
  })

  it('pauses longer before "s" and "." than before any other character', () => {
    const wordPauses = [BRAND_TYPE_DELAYS_MS[7]!, BRAND_TYPE_DELAYS_MS[16]!]
    const letterPauses = BRAND_TYPE_DELAYS_MS.filter((_, index) => index !== 7 && index !== 16)

    expect(Math.min(...wordPauses)).toBeGreaterThan(Math.max(...letterPauses))
  })

  it('deletes one character per 60 ms', () => {
    expect(BRAND_DELETE_DELAY_MS).toBe(60)
  })

  it('waits 800 ms before the intro starts', () => {
    expect(BRAND_INTRO_DELAY_MS).toBe(800)
  })
})

describe('useBrandTitle — intro (AC 1, AC 3, D4, D5)', () => {
  it('is empty at mount', () => {
    const brand = mountBrandTitle()

    expect(text(brand)).toBe('')
  })

  // D4 lead phase: type(800) spends the lead in 'idle' (cursor blinking at the start
  // position) and switches to 'typing' at 800 ms (MS-18-tests.md, Finding 1, resolved).
  it('is idle at mount (cursor blinks during the lead)', () => {
    const brand = mountBrandTitle()

    expect(brand.phase.value).toBe('idle')
  })

  it('is still idle at 799 ms', () => {
    const brand = mountBrandTitle()

    vi.advanceTimersByTime(BRAND_INTRO_DELAY_MS - 1)

    expect(brand.phase.value).toBe('idle')
  })

  it('switches to typing at 800 ms, still empty', () => {
    const brand = mountBrandTitle()

    vi.advanceTimersByTime(BRAND_INTRO_DELAY_MS)

    expect([brand.phase.value, text(brand)]).toEqual(['typing', ''])
  })

  it('keeps exactly one pending timer during the lead', () => {
    mountBrandTitle()

    expect(vi.getTimerCount()).toBe(1)
  })

  it('is still empty 1 ms before the first character', () => {
    const brand = mountBrandTitle()

    vi.advanceTimersByTime(999)

    expect(text(brand)).toBe('')
  })

  it('shows "m" at 1000 ms', () => {
    const brand = mountBrandTitle()

    vi.advanceTimersByTime(1000)

    expect(text(brand)).toBe('m')
  })

  it('misses only the last character 1 ms before 5180 ms', () => {
    const brand = mountBrandTitle()

    vi.advanceTimersByTime(INTRO_END_MS - 1)

    expect(text(brand)).toBe('michaelschreiber.ne')
  })

  it('shows the full title at 5180 ms', () => {
    const brand = mountBrandTitle()

    vi.advanceTimersByTime(INTRO_END_MS)

    expect(text(brand)).toBe('michaelschreiber.net')
  })

  it('goes idle after the intro (AC 3)', () => {
    const brand = mountBrandTitle()

    vi.advanceTimersByTime(INTRO_END_MS)

    expect(brand.phase.value).toBe('idle')
  })

  it('leaves no timer after the intro', () => {
    mountBrandTitle()

    vi.advanceTimersByTime(INTRO_END_MS)

    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('useBrandTitle — once per page load (D5)', () => {
  it('shows the full title at once in a second instance', () => {
    mountBrandTitle()
    const second = mountBrandTitle()

    expect(text(second)).toBe('michaelschreiber.net')
  })

  it('is idle in a second instance', () => {
    mountBrandTitle()
    const second = mountBrandTitle()

    expect(second.phase.value).toBe('idle')
  })

  it('schedules no timer for a second instance', () => {
    const first = mountBrandTitle()
    first.onPointerEnter(MOUSE)
    vi.runAllTimers()

    mountBrandTitle()

    expect(vi.getTimerCount()).toBe(0)
  })

  it('does not replay the intro after the first instance was unmounted mid-intro', () => {
    mountBrandTitle()
    vi.advanceTimersByTime(2000)
    wrappers[0]!.unmount()
    wrappers = []

    const second = mountBrandTitle()

    expect(text(second)).toBe('michaelschreiber.net')
  })

  it('plays the intro again after resetBrandTitleIntro()', () => {
    mountBrandTitle()
    resetBrandTitleIntro()

    const second = mountBrandTitle()

    expect(text(second)).toBe('')
  })
})

describe('useBrandTitle — segments (D2a)', () => {
  it('covers 0–20 with first, strong, tld and no gaps', () => {
    expect([BRAND_SEGMENTS.first, BRAND_SEGMENTS.strong, BRAND_SEGMENTS.tld]).toEqual([
      [0, 7],
      [7, 16],
      [16, BRAND_TITLE.length],
    ])
  })

  it('slices the title into michael, schreiber and .net', () => {
    expect([
      BRAND_TITLE.slice(...BRAND_SEGMENTS.first),
      BRAND_TITLE.slice(...BRAND_SEGMENTS.strong),
      BRAND_TITLE.slice(...BRAND_SEGMENTS.tld),
    ]).toEqual(['michael', 'schreiber', '.net'])
  })

  it('splits count 5 into "micha" / "" / ""', () => {
    const brand = mountBrandTitle()

    vi.advanceTimersByTime(INTRO_COUNT_5_MS)

    expect(segments(brand)).toEqual(['micha', '', ''])
  })

  it('splits count 7 into "michael" / "" / ""', () => {
    const brand = mountBrandTitle()

    vi.advanceTimersByTime(INTRO_COUNT_7_MS)

    expect(segments(brand)).toEqual(['michael', '', ''])
  })

  it('splits count 10 into "michael" / "sch" / ""', () => {
    const brand = mountBrandTitle()

    vi.advanceTimersByTime(INTRO_COUNT_10_MS)

    expect(segments(brand)).toEqual(['michael', 'sch', ''])
  })

  it('splits count 16 into "michael" / "schreiber" / ""', () => {
    const brand = mountBrandTitle()

    vi.advanceTimersByTime(INTRO_COUNT_16_MS)

    expect(segments(brand)).toEqual(['michael', 'schreiber', ''])
  })

  it('splits count 18 into "michael" / "schreiber" / ".n"', () => {
    const brand = mountBrandTitle()

    vi.advanceTimersByTime(INTRO_COUNT_18_MS)

    expect(segments(brand)).toEqual(['michael', 'schreiber', '.n'])
  })

  it('splits count 20 into "michael" / "schreiber" / ".net"', () => {
    const brand = mountBrandTitle()

    vi.advanceTimersByTime(INTRO_END_MS)

    expect(segments(brand)).toEqual(['michael', 'schreiber', '.net'])
  })

  it('splits count 0 into three empty segments', () => {
    const brand = mountBrandTitle()

    expect(segments(brand)).toEqual(['', '', ''])
  })
})

describe('useBrandTitle — hover deletes, leave retypes (AC 4, AC 5)', () => {
  it('removes one character at once on pointer enter', () => {
    const brand = mountBrandTitle()
    vi.advanceTimersByTime(INTRO_END_MS)

    brand.onPointerEnter(MOUSE)

    expect(text(brand)).toBe('michaelschreiber.ne')
  })

  it('is deleting after pointer enter', () => {
    const brand = mountBrandTitle()
    vi.advanceTimersByTime(INTRO_END_MS)

    brand.onPointerEnter(MOUSE)

    expect(brand.phase.value).toBe('deleting')
  })

  it('removes the rest at 60 ms per character, empty and idle after 19 × 60 ms', () => {
    const brand = mountBrandTitle()
    vi.advanceTimersByTime(INTRO_END_MS)

    brand.onPointerEnter(MOUSE)
    vi.advanceTimersByTime(19 * 60)

    expect([text(brand), brand.phase.value]).toEqual(['', 'idle'])
  })

  it('retypes from the current character on pointer leave', () => {
    const brand = mountBrandTitle()
    vi.advanceTimersByTime(INTRO_END_MS)
    brand.onPointerEnter(MOUSE)
    vi.advanceTimersByTime(7 * 60)

    brand.onPointerLeave(MOUSE)

    expect([text(brand), brand.phase.value]).toEqual(['michaelschre', 'typing'])
  })

  it('types the next character after its D4 pause, without the intro lead', () => {
    const brand = mountBrandTitle()
    vi.advanceTimersByTime(INTRO_END_MS)
    brand.onPointerEnter(MOUSE)
    vi.advanceTimersByTime(7 * 60)

    brand.onPointerLeave(MOUSE)
    vi.advanceTimersByTime(BRAND_TYPE_DELAYS_MS[12]! - 1)
    const before = text(brand)
    vi.advanceTimersByTime(1)

    expect([before, text(brand)]).toEqual(['michaelschre', 'michaelschrei'])
  })

  it('restores the full title after leaving', () => {
    const brand = mountBrandTitle()
    vi.advanceTimersByTime(INTRO_END_MS)
    brand.onPointerEnter(MOUSE)
    vi.advanceTimersByTime(7 * 60)

    brand.onPointerLeave(MOUSE)
    vi.runAllTimers()

    expect([text(brand), brand.phase.value]).toEqual(['michaelschreiber.net', 'idle'])
  })

  it('deletes from the current character when hovered mid-intro', () => {
    const brand = mountBrandTitle()
    vi.advanceTimersByTime(INTRO_COUNT_5_MS)

    brand.onPointerEnter(MOUSE)

    expect(text(brand)).toBe('mich')
  })

  it('reacts to a pen like to a mouse', () => {
    const brand = mountBrandTitle()
    vi.advanceTimersByTime(INTRO_END_MS)

    brand.onPointerEnter({ pointerType: 'pen' } as PointerEvent)

    expect(text(brand)).toBe('michaelschreiber.ne')
  })

  it('treats a missing pointerType as a mouse', () => {
    const brand = mountBrandTitle()
    vi.advanceTimersByTime(INTRO_END_MS)

    brand.onPointerEnter({} as PointerEvent)

    expect(text(brand)).toBe('michaelschreiber.ne')
  })

  it('treats an empty pointerType as a mouse', () => {
    const brand = mountBrandTitle()
    vi.advanceTimersByTime(INTRO_END_MS)

    brand.onPointerEnter({ pointerType: '' } as PointerEvent)

    expect(text(brand)).toBe('michaelschreiber.ne')
  })
})

describe('useBrandTitle — touch is ignored (D8)', () => {
  it('ignores a touch pointer enter', () => {
    const brand = mountBrandTitle()
    vi.advanceTimersByTime(INTRO_END_MS)

    brand.onPointerEnter(TOUCH)

    expect([text(brand), brand.phase.value, vi.getTimerCount()]).toEqual(['michaelschreiber.net', 'idle', 0])
  })

  it('ignores a touch pointer leave while deleting', () => {
    const brand = mountBrandTitle()
    vi.advanceTimersByTime(INTRO_END_MS)
    brand.onPointerEnter(MOUSE)

    brand.onPointerLeave(TOUCH)

    expect(brand.phase.value).toBe('deleting')
  })
})

describe('useBrandTitle — prefers-reduced-motion (D7)', () => {
  it('queries prefers-reduced-motion: reduce', () => {
    const matchMedia = stubReducedMotion(false)

    mountBrandTitle()

    expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
  })

  it('shows the full title at once', () => {
    stubReducedMotion(true)

    const brand = mountBrandTitle()

    expect(text(brand)).toBe('michaelschreiber.net')
  })

  it('schedules no intro timer', () => {
    stubReducedMotion(true)

    mountBrandTitle()

    expect(vi.getTimerCount()).toBe(0)
  })

  it('ignores a mouse pointer enter', () => {
    stubReducedMotion(true)
    const brand = mountBrandTitle()

    brand.onPointerEnter(MOUSE)

    expect([text(brand), brand.phase.value, vi.getTimerCount()]).toEqual(['michaelschreiber.net', 'idle', 0])
  })

  it('ignores a mouse pointer leave', () => {
    stubReducedMotion(true)
    const brand = mountBrandTitle()

    brand.onPointerLeave(MOUSE)

    expect([text(brand), brand.phase.value, vi.getTimerCount()]).toEqual(['michaelschreiber.net', 'idle', 0])
  })

  it('plays the intro when matchMedia reports no preference', () => {
    stubReducedMotion(false)

    const brand = mountBrandTitle()

    expect(text(brand)).toBe('')
  })
})

describe('useBrandTitle — cleanup (D4)', () => {
  it('leaves no pending timer when unmounted during the intro', () => {
    mountBrandTitle()
    vi.advanceTimersByTime(2000)

    wrappers[0]!.unmount()
    wrappers = []

    expect(vi.getTimerCount()).toBe(0)
  })

  it('leaves no pending timer when unmounted while deleting', () => {
    const brand = mountBrandTitle()
    vi.advanceTimersByTime(INTRO_END_MS)
    brand.onPointerEnter(MOUSE)

    wrappers[0]!.unmount()
    wrappers = []

    expect(vi.getTimerCount()).toBe(0)
  })
})
