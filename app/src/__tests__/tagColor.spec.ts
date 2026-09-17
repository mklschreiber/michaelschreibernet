/**
 * Testing concept — Colored Tags (getTagColor)
 *
 * Trello card: https://trello.com/c/u1IyHIJw/8-colored-tags
 * The Trello card description is canonical for requirements and acceptance
 * criteria (AC-01 deterministic per-value color, AC-02 regular text color,
 * AC-03 always light background). This suite covers `getTagColor` at the
 * unit level, since it is a pure, stateless string -> HSL-string function
 * with no Vue reactivity. Verified here:
 *  - determinism across repeated calls for the same value (AC-01)
 *  - output shape: exact `hsl(<hue>, 65%, 85%)` string, hue an integer in
 *    [0, 359], saturation/lightness fixed at the documented light values
 *    (AC-03)
 *  - different tag values tend to produce different hues (spread), and
 *    case/whitespace sensitivity per the architecture contract
 *  - empty string input does not throw and is still deterministic
 * AC-02 (regular text color, not derived from the background) is covered
 * in ProjectCard.spec.ts instead, since it is a component-level concern.
 */
import { describe, it, expect } from 'vitest'
import { getTagColor, TAG_COLOR_SATURATION, TAG_COLOR_LIGHTNESS } from '@/utils/tagColor'

const HSL_PATTERN = /^hsl\((\d+), (\d+)%, (\d+)%\)$/

describe('getTagColor', () => {
  it('returns the same color for the same value across repeated calls', () => {
    const first = getTagColor('Vue.js')
    const second = getTagColor('Vue.js')

    expect(second).toBe(first)
  })

  it('returns a valid hsl(...) string', () => {
    const result = getTagColor('TypeScript')

    expect(result).toMatch(HSL_PATTERN)
  })

  it('fixes saturation at the documented light-color constant', () => {
    const result = getTagColor('TypeScript')
    const [, , saturation] = HSL_PATTERN.exec(result)!

    expect(Number(saturation)).toBe(TAG_COLOR_SATURATION)
  })

  it('fixes lightness at the documented light-color constant', () => {
    const result = getTagColor('TypeScript')
    const [, , , lightness] = HSL_PATTERN.exec(result)!

    expect(Number(lightness)).toBe(TAG_COLOR_LIGHTNESS)
  })

  it('always uses a lightness of 85%, guaranteeing a light color', () => {
    const values = ['Vue.js', 'TypeScript', 'Node.js', 'Docker', 'GraphQL', '']

    const lightnesses = values.map((value) => {
      const [, , , lightness] = HSL_PATTERN.exec(getTagColor(value))!
      return Number(lightness)
    })

    expect(lightnesses.every((lightness) => lightness === 85)).toBe(true)
  })

  it('produces a hue within the valid [0, 359] range', () => {
    const result = getTagColor('Kubernetes')
    const [, hue] = HSL_PATTERN.exec(result)!

    expect(Number(hue)).toBeGreaterThanOrEqual(0)
    expect(Number(hue)).toBeLessThanOrEqual(359)
  })

  it('produces different hues for different tag values', () => {
    const values = ['Vue.js', 'TypeScript', 'Node.js', 'Docker', 'GraphQL', 'React', 'AWS']

    const hues = new Set(
      values.map((value) => Number(HSL_PATTERN.exec(getTagColor(value))![1])),
    )

    expect(hues.size).toBeGreaterThan(1)
  })

  it('is case-sensitive, so at least some differently-cased pairs differ', () => {
    // The hash is unnormalized, so a single case-flipped pair could
    // (rarely) collide after the `% 360` reduction; checking several pairs
    // keeps this deterministic while still asserting case sensitivity.
    const pairs: Array<[string, string]> = [
      ['vue.js', 'VUE.JS'],
      ['docker', 'DOCKER'],
      ['react', 'REACT'],
      ['graphql', 'GRAPHQL'],
      ['kubernetes', 'KUBERNETES'],
    ]

    const differingPairs = pairs.filter(([lower, upper]) => getTagColor(lower) !== getTagColor(upper))

    expect(differingPairs.length).toBeGreaterThan(0)
  })

  it('is sensitive to leading, trailing, and internal whitespace', () => {
    // The hash walks raw char codes with no trimming/normalization, so a
    // single pair could (rarely) collide after the `% 360` reduction;
    // checking several pairs keeps this deterministic while still
    // asserting whitespace sensitivity.
    const pairs: Array<[string, string]> = [
      ['React', ' React'],
      ['React', 'React '],
      ['Vue.js', 'Vue .js'],
      ['Node.js', 'Node.js '],
      ['GraphQL', ' GraphQL '],
    ]

    const differingPairs = pairs.filter(([a, b]) => getTagColor(a) !== getTagColor(b))

    expect(differingPairs.length).toBeGreaterThan(0)
  })

  it('does not throw for an empty string and still returns a valid hsl(...) string', () => {
    expect(() => getTagColor('')).not.toThrow()
    expect(getTagColor('')).toMatch(HSL_PATTERN)
  })

  it('deterministically maps the empty string to the same color every time', () => {
    expect(getTagColor('')).toBe(getTagColor(''))
  })
})
