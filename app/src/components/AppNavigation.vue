<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <header>
    <nav class="navigation">
      <RouterLink to="/">{{ t('nav.home') }}</RouterLink>
      <RouterLink to="/projects">{{ t('nav.projects') }}</RouterLink>
      <RouterLink to="/contact">{{ t('nav.contact') }}</RouterLink>
    </nav>
  </header>
</template>

<style scoped>
header {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--color-border);
}

.navigation {
  display: flex;
  gap: var(--spacing-xl);
  max-width: var(--container-max-width);
  margin: 0 auto;
}

.navigation a {
  text-decoration: none;
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-base);
}

.navigation a:hover,
.navigation a.router-link-active {
  color: var(--color-primary);
}
</style>
