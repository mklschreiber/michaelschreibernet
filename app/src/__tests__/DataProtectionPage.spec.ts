/**
 * Testing concept — Minor Changes Round 2 (clickable phone/email links)
 *
 * Trello card: https://trello.com/c/Qd2fLMw5/11-minor-changes
 * The Trello card description is canonical for requirements. This spec
 * covers the "Hinweis zur verantwortlichen Stelle" section of the
 * Datenschutz page, where the same phone/email pair as ImpressumPage.vue
 * must each individually become a `tel:`/`mailto:` link. This is a long,
 * mostly-static legal page, so the assertions query narrowly by href
 * pattern rather than snapshotting the whole rendered page.
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import DataProtectionPage from '@/views/DataProtectionPage.vue'
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
    routes: [{ path: '/', component: { template: '<div />' } }],
  })
  return mount(DataProtectionPage, { global: { plugins: [i18n, router] } })
}

describe('DataProtectionPage', () => {
  it('renders the responsible-party phone number as a tel: link with the unchanged display text', () => {
    const wrapper = createWrapper()
    const phoneLink = wrapper.find('a[href^="tel:"]')

    expect(phoneLink.exists()).toBe(true)
    expect(phoneLink.attributes('href')).toBe('tel:+4915679724718')
    expect(phoneLink.text()).toBe('+49 (0) 15679 724718')
  })

  it('renders the responsible-party email address as a mailto: link with the unchanged display text', () => {
    const wrapper = createWrapper()
    const emailLink = wrapper.find('a[href^="mailto:"]')

    expect(emailLink.exists()).toBe(true)
    expect(emailLink.attributes('href')).toBe('mailto:info@michaelschreiber.net')
    expect(emailLink.text()).toBe('info@michaelschreiber.net')
  })
})
