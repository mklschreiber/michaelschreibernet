import { createI18n } from 'vue-i18n'
import en from './locales/en'
import de from './locales/de'
import type { MessageSchema } from './types'

const i18n = createI18n<[MessageSchema], 'en' | 'de'>({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'en',
  globalInjection: true,
  messages: {
    en,
    de,
  },
})

export default i18n
