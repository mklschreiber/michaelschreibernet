<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="contact-info">
    <h2>{{ t('contact.contactInfo') }}</h2>
    <div class="info-item">
      <strong>{{ t('contact.email') }}:</strong>
      <p>{{ t('contact.emailValue') }}</p>
    </div>
    <div class="info-item">
      <strong>{{ t('contact.phone') }}:</strong>
      <p>{{ t('contact.phoneValue') }}</p>
    </div>
    <div class="info-item">
      <strong>{{ t('contact.location') }}:</strong>
      <p>{{ t('contact.locationValue') }}</p>
    </div>
  </div>
</template>

<style scoped>
.contact-info h2 {
  font-size: var(--font-size-2xl);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
}

.info-item {
  margin-bottom: var(--spacing-lg);
}

.info-item strong {
  display: block;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.info-item p {
  color: var(--color-text-secondary);
}
</style>
