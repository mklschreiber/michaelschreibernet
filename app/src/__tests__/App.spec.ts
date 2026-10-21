import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'
import router from '../router'
import i18n from '../i18n'

async function mountApp() {
  router.push('/')
  await router.isReady()

  return mount(App, {
    global: {
      plugins: [router, i18n],
    },
  })
}

function legalLinkHref(wrapper: Awaited<ReturnType<typeof mountApp>>, text: string) {
  return wrapper
    .findAll('.legal-link')
    .find((link) => link.text() === text)
    ?.attributes('href')
}

describe('App', () => {
  it('shows the footer with legal links', async () => {
    const wrapper = await mountApp()

    expect(wrapper.text()).toContain('Impressum')
    expect(wrapper.text()).toContain('Datenschutz')
    expect(wrapper.text()).toContain('Copyright 2026 - michaelschreiber.net')
  })

  // MS-16: footer links point to the English paths; labels stay German.
  it('links the Impressum footer entry to the English /imprint path', async () => {
    const wrapper = await mountApp()

    expect(legalLinkHref(wrapper, 'Impressum')).toMatch(/#\/imprint$/)
  })

  it('links the Datenschutz footer entry to the English /privacy path', async () => {
    const wrapper = await mountApp()

    expect(legalLinkHref(wrapper, 'Datenschutz')).toMatch(/#\/privacy$/)
  })
})
