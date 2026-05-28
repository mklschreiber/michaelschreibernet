import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'
import router from '../router'
import i18n from '../i18n'

describe('App', () => {
  it('shows the footer with legal links', async () => {
    router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [router, i18n],
      },
    })

    expect(wrapper.text()).toContain('Impressum')
    expect(wrapper.text()).toContain('Datenschutz')
    expect(wrapper.text()).toContain('Copyright 2026 - michaelschreiber.net')
  })
})
