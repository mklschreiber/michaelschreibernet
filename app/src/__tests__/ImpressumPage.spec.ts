/**
 * Testing concept — Minor Changes Round 2 (clickable phone/email links)
 *
 * Trello card: https://trello.com/c/Qd2fLMw5/11-minor-changes
 * The Trello card description is canonical for requirements. Round 2 asks
 * that every phone number and email address in Impressum, Kontakt, and
 * Profil become a clickable link. This spec covers the Impressum page's
 * "Kontakt" section: the phone number must be wrapped in a `tel:` link and
 * the email address in a `mailto:` link, with the human-readable display
 * text unchanged from what was rendered before this round.
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppNavigation from '@/components/AppNavigation.vue'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import ImpressumPage from '@/views/ImpressumPage.vue'
import de from '@/i18n/locales/de'
import en from '@/i18n/locales/en'
import type { MessageSchema } from '@/i18n/types'

function createWrapper() {
  const i18n = createI18n<[MessageSchema], 'de' | 'en'>({
    legacy: false,
    locale: 'de',
    messages: { de, en },
  })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: ['home', 'projects', 'about', 'contact'].map((name) => ({
      path: name === 'home' ? '/' : `/${name}`,
      name,
      component: { template: '<div />' },
    })),
  })
  return mount(ImpressumPage, { global: { plugins: [i18n, router] } })
}

describe('ImpressumPage', () => {
  it('renders the phone number as a tel: link with the unchanged display text', () => {
    const wrapper = createWrapper()
    const phoneLink = wrapper.find('a[href^="tel:"]')

    expect(phoneLink.exists()).toBe(true)
    expect(phoneLink.attributes('href')).toBe('tel:+491624337334')
    expect(phoneLink.text()).toBe('+49 (0) 162 4337334')
  })

  it('renders the email address as a mailto: link with the unchanged display text', () => {
    const wrapper = createWrapper()
    const emailLink = wrapper.find('a[href^="mailto:"]')

    expect(emailLink.exists()).toBe(true)
    expect(emailLink.attributes('href')).toBe('mailto:info@michaelschreiber.net')
    expect(emailLink.text()).toBe('info@michaelschreiber.net')
  })
})

// MS-20 (docs/architecture/MS-20-tests.md, D5, D6): the legal page renders the
// shared header with no active section and its own single main landmark.
describe('ImpressumPage — shared onepage header (MS-20)', () => {
  it('renders the shared AppNavigation', () => {
    expect(createWrapper().findComponent(AppNavigation).exists()).toBe(true)
  })

  it('marks no navigation link as current', () => {
    expect(createWrapper().findAll('nav a[aria-current]')).toHaveLength(0)
  })

  it('links the navigation back to the four onepage sections', () => {
    expect(createWrapper().findAll('nav.navigation a').map((link) => link.attributes('href'))).toEqual([
      '/',
      '/projects',
      '/about',
      '/contact',
    ])
  })

  it('renders exactly one main with the header outside it', () => {
    const wrapper = createWrapper()

    expect([wrapper.findAll('main').length, wrapper.findAll('main header').length]).toEqual([1, 0])
  })

  it('renders exactly one h1', () => {
    expect(createWrapper().findAll('h1')).toHaveLength(1)
  })
})
