<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Zustand für das Hamburger-Menü
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// Optional: Schließt das Menü, wenn ein Link angeklickt wird
const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<template>
  <header class="nav-header">
    <div class="nav-container">
      <button class="hamburger" @click="toggleMenu" aria-label="Menü öffnen">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>

      <nav :class="['navigation', { 'is-open': isMenuOpen }]">
        <RouterLink to="/" @click="closeMenu">{{ t('nav.home') }}</RouterLink>
        <RouterLink to="/projects" @click="closeMenu">{{ t('nav.projects') }}</RouterLink>
        <RouterLink to="/contact" @click="closeMenu">{{ t('nav.contact') }}</RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
header {
  padding: var(--spacing-lg) var(--spacing-xl);
}

.nav-header {
  background-color: var(--color-primary);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.nav-container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

/* Hamburger Icon Design */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0px;
}

.hamburger .bar {
  display: block;
  width: 25px;
  height: 3px;
  background-color: var(--color-text-primary);
  transition: 0.3s;
}

.hamburger.open .bar:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}
.hamburger.open .bar:nth-child(2) {
  opacity: 0;
}
.hamburger.open .bar:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

.navigation {
  display: flex;
  gap: var(--spacing-xl);
}

.navigation a {
  text-decoration: none;
  color: var(--color-text-light);
  font-weight: var(--font-weight-medium);
}
@media (max-width: 768px) {
  .navigation a {
    color: var(--color-text-primary);
  }

  .nav-container {
    justify-content: flex-end;
  }

  .hamburger {
    display: flex;
  }

  .navigation {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 70px;
    right: 0;
    width: 100%;
    background: var(--color-bg-primary);
    padding: var(--spacing-lg);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .navigation.is-open {
    display: flex;
  }
}
</style>
