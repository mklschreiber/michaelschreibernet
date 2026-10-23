<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { BRAND_SEGMENTS, BRAND_TITLE, useBrandTitle } from '@/composables/useBrandTitle'
import { useSectionNavigation } from '@/composables/useSectionNavigation'
import type { SectionId } from '@/composables/useSectionNavigation'
import IconMenu from '@/components/icons/IconMenu.vue'
import IconClose from '@/components/icons/IconClose.vue'

withDefaults(defineProps<{ activeSection?: SectionId | null }>(), {
  activeSection: null,
})

const { t } = useI18n()
const route = useRoute()
const { sectionHref, goToSection } = useSectionNavigation()
const { first, strong, tld, phase, onPointerEnter, onPointerLeave } = useBrandTitle()
const fullFirst = BRAND_TITLE.slice(...BRAND_SEGMENTS.first)
const fullStrong = BRAND_TITLE.slice(...BRAND_SEGMENTS.strong)
const fullTld = BRAND_TITLE.slice(...BRAND_SEGMENTS.tld)

const navItems: { id: SectionId; labelKey: string }[] = [
  { id: 'home', labelKey: 'nav.home' },
  { id: 'projects', labelKey: 'nav.projects' },
  { id: 'about', labelKey: 'nav.about' },
  { id: 'contact', labelKey: 'nav.contact' },
]

const isMenuOpen = ref(false)
const menuButton = ref<HTMLButtonElement | null>(null)

function toggleMenu(): void {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu(): void {
  isMenuOpen.value = false
}

function onSectionClick(id: SectionId, event: MouseEvent): void {
  closeMenu()
  void goToSection(id, event)
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape' || !isMenuOpen.value) return
  closeMenu()
  menuButton.value?.focus()
}

watch(
  () => route.fullPath,
  () => closeMenu(),
)

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <header class="nav-header">
    <div class="nav-container">
      <a
        class="brand"
        :href="sectionHref('home')"
        @click="onSectionClick('home', $event)"
        @pointerenter="onPointerEnter"
        @pointerleave="onPointerLeave"
      >
        <span class="brand__mark" aria-hidden="true">
          <img class="brand__mark-image" src="/logo_simple_white.svg" alt="" />
        </span>
        <span class="brand__name">
          <span class="brand__sr">{{ BRAND_TITLE }}</span>
          <span class="brand__title" aria-hidden="true" :data-phase="phase">
            <span class="brand__ghost"
              ><span class="brand__first">{{ fullFirst }}</span
              ><span class="brand__strong">{{ fullStrong }}</span
              ><span class="brand__tld">{{ fullTld }}</span
              ><span class="brand__cursor"></span
            ></span>
            <span class="brand__typed"
              ><span class="brand__first">{{ first }}</span
              ><span class="brand__strong">{{ strong }}</span
              ><span class="brand__tld">{{ tld }}</span
              ><span
                class="brand__cursor"
                :class="{ 'brand__cursor--blinking': phase === 'idle' }"
              ></span
            ></span>
          </span>
        </span>
      </a>

      <button
        ref="menuButton"
        type="button"
        class="menu-button"
        :aria-label="t('nav.menu')"
        :aria-expanded="isMenuOpen"
        aria-controls="main-navigation"
        @click="toggleMenu"
      >
        <span class="menu-button__icon">
          <IconClose v-if="isMenuOpen" />
          <IconMenu v-else />
        </span>
      </button>

      <nav
        id="main-navigation"
        :class="['navigation', { 'is-open': isMenuOpen }]"
        :aria-label="t('nav.mainLabel')"
      >
        <a
          v-for="item in navItems"
          :key="item.id"
          :href="sectionHref(item.id)"
          :class="['nav-link', { 'is-active': activeSection === item.id }]"
          :aria-current="activeSection === item.id ? 'true' : undefined"
          @click="onSectionClick(item.id, $event)"
          >{{ t(item.labelKey) }}</a
        >
      </nav>
    </div>
  </header>
</template>

<style scoped>
.nav-header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  height: var(--nav-height);
  background: color-mix(in srgb, var(--color-surface) 70%, transparent);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  backdrop-filter: blur(16px) saturate(1.4);
  border-bottom: 1px solid var(--color-outline-variant);
}

.nav-container {
  max-width: calc(var(--container-max-width) + 2 * var(--page-padding-inline));
  height: 100%;
  margin: 0 auto;
  padding: 0 var(--page-padding-inline);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-lg);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-3);
  color: var(--color-on-surface);
  text-decoration: none;
  flex-shrink: 0;
}

.brand__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  padding: 8px;
  border-radius: var(--radius-md);
  background: var(--gradient-brand-mark);
}

.brand__mark-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.brand__name {
  font-size: 24px;
  line-height: 32px;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.brand__first,
.brand__tld {
  font-weight: var(--font-weight-normal);
}

.brand__strong {
  font-weight: var(--font-weight-bold);
}

.brand__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

.brand__title {
  display: inline-grid;
}

.brand__ghost,
.brand__typed {
  grid-area: 1 / 1;
}

.brand__ghost {
  visibility: hidden;
}

.brand__typed {
  justify-self: start;
}

.brand__cursor {
  display: inline-block;
  width: 0.6em;
  height: max(2px, 0.1em);
  margin-left: 0.06em;
  background-color: currentColor;
  vertical-align: baseline;
}

.brand__cursor--blinking {
  animation: brand-cursor-blink 1s steps(1, end) infinite;
}

@keyframes brand-cursor-blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand__cursor--blinking {
    animation: none;
  }
}

.menu-button {
  display: none;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 0;
  border: 0;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-on-surface);
  cursor: pointer;
}

.menu-button__icon {
  display: inline-flex;
  width: 28px;
  height: 28px;
}

.navigation {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.nav-link {
  display: inline-flex;
  align-items: center;
  height: 48px;
  padding: 0 16px;
  border-radius: var(--radius-full);
  font: var(--font-label-md);
  color: var(--color-on-surface-variant);
  text-decoration: none;
}

.nav-link:hover {
  background: var(--color-primary-container);
  color: var(--color-on-primary-container);
}

.nav-link.is-active {
  background: var(--color-primary-container);
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 16px 0 var(--page-padding-inline);
    gap: var(--spacing-3);
  }

  .brand__mark {
    width: 40px;
    height: 40px;
    padding: 6px;
  }

  .brand__name {
    font-size: 20px;
    line-height: 28px;
  }

  .menu-button {
    display: inline-flex;
  }

  .navigation {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 8px 0 16px;
    background: var(--color-surface);
    border-top: 1px solid var(--color-outline-variant);
    border-bottom: 1px solid var(--color-outline-variant);
  }

  .navigation.is-open {
    display: flex;
  }

  .nav-link {
    display: flex;
    width: 100%;
    height: 56px;
    padding: 0 24px;
    border-radius: 0;
  }
}
</style>
