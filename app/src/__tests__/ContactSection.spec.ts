/**
 * Testing concept — MS-20 Redesign onepager (ContactSection + ContactForm)
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-20
 * Architecture: docs/architecture/MS-20-redesign-onepager.md (D6, D7, D14).
 * Design: docs/design/MS-20-1/README.md ("Kontakt").
 * Test concept: docs/architecture/MS-20-tests.md.
 *
 * Component level (real de/en locales, `fetch` stubbed with `vi.fn`):
 * - Section: `#contact` labelled by its `h2` "Kontakt", subtitle "Lass uns in
 *   Verbindung treten" (de) / "Let's get in touch" (en), contains the form.
 * - Form: the `contact-` prefixed ids are wired to their labels, the
 *   design placeholders ("du" form), the submit button "Nachricht senden"
 *   with the send icon.
 * - Unchanged Formspree behaviour (regression, the form had no spec): POST
 *   with the JSON body, success message and reset fields, the new "du"
 *   success/error texts, the success message hidden again after 5 s.
 * Asynchronous work is awaited with `flushPromises`; only `setTimeout` is
 * faked (for the 5 s message timeout), no fixed delays.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ContactSection from '@/components/sections/ContactSection.vue'
import ContactForm from '@/components/ContactForm.vue'
import de from '@/i18n/locales/de'
import en from '@/i18n/locales/en'
import type { MessageSchema } from '@/i18n/types'

const fetchMock = vi.fn()

function mountContact(locale: 'de' | 'en' = 'de') {
  const i18n = createI18n<[MessageSchema], 'de' | 'en'>({
    legacy: false,
    locale,
    messages: { de, en },
  })
  return mount(ContactSection, { global: { plugins: [i18n] } })
}

async function fillAndSubmit(wrapper: VueWrapper) {
  await wrapper.get('#contact-name').setValue('Erika Muster')
  await wrapper.get('#contact-email').setValue('erika@example.com')
  await wrapper.get('#contact-message').setValue('Hallo!')
  await wrapper.get('form').trigger('submit')
  await flushPromises()
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('ContactSection', () => {
  it('renders the section with the id contact', () => {
    expect(mountContact().get('section').attributes('id')).toBe('contact')
  })

  it('labels the section with its h2', () => {
    const wrapper = mountContact()

    expect(wrapper.get('section').attributes('aria-labelledby')).toBe(wrapper.get('h2').attributes('id'))
  })

  it('shows the German title', () => {
    expect(mountContact('de').get('h2').text()).toBe('Kontakt')
  })

  it('shows the German design subtitle', () => {
    expect(mountContact('de').get('.section__subtitle').text()).toBe('Lass uns in Verbindung treten')
  })

  it('shows the English subtitle', () => {
    expect(mountContact('en').get('.section__subtitle').text()).toBe("Let's get in touch")
  })

  it('contains the contact form', () => {
    expect(mountContact().findComponent(ContactForm).exists()).toBe(true)
  })
})

describe('ContactForm fields (MS-20)', () => {
  it.each([
    ['contact-name', 'Name'],
    ['contact-email', 'E-Mail'],
    ['contact-message', 'Nachricht'],
  ])('labels #%s with "%s"', (id, label) => {
    const wrapper = mountContact()

    expect(wrapper.get(`label[for="${id}"]`).text()).toBe(label)
  })

  it.each(['contact-name', 'contact-email', 'contact-message'])('renders a field for the label of #%s', (id) => {
    expect(mountContact().find(`#${id}.form-field`).exists()).toBe(true)
  })

  it.each([
    ['contact-name', 'Dein Name'],
    ['contact-email', 'deine.email@example.com'],
    ['contact-message', 'Deine Nachricht'],
  ])('shows the German placeholder for #%s', (id, placeholder) => {
    expect(mountContact('de').get(`#${id}`).attributes('placeholder')).toBe(placeholder)
  })

  it('shows the English e-mail placeholder', () => {
    expect(mountContact('en').get('#contact-email').attributes('placeholder')).toBe('your.email@example.com')
  })

  it('labels the e-mail field "Email" in English', () => {
    expect(mountContact('en').get('label[for="contact-email"]').text()).toBe('Email')
  })

  it('keeps the e-mail field type for validation', () => {
    expect(mountContact().get('#contact-email').attributes('type')).toBe('email')
  })

  it('requires all three fields', () => {
    const wrapper = mountContact()

    expect(
      ['#contact-name', '#contact-email', '#contact-message'].map((selector) =>
        wrapper.get(selector).attributes('required'),
      ),
    ).toEqual(['', '', ''])
  })

  it('shows the German submit label', () => {
    expect(mountContact('de').get('button[type="submit"]').text()).toBe('Nachricht senden')
  })

  it('renders the send icon in the submit button', () => {
    expect(mountContact().find('button[type="submit"] svg[aria-hidden="true"]').exists()).toBe(true)
  })
})

describe('ContactForm submission (regression)', () => {
  it('posts the form data as JSON to Formspree', async () => {
    fetchMock.mockResolvedValue({ ok: true })
    const wrapper = mountContact()

    await fillAndSubmit(wrapper)

    expect(fetchMock).toHaveBeenCalledWith('https://formspree.io/f/xlggqdgn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Erika Muster',
        email: 'erika@example.com',
        message: 'Hallo!',
        _replyto: 'erika@example.com',
      }),
    })
  })

  it('shows the German success message after a successful submit', async () => {
    fetchMock.mockResolvedValue({ ok: true })
    const wrapper = mountContact('de')

    await fillAndSubmit(wrapper)

    expect(wrapper.get('.form-message--success').text()).toBe(
      'Vielen Dank für deine Nachricht! Ich melde mich bald bei dir.',
    )
  })

  it('clears the fields after a successful submit', async () => {
    fetchMock.mockResolvedValue({ ok: true })
    const wrapper = mountContact()

    await fillAndSubmit(wrapper)

    expect(
      ['#contact-name', '#contact-email', '#contact-message'].map(
        (selector) => (wrapper.get(selector).element as HTMLInputElement).value,
      ),
    ).toEqual(['', '', ''])
  })

  it('hides the success message after 5 seconds', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout'] })
    fetchMock.mockResolvedValue({ ok: true })
    const wrapper = mountContact()
    await fillAndSubmit(wrapper)

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(wrapper.find('.form-message--success').exists()).toBe(false)
  })

  it('shows the German error message when Formspree rejects the request', async () => {
    fetchMock.mockResolvedValue({ ok: false })
    const wrapper = mountContact('de')

    await fillAndSubmit(wrapper)

    expect(wrapper.get('.form-message--error').text()).toBe(
      'Beim Senden der Nachricht gab es ein Problem. Bitte versuche es erneut.',
    )
  })

  it('shows the error message on a network failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockRejectedValue(new Error('offline'))
    const wrapper = mountContact('de')

    await fillAndSubmit(wrapper)

    expect(wrapper.find('.form-message--error').exists()).toBe(true)
  })

  it('keeps the entered values after an error', async () => {
    fetchMock.mockResolvedValue({ ok: false })
    const wrapper = mountContact()

    await fillAndSubmit(wrapper)

    expect((wrapper.get('#contact-name').element as HTMLInputElement).value).toBe('Erika Muster')
  })
})
