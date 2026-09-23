import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IconEmail from '@/components/icons/IconEmail.vue'
import IconXing from '@/components/icons/IconXing.vue'
import IconGithub from '@/components/icons/IconGithub.vue'
import IconLinkedin from '@/components/icons/IconLinkedin.vue'
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue'
import IconChevronRight from '@/components/icons/IconChevronRight.vue'

describe.each([
  ['IconEmail', IconEmail],
  ['IconXing', IconXing],
  ['IconGithub', IconGithub],
  ['IconLinkedin', IconLinkedin],
  ['IconChevronLeft', IconChevronLeft],
  ['IconChevronRight', IconChevronRight],
])('%s', (_name, component) => {
  it('renders exactly one flat, solid-fill svg with a 0 0 24 24 viewBox', () => {
    const wrapper = mount(component)
    const svgs = wrapper.findAll('svg')

    expect(svgs).toHaveLength(1)
    expect(svgs[0]?.attributes('viewBox')).toBe('0 0 24 24')
    expect(svgs[0]?.attributes('fill')).toBe('currentColor')
  })

  it('hides the icon from assistive technology, relying on the surrounding link text', () => {
    const wrapper = mount(component)

    expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true')
  })
})
