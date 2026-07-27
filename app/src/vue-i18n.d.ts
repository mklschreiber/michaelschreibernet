import 'vue-i18n'
import type { MessageSchema } from './i18n/types'

declare module 'vue-i18n' {
  // Keeps this declaration an augmentation instead of replacing vue-i18n's exports.
  // The optional marker avoids an empty-interface lint fix while retaining the schema.
  export interface DefineLocaleMessage extends MessageSchema {
    readonly __messageSchema?: never
  }
}
