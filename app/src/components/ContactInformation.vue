<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import IconEmail from '@/components/icons/IconEmail.vue'
import IconPhone from '@/components/icons/IconPhone.vue'
import IconLocation from '@/components/icons/IconLocation.vue'

const { t } = useI18n()
</script>

<template>
  <div class="contact-info">
    <h2>{{ t('contact.contactInfo') }}</h2>
    <div class="info-item">
      <span class="info-item__icon" aria-hidden="true"><IconEmail /></span>
      <div>
        <strong>{{ t('contact.email') }}:</strong>
        <p><a href="mailto:info@michaelschreiber.net">{{ t('contact.emailValue') }}</a></p>
      </div>
    </div>
    <div class="info-item">
      <span class="info-item__icon" aria-hidden="true"><IconPhone /></span>
      <div>
        <strong>{{ t('contact.phone') }}:</strong>
        <p><a href="tel:+4915679724718">{{ t('contact.phoneValue') }}</a></p>
      </div>
    </div>
    <div class="info-item">
      <span class="info-item__icon" aria-hidden="true"><IconLocation /></span>
      <div>
        <strong>{{ t('contact.location') }}:</strong>
        <p>{{ t('contact.locationValue') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-info {
  position: relative;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-xl);
  padding-top: calc(var(--spacing-xl) + 4px);
  height: 100%;
  overflow: hidden;
  box-shadow: var(--shadow-glow);
}

.contact-info::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 24px;
  background: var(--gradient-brand);
  mask-image: linear-gradient(to bottom, black 0, black 4px, transparent 24px);
  -webkit-mask-image: linear-gradient(to bottom, black 0, black 4px, transparent 24px);
}

.contact-info h2 {
  font-size: var(--font-size-2xl);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  min-width: 40px;
  padding: 10px;
  border-radius: var(--radius-md);
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.info-item strong {
  display: block;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.info-item p {
  color: var(--color-text-secondary);
}

.info-item a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color var(--transition-fast);
}

.info-item a:hover {
  color: var(--color-primary);
}
</style>
