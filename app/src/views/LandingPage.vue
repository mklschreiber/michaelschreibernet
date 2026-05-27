<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppNavigation from '@/components/AppNavigation.vue'
import MdFilledButton from '@/components/MdFilledButton.vue'
import MdOutlinedButton from '@/components/MdOutlinedButton.vue'

const { t } = useI18n()
</script>

<template>
  <div class="landing-page">
    <AppNavigation />

    <main class="hero">
      <h1>{{ t('landing.title') }}</h1>
      <p>{{ t('landing.subtitle') }}</p>
      <div class="cta-buttons">
        <MdFilledButton to="/projects">{{ t('landing.viewProjects') }}</MdFilledButton>
        <MdOutlinedButton to="/contact">{{ t('landing.getInTouch') }}</MdOutlinedButton>
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
  width: 100%;
  justify-content: center;
}

@media (max-width: 768px) {
  .cta-buttons {
    flex-direction: column;
    align-items: stretch;
    padding: 0 var(--spacing-md);
  }
}
</style>
