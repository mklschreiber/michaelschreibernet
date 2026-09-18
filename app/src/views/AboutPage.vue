<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import AppNavigation from '@/components/AppNavigation.vue'
import TimelineEntry from '@/components/TimelineEntry.vue'
import IconEmail from '@/components/icons/IconEmail.vue'
import IconXing from '@/components/icons/IconXing.vue'
import IconGithub from '@/components/icons/IconGithub.vue'
import IconLinkedin from '@/components/icons/IconLinkedin.vue'
import { timelineEntries } from '@/data/timeline'
import { useTimelineAnimation } from '@/composables/useTimelineAnimation'

const { t } = useI18n()
const { entryRefs, visibilityMap } = useTimelineAnimation()

/** Alternates left/right based on index */
const timelineWithSides = timelineEntries.map((entry, index) => ({
  ...entry,
  side: (index % 2 === 0 ? 'left' : 'right') as 'left' | 'right',
}))

/** Sets the root DOM element of a component as a ref */
function setEntryRef(index: number) {
  return (el: Element | ComponentPublicInstance | null) => {
    if (el) {
      const domEl = (el as ComponentPublicInstance)?.$el ?? (el as HTMLElement)
      entryRefs.value[index] = domEl
    }
  }
}
</script>

<template>
  <div class="about-page">
    <AppNavigation />

    <main class="about-page__content">
      <h1>{{ t('about.title') }}</h1>
      <p class="subtitle">{{ t('about.subtitle') }}</p>

      <section class="about-page__card">
        <div class="about-page__avatar">
          <img
            class="about-page__avatar-image"
            src="/profile-picture.jpeg"
            :alt="t('about.businessCard.avatarAlt')"
          />
        </div>
        <div class="about-page__info">
          <h2 class="about-page__name">{{ t('about.businessCard.name') }}</h2>
          <p class="about-page__role">{{ t('about.businessCard.role') }}</p>
          <div class="about-page__links">
            <a href="mailto:info@michaelschreiber.net" class="about-page__link">
              <span class="about-page__link-icon" aria-hidden="true"><IconEmail /></span>
              {{ t('about.businessCard.email') }}
            </a>
            <a
              href="https://www.xing.com/profile/Michael_Schreiber94/web_profiles?nwt_nav=profile"
              target="_blank"
              rel="noopener noreferrer"
              class="about-page__link"
            >
              <span class="about-page__link-icon" aria-hidden="true"><IconXing /></span>
              {{ t('about.businessCard.xing') }}
            </a>
            <a
              href="https://www.linkedin.com/in/mklschreiber"
              target="_blank"
              rel="noopener noreferrer"
              class="about-page__link"
            >
              <span class="about-page__link-icon" aria-hidden="true"><IconLinkedin /></span>
              {{ t('about.businessCard.linkedin') }}
            </a>
            <a
              href="https://github.com/mklschreiber"
              target="_blank"
              rel="noopener noreferrer"
              class="about-page__link"
            >
              <span class="about-page__link-icon" aria-hidden="true"><IconGithub /></span>
              {{ t('about.businessCard.github') }}
            </a>
          </div>
        </div>
      </section>

      <!-- Timeline -->
      <section class="about-page__timeline" :aria-label="t('about.timeline.title')">
        <div class="timeline">
          <div class="timeline__line" aria-hidden="true"></div>
          <ol class="timeline__list">
            <TimelineEntry
              v-for="(item, index) in timelineWithSides"
              :key="item.id"
              :ref="setEntryRef(index)"
              :entry="item"
              :side="item.side"
              :is-visible="visibilityMap[item.id] === true"
              :style="{ '--delay': `${index * 0.15}s` }"
            />
          </ol>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.about-page {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--color-primary-light) 0%, var(--color-bg-primary) 24rem);
}

.about-page__content {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-xl);
}

.about-page__content h1 {
  display: inline-block;
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.02em;
  margin-bottom: var(--spacing-md);
  background: var(--gradient-text);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.about-page__content .subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-2xl);
}

/* ── Business Card ────────────────────────────────────── */
.about-page__card {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  padding: var(--spacing-2xl);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-2xl);
}

.about-page__card > * {
  position: relative;
  z-index: 1;
}

.about-page__card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 2px solid transparent;
  background:
    linear-gradient(var(--color-bg-primary), var(--color-bg-primary)) padding-box,
    var(--gradient-brand-horizontal) border-box;
  mask-image: linear-gradient(to bottom, #000 0, #000 26px, transparent 50%);
  -webkit-mask-image: linear-gradient(to bottom, #000 0, #000 26px, transparent 50%);
  pointer-events: none;
}

.about-page__avatar {
  width: 112px;
  height: 112px;
  border-radius: 50%;
  background: var(--gradient-brand);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 4px;
}

.about-page__avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  border: 3px solid var(--color-bg-primary);
}

.about-page__name {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs);
}

.about-page__role {
  font-size: var(--font-size-lg);
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
  margin: 0 0 var(--spacing-md);
}

.about-page__links {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.about-page__link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
}

.about-page__link:hover {
  background: var(--color-primary);
  color: var(--color-text-light);
  transform: translateY(-2px);
}

.about-page__link-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  display: inline-flex;
}

/* ── Timeline ─────────────────────────────────────────── */
.about-page__timeline {
  padding-top: var(--spacing-xl);
}

.timeline {
  position: relative;
}

/* Vertical line in the center */
.timeline__line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: var(--radius-full);
  background: var(--gradient-brand);
  opacity: 0.25;
  transform: translateX(-50%);
}

.timeline__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xl);
  padding-block: var(--spacing-xl);
}

/* ── Responsive ───────────────────────────────────────── */
@media (max-width: 768px) {
  .about-page__card {
    flex-direction: column;
    text-align: center;
  }

  .about-page__links {
    justify-content: center;
  }

  .timeline__line {
    /* align with dot center: list padding (spacing-xl = 32px) + dot radius (8px) = 40px */
    left: calc(var(--spacing-xl) + 8px);
    transform: none;
  }

  .timeline__list {
    align-items: stretch;
    padding-left: var(--spacing-xl);
  }
}
</style>

