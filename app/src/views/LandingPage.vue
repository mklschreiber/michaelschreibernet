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
      <img
        class="hero__logo"
        src="/logo_anim.gif"
        :alt="t('landing.logoAlt')"
      >
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
  background-image: url('/bg_image-640.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

@media (min-width: 640px) {
  .landing-page {
    background-image: url('/bg_image-960.jpg');
  }
}

@media (min-width: 960px) {
  .landing-page {
    background-image: url('/bg_image-1280.jpg');
  }
}

@media (min-width: 1280px) {
  .landing-page {
    background-image: url('/bg_image-1920.jpg');
  }
}

@media (min-width: 1920px) {
  .landing-page {
    background-image: url('/bg_image-2560.jpg');
  }
}

@media (min-width: 2560px) {
  .landing-page {
    background-image: url('/bg_image-3200.jpg');
  }
}

@media (min-width: 640px) and (min-resolution: 2dppx) {
  .landing-page {
    background-image: url('/bg_image-1280.jpg');
  }
}

@media (min-width: 960px) and (min-resolution: 2dppx) {
  .landing-page {
    background-image: url('/bg_image-1920.jpg');
  }
}

@media (min-width: 1280px) and (min-resolution: 2dppx) {
  .landing-page {
    background-image: url('/bg_image-2560.jpg');
  }
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

.hero__logo {
  width: min(100%, 19rem);
  height: auto;
  margin-bottom: var(--spacing-xl);
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
