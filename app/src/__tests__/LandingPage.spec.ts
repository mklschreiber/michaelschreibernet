/**
 * Testing concept — MS-17 Animated SVG Logo Instead of GIF (LandingPage)
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-17
 * Architecture: docs/architecture/MS-17-animated-svg-logo.md (D7, D9).
 * Test concept: docs/architecture/MS-17-tests.md.
 *
 * - Component level (Vue Test Utils + real de/en locales): the hero logo is
 *   the inline `AnimatedLogo` root (`svg.hero__logo.animated-logo`), placed
 *   before the `h1`, with the localized `aria-label` (AC 5).
 * - AC 6: no `img` element with the old GIF is rendered, and the GIF file no
 *   longer exists in `app/public/` (Node `fs`).
 */
import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'
import de from '@/i18n/locales/de'
import en from '@/i18n/locales/en'
import type { MessageSchema } from '@/i18n/types'

// jsdom gives import.meta.url an http scheme, so resolve from the module directory.
const publicDir = resolve(__dirname, '../../public')

function mountLandingPage(locale: 'de' | 'en' = 'de') {
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
    ],
  })

  return mount(LandingPage, {
    global: {
      plugins: [i18n, router],
    },
  })
}

describe('LandingPage', () => {
  it('renders the hero logo as the inline AnimatedLogo svg', () => {
    const wrapper = mountLandingPage()

    expect(wrapper.find('svg.hero__logo.animated-logo').exists()).toBe(true)
  })

  it('renders the animated logo above the welcome heading', () => {
    const wrapper = mountLandingPage()
    const logo = wrapper.get('.hero__logo')
    const heading = wrapper.get('h1')

    expect(logo.element.compareDocumentPosition(heading.element) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0)
  })

  it('labels the logo with the German landing.logoAlt text', () => {
    const wrapper = mountLandingPage('de')

    expect(wrapper.get('.hero__logo').attributes('aria-label')).toBe(
      'Animiertes michaelschreiber.net Logo als verbundenes IT-Netzwerk',
    )
  })

  it('labels the logo with the English landing.logoAlt text', () => {
    const wrapper = mountLandingPage('en')

    expect(wrapper.get('.hero__logo').attributes('aria-label')).toBe(
      'Animated michaelschreiber.net logo as a connected IT network',
    )
  })

  it('does not render the old GIF', () => {
    const wrapper = mountLandingPage()

    expect(wrapper.find('img[src="/logo_anim.gif"]').exists()).toBe(false)
  })

  it('does not render any img element in the hero', () => {
    const wrapper = mountLandingPage()

    expect(wrapper.findAll('.hero img')).toHaveLength(0)
  })

  it('no longer ships logo_anim.gif in app/public', () => {
    expect(existsSync(resolve(publicDir, 'logo_anim.gif'))).toBe(false)
  })
})
