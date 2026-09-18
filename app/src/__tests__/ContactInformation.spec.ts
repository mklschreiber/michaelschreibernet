/**
 * Testing concept — Minor Changes Round 2 (clickable phone/email links)
 *
 * Trello card: https://trello.com/c/Qd2fLMw5/11-minor-changes
 * The Trello card description is canonical for requirements. This spec
 * covers the Kontakt page's ContactInformation component, where the
 * localized `contact.emailValue`/`contact.phoneValue` text is wrapped in
 * hardcoded `mailto:`/`tel:` links (the href is not derived from the i18n
 * value, per the architecture concept's decision — see
 * docs/architecture/minor-changes.md, Round 2 §10). Assertions compare the
 * link text against `t('contact.emailValue')`/`t('contact.phoneValue')`
 * rather than a hardcoded string, so this test doesn't duplicate ownership
 * of the display text.
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ContactInformation from '@/components/ContactInformation.vue'
import de from '@/i18n/locales/de'
import en from '@/i18n/locales/en'
import type { MessageSchema } from '@/i18n/types'

function createWrapper() {
  const i18n = createI18n<[MessageSchema], 'de' | 'en'>({
    legacy: false,
    locale: 'de',
    messages: { de, en },
  })
  const wrapper = mount(ContactInformation, { global: { plugins: [i18n] } })
  return { wrapper, t: i18n.global.t }
}

describe('ContactInformation', () => {
  it('renders the email as a mailto: link with the localized display text', () => {
    const { wrapper, t } = createWrapper()
    const emailLink = wrapper.find('a[href^="mailto:"]')

    expect(emailLink.exists()).toBe(true)
    expect(emailLink.attributes('href')).toBe('mailto:info@michaelschreiber.net')
    expect(emailLink.text()).toBe(t('contact.emailValue'))
  })

  it('renders the phone number as a tel: link with the localized display text', () => {
    const { wrapper, t } = createWrapper()
    const phoneLink = wrapper.find('a[href^="tel:"]')

    expect(phoneLink.exists()).toBe(true)
    expect(phoneLink.attributes('href')).toBe('tel:+4915679724718')
    expect(phoneLink.text()).toBe(t('contact.phoneValue'))
  })
})
