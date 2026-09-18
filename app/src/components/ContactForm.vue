<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const formData = ref({
  name: '',
  email: '',
  message: ''
})

const submitted = ref(false)
const isSubmitting = ref(false)
const error = ref('')

const handleSubmit = async () => {
  if (isSubmitting.value) return

  isSubmitting.value = true
  error.value = ''

  try {
    const response = await fetch('https://formspree.io/f/xlggqdgn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.value.name,
        email: formData.value.email,
        message: formData.value.message,
        _replyto: formData.value.email,
      }),
    })

    if (response.ok) {
      submitted.value = true
      // Reset form
      formData.value = {
        name: '',
        email: '',
        message: ''
      }

      // Hide success message after 5 seconds
      setTimeout(() => {
        submitted.value = false
      }, 5000)
    } else {
      error.value = t('contact.form.errorMessage')
    }
  } catch (err) {
    error.value = t('contact.form.errorMessage')
    console.error('Form submission error:', err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="contact-form">
    <div v-if="submitted" class="success-message">
      {{ t('contact.form.successMessage') }}
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="form-group">
      <label for="name">{{ t('contact.form.name') }}</label>
      <input
        id="name"
        v-model="formData.name"
        type="text"
        required
        :disabled="isSubmitting"
        :placeholder="t('contact.form.namePlaceholder')"
      />
    </div>

    <div class="form-group">
      <label for="email">{{ t('contact.form.email') }}</label>
      <input
        id="email"
        v-model="formData.email"
        type="email"
        required
        :disabled="isSubmitting"
        :placeholder="t('contact.form.emailPlaceholder')"
      />
    </div>

    <div class="form-group">
      <label for="message">{{ t('contact.form.message') }}</label>
      <textarea
        id="message"
        v-model="formData.message"
        required
        rows="5"
        :disabled="isSubmitting"
        :placeholder="t('contact.form.messagePlaceholder')"
      ></textarea>
    </div>

    <div class="button-group">
      <button type="submit" class="submit-btn" :disabled="isSubmitting">
        {{ isSubmitting ? t('contact.form.submitting') : t('contact.form.submit') }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.contact-form {
  position: relative;
  background: var(--color-bg-primary);
  padding: var(--spacing-xl);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-glow);
}

.contact-form > * {
  position: relative;
  z-index: 1;
}

.contact-form::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 2px solid transparent;
  background:
    linear-gradient(var(--color-bg-primary), var(--color-bg-primary)) padding-box,
    var(--gradient-brand-horizontal) border-box;
  mask-image: linear-gradient(to bottom, #000 0, #000 26px, transparent 46px);
  -webkit-mask-image: linear-gradient(to bottom, #000 0, #000 26px, transparent 46px);
  pointer-events: none;
}

.success-message {
  background-color: var(--color-success);
  color: white;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.error-message {
  background-color: var(--color-error);
  color: white;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  display: block;
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-sm);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-base);
  font-family: inherit;
  background: var(--color-bg-primary);
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-primary-light);
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.submit-btn {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: transform var(--transition-base), box-shadow var(--transition-base), background var(--transition-base);
  background: var(--gradient-brand);
  color: white;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
}

.submit-btn:disabled {
  background: var(--color-primary-light);
  color: var(--color-primary);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@media (min-width: 640px) {
  .button-group {
    flex-direction: row;
  }
}
</style>
