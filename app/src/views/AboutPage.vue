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
      <section class="about-page__card">
        <div class="about-page__avatar">
          <img
            class="about-page__avatar-image"
            src="/profile-picture.jpeg"
            :alt="t('about.businessCard.avatarAlt')"
          />
        </div>
        <div class="about-page__info">
          <h1 class="about-page__name">{{ t('about.businessCard.name') }}</h1>
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
        <h2 class="about-page__timeline-title">{{ t('about.timeline.title') }}</h2>
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
}

.about-page__content {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-xl);
}

/* ── Business Card ────────────────────────────────────── */
.about-page__card {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  padding: var(--spacing-2xl);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-2xl);
}

.about-page__avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.about-page__avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.about-page__name {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs);
}

.about-page__role {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-md);
}

.about-page__links {
  display: flex;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.about-page__link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: opacity var(--transition-base);
}

.about-page__link:hover {
  opacity: 0.8;
}

.about-page__link-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: inline-flex;
}

/* ── Timeline ─────────────────────────────────────────── */
.about-page__timeline-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  text-align: center;
  margin-bottom: var(--spacing-2xl);
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
  width: 2px;
  background: var(--color-border);
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

