/**
 * Testing concept — MS-17 Animated SVG Logo Instead of GIF (AnimatedLogo)
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-17
 * Architecture: docs/architecture/MS-17-animated-svg-logo.md (incl. sections
 * "User Review Round 1" — travelling circles, blinking block cursor — and
 * "User Review Round 2" — hole mask, snapped ring centres, typing rhythm).
 * Design input: docs/design/MS-17/README.md, logo-outlined.svg,
 * ring-geometry.py. Test concept: docs/architecture/MS-17-tests.md.
 *
 * - Component level (Vue Test Utils + real de/en locales): one root `svg`
 *   with the 512 viewBox, `role="img"` and the localized `landing.logoAlt`
 *   label (AC 5). The wordmark is 20 glyph paths spelling
 *   `michaelschreiber.net` with the design weights and no `<text>`/`<image>`
 *   (AC 1). Strokes, the wordmark fill and the cursor use `currentColor`;
 *   only the mask uses literal black/white (D6).
 * - Rings (D2, D3, D3a): 7 root-level dots and 3 heads, 10 rings outside the
 *   mask, with the round 2 centres and the timing of their trace.
 * - Hole mask (D3b): `mask#animated-logo-holes` with a white full-size rect
 *   and one black hole per ring, mirroring the ring's centre, radius and
 *   timing; the masked group holds the 9 traces and nothing else.
 * - Joint geometry (D3b): each moving dot centre lies on the axis of its
 *   trace's last segment, D3 on the P4 and P7 axes; each trace end / start is
 *   within [5.976, 13.69] of its ring centre (nothing in the hole, no notch).
 * - Geometry against the design (`logo-outlined.svg` via DOMParser): traces,
 *   glyph outlines, wordmark transforms identical; ring radius and stroke
 *   width are the scaled design values; heads on their trace end points.
 * - Motion paths and CSS (raw SFC via `?raw`, jsdom applies no scoped CSS):
 *   `logo-move-*` stops on the trace vertices, length-proportional, ending at
 *   `translate(0px, 0px)`; holes share their ring's animation; typing
 *   rhythm per D4 and the cursor keyframes in sync with it (D4a); the
 *   `prefers-reduced-motion` block sets `animation: none` for all animated
 *   classes and is the last rule block (D5). Regression guard: glyph, dot and
 *   dot-hole reveals use `steps(1, start)` (with `steps(1, end)` Chrome left
 *   m/i/c invisible). The cursor intentionally uses `steps(1, end)` with fill
 *   `none` on a base `opacity: 0`.
 * - Rendering (holes really empty, joints, playback) stays a browser check.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import AnimatedLogo from '@/components/AnimatedLogo.vue'
import animatedLogoSource from '@/components/AnimatedLogo.vue?raw'
import de from '@/i18n/locales/de'
import en from '@/i18n/locales/en'
import type { MessageSchema } from '@/i18n/types'

// jsdom gives import.meta.url an http scheme, so resolve from the module directory.
const designSvgPath = resolve(__dirname, '../../../docs/design/MS-17/logo-outlined.svg')

type Point = [number, number]

const RING_RADIUS = 10.144
const HOLE_INNER_EDGE = 5.976
const NOTCH_LIMIT = 13.69

const TRACES = [
  { name: 'P1', d: 'M793.161,888.192L663.676,1017.676L555,909', delay: '1.55s', duration: '1.75s' },
  { name: 'P2', d: 'M791.529,950.641L661.085,1079.085L580,998L580,1152', delay: '1.20s', duration: '2.35s' },
  { name: 'P3', d: 'M794,1118L937,1118L995,1067L918,1004', delay: '0.35s', duration: '1.65s' },
  { name: 'P4', d: 'M759,1166L954,1166L997,1125L996,1068', delay: '0.10s', duration: '1.38s' },
  { name: 'P5', d: 'M961,1097L843,997L899,947L985,946', delay: '1.30s', duration: '1.65s' },
  { name: 'P6', d: 'M841,995L842,942L887,899L951.719,899', delay: '2.10s', duration: '0.95s' },
  { name: 'P7', d: 'M755.281,988.719L791.999,952.001', delay: '0.10s', duration: '0.25s' },
  { name: 'P8', d: 'M795,1116L795,889', delay: '0.35s', duration: '1.20s' },
  { name: 'P9', d: 'M746,996L746,1072', delay: '1.55s', duration: '0.40s' },
].map((trace, index) => ({ ...trace, index }))

/** Dots in design order D1–D7 (round 2 snapped centres) with the trace they ride. */
const DOTS = [
  { modifier: 'd1', cx: '109.298', cy: '326.917', trace: 1 },
  { modifier: 'd2', cx: '82.766', cy: '120.126', trace: 0 },
  { modifier: 'd3', cx: '237.275', cy: '327.697', trace: null },
  { modifier: 'd4', cx: '238.835', cy: '264.489', trace: 8 },
  { modifier: 'd5', cx: '363.620', cy: '193.563', trace: 2 },
  { modifier: 'd6', cx: '436.260', cy: '155.895', trace: 4 },
  { modifier: 'd7', cx: '409.730', cy: '119.346', trace: 5 },
].map((dot, index) => ({ ...dot, index }))

const MOVING_DOTS = DOTS.filter((dot) => dot.trace !== null).map((dot) => ({
  ...dot,
  trace: dot.trace as number,
  traceName: TRACES[dot.trace as number]!.name,
}))

/** Heads; since round 3 the P4 head rests on D5's centre (D3c). */
const HEADS = [
  { modifier: 'p4', cx: '363.620', cy: '193.563', trace: 3 },
  { modifier: 'p7', cx: '274.730', cy: '290.242', trace: 6 },
  { modifier: 'p8', cx: '275.511', cy: '111.542', trace: 7 },
].map((head) => ({ ...head, traceName: TRACES[head.trace]!.name }))

/** Heads that ride their own trace only and end on its end point (P4 merges into D5 instead). */
const TRAIL_HEADS = HEADS.filter((head) => head.modifier !== 'p4')

/** Circles whose keyframes follow exactly one trace (all moving circles except the P4 head). */
const MOVING_CIRCLES = [
  ...MOVING_DOTS.map((dot) => ({ ...dot, selector: `.animated-logo__dot--${dot.modifier}` })),
  ...TRAIL_HEADS.map((head) => ({ ...head, selector: `.animated-logo__head--${head.modifier}` })),
]

const ALL_MOVING_CIRCLES = [
  ...MOVING_CIRCLES,
  { ...HEADS[0]!, selector: '.animated-logo__head--p4' },
]

/** D3c: the P4 head merges into D5 at P3's corner J. */
const P3_INDEX = 2
const P4_INDEX = 3
const P4_HEAD_TIMING = '0.10s|1.90s'
const MERGE_SECONDS = 1.487

const RINGS = [
  ...DOTS.map((dot) => ({ modifier: dot.modifier, selector: `.animated-logo__dot--${dot.modifier}` })),
  ...HEADS.map((head) => ({ modifier: head.modifier, selector: `.animated-logo__head--${head.modifier}` })),
]

/** D3 starts both P4 and P7. */
const ROOT_BRANCHES = [
  { traceName: 'P4', trace: 3 },
  { traceName: 'P7', trace: 6 },
]

/** D4 typing rhythm. */
const GLYPH_DELAYS = [
  '5.00s', '5.17s', '5.38s', '5.57s', '5.80s', '5.98s', '6.18s',
  '6.63s', '6.82s', '6.99s', '7.21s', '7.39s', '7.55s', '7.79s', '7.98s', '8.18s',
  '8.58s', '8.80s', '8.98s', '9.18s',
]

const CURSOR_OFFSETS = [
  42.86, 54.66, 84.6, 113.19, 142.86, 172.03, 181.98, 212.34, 240.99, 270.29, 291.98, 318.61,
  330.67, 362.99, 391.69, 411.92, 420.57, 451.52, 481.27, 499.23,
]

const CURSOR_APPEARS_SECONDS = 3.8
const CURSOR_MOVE_START_SECONDS = 5
const CURSOR_BLINK_TIMES = [3.8, 4.3, 4.8, 9.68, 10.18, 10.68]
const ANIMATION_END_SECONDS = 10.68

function mountLogo(locale: 'de' | 'en' = 'de') {
  const i18n = createI18n<[MessageSchema], 'de' | 'en'>({
    legacy: false,
    locale,
    messages: { de, en },
  })
  return mount(AnimatedLogo, { global: { plugins: [i18n] } })
}

function last<T>(items: T[]): T {
  return items[items.length - 1]!
}

function seconds(value: string): number {
  return Number.parseFloat(value)
}

function customProperty(element: Element, name: string): string {
  return (element as SVGElement).style.getPropertyValue(name).trim()
}

function timing(element: Element): string {
  return `${customProperty(element, '--logo-delay')}|${customProperty(element, '--logo-duration')}`
}

function reversePolyline(d: string): string {
  const points = d.replace(/^M/, '').split('L').reverse()
  return `M${points.join('L')}`
}

function parseMatrix(transform: string | null | undefined): number[] {
  return (transform ?? '').replace(/^matrix\(|\)$/g, '').split(',').map(Number)
}

function applyMatrix(matrix: number[], [x, y]: Point): Point {
  const [a = 1, b = 0, c = 0, d = 1, e = 0, f = 0] = matrix
  return [a * x + c * y + e, b * x + d * y + f]
}

/** Trace vertices in viewBox units (the trace's group matrix applied). */
function traceVertices(d: string, transform: string | null | undefined): Point[] {
  const matrix = parseMatrix(transform)
  return d
    .replace(/^M/, '')
    .split('L')
    .map((pair) => applyMatrix(matrix, pair.split(',').map(Number) as Point))
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1])
}

/** Distance of point p from the infinite line through a and b. */
function distanceFromLine(p: Point, a: Point, b: Point): number {
  return Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / distance(a, b)
}

function cumulativePercentages(points: Point[]): number[] {
  const lengths = points.map((point, index) => (index === 0 ? 0 : distance(point, points[index - 1]!)))
  const cumulative = lengths.map((_, index) => lengths.slice(0, index + 1).reduce((sum, l) => sum + l, 0))
  const total = last(cumulative)
  return cumulative.map((length) => (100 * length) / total)
}

function parentTransforms(elements: Element[]): (string | null)[] {
  return elements.map((element) => element.parentElement?.getAttribute('transform') ?? null)
}

function centre(element: Element): Point {
  return [Number(element.getAttribute('cx')), Number(element.getAttribute('cy'))]
}

// --- Raw style source helpers -------------------------------------------------

const styleSource = animatedLogoSource.slice(animatedLogoSource.indexOf('<style'))
const reducedMotionStart = styleSource.indexOf('@media (prefers-reduced-motion: reduce)')
const reducedMotionEnd = reducedMotionStart === -1 ? -1 : styleSource.indexOf('\n}', reducedMotionStart) + 2
const reducedMotionBlock = reducedMotionStart === -1 ? '' : styleSource.slice(reducedMotionStart, reducedMotionEnd)
const baseStyle = reducedMotionStart === -1 ? styleSource : styleSource.slice(0, reducedMotionStart)

/** Bodies of all top-level rules (outside the reduced-motion block) whose selector list contains `selector`. */
function ruleBody(selector: string): string {
  return Array.from(baseStyle.matchAll(/(?:^|\n)([^{}@]+?)\{([^{}]*)\}/g))
    .filter((match) =>
      match[1]!
        .split(',')
        .map((part) => part.trim())
        .includes(selector),
    )
    .map((match) => match[2]!)
    .join('\n')
}

function animationDeclaration(selector: string): string {
  return ruleBody(selector).match(/animation:([^;]*);/)?.[1]?.replace(/\s+/g, ' ').trim() ?? ''
}

function extractBlock(source: string, header: string): string {
  const start = source.indexOf(header)
  const end = source.indexOf('\n}', start)
  return start === -1 ? '' : source.slice(start, end)
}

function translateStops(name: string): { percent: number; x: number; y: number }[] {
  const block = extractBlock(styleSource, `@keyframes ${name} {`)
  return Array.from(
    block.matchAll(/([\d.]+)%\s*\{\s*transform:\s*translate\(([-\d.]+)px,\s*([-\d.]+)px\);/g),
    (match) => ({ percent: Number(match[1]), x: Number(match[2]), y: Number(match[3]) }),
  )
}

function translateXStops(name: string): { percent: number; x: number }[] {
  const block = extractBlock(styleSource, `@keyframes ${name} {`)
  return Array.from(block.matchAll(/([\d.]+)%\s*\{\s*transform:\s*translateX\(([-\d.]+)px\);/g), (match) => ({
    percent: Number(match[1]),
    x: Number(match[2]),
  }))
}

function opacityStops(name: string): { percent: number; opacity: number }[] {
  const block = extractBlock(styleSource, `@keyframes ${name} {`)
  return Array.from(block.matchAll(/([\d.]+)%\s*\{\s*opacity:\s*([\d.]+);/g), (match) => ({
    percent: Number(match[1]),
    opacity: Number(match[2]),
  }))
}

// --- Design file and rendered geometry ---------------------------------------

const designDocument = new DOMParser().parseFromString(
  readFileSync(designSvgPath, 'utf8'),
  'image/svg+xml',
)
const designCircles = Array.from(designDocument.querySelectorAll('circle'))
const designTraces = Array.from(designDocument.querySelectorAll('path:not([data-char])'))
const designGlyphs = Array.from(designDocument.querySelectorAll('path[data-char]'))
const designCircleScale = parseMatrix(designCircles[0]!.parentElement?.getAttribute('transform'))[0]!

const renderedTraceVertices = Array.from(
  mountLogo().element.querySelectorAll('.animated-logo__trace'),
  (trace: Element) => traceVertices(trace.getAttribute('d') ?? '', trace.parentElement?.getAttribute('transform')),
)

describe('AnimatedLogo — root and accessibility', () => {
  it('renders a single svg root with the 512 viewBox', () => {
    const wrapper = mountLogo()

    expect(wrapper.element.tagName.toLowerCase()).toBe('svg')
    expect(wrapper.attributes('viewBox')).toBe('0 0 512 512')
  })

  it('exposes the logo as an image to assistive technology', () => {
    const wrapper = mountLogo()

    expect(wrapper.attributes('role')).toBe('img')
  })

  it('uses the German landing.logoAlt text as aria-label', () => {
    const wrapper = mountLogo('de')

    expect(wrapper.attributes('aria-label')).toBe(
      'Animiertes michaelschreiber.net Logo als verbundenes IT-Netzwerk',
    )
  })

  it('uses the English landing.logoAlt text as aria-label', () => {
    const wrapper = mountLogo('en')

    expect(wrapper.attributes('aria-label')).toBe(
      'Animated michaelschreiber.net logo as a connected IT network',
    )
  })

  it('lets a class passed by the parent fall through to the svg root', () => {
    const wrapper = mount(AnimatedLogo, {
      attrs: { class: 'hero__logo' },
      global: {
        plugins: [createI18n<[MessageSchema], 'de' | 'en'>({ legacy: false, locale: 'de', messages: { de, en } })],
      },
    })

    expect(wrapper.classes()).toEqual(expect.arrayContaining(['animated-logo', 'hero__logo']))
  })
})

describe('AnimatedLogo — outlined wordmark (AC 1)', () => {
  it('contains no text element', () => {
    const wrapper = mountLogo()

    expect(wrapper.findAll('text')).toHaveLength(0)
  })

  it('contains no embedded raster image', () => {
    const wrapper = mountLogo()

    expect(wrapper.findAll('image')).toHaveLength(0)
  })

  it('renders 20 glyph paths inside the wordmark group', () => {
    const wrapper = mountLogo()

    expect(wrapper.findAll('g.animated-logo__wordmark path.animated-logo__glyph')).toHaveLength(20)
  })

  it('spells michaelschreiber.net with the glyph data-char values in order', () => {
    const wrapper = mountLogo()
    const chars = wrapper.findAll('.animated-logo__glyph').map((glyph) => glyph.attributes('data-char'))

    expect(chars.join('')).toBe('michaelschreiber.net')
  })

  it('uses light for michael and .net and medium for schreiber', () => {
    const wrapper = mountLogo()
    const weights = wrapper.findAll('.animated-logo__glyph').map((glyph) => glyph.attributes('data-weight'))

    expect(weights).toEqual([
      ...Array<string>(7).fill('light'),
      ...Array<string>(9).fill('medium'),
      ...Array<string>(4).fill('light'),
    ])
  })

  it('fills the wordmark with currentColor', () => {
    const wrapper = mountLogo()

    expect(wrapper.get('g.animated-logo__wordmark').attributes('fill')).toBe('currentColor')
  })
})

describe('AnimatedLogo — traces (D2, D3, D5, D6)', () => {
  it('renders nine traces', () => {
    const wrapper = mountLogo()

    expect(wrapper.findAll('path.animated-logo__trace')).toHaveLength(9)
  })

  it('normalises every trace to pathLength 1', () => {
    const wrapper = mountLogo()
    const pathLengths = wrapper.findAll('.animated-logo__trace').map((trace) => trace.attributes('pathLength'))

    expect(pathLengths).toEqual(Array<string>(9).fill('1'))
  })

  it('strokes every trace with currentColor, no fill and the design width 10.68', () => {
    const wrapper = mountLogo()
    const paints = wrapper
      .findAll('.animated-logo__trace')
      .map((trace) => `${trace.attributes('stroke')}|${trace.attributes('fill')}|${trace.attributes('stroke-width')}`)

    expect(paints).toEqual(Array<string>(9).fill('currentColor|none|10.68'))
  })

  it.each(TRACES)('draws trace $name from the junction outward ($d)', ({ index, d }) => {
    const wrapper = mountLogo()

    expect(wrapper.findAll('.animated-logo__trace')[index]?.attributes('d')).toBe(d)
  })

  it.each(TRACES)('times trace $name with delay $delay and duration $duration', ({ index, delay, duration }) => {
    const wrapper = mountLogo()

    expect(timing(wrapper.findAll('.animated-logo__trace')[index]!.element)).toBe(`${delay}|${duration}`)
  })

  it('uses literal black only inside the mask (D6)', () => {
    const wrapper = mountLogo()
    const blackOutsideMask = Array.from(
      wrapper.element.querySelectorAll('[fill="black"], [stroke="black"], [fill="#000"], [stroke="#000"]'),
      (element: Element) => element,
    ).filter((element) => element.closest('mask') === null)

    expect(blackOutsideMask).toHaveLength(0)
  })
})

describe('AnimatedLogo — rings: dots and heads (D2, D3, D3a)', () => {
  it('renders exactly 10 ring circles outside the mask', () => {
    const wrapper = mountLogo()

    expect(wrapper.findAll('svg > circle')).toHaveLength(10)
  })

  it('renders the seven dots d1 to d7 in design order', () => {
    const wrapper = mountLogo()
    const modifiers = wrapper
      .findAll('circle.animated-logo__dot')
      .map((dot) => dot.classes().find((name) => name.startsWith('animated-logo__dot--')))

    expect(modifiers).toEqual(DOTS.map((dot) => `animated-logo__dot--${dot.modifier}`))
  })

  it('renders the three head circles p4, p7 and p8', () => {
    const wrapper = mountLogo()
    const modifiers = wrapper
      .findAll('circle.animated-logo__head')
      .map((head) => head.classes().find((name) => name.startsWith('animated-logo__head--')))

    expect(modifiers).toEqual(HEADS.map((head) => `animated-logo__head--${head.modifier}`))
  })

  it('places every ring directly in the root svg (no transformed wrapper)', () => {
    const wrapper = mountLogo()
    const parents = wrapper
      .findAll('.animated-logo__dot, .animated-logo__head')
      .map((circle) => circle.element.parentElement)

    expect(parents).toEqual(Array<Element>(10).fill(wrapper.element))
  })

  it('draws every ring in currentColor with r 10.144 and stroke width 8.336', () => {
    const wrapper = mountLogo()
    const rings = wrapper
      .findAll('.animated-logo__dot, .animated-logo__head')
      .map(
        (circle) =>
          `${circle.attributes('r')}|${circle.attributes('fill')}|${circle.attributes('stroke')}|${circle.attributes('stroke-width')}`,
      )

    expect(rings).toEqual(Array<string>(10).fill('10.144|none|currentColor|8.336'))
  })

  it('orders the root children: mask defs, masked traces, dots, heads, wordmark', () => {
    const wrapper = mountLogo()
    const order = Array.from(
      wrapper.element.children,
      (child: Element) => child.getAttribute('class')?.split(' ')[0] ?? child.tagName.toLowerCase(),
    )

    expect(order).toEqual([
      'defs',
      'animated-logo__traces',
      ...Array<string>(7).fill('animated-logo__dot'),
      ...Array<string>(3).fill('animated-logo__head'),
      'animated-logo__wordmark',
    ])
  })

  it.each(DOTS)('places dot $modifier at ($cx, $cy)', ({ modifier, cx, cy }) => {
    const wrapper = mountLogo()
    const dot = wrapper.get(`.animated-logo__dot--${modifier}`)

    expect(`${dot.attributes('cx')},${dot.attributes('cy')}`).toBe(`${cx},${cy}`)
  })

  it.each(HEADS)('places head $modifier at ($cx, $cy)', ({ modifier, cx, cy }) => {
    const wrapper = mountLogo()
    const head = wrapper.get(`.animated-logo__head--${modifier}`)

    expect(`${head.attributes('cx')},${head.attributes('cy')}`).toBe(`${cx},${cy}`)
  })

  it('starts the root dot d3 at 0s', () => {
    const wrapper = mountLogo()

    expect(customProperty(wrapper.get('.animated-logo__dot--d3').element, '--logo-delay')).toBe('0s')
  })

  it.each(MOVING_DOTS)('syncs dot $modifier with its trace $traceName', ({ modifier, trace }) => {
    const wrapper = mountLogo()
    const dot = wrapper.get(`.animated-logo__dot--${modifier}`).element

    expect(timing(dot)).toBe(timing(wrapper.findAll('.animated-logo__trace')[trace]!.element))
  })

  it.each(TRAIL_HEADS)('syncs head $modifier with its trace $traceName', ({ modifier, trace }) => {
    const wrapper = mountLogo()
    const head = wrapper.get(`.animated-logo__head--${modifier}`).element

    expect(timing(head)).toBe(timing(wrapper.findAll('.animated-logo__trace')[trace]!.element))
  })

  it('starts only the root dot at 0s and nothing earlier', () => {
    const wrapper = mountLogo()
    const startingAtOrBeforeZero = wrapper
      .findAll('.animated-logo__trace, .animated-logo__dot, .animated-logo__head, .animated-logo__glyph')
      .filter((element) => seconds(customProperty(element.element, '--logo-delay')) <= 0)
      .map((element) => element.element)

    expect(startingAtOrBeforeZero).toEqual([wrapper.get('.animated-logo__dot--d3').element])
  })

  it('completes the circuit before the cursor appears (3.8 s)', () => {
    const wrapper = mountLogo()
    const ends = wrapper
      .findAll('.animated-logo__trace, .animated-logo__dot, .animated-logo__head')
      .map(
        (element) =>
          seconds(customProperty(element.element, '--logo-delay')) +
          (seconds(customProperty(element.element, '--logo-duration')) || 0),
      )

    expect(Math.max(...ends)).toBeLessThanOrEqual(CURSOR_APPEARS_SECONDS)
  })
})

describe('AnimatedLogo — hole mask (D3b)', () => {
  it('defines one mask with the id animated-logo-holes', () => {
    const wrapper = mountLogo()

    expect(wrapper.findAll('defs > mask#animated-logo-holes')).toHaveLength(1)
  })

  it('uses user space units covering the whole viewBox', () => {
    const wrapper = mountLogo()
    const mask = wrapper.get('mask')

    expect(['maskUnits', 'x', 'y', 'width', 'height'].map((name) => mask.attributes(name))).toEqual([
      'userSpaceOnUse',
      '0',
      '0',
      '512',
      '512',
    ])
  })

  it('starts the mask with a white full-size rect (everything visible)', () => {
    const wrapper = mountLogo()
    const rect = wrapper.get('mask').element.firstElementChild!

    expect(
      ['tagName', 'width', 'height', 'fill'].map((name) =>
        name === 'tagName' ? rect.tagName.toLowerCase() : rect.getAttribute(name),
      ),
    ).toEqual(['rect', '512', '512', 'white'])
  })

  it('cuts one black hole of r 10.144 per ring, with the ring modifiers in order', () => {
    const wrapper = mountLogo()
    const holes = wrapper
      .findAll('mask circle.animated-logo__hole')
      .map((hole) => `${hole.classes().find((name) => name.startsWith('animated-logo__hole--'))}|${hole.attributes('r')}|${hole.attributes('fill')}`)

    expect(holes).toEqual(RINGS.map((ring) => `animated-logo__hole--${ring.modifier}|10.144|black`))
  })

  it.each(RINGS)('hole $modifier sits on the centre of its ring', ({ modifier, selector }) => {
    const wrapper = mountLogo()
    const hole = wrapper.get(`.animated-logo__hole--${modifier}`)
    const ring = wrapper.get(selector)

    expect(`${hole.attributes('cx')},${hole.attributes('cy')}`).toBe(`${ring.attributes('cx')},${ring.attributes('cy')}`)
  })

  it.each(RINGS)('hole $modifier has the timing of its ring', ({ modifier, selector }) => {
    const wrapper = mountLogo()

    expect(timing(wrapper.get(`.animated-logo__hole--${modifier}`).element)).toBe(
      timing(wrapper.get(selector).element),
    )
  })

  it('applies the mask to the trace group', () => {
    const wrapper = mountLogo()

    expect(wrapper.get('g.animated-logo__traces').attributes('mask')).toBe('url(#animated-logo-holes)')
  })

  it('has exactly one masked element', () => {
    const wrapper = mountLogo()

    expect(wrapper.findAll('[mask]')).toHaveLength(1)
  })

  it('puts all nine traces inside the masked group', () => {
    const wrapper = mountLogo()

    expect(wrapper.findAll('g.animated-logo__traces .animated-logo__trace')).toHaveLength(9)
  })

  it('puts nothing but trace groups and traces inside the masked group', () => {
    const wrapper = mountLogo()
    const contents = Array.from(
      wrapper.get('g.animated-logo__traces').element.querySelectorAll('*'),
      (element: Element) => element.getAttribute('class') ?? element.tagName.toLowerCase(),
    )

    expect(contents).toEqual(
      Array.from({ length: 18 }, (_, index) => (index % 2 === 0 ? 'g' : 'animated-logo__trace')),
    )
  })
})

describe('AnimatedLogo — joint geometry (D3b)', () => {
  it.each(MOVING_DOTS)(
    'dot $modifier lies on the axis of the last segment of $traceName',
    ({ cx, cy, trace }) => {
      const vertices = renderedTraceVertices[trace]!

      expect(
        distanceFromLine([Number(cx), Number(cy)], vertices[vertices.length - 2]!, last(vertices)),
      ).toBeLessThan(0.01)
    },
  )

  it.each(ROOT_BRANCHES)('root dot d3 lies on the axis of the first segment of $traceName', ({ trace }) => {
    const vertices = renderedTraceVertices[trace]!
    const d3 = DOTS[2]!

    expect(distanceFromLine([Number(d3.cx), Number(d3.cy)], vertices[0]!, vertices[1]!)).toBeLessThan(0.01)
  })

  it.each(MOVING_DOTS)(
    'trace $traceName ends within [5.976, 13.69] of dot $modifier (no line in the hole, no notch)',
    ({ cx, cy, trace }) => {
      const gap = distance(last(renderedTraceVertices[trace]!), [Number(cx), Number(cy)])

      expect([gap >= HOLE_INNER_EDGE, gap <= NOTCH_LIMIT]).toEqual([true, true])
    },
  )

  it.each(ROOT_BRANCHES)('trace $traceName starts within [5.976, 13.69] of the root dot d3', ({ trace }) => {
    const d3 = DOTS[2]!
    const gap = distance(renderedTraceVertices[trace]![0]!, [Number(d3.cx), Number(d3.cy)])

    expect([gap >= HOLE_INNER_EDGE, gap <= NOTCH_LIMIT]).toEqual([true, true])
  })

  it.each(DOTS)('moves dot $modifier at most ~1.1 units (concept: ≤ 1.1, D3 is 1.103) from the design centre', ({ index, cx, cy }) => {
    const designCentre = applyMatrix(
      parseMatrix(designCircles[index]!.parentElement?.getAttribute('transform')),
      centre(designCircles[index]!),
    )

    expect(distance([Number(cx), Number(cy)], designCentre)).toBeLessThan(1.11)
  })
})

describe('AnimatedLogo — wordmark, typing rhythm and cursor markup (D4, D4a)', () => {
  it('reveals the glyphs at the D4 times', () => {
    const wrapper = mountLogo()
    const delays = wrapper
      .findAll('.animated-logo__glyph')
      .map((glyph) => customProperty(glyph.element, '--logo-delay'))

    expect(delays).toEqual(GLYPH_DELAYS)
  })

  it('reveals the glyphs in strictly increasing order', () => {
    const wrapper = mountLogo()
    const times = wrapper
      .findAll('.animated-logo__glyph')
      .map((glyph) => seconds(customProperty(glyph.element, '--logo-delay')))
    const gaps = times.slice(1).map((time, index) => time - times[index]!)

    expect(Math.min(...gaps)).toBeGreaterThan(0)
  })

  it('pauses longer before schreiber and .net than between any two letters of a word', () => {
    const times = GLYPH_DELAYS.map(seconds)
    const gaps = times.slice(1).map((time, index) => time - times[index]!)
    const wordPauses = [gaps[6]!, gaps[15]!]
    const letterGaps = gaps.filter((_, index) => index !== 6 && index !== 15)

    expect(Math.min(...wordPauses)).toBeGreaterThan(Math.max(...letterGaps))
  })

  it('no longer uses the index-based --logo-glyph property', () => {
    expect(animatedLogoSource).not.toMatch(/--logo-glyph|--logo-typing-start/)
  })

  it('renders exactly one cursor rect inside the wordmark', () => {
    const wrapper = mountLogo()

    expect(wrapper.findAll('g.animated-logo__wordmark rect.animated-logo__cursor')).toHaveLength(1)
  })

  it('renders no rect outside the mask except the cursor', () => {
    const wrapper = mountLogo()
    const rects = Array.from(wrapper.element.querySelectorAll('rect'), (rect: Element) => rect).filter(
      (rect) => rect.closest('mask') === null,
    )

    expect(rects).toEqual([wrapper.get('.animated-logo__cursor').element])
  })

  it('shares the glyph coordinate system with the cursor', () => {
    const wrapper = mountLogo()

    expect(wrapper.get('.animated-logo__cursor').element.parentElement).toBe(
      wrapper.get('.animated-logo__glyph').element.parentElement,
    )
  })

  it('sizes the cursor as a block from the baseline to the ascender', () => {
    const wrapper = mountLogo()
    const cursor = wrapper.get('.animated-logo__cursor')

    expect(['x', 'y', 'width', 'height'].map((name) => cursor.attributes(name))).toEqual([
      '566.19',
      '1218.66',
      '22',
      '41.26',
    ])
  })

  it('fills the cursor with currentColor', () => {
    const wrapper = mountLogo()

    expect(wrapper.get('.animated-logo__cursor').attributes('fill')).toBe('currentColor')
  })
})

describe('AnimatedLogo — geometry matches the design end state (AC 3)', () => {
  it('keeps the trace group transforms from logo-outlined.svg', () => {
    const wrapper = mountLogo()
    const traces = wrapper.findAll('.animated-logo__trace').map((trace) => trace.element)

    expect(parentTransforms(traces)).toEqual(parentTransforms(designTraces))
  })

  it.each(TRACES)('uses the design polyline of trace $name (as is or reversed)', ({ index, d }) => {
    const designD = designTraces[index]!.getAttribute('d')!

    expect([designD, reversePolyline(designD)]).toContain(d)
  })

  it('flattens the design radius into r 10.144', () => {
    expect(designCircleScale * Number(designCircles[0]!.getAttribute('r'))).toBeCloseTo(RING_RADIUS, 3)
  })

  it('flattens the design stroke width 14.38 into 8.336', () => {
    expect(designCircleScale * 14.38).toBeCloseTo(8.336, 3)
  })

  it.each(TRAIL_HEADS)('puts head $modifier on the end point of trace $traceName', ({ cx, cy, trace }) => {
    expect(distance(last(renderedTraceVertices[trace]!), [Number(cx), Number(cy)])).toBeLessThan(0.01)
  })

  it('keeps the wordmark fitting transform of the design', () => {
    const wrapper = mountLogo()

    expect(wrapper.get('g.animated-logo__wordmark').attributes('transform')).toBe(
      designGlyphs[0]!.parentElement!.parentElement!.getAttribute('transform'),
    )
  })

  it('keeps the inner wordmark transform of the design', () => {
    const wrapper = mountLogo()
    const glyph = wrapper.get('.animated-logo__glyph').element

    expect(glyph.parentElement?.getAttribute('transform')).toBe(
      designGlyphs[0]!.parentElement!.getAttribute('transform'),
    )
  })

  it('keeps every glyph outline of logo-outlined.svg', () => {
    const wrapper = mountLogo()

    expect(wrapper.findAll('.animated-logo__glyph').map((glyph) => glyph.attributes('d'))).toEqual(
      designGlyphs.map((glyph) => glyph.getAttribute('d')),
    )
  })
})

describe('AnimatedLogo — travelling circles ride the trace tips (D3a, source level)', () => {
  /** Expected path of each circle: trace vertices, last one replaced by the circle centre. */
  const expectedPath = (trace: number, cx: string, cy: string): Point[] => [
    ...renderedTraceVertices[trace]!.slice(0, -1),
    [Number(cx), Number(cy)],
  ]

  it.each(ALL_MOVING_CIRCLES)('$selector ends logo-move at translate(0px, 0px)', ({ modifier }) => {
    expect(last(translateStops(`logo-move-${modifier}`))).toEqual({ percent: 100, x: 0, y: 0 })
  })

  it.each(MOVING_CIRCLES)('$selector has one keyframe stop per vertex of $traceName', ({ modifier, trace }) => {
    expect(translateStops(`logo-move-${modifier}`)).toHaveLength(renderedTraceVertices[trace]!.length)
  })

  it.each(MOVING_CIRCLES)(
    '$selector keyframe positions lie on the vertices of $traceName',
    ({ modifier, trace, cx, cy }) => {
      const path = expectedPath(trace, cx, cy)
      const deviations = translateStops(`logo-move-${modifier}`).map((stop, index) =>
        distance([stop.x + Number(cx), stop.y + Number(cy)], path[index]!),
      )

      expect(Math.max(...deviations)).toBeLessThan(0.05)
    },
  )

  it.each(MOVING_CIRCLES)(
    '$selector reaches each vertex of $traceName together with the trace tip (cumulative trace length)',
    ({ modifier, trace }) => {
      const expected = cumulativePercentages(renderedTraceVertices[trace]!)
      const deviations = translateStops(`logo-move-${modifier}`).map((stop, index) =>
        Math.abs(stop.percent - expected[index]!),
      )

      expect(Math.max(...deviations)).toBeLessThan(0.1)
    },
  )

  it.each(ALL_MOVING_CIRCLES)('$selector moves linearly with its delay and duration', ({ selector, modifier }) => {
    expect(animationDeclaration(selector)).toMatch(
      new RegExp(`logo-move-${modifier} var\\(--logo-duration\\) linear var\\(--logo-delay\\) (?:both|none)`),
    )
  })

  it.each(MOVING_DOTS)('.animated-logo__dot--$modifier holds its start before the delay (fill both)', ({ modifier }) => {
    expect(animationDeclaration(`.animated-logo__dot--${modifier}`)).toMatch(
      new RegExp(`logo-move-${modifier} [^,]* both`),
    )
  })

  it.each(MOVING_DOTS)(
    '.animated-logo__dot--$modifier is revealed with logo-show steps(1, start) at its delay',
    ({ modifier }) => {
      expect(animationDeclaration(`.animated-logo__dot--${modifier}`)).toMatch(
        /logo-show 1ms steps\(1, start\) var\(--logo-delay\) both/,
      )
    },
  )

  it('pops the static root dot d3 in with logo-pop at 0s', () => {
    expect(animationDeclaration('.animated-logo__dot--d3')).toMatch(/^logo-pop [^,]*var\(--logo-delay\) both$/)
  })

  it.each(HEADS)('.animated-logo__head--$modifier is visible only while its trace grows (fill none)', ({ modifier }) => {
    expect(animationDeclaration(`.animated-logo__head--${modifier}`)).toBe(
      `logo-move-${modifier} var(--logo-duration) linear var(--logo-delay) none, logo-head-on var(--logo-duration) linear var(--logo-delay) none`,
    )
  })

  it('keeps head circles visible from the first to the last keyframe of logo-head-on', () => {
    expect(styleSource).toMatch(/@keyframes logo-head-on\s*\{\s*from,\s*to\s*\{\s*opacity:\s*1;\s*\}\s*\}/)
  })

  it('hides head circles in their base style', () => {
    expect(ruleBody('.animated-logo__head')).toMatch(/opacity:\s*0;/)
  })
})

describe('AnimatedLogo — bottom-right merge of the P4 head into D5 (D3c)', () => {
  const p4Stops = translateStops('logo-move-p4')
  const d5Stops = translateStops('logo-move-d5')
  const p4Vertices = renderedTraceVertices[P4_INDEX]!
  const junction = renderedTraceVertices[P3_INDEX]![2]!
  const d5Centre: Point = [Number(DOTS[4]!.cx), Number(DOTS[4]!.cy)]

  it('runs the P4 trace in 1.38s from 0.10s', () => {
    const wrapper = mountLogo()

    expect(timing(wrapper.findAll('.animated-logo__trace')[P4_INDEX]!.element)).toBe('0.10s|1.38s')
  })

  it('rests the P4 head on the centre of D5', () => {
    const wrapper = mountLogo()
    const head = wrapper.get('.animated-logo__head--p4')
    const dot = wrapper.get('.animated-logo__dot--d5')

    expect(`${head.attributes('cx')},${head.attributes('cy')}`).toBe(`${dot.attributes('cx')},${dot.attributes('cy')}`)
  })

  it('rests the P4 hole on the centre of D5', () => {
    const wrapper = mountLogo()
    const hole = wrapper.get('.animated-logo__hole--p4')
    const dot = wrapper.get('.animated-logo__dot--d5')

    expect(`${hole.attributes('cx')},${hole.attributes('cy')}`).toBe(`${dot.attributes('cx')},${dot.attributes('cy')}`)
  })

  it('times the P4 head with its own 0.10s / 1.90s', () => {
    const wrapper = mountLogo()

    expect(timing(wrapper.get('.animated-logo__head--p4').element)).toBe(P4_HEAD_TIMING)
  })

  it('times the P4 hole like the P4 head', () => {
    const wrapper = mountLogo()

    expect(timing(wrapper.get('.animated-logo__hole--p4').element)).toBe(P4_HEAD_TIMING)
  })

  it('lets the P4 head arrive at D5 together with the D5 circle (2.00 s)', () => {
    const wrapper = mountLogo()
    const end = (element: Element) =>
      seconds(customProperty(element, '--logo-delay')) + seconds(customProperty(element, '--logo-duration'))

    expect(end(wrapper.get('.animated-logo__head--p4').element)).toBeCloseTo(
      end(wrapper.get('.animated-logo__dot--d5').element),
      5,
    )
  })

  it('moves the P4 head through six stops: P4 start, two corners, P4 end, J, D5', () => {
    expect(p4Stops).toHaveLength(6)
  })

  it('puts the first four P4 head stops on the P4 vertices', () => {
    const deviations = p4Stops
      .slice(0, 4)
      .map((stop, index) => distance([stop.x + d5Centre[0], stop.y + d5Centre[1]], p4Vertices[index]!))

    expect(Math.max(...deviations)).toBeLessThan(0.05)
  })

  it('keeps the P4 head on the P4 tip until the P4 end (1.48 s)', () => {
    const tipTimes = cumulativePercentages(p4Vertices).map((percent) => 0.1 + (percent / 100) * 1.38)
    const deviations = p4Stops.slice(0, 4).map((stop, index) => Math.abs(0.1 + (stop.percent / 100) * 1.9 - tipTimes[index]!))

    expect(Math.max(...deviations)).toBeLessThan(0.005)
  })

  it('has a 73% stop at J, translate(69.52px, 56.88px)', () => {
    expect(p4Stops[4]).toEqual({ percent: 73, x: 69.52, y: 56.88 })
  })

  it('shares the J stop with the 68.9% stop of logo-move-d5', () => {
    expect(d5Stops[2]).toEqual({ percent: 68.9, x: p4Stops[4]!.x, y: p4Stops[4]!.y })
  })

  it('places the J stop on P3’s corner', () => {
    expect(distance([p4Stops[4]!.x + d5Centre[0], p4Stops[4]!.y + d5Centre[1]], junction)).toBeLessThan(0.05)
  })

  it('reaches J at 1.487 s on both circles (0.10 + 0.73 × 1.90 and 0.35 + 0.689 × 1.65)', () => {
    expect([0.1 + (p4Stops[4]!.percent / 100) * 1.9, 0.35 + (d5Stops[2]!.percent / 100) * 1.65]).toEqual([
      expect.closeTo(MERGE_SECONDS, 2),
      expect.closeTo(MERGE_SECONDS, 2),
    ])
  })

  it('reaches J within 5 ms on both circles', () => {
    expect(Math.abs(0.1 + (p4Stops[4]!.percent / 100) * 1.9 - (0.35 + (d5Stops[2]!.percent / 100) * 1.65))).toBeLessThan(
      0.005,
    )
  })

  it('ends P4 1.10 units before J, so the head closes the gap in a few ms', () => {
    expect(distance(last(p4Vertices), junction)).toBeCloseTo(1.1, 1)
  })

  it('ends the P4 head at translate(0px, 0px), the D5 centre', () => {
    expect(last(p4Stops)).toEqual({ percent: 100, x: 0, y: 0 })
  })

  it('follows D5 from J to the end with the same keyframe tail', () => {
    expect(p4Stops.slice(4).map((stop) => [stop.x, stop.y])).toEqual(d5Stops.slice(2).map((stop) => [stop.x, stop.y]))
  })
})

describe('AnimatedLogo — holes animate with their rings (D3b, source level)', () => {
  const HOLE_RINGS = RINGS.filter((ring) => ring.modifier !== 'd3')

  it.each(HOLE_RINGS)('hole $modifier uses the same animation as its ring', ({ modifier, selector }) => {
    expect(animationDeclaration(`.animated-logo__hole--${modifier}`)).toBe(animationDeclaration(selector))
  })

  it.each(HOLE_RINGS)('hole $modifier has an animation at all', ({ modifier }) => {
    expect(animationDeclaration(`.animated-logo__hole--${modifier}`)).not.toBe('')
  })

  it('keeps the root hole d3 static', () => {
    expect(animationDeclaration('.animated-logo__hole--d3')).toBe('')
  })

  it.each(HEADS)('hides head hole $modifier in its base style', ({ modifier }) => {
    expect(ruleBody(`.animated-logo__hole--${modifier}`)).toMatch(/opacity:\s*0;/)
  })

  it.each(MOVING_DOTS)('does not hide dot hole $modifier in its base style', ({ modifier }) => {
    expect(ruleBody(`.animated-logo__hole--${modifier}`)).not.toMatch(/opacity|visibility|display:\s*none/)
  })
})

describe('AnimatedLogo — cursor animation (D4a, source level)', () => {
  const cursorAnimation = animationDeclaration('.animated-logo__cursor')
  const moveStops = translateXStops('logo-cursor-move')
  const blinkStops = opacityStops('logo-cursor-blink')

  it('hides the cursor in its base style (end state: no cursor)', () => {
    expect(ruleBody('.animated-logo__cursor')).toMatch(/opacity:\s*0;/)
  })

  it('blinks the cursor for 6.88s from 3.8s with steps(1, end), fill none', () => {
    expect(cursorAnimation).toContain('logo-cursor-blink 6.88s steps(1, end) 3.8s none')
  })

  it('moves the cursor for 5.68s from 5s with steps(1, end), fill none', () => {
    expect(cursorAnimation).toContain('logo-cursor-move 5.68s steps(1, end) 5s none')
  })

  it('ends blink and move together at 10.68 s', () => {
    const blinkDuration = seconds(cursorAnimation.match(/logo-cursor-blink ([\d.]+s)/)?.[1] ?? 'NaN')
    const moveDuration = seconds(cursorAnimation.match(/logo-cursor-move ([\d.]+s)/)?.[1] ?? 'NaN')

    expect([CURSOR_APPEARS_SECONDS + blinkDuration, CURSOR_MOVE_START_SECONDS + moveDuration]).toEqual([
      expect.closeTo(ANIMATION_END_SECONDS, 5),
      expect.closeTo(ANIMATION_END_SECONDS, 5),
    ])
  })

  it('alternates the cursor on and off, starting on and ending off', () => {
    expect(blinkStops.map((stop) => stop.opacity)).toEqual([1, 0, 1, 0, 1, 0])
  })

  it('switches the blink at 3.8, 4.3, 4.8, 9.68, 10.18 and 10.68 s', () => {
    const deviations = blinkStops.map((stop, index) =>
      Math.abs(CURSOR_APPEARS_SECONDS + (stop.percent / 100) * 6.88 - CURSOR_BLINK_TIMES[index]!),
    )

    expect(Math.max(...deviations)).toBeLessThan(0.001)
  })

  it('keeps the cursor on from its second on-phase until after the last glyph', () => {
    expect([CURSOR_BLINK_TIMES[2]!, CURSOR_BLINK_TIMES[3]!]).toEqual([
      expect.closeTo(seconds(GLYPH_DELAYS[0]!) - 0.2, 5),
      expect.closeTo(seconds(last(GLYPH_DELAYS)) + 0.5, 5),
    ])
  })

  it('steps the cursor through the 20 glyph offsets from the concept', () => {
    expect(moveStops.map((stop) => stop.x)).toEqual([...CURSOR_OFFSETS, 499.23])
  })

  it('jumps the cursor right of glyph j exactly when glyph j appears', () => {
    const deviations = moveStops
      .slice(0, 20)
      .map((stop, index) =>
        Math.abs(CURSOR_MOVE_START_SECONDS + (stop.percent / 100) * 5.68 - seconds(GLYPH_DELAYS[index]!)),
      )

    expect(Math.max(...deviations)).toBeLessThan(0.001)
  })

  it('ends logo-cursor-move at translateX(499.23px)', () => {
    expect(last(moveStops)).toEqual({ percent: 100, x: 499.23 })
  })

  it('only ever moves the cursor to the right', () => {
    const offsets = moveStops.map((stop) => stop.x)

    expect(offsets).toEqual([...offsets].sort((a, b) => a - b))
  })
})

describe('AnimatedLogo — CSS animation contract (source level)', () => {
  it('draws traces with a stroke-dashoffset keyframe starting outside the path (AC 2)', () => {
    expect(styleSource).toMatch(/@keyframes logo-draw\s*\{\s*from\s*\{\s*stroke-dashoffset:\s*1\.01;\s*\}\s*\}/)
  })

  it('animates traces with logo-draw using their delay and duration (AC 2)', () => {
    expect(animationDeclaration('.animated-logo__trace')).toBe(
      'logo-draw var(--logo-duration) linear var(--logo-delay) both',
    )
  })

  it('keeps the trace end state as the base style', () => {
    expect(ruleBody('.animated-logo__trace')).toMatch(/stroke-dasharray:\s*1 2;[\s\S]*stroke-dashoffset:\s*0;/)
  })

  it('reveals glyphs with logo-show steps(1, start) at their own delay (AC 2)', () => {
    expect(animationDeclaration('.animated-logo__glyph')).toBe('logo-show 1ms steps(1, start) var(--logo-delay) both')
  })

  it('defines logo-show from opacity 0 to opacity 1', () => {
    expect(styleSource).toMatch(
      /@keyframes logo-show\s*\{\s*from\s*\{\s*opacity:\s*0;\s*\}\s*to\s*\{\s*opacity:\s*1;\s*\}\s*\}/,
    )
  })

  it('does not use a jump-end timing for the glyph reveal (Chrome left the first glyphs hidden)', () => {
    expect(animationDeclaration('.animated-logo__glyph')).not.toMatch(/steps\(1(?:,\s*(?:end|jump-end))?\)|step-end/)
  })

  it.each(MOVING_DOTS)('does not use a jump-end timing for the reveal of dot and hole $modifier', ({ modifier }) => {
    expect(
      `${animationDeclaration(`.animated-logo__dot--${modifier}`)} ${animationDeclaration(`.animated-logo__hole--${modifier}`)}`,
    ).not.toMatch(/steps\(1(?:,\s*(?:end|jump-end))?\)|step-end/)
  })

  it('hides traces, glyphs and dots only in keyframes, never in their base rules', () => {
    const baseRules = [
      '.animated-logo__trace',
      '.animated-logo__glyph',
      '.animated-logo__dot',
      ...DOTS.map((dot) => `.animated-logo__dot--${dot.modifier}`),
    ]
      .map((selector) => ruleBody(selector))
      .join('\n')

    expect(baseRules).not.toMatch(/opacity|visibility|display:\s*none/)
  })

  it('has a prefers-reduced-motion: reduce block', () => {
    expect(reducedMotionBlock).not.toBe('')
  })

  it('disables the animation of traces, dots, heads, holes, glyphs and cursor under reduced motion (AC 4)', () => {
    expect(reducedMotionBlock).toMatch(
      /\.animated-logo__trace,\s*\.animated-logo__dot,\s*\.animated-logo__head,\s*\.animated-logo__hole,\s*\.animated-logo__glyph,\s*\.animated-logo__cursor\s*\{\s*animation:\s*none;\s*\}/,
    )
  })

  it('places the reduced-motion block after every other animation declaration (D5)', () => {
    expect(styleSource.slice(reducedMotionEnd)).not.toContain('animation')
  })

  it('keeps the reduced-motion block as the last rule block of the style (D5)', () => {
    expect(styleSource.slice(reducedMotionEnd).trim()).toBe('</style>')
  })

  it('does not reference a font', () => {
    expect(animatedLogoSource).not.toMatch(/font-family|@font-face|<text/)
  })

  it('does not reference the old GIF', () => {
    expect(animatedLogoSource).not.toContain('logo_anim.gif')
  })
})
