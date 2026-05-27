import type { DefineComponent } from 'vue'

type ButtonType = 'button' | 'submit' | 'reset'

interface MaterialWebButtonProps {
  disabled?: boolean
  href?: string
  target?: string
  type?: ButtonType
  ariaLabel?: string
  trailingIcon?: boolean
  hasIcon?: boolean
  softDisabled?: boolean
}

declare module 'vue' {
  export interface GlobalComponents {
    'md-filled-button': DefineComponent<MaterialWebButtonProps>
    'md-outlined-button': DefineComponent<MaterialWebButtonProps>
  }
}

export {}

