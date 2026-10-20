import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IconEmail from '@/components/icons/IconEmail.vue'
import IconGithub from '@/components/icons/IconGithub.vue'
import IconLinkedin from '@/components/icons/IconLinkedin.vue'
import IconPhone from '@/components/icons/IconPhone.vue'
import IconFacebook from '@/components/icons/IconFacebook.vue'
import IconInstagram from '@/components/icons/IconInstagram.vue'
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue'
import IconChevronRight from '@/components/icons/IconChevronRight.vue'

describe.each([
  ['IconEmail', IconEmail],
  ['IconGithub', IconGithub],
  ['IconLinkedin', IconLinkedin],
  ['IconPhone', IconPhone],
  ['IconFacebook', IconFacebook],
  ['IconInstagram', IconInstagram],
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

  it('draws a single solid path without a stroke', () => {
    const wrapper = mount(component)
    const paths = wrapper.findAll('svg path')

    expect(paths).toHaveLength(1)
    expect(wrapper.find('svg').attributes()).not.toHaveProperty('stroke')
    expect(paths[0]?.attributes()).not.toHaveProperty('stroke')
  })

  it('hides the icon from assistive technology, relying on the surrounding link text', () => {
    const wrapper = mount(component)

    expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true')
  })
})

describe('icon set', () => {
  it('no longer contains the removed IconXing component (MS-15)', () => {
    const iconFiles = Object.keys(import.meta.glob('@/components/icons/*.vue'))

    expect(iconFiles).not.toContain('/src/components/icons/IconXing.vue')
  })
})
