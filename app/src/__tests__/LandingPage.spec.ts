import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'
import de from '@/i18n/locales/de'
import en from '@/i18n/locales/en'
import type { MessageSchema } from '@/i18n/types'

describe('LandingPage', () => {
  it('renders the animated logo above the welcome heading', () => {
    const i18n = createI18n<[MessageSchema], 'de' | 'en'>({
      legacy: false,
      locale: 'de',
      messages: { de, en },
    })
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div />' } },
        { path: '/about', component: { template: '<div />' } },
        { path: '/projects', component: { template: '<div />' } },
        { path: '/contact', component: { template: '<div />' } },
      ],
    })

    const wrapper = mount(LandingPage, {
      global: {
        plugins: [i18n, router],
      },
    })
    const logo = wrapper.get('.hero__logo')
    const heading = wrapper.get('h1')

    expect(logo.attributes('src')).toBe('/logo_anim.gif')
    expect(logo.attributes('alt')).toBe('Animiertes michaelschreiber.net Logo als verbundenes IT-Netzwerk')
    expect(logo.element.compareDocumentPosition(heading.element) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0)
  })
})
