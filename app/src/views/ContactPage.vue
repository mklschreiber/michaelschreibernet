<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppNavigation from '@/components/AppNavigation.vue'
import ContactInformation from '@/components/ContactInformation.vue'
import ContactForm from '@/components/ContactForm.vue'

const { t } = useI18n()
</script>

<template>
  <div class="contact-page">
    <AppNavigation />

    <main class="content">
      <h1>{{ t('contact.title') }}</h1>
      <p class="subtitle">{{ t('contact.subtitle') }}</p>

      <div class="contact-container">
        <ContactInformation />
        <ContactForm />
      </div>
    </main>
  </div>
</template>

<style scoped>
.contact-page {
  min-height: 100vh;
}

.content {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-xl);
}

.content h1 {
  font-size: var(--font-size-4xl);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-2xl);
}

.contact-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--spacing-2xl);
}

@media (max-width: 768px) {
  .contact-container {
    grid-template-columns: 1fr;
  }
}
</style>
