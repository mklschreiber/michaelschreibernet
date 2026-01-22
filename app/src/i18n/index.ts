import { createI18n } from 'vue-i18n'
import de from './locales/de'
import type { MessageSchema } from './types'

const i18n = createI18n<[MessageSchema], 'de'>({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'de',
  messages: {
    de,
  },
})

export default i18n
