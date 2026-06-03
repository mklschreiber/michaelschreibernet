import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import AboutPage from '@/views/AboutPage.vue'
import de from '@/i18n/locales/de'
import en from '@/i18n/locales/en'

vi.stubGlobal(
  'IntersectionObserver',
  class {
    constructor(_cb: unknown) {}
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  },
)

function createWrapper(locale = 'de') {
  const i18n = createI18n({ legacy: false, locale, messages: { de, en } })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/about', component: { template: '<div />' } },
      { path: '/projects', component: { template: '<div />' } },
      { path: '/contact', component: { template: '<div />' } },
      { path: '/impressum', component: { template: '<div />' } },
      { path: '/datenschutz', component: { template: '<div />' } },
    ],
  })
  return mount(AboutPage, { global: { plugins: [i18n, router] } })
}

describe('AboutPage', () => {
  it('renders navigation', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('nav').exists()).toBe(true)
  })

  it('renders avatar with initials MS', () => {
    const wrapper = createWrapper()
    const avatar = wrapper.find('.about-page__avatar')
    expect(avatar.exists()).toBe(true)
    expect(avatar.find('.about-page__initials').text()).toBe('MS')
  })

  it('renders name', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.about-page__name').text()).toBe('Michael Schreiber')
  })

  it('renders role', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.about-page__role').text()).toBe('Senior Software Engineer')
  })

  it('renders email link with mailto href', () => {
    const wrapper = createWrapper()
    const emailLink = wrapper.find('a[href^="mailto:"]')
    expect(emailLink.exists()).toBe(true)
    expect(emailLink.attributes('href')).toBe('mailto:michael.schreiber@outlook.com')
  })

  it('renders Xing link with noopener noreferrer', () => {
    const wrapper = createWrapper()
    const xingLink = wrapper.find('a[href*="xing"]')
    expect(xingLink.exists()).toBe(true)
    expect(xingLink.attributes('rel')).toBe('noopener noreferrer')
    expect(xingLink.attributes('target')).toBe('_blank')
  })

  it('renders timeline section with aria-label', () => {
    const wrapper = createWrapper()
    const section = wrapper.find('section[aria-label]')
    expect(section.exists()).toBe(true)
  })

  it('renders ol element for timeline', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('ol').exists()).toBe(true)
  })

  it('renders all 8 timeline entries', () => {
    const wrapper = createWrapper()
    const entries = wrapper.findAll('[data-entry-id]')
    expect(entries).toHaveLength(8)
  })

  it('first entry has data-entry-id mercedesBenz (most recent)', () => {
    const wrapper = createWrapper()
    const entries = wrapper.findAll('[data-entry-id]')
    expect(entries[0].attributes('data-entry-id')).toBe('mercedesBenz')
  })

  it('alternates sides left/right', () => {
    const wrapper = createWrapper()
    const entries = wrapper.findAll('[data-entry-id]')
    expect(entries[0].classes()).toContain('timeline-entry--left')
    expect(entries[1].classes()).toContain('timeline-entry--right')
    expect(entries[2].classes()).toContain('timeline-entry--left')
  })

  it('renders title in English when locale is en', () => {
    const wrapper = createWrapper('en')
    expect(wrapper.find('.about-page__name').text()).toBe('Michael Schreiber')
    // Timeline title should be in English
    expect(wrapper.find('.about-page__timeline-title').text()).toBe('Professional Experience')
  })
})

