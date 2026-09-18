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
      <div class="hero__glow hero__glow--one" aria-hidden="true"></div>
      <div class="hero__glow hero__glow--two" aria-hidden="true"></div>

      <div class="hero__content">
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
      </div>
    </main>
  </div>
</template>

<style scoped>

.landing-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-image: url('/bg_image-640.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.landing-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.55) 0%,
    rgba(255, 255, 255, 0.82) 55%,
    rgba(255, 255, 255, 0.95) 100%
  );
  pointer-events: none;
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
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-xl);
  overflow: hidden;
}

.hero__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  pointer-events: none;
  z-index: 0;
}

.hero__glow--one {
  width: 32rem;
  height: 32rem;
  top: -8rem;
  left: -6rem;
  background: radial-gradient(circle, rgba(79, 70, 229, 0.22) 0%, rgba(79, 70, 229, 0) 70%);
}

.hero__glow--two {
  width: 28rem;
  height: 28rem;
  bottom: -10rem;
  right: -6rem;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0) 70%);
}

.hero__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: hero-rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.hero__logo {
  width: min(100%, 19rem);
  height: auto;
  margin-bottom: var(--spacing-xl);
}

.hero h1 {
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.02em;
  margin-bottom: var(--spacing-md);
  background: var(--gradient-text);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.hero p {
  font-size: var(--font-size-xl);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
  max-width: 34rem;
}

.cta-buttons {
  display: flex;
  gap: var(--spacing-md);
  width: 100%;
  justify-content: center;
}

@keyframes hero-rise {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .cta-buttons {
    flex-direction: column;
    align-items: stretch;
    padding: 0 var(--spacing-md);
  }
}
</style>
