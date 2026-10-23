<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import IconSend from '@/components/icons/IconSend.vue'

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
  <form class="card contact-form" @submit.prevent="handleSubmit">
    <div v-if="submitted" class="form-message form-message--success">
      {{ t('contact.form.successMessage') }}
    </div>

    <div v-if="error" class="form-message form-message--error">
      {{ error }}
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="contact-name">{{ t('contact.form.name') }}</label>
        <input
          id="contact-name"
          v-model="formData.name"
          class="form-field"
          type="text"
          required
          :disabled="isSubmitting"
          :placeholder="t('contact.form.namePlaceholder')"
        />
      </div>

      <div class="form-group">
        <label for="contact-email">{{ t('contact.form.email') }}</label>
        <input
          id="contact-email"
          v-model="formData.email"
          class="form-field"
          type="email"
          required
          :disabled="isSubmitting"
          :placeholder="t('contact.form.emailPlaceholder')"
        />
      </div>
    </div>

    <div class="form-group">
      <label for="contact-message">{{ t('contact.form.message') }}</label>
      <textarea
        id="contact-message"
        v-model="formData.message"
        class="form-field form-field--textarea"
        required
        :disabled="isSubmitting"
        :placeholder="t('contact.form.messagePlaceholder')"
      ></textarea>
    </div>

    <div>
      <button type="submit" class="submit-btn" :disabled="isSubmitting">
        <span class="submit-btn__icon"><IconSend /></span>
        {{ isSubmitting ? t('contact.form.submitting') : t('contact.form.submit') }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.contact-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-card);
}

.form-message {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  font: var(--font-body-sm);
  text-align: center;
}

.form-message--success {
  background-color: var(--color-success);
  color: #ffffff;
}

.form-message--error {
  background-color: var(--color-error);
  color: var(--color-on-error);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-group label {
  font: var(--font-label-md);
  color: var(--color-on-surface);
}

.form-field {
  width: 100%;
  height: 56px;
  padding: 0 16px;
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-on-surface);
  font: var(--font-body-sm);
}

.form-field--textarea {
  height: 176px;
  padding: 14px 16px;
  resize: vertical;
}

.form-field::placeholder {
  color: var(--color-on-surface-variant);
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  height: 56px;
  padding: 0 32px;
  border: 0;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-on-primary);
  font: var(--font-label-lg);
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: box-shadow var(--transition-base);
}

.submit-btn:hover:not(:disabled) {
  box-shadow: var(--shadow-raised);
}

.submit-btn:disabled {
  background: var(--color-primary-container);
  color: var(--color-primary);
  box-shadow: none;
  cursor: not-allowed;
}

.submit-btn__icon {
  display: inline-flex;
  width: 20px;
  height: 20px;
}

@media (max-width: 768px) {
  .contact-form {
    padding: var(--spacing-lg);
  }

  .form-row {
    grid-template-columns: minmax(0, 1fr);
  }

  .submit-btn {
    display: flex;
    width: 100%;
  }
}
</style>
