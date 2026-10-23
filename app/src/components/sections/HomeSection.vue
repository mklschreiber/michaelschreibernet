<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AnimatedLogo from '@/components/AnimatedLogo.vue'
import IconArrowDown from '@/components/icons/IconArrowDown.vue'
import { useSectionNavigation } from '@/composables/useSectionNavigation'

const { t } = useI18n()
const { sectionHref, goToSection } = useSectionNavigation()
</script>

<template>
  <section id="home" class="section home-section" aria-labelledby="home-title">
    <div class="home-section__content">
      <AnimatedLogo class="home-section__logo" />
      <h1 id="home-title" class="home-section__title">{{ t('landing.title') }}</h1>
      <p class="home-section__subtitle">{{ t('landing.subtitle') }}</p>
      <a
        class="home-section__scroll"
        :href="sectionHref('projects')"
        :aria-label="t('landing.scrollToProjects')"
        @click="goToSection('projects', $event)"
      >
        <span class="home-section__scroll-icon"><IconArrowDown /></span>
      </a>
    </div>
  </section>
</template>

<style scoped>
.home-section {
  min-height: max(560px, calc(100svh - var(--nav-height)));
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: linear-gradient(180deg, var(--color-surface-container-low), var(--color-surface));
}

.home-section__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: hero-rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.home-section__logo {
  width: 360px;
  max-width: 100%;
  height: auto;
  margin-bottom: var(--spacing-2xl);
  color: var(--color-on-surface);
}

.home-section__title {
  font: var(--font-display-lg);
  letter-spacing: -0.02em;
  background: var(--gradient-text);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}

.home-section__subtitle {
  margin-top: var(--spacing-md);
  max-width: 560px;
  font: var(--font-body-lg);
  color: var(--color-on-surface-variant);
}

.home-section__scroll {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-top: var(--spacing-2xl);
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-full);
  color: var(--color-primary);
}

.home-section__scroll-icon {
  display: inline-flex;
  width: 28px;
  height: 28px;
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
  .home-section__logo {
    width: 240px;
    margin-bottom: 40px;
  }

  .home-section__title {
    font: var(--font-display-sm);
    letter-spacing: -0.02em;
  }

  .home-section__scroll {
    margin-top: 40px;
  }
}
</style>
