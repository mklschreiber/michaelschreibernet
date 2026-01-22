<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppNavigation from '@/components/AppNavigation.vue'

const { t } = useI18n()
</script>

<template>
  <div class="landing-page">
    <AppNavigation />

    <main class="hero">
      <h1>{{ t('landing.title') }}</h1>
      <p>{{ t('landing.subtitle') }}</p>
      <div class="cta-buttons">
        <RouterLink to="/projects" class="btn btn-primary">{{ t('landing.viewProjects') }}</RouterLink>
        <RouterLink to="/contact" class="btn btn-secondary">{{ t('landing.getInTouch') }}</RouterLink>
      </div>
    </main>
  </div>
</template>

<style scoped>
.landing-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-xl);
}

.hero h1 {
  font-size: var(--font-size-5xl);
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.hero p {
  font-size: var(--font-size-xl);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
}

.cta-buttons {
  display: flex;
  gap: var(--spacing-md);
}

.btn {
  padding: var(--spacing-md) var(--spacing-lg);
  text-decoration: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-base);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.btn-secondary {
  background-color: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.btn-secondary:hover {
  background-color: var(--color-primary);
  color: white;
}
</style>
