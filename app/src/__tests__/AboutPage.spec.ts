import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import AboutPage from '@/views/AboutPage.vue'
import de from '@/i18n/locales/de'
import en from '@/i18n/locales/en'
import type { MessageSchema } from '@/i18n/types'

vi.stubGlobal(
  'IntersectionObserver',
  class {
    constructor() {}
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  },
)

function createWrapper(locale: 'de' | 'en' = 'de') {
  const i18n = createI18n<[MessageSchema], 'de' | 'en'>({
    legacy: false,
    locale,
    messages: { de, en },
  })
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

  it('renders avatar with profile picture image', () => {
    const wrapper = createWrapper()
    const avatar = wrapper.find('.about-page__avatar')
    expect(avatar.exists()).toBe(true)
    const image = avatar.find('.about-page__avatar-image')
    expect(image.exists()).toBe(true)
    expect(image.attributes('src')).toBe('/profile-picture.jpeg')
    expect(image.attributes('alt')).toBe('Profilbild von Michael Schreiber')
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
    expect(emailLink.attributes('href')).toBe('mailto:info@michaelschreiber.net')
  })

  it('renders Xing link with noopener noreferrer and the localized label', () => {
    const wrapper = createWrapper()
    const xingLink = wrapper.find('a[href*="xing"]')
    expect(xingLink.exists()).toBe(true)
    expect(xingLink.attributes('rel')).toBe('noopener noreferrer')
    expect(xingLink.attributes('target')).toBe('_blank')
    expect(xingLink.text()).toContain('Xing-Profil')
  })

  it('renders LinkedIn link with the correct href, target, rel, and localized label', () => {
    const wrapper = createWrapper()
    const linkedinLink = wrapper.find('a[href="https://www.linkedin.com/in/mklschreiber"]')
    expect(linkedinLink.exists()).toBe(true)
    expect(linkedinLink.attributes('target')).toBe('_blank')
    expect(linkedinLink.attributes('rel')).toBe('noopener noreferrer')
    expect(linkedinLink.text()).toContain('LinkedIn-Profil')
  })

  it('renders LinkedIn link with the English label when locale is en', () => {
    const wrapper = createWrapper('en')
    const linkedinLink = wrapper.find('a[href="https://www.linkedin.com/in/mklschreiber"]')
    expect(linkedinLink.text()).toContain('LinkedIn Profile')
  })

  it('renders GitHub link with the correct href, target, rel, and localized label', () => {
    const wrapper = createWrapper()
    const githubLink = wrapper.find('a[href="https://github.com/mklschreiber"]')
    expect(githubLink.exists()).toBe(true)
    expect(githubLink.attributes('target')).toBe('_blank')
    expect(githubLink.attributes('rel')).toBe('noopener noreferrer')
    expect(githubLink.text()).toContain('GitHub-Profil')
  })

  it('renders GitHub link with the English label when locale is en', () => {
    const wrapper = createWrapper('en')
    const githubLink = wrapper.find('a[href="https://github.com/mklschreiber"]')
    expect(githubLink.text()).toContain('GitHub Profile')
  })

  it('renders exactly four business-card links, each with an icon', () => {
    const wrapper = createWrapper()
    const links = wrapper.findAll('.about-page__links > .about-page__link')
    expect(links).toHaveLength(4)
    links.forEach((link) => {
      expect(link.find('.about-page__link-icon svg').exists()).toBe(true)
    })
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
    expect(entries[0]?.attributes('data-entry-id')).toBe('mercedesBenz')
  })

  it('alternates sides left/right', () => {
    const wrapper = createWrapper()
    const entries = wrapper.findAll('[data-entry-id]')
    expect(entries[0]?.classes()).toContain('timeline-entry--left')
    expect(entries[1]?.classes()).toContain('timeline-entry--right')
    expect(entries[2]?.classes()).toContain('timeline-entry--left')
  })

  it('renders title in English when locale is en', () => {
    const wrapper = createWrapper('en')
    expect(wrapper.find('.about-page__name').text()).toBe('Michael Schreiber')
    // Timeline section's aria-label should be in English (no visible heading)
    expect(wrapper.find('section[aria-label]').attributes('aria-label')).toBe(
      'Professional Experience',
    )
  })
})
