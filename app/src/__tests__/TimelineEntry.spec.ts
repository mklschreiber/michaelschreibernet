import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import TimelineEntry from '@/components/TimelineEntry.vue'
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

  it('renders connector element (gestrichelte Linie)', () => {
    const wrapper = createWrapper({ entry: mockEntry, side: 'left', isVisible: false })
    expect(wrapper.find('.timeline-entry__connector').exists()).toBe(true)
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

