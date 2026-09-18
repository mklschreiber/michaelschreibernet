<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// State for the hamburger menu
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// Optional: Close the menu when a link is clicked
const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<template>
  <header class="nav-header">
    <div class="nav-container">
      <RouterLink to="/" class="brand" @click="closeMenu">
        <span class="brand__mark" aria-hidden="true">MS</span>
        <span class="brand__name">michaelschreiber<span class="brand__tld">.net</span></span>
      </RouterLink>

      <button
        class="hamburger"
        :class="{ 'is-open': isMenuOpen }"
        @click="toggleMenu"
        aria-label="Menü öffnen"
        :aria-expanded="isMenuOpen"
      >
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>

      <nav :class="['navigation', { 'is-open': isMenuOpen }]">
        <RouterLink to="/" @click="closeMenu">{{ t('nav.home') }}</RouterLink>
        <RouterLink to="/about" @click="closeMenu">{{ t('nav.about') }}</RouterLink>
        <RouterLink to="/projects" @click="closeMenu">{{ t('nav.projects') }}</RouterLink>
        <RouterLink to="/contact" @click="closeMenu">{{ t('nav.contact') }}</RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.nav-header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  padding: var(--spacing-md) var(--spacing-xl);
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border-light);
}

.nav-container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-lg);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  flex-shrink: 0;
}

.brand__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--gradient-brand);
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.02em;
}

.brand__name {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
  white-space: nowrap;
}

.brand__tld {
  color: var(--color-primary);
}

/* Hamburger Icon Design */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0px;
}

.hamburger .bar {
  display: block;
  width: 24px;
  height: 2px;
  border-radius: var(--radius-full);
  background-color: var(--color-text-primary);
  transition: transform var(--transition-base), opacity var(--transition-base);
}

.hamburger.is-open .bar:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.hamburger.is-open .bar:nth-child(2) {
  opacity: 0;
}
.hamburger.is-open .bar:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

.navigation {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

.navigation a {
  position: relative;
  text-decoration: none;
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  padding-block: var(--spacing-xs);
  transition: color var(--transition-fast);
}

.navigation a::after {
  content: '';
  position: absolute;
  left: 0;
  right: 100%;
  bottom: 0;
  height: 2px;
  border-radius: var(--radius-full);
  background: var(--gradient-brand);
  transition: right var(--transition-base);
}

.navigation a:hover {
  color: var(--color-text-primary);
}

.navigation a:hover::after {
  right: 0;
}

.navigation a.router-link-exact-active {
  color: var(--color-primary);
}

.navigation a.router-link-exact-active::after {
  right: 0;
}

@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }

  .navigation {
    display: none;
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: var(--spacing-sm);
    background: var(--color-bg-primary);
    padding: var(--spacing-lg);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
  }

  .navigation.is-open {
    display: flex;
  }

  .navigation a {
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-sm);
  }

  .navigation a:hover {
    background: var(--color-bg-secondary);
  }

  .navigation a::after {
    display: none;
  }
}
</style>
