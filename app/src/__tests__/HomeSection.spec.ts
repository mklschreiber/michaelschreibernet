/**
 * Testing concept — MS-20 Redesign onepager (HomeSection)
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-20
 * Architecture: docs/architecture/MS-20-redesign-onepager.md (D4, D6, D7, D14).
 * Design: docs/design/MS-20-1/README.md ("Home").
 * Test concept: docs/architecture/MS-20-tests.md.
 *
 * Component level (memory router with the four section routes, real de/en
 * locales): the section is `#home`, labelled by its `h1` "Willkommen" /
 * "Welcome", shows the design subtitle and the AnimatedLogo (AC-5), and the
 * round scroll button is a real link to the projects route with the
 * localized accessible name and an `aria-hidden` arrow icon. Clicking it
 * navigates to `projects` (scrolling itself is covered by the router and
 * useSectionNavigation specs). Source level: the `hero-rise` entry
 * animation is kept (D7).
 */
import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter } from 'vue-router'
import HomeSection from '@/components/sections/HomeSection.vue'
import homeSectionSource from '@/components/sections/HomeSection.vue?raw'
import AnimatedLogo from '@/components/AnimatedLogo.vue'
import de from '@/i18n/locales/de'
import en from '@/i18n/locales/en'
import type { MessageSchema } from '@/i18n/types'

async function mountHome(locale: 'de' | 'en' = 'de') {
  const i18n = createI18n<[MessageSchema], 'de' | 'en'>({
    legacy: false,
    locale,
    messages: { de, en },
  })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: ['home', 'projects', 'about', 'contact'].map((name) => ({
      path: name === 'home' ? '/' : `/${name}`,
      name,
      component: { render: () => null },
    })),
  })
  await router.push('/')
  const wrapper = mount(HomeSection, { global: { plugins: [i18n, router] } })
  return { wrapper, router }
}

describe('HomeSection', () => {
  it('renders the section with the id home', async () => {
    const { wrapper } = await mountHome()

    expect(wrapper.get('section').attributes('id')).toBe('home')
  })

  it('labels the section with its h1', async () => {
    const { wrapper } = await mountHome()

    expect(wrapper.get('section').attributes('aria-labelledby')).toBe(wrapper.get('h1').attributes('id'))
  })

  it('shows the German welcome heading', async () => {
    const { wrapper } = await mountHome('de')

    expect(wrapper.get('h1').text()).toBe('Willkommen')
  })

  it('shows the English welcome heading', async () => {
    const { wrapper } = await mountHome('en')

    expect(wrapper.get('h1').text()).toBe('Welcome')
  })

  it('shows the German design subtitle', async () => {
    const { wrapper } = await mountHome('de')

    expect(wrapper.get('.home-section__subtitle').text()).toBe(
      'Entdecke meine Projekte und nimm Kontakt auf.',
    )
  })

  it('renders the animated MS logo', async () => {
    const { wrapper } = await mountHome()

    expect(wrapper.findComponent(AnimatedLogo).exists()).toBe(true)
  })

  it('links the scroll button to the projects route', async () => {
    const { wrapper } = await mountHome()

    expect(wrapper.get('a.home-section__scroll').attributes('href')).toBe('/projects')
  })

  it('names the scroll button in German', async () => {
    const { wrapper } = await mountHome('de')

    expect(wrapper.get('a.home-section__scroll').attributes('aria-label')).toBe('Zu „Projekte“ scrollen')
  })

  it('names the scroll button in English', async () => {
    const { wrapper } = await mountHome('en')

    expect(wrapper.get('a.home-section__scroll').attributes('aria-label')).toBe('Scroll to “Projects”')
  })

  it('hides the arrow icon from assistive technology', async () => {
    const { wrapper } = await mountHome()

    expect(wrapper.get('a.home-section__scroll svg').attributes('aria-hidden')).toBe('true')
  })

  it('navigates to the projects section on click', async () => {
    const { wrapper, router } = await mountHome()

    await wrapper.get('a.home-section__scroll').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('projects')
  })

  it('keeps the hero-rise entry animation', () => {
    expect(homeSectionSource).toMatch(/@keyframes hero-rise\s*\{/)
  })
})
