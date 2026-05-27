<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { useRouter } from 'vue-router'
import '@/material-web'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    href?: string
    target?: string
    to?: RouteLocationRaw
    type?: 'button' | 'submit' | 'reset'
    ariaLabel?: string
    trailingIcon?: boolean
    hasIcon?: boolean
    softDisabled?: boolean
  }>(),
  {
    disabled: false,
    type: 'button',
    trailingIcon: false,
    hasIcon: false,
    softDisabled: false,
  },
)

const router = useRouter()

async function handleClick(event: MouseEvent) {
  if (!props.to || props.disabled || props.softDisabled) {
    return
  }

  event.preventDefault()
  await router.push(props.to)
}
</script>

<template>
  <md-filled-button
    v-bind="$attrs"
    :disabled="disabled"
    :href="to ? undefined : href"
    :target="target"
    :type="to ? undefined : type"
    :aria-label="ariaLabel"
    :trailing-icon="trailingIcon || undefined"
    :has-icon="hasIcon || undefined"
    :soft-disabled="softDisabled || undefined"
    @click="handleClick"
  >
    <slot />
  </md-filled-button>
</template>

