/**
 * Testing concept — MS-15 Update Profile (business-card link row)
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-15
 * Concept: docs/architecture/MS-15-update-profile.md
 *
 * Component level (Vue Test Utils, jsdom), because the change is static
 * markup plus i18n labels:
 * - Xing is gone: no `a[href*="xing"]` and no "Xing" text in the card.
 * - New phone chip: `tel:+491624337334`, no `target`/`rel` (local handler,
 *   like `mailto:`), label "Telefon" / "Phone" (label, not the number — §5).
 * - New Facebook and Instagram chips: exact href (Instagram with trailing
 *   slash), `target="_blank"`, `rel="noopener noreferrer"`, de and en label.
 * - Link order: Email, Phone, LinkedIn, GitHub, Facebook, Instagram (§4).
 * Icon render contract is covered in icons.spec.ts.
 */
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
      { path: '/imprint', component: { template: '<div />' } },
      { path: '/privacy', component: { template: '<div />' } },
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

  it('renders no Xing link', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('a[href*="xing"]').exists()).toBe(false)
  })

  it('renders no Xing label in the business card', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.about-page__links').text()).not.toMatch(/xing/i)
  })

  it('renders the phone link with the new tel: href and the German label', () => {
    const wrapper = createWrapper()
    const phoneLink = wrapper.find('.about-page__links a[href^="tel:"]')
    expect(phoneLink.attributes('href')).toBe('tel:+491624337334')
    expect(phoneLink.text()).toBe('Telefon')
  })

  it('renders the phone link with the English label when locale is en', () => {
    const wrapper = createWrapper('en')
    const phoneLink = wrapper.find('.about-page__links a[href="tel:+491624337334"]')
    expect(phoneLink.text()).toBe('Phone')
  })

  it('renders the phone link without target and rel', () => {
    const wrapper = createWrapper()
    const phoneLink = wrapper.find('.about-page__links a[href="tel:+491624337334"]')
    expect(phoneLink.attributes()).not.toHaveProperty('target')
    expect(phoneLink.attributes()).not.toHaveProperty('rel')
  })

  it('renders Facebook link with the correct href, target, rel, and localized label', () => {
    const wrapper = createWrapper()
    const facebookLink = wrapper.find('a[href="https://www.facebook.com/mklschreiber"]')
    expect(facebookLink.exists()).toBe(true)
    expect(facebookLink.attributes('target')).toBe('_blank')
    expect(facebookLink.attributes('rel')).toBe('noopener noreferrer')
    expect(facebookLink.text()).toBe('Facebook-Profil')
  })

  it('renders Facebook link with the English label when locale is en', () => {
    const wrapper = createWrapper('en')
    const facebookLink = wrapper.find('a[href="https://www.facebook.com/mklschreiber"]')
    expect(facebookLink.text()).toBe('Facebook Profile')
  })

  it('renders Instagram link with the correct href, target, rel, and localized label', () => {
    const wrapper = createWrapper()
    const instagramLink = wrapper.find('a[href="https://www.instagram.com/mklschreiber/"]')
    expect(instagramLink.exists()).toBe(true)
    expect(instagramLink.attributes('target')).toBe('_blank')
    expect(instagramLink.attributes('rel')).toBe('noopener noreferrer')
    expect(instagramLink.text()).toBe('Instagram-Profil')
  })

  it('renders Instagram link with the English label when locale is en', () => {
    const wrapper = createWrapper('en')
    const instagramLink = wrapper.find('a[href="https://www.instagram.com/mklschreiber/"]')
    expect(instagramLink.text()).toBe('Instagram Profile')
  })

  it('renders the business-card links in the order Email, Phone, LinkedIn, GitHub, Facebook, Instagram', () => {
    const wrapper = createWrapper()
    const hrefs = wrapper
      .findAll('.about-page__links > .about-page__link')
      .map((link) => link.attributes('href'))
    expect(hrefs).toEqual([
      'mailto:info@michaelschreiber.net',
      'tel:+491624337334',
      'https://www.linkedin.com/in/mklschreiber',
      'https://github.com/mklschreiber',
      'https://www.facebook.com/mklschreiber',
      'https://www.instagram.com/mklschreiber/',
    ])
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

  it('renders exactly six business-card links, each with an icon', () => {
    const wrapper = createWrapper()
    const links = wrapper.findAll('.about-page__links > .about-page__link')
    expect(links).toHaveLength(6)
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
