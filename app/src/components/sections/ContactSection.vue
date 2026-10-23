<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ContactForm from '@/components/ContactForm.vue'

const { t } = useI18n()
</script>

<template>
  <section id="contact" class="section contact-section" aria-labelledby="contact-title">
    <div class="section__inner">
      <h2 id="contact-title" class="section__title">{{ t('contact.title') }}</h2>
      <p class="section__subtitle">{{ t('contact.subtitle') }}</p>
      <ContactForm />
    </div>
  </section>
</template>

<style scoped>
.contact-section {
  padding-bottom: 96px;
}

@media (max-width: 768px) {
  .contact-section {
    padding-bottom: var(--spacing-3xl);
  }
}
</style>
