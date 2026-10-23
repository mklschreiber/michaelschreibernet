/**
 * Testing concept — TimelineEntry; MS-20 (docs/architecture/MS-20-tests.md,
 * D13) adds: the entry is an `li` grid row, the employer is an `h3`, and the
 * axis is `aria-hidden`.
 * User review round 1 (R3), source level (`TimelineEntry.vue?raw`, jsdom
 * applies no scoped CSS): the entry and its axis lines are static, only the
 * dot and the card fly in (opacity 0 → 1, translateY(30px) → 0, 0.6s
 * ease-out after `var(--delay, 0s)`), and under reduced motion dot and card
 * are visible without a transition. The animation itself is a manual check.
 * User review round 3 (R6): the axis holds only the dot (no line spans); the
 * line is the continuous `.timeline-entry__axis::before` (top 0 / bottom 0,
 * 2px, `primary-container`, static), so a hidden or flying dot leaves no gap.
 * Source level: the dot is positioned above the line (`position: relative`,
 * `z-index: 1`) at `margin-top: 28px` (first entry 60px). The seamless line
 * while scrolling is a manual check.
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import TimelineEntry from '@/components/TimelineEntry.vue'
import timelineEntrySource from '@/components/TimelineEntry.vue?raw'
import type { TimelineEntry as TimelineEntryType } from '@/data/timeline'

const mockEntry: TimelineEntryType = {
  id: 'mercedesBenz',
  date: 'April 2022',
  titleKey: 'about.timeline.entries.mercedesBenz.company',
  descriptionKey: 'about.timeline.entries.mercedesBenz.role',
}

function createWrapper(props: {
  entry: TimelineEntryType
  side: 'left' | 'right'
  isVisible: boolean
}) {
  const i18n = createI18n({
    legacy: false,
    locale: 'de',
    messages: {
      de: {
        about: {
          timeline: {
            entries: {
              mercedesBenz: {
                company: 'Mercedes-Benz Tech Innovation',
                role: 'Senior Software Engineer',
              },
            },
          },
        },
      },
    },
  })
  return mount(TimelineEntry, { props, global: { plugins: [i18n] } })
}

describe('TimelineEntry', () => {
  it('applies left class when side is left', () => {
    const wrapper = createWrapper({ entry: mockEntry, side: 'left', isVisible: false })
    expect(wrapper.classes()).toContain('timeline-entry--left')
  })

  it('applies right class when side is right', () => {
    const wrapper = createWrapper({ entry: mockEntry, side: 'right', isVisible: false })
    expect(wrapper.classes()).toContain('timeline-entry--right')
  })

  it('applies visible class when isVisible is true', () => {
    const wrapper = createWrapper({ entry: mockEntry, side: 'left', isVisible: true })
    expect(wrapper.classes()).toContain('timeline-entry--visible')
  })

  it('does not apply visible class when isVisible is false', () => {
    const wrapper = createWrapper({ entry: mockEntry, side: 'left', isVisible: false })
    expect(wrapper.classes()).not.toContain('timeline-entry--visible')
  })

  it('renders dot element', () => {
    const wrapper = createWrapper({ entry: mockEntry, side: 'left', isVisible: false })
    expect(wrapper.find('.timeline-entry__dot').exists()).toBe(true)
  })

  it('renders only the dot inside the axis (MS-20 R6)', () => {
    const wrapper = createWrapper({ entry: mockEntry, side: 'left', isVisible: false })
    expect(wrapper.findAll('.timeline-entry__axis > *').map((child) => child.classes())).toEqual([
      ['timeline-entry__dot'],
    ])
  })

  it('renders no axis line segment elements (MS-20 R6)', () => {
    const wrapper = createWrapper({ entry: mockEntry, side: 'left', isVisible: false })
    expect(wrapper.find('.timeline-entry__line').exists()).toBe(false)
  })

  it('renders date, company and role', () => {
    const wrapper = createWrapper({ entry: mockEntry, side: 'left', isVisible: true })
    expect(wrapper.find('.timeline-entry__date').text()).toBe('April 2022')
    expect(wrapper.find('.timeline-entry__company').text()).toBe('Mercedes-Benz Tech Innovation')
    expect(wrapper.find('.timeline-entry__role').text()).toBe('Senior Software Engineer')
  })

  it('sets data-entry-id attribute', () => {
    const wrapper = createWrapper({ entry: mockEntry, side: 'left', isVisible: false })
    expect(wrapper.attributes('data-entry-id')).toBe('mercedesBenz')
  })
})

describe('TimelineEntry — MS-20 semantics', () => {
  it('renders the entry as a list item', () => {
    const wrapper = createWrapper({ entry: mockEntry, side: 'left', isVisible: false })
    expect(wrapper.element.tagName).toBe('LI')
  })

  it('renders the employer as h3', () => {
    const wrapper = createWrapper({ entry: mockEntry, side: 'right', isVisible: false })
    expect(wrapper.get('h3').text()).toBe('Mercedes-Benz Tech Innovation')
  })

  it('hides the axis from assistive technology', () => {
    const wrapper = createWrapper({ entry: mockEntry, side: 'left', isVisible: false })
    expect(wrapper.get('.timeline-entry__axis').attributes('aria-hidden')).toBe('true')
  })
})

describe('TimelineEntry — fly-in CSS (source level, MS-20 R3)', () => {
  const styleSource = timelineEntrySource.slice(timelineEntrySource.indexOf('<style'))
  const reducedMotionStart = styleSource.indexOf('@media (prefers-reduced-motion: reduce)')
  const reducedMotionBlock = styleSource.slice(reducedMotionStart, styleSource.indexOf('\n}', reducedMotionStart))

  /** Bodies of all rules whose full selector list equals `selectors` (outside @media blocks too). */
  function rulesWithSelector(selectors: string): string {
    return Array.from(styleSource.matchAll(/([^{}]+)\{([^{}]*)\}/g))
      .filter((match) => match[1]!.replace(/\s+/g, ' ').trim() === selectors)
      .map((match) => match[2]!)
      .join('\n')
  }

  /** Bodies of all rules whose selector list mentions `.timeline-entry` alone or the visible modifier alone. */
  const entryRules = Array.from(styleSource.matchAll(/([^{}]+)\{([^{}]*)\}/g))
    .filter((match) =>
      match[1]!
        .split(',')
        .map((part) => part.trim())
        .some((part) => part === '.timeline-entry' || part === '.timeline-entry--visible'),
    )
    .map((match) => match[2]!)
    .join('\n')


  it('does not animate the entry itself', () => {
    expect(entryRules).not.toMatch(/opacity|transform|transition/)
  })

  it('starts dot and card hidden and 30px lower', () => {
    expect(rulesWithSelector('.timeline-entry__dot, .timeline-entry__card')).toMatch(
      /opacity:\s*0;[\s\S]*transform:\s*translateY\(30px\);/,
    )
  })

  it('moves dot and card in over 0.6s after the stagger delay', () => {
    expect(rulesWithSelector('.timeline-entry__dot, .timeline-entry__card')).toMatch(
      /transition:\s*opacity 0\.6s ease-out var\(--delay, 0s\),\s*transform 0\.6s ease-out var\(--delay, 0s\);/,
    )
  })

  it('shows dot and card in place once the entry is visible', () => {
    expect(
      rulesWithSelector('.timeline-entry--visible .timeline-entry__dot, .timeline-entry--visible .timeline-entry__card'),
    ).toMatch(/opacity:\s*1;[\s\S]*transform:\s*translateY\(0\);/)
  })

  it('shows dot and card at once under prefers-reduced-motion', () => {
    expect(reducedMotionBlock).toMatch(
      /\.timeline-entry__dot,\s*\.timeline-entry__card\s*\{\s*opacity:\s*1;\s*transform:\s*none;\s*transition:\s*none;\s*\}/,
    )
  })
})

describe('TimelineEntry — continuous axis line (source level, MS-20 R6)', () => {
  const styleSource = timelineEntrySource.slice(timelineEntrySource.indexOf('<style'))
  const rules = Array.from(styleSource.matchAll(/([^{}]+)\{([^{}]*)\}/g)).map((match) => ({
    selector: match[1]!.replace(/\s+/g, ' ').trim(),
    body: match[2]!,
  }))

  /** Bodies of all rules whose full selector list equals `selector`. */
  function rulesWithSelector(selector: string): string {
    return rules
      .filter((rule) => rule.selector === selector)
      .map((rule) => rule.body)
      .join('\n')
  }

  const axisRules = rules
    .filter((rule) => rule.selector.includes('.timeline-entry__axis'))
    .map((rule) => rule.body)
    .join('\n')

  const lineBefore = rulesWithSelector('.timeline-entry__axis::before')

  it('has no `.timeline-entry__line` rules left', () => {
    expect(styleSource).not.toContain('.timeline-entry__line')
  })

  it('does not animate the axis or its line', () => {
    expect(axisRules).not.toMatch(/opacity|transform|transition/)
  })

  it('makes the axis the containing block of the line', () => {
    expect(rulesWithSelector('.timeline-entry__axis')).toMatch(/position:\s*relative;/)
  })

  it('draws the line as an empty absolutely positioned pseudo-element', () => {
    expect(lineBefore).toMatch(/content:\s*'';[\s\S]*position:\s*absolute;/)
  })

  it('spans the line over the full entry height', () => {
    expect(lineBefore).toMatch(/top:\s*0;[\s\S]*bottom:\s*0;/)
  })

  it('centres a 2px line on whole pixels without a transform', () => {
    expect(lineBefore).toMatch(/left:\s*calc\(50% - 1px\);[\s\S]*width:\s*2px;/)
  })

  it('colours the line with primary-container', () => {
    expect(lineBefore).toMatch(/background:\s*var\(--color-primary-container\);/)
  })

  it('stacks the dot above the line', () => {
    expect(rulesWithSelector('.timeline-entry__dot')).toMatch(/position:\s*relative;[\s\S]*z-index:\s*1;/)
  })

  it('places the dot 28px below the entry top', () => {
    expect(rulesWithSelector('.timeline-entry__dot')).toMatch(/margin-top:\s*28px;/)
  })

  it('places the first entry dot 60px below the entry top', () => {
    expect(rulesWithSelector('.timeline-entry:first-child .timeline-entry__dot')).toMatch(/margin-top:\s*60px;/)
  })
})
