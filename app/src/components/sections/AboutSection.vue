<script setup lang="ts">
import type { Component, ComponentPublicInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import TimelineEntry from '@/components/TimelineEntry.vue'
import IconEmail from '@/components/icons/IconEmail.vue'
import IconPhone from '@/components/icons/IconPhone.vue'
import IconGithub from '@/components/icons/IconGithub.vue'
import IconLinkedin from '@/components/icons/IconLinkedin.vue'
import IconFacebook from '@/components/icons/IconFacebook.vue'
import IconInstagram from '@/components/icons/IconInstagram.vue'
import { latestTimelineEntries } from '@/data/timeline'
import { useTimelineAnimation } from '@/composables/useTimelineAnimation'

interface ContactChip {
  id: string
  href: string
  icon: Component
  textKey?: string
  brand?: string
  ariaLabelKey?: string
  external: boolean
}

const { t } = useI18n()
const { entryRefs, visibilityMap } = useTimelineAnimation()

const contactChips: ContactChip[] = [
  {
    id: 'email',
    href: 'mailto:info@michaelschreiber.net',
    icon: IconEmail,
    textKey: 'about.businessCard.email',
    external: false,
  },
  {
    id: 'phone',
    href: 'tel:+491624337334',
    icon: IconPhone,
    textKey: 'about.businessCard.phone',
    external: false,
  },
  {
    id: 'linkedin',
    href: 'https://www.linkedin.com/in/mklschreiber',
    icon: IconLinkedin,
    brand: 'LinkedIn',
    ariaLabelKey: 'about.businessCard.linkedin',
    external: true,
  },
  {
    id: 'github',
    href: 'https://github.com/mklschreiber',
    icon: IconGithub,
    brand: 'GitHub',
    ariaLabelKey: 'about.businessCard.github',
    external: true,
  },
  {
    id: 'facebook',
    href: 'https://www.facebook.com/mklschreiber',
    icon: IconFacebook,
    brand: 'Facebook',
    ariaLabelKey: 'about.businessCard.facebook',
    external: true,
  },
  {
    id: 'instagram',
    href: 'https://www.instagram.com/mklschreiber/',
    icon: IconInstagram,
    brand: 'Instagram',
    ariaLabelKey: 'about.businessCard.instagram',
    external: true,
  },
]

const timelineWithSides = latestTimelineEntries.map((entry, index) => ({
  ...entry,
  side: (index % 2 === 0 ? 'left' : 'right') as 'left' | 'right',
}))

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
  <section id="about" class="section about-section" aria-labelledby="about-title">
    <div class="section__inner">
      <h2 id="about-title" class="section__title">{{ t('about.title') }}</h2>
      <p class="section__subtitle">{{ t('about.subtitle') }}</p>

      <div class="card profile-card">
        <img
          class="profile-card__portrait"
          src="/profile-picture.jpeg"
          width="176"
          height="176"
          :alt="t('about.businessCard.avatarAlt')"
        />
        <div class="profile-card__info">
          <h3 class="profile-card__name">{{ t('about.businessCard.name') }}</h3>
          <p class="profile-card__role">{{ t('about.businessCard.role') }}</p>
          <div class="profile-card__chips">
            <a
              v-for="chip in contactChips"
              :key="chip.id"
              class="contact-chip"
              :href="chip.href"
              :target="chip.external ? '_blank' : undefined"
              :rel="chip.external ? 'noopener noreferrer' : undefined"
              :aria-label="chip.ariaLabelKey ? t(chip.ariaLabelKey) : undefined"
            >
              <span class="contact-chip__icon" aria-hidden="true"><component :is="chip.icon" /></span>
              {{ chip.textKey ? t(chip.textKey) : chip.brand }}
            </a>
          </div>
        </div>
      </div>

      <div class="timeline">
        <ol class="timeline__list" :aria-label="t('about.timeline.title')">
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
        <div class="timeline__fade" aria-hidden="true">
          <span class="timeline__fade-line"></span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-section {
  background: linear-gradient(180deg, var(--color-surface-container-low), var(--color-surface));
}

/* ── Profile card ─────────────────────────────────────── */
.profile-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-2xl);
  padding: var(--spacing-card);
}

.profile-card__portrait {
  flex: none;
  width: 176px;
  height: 176px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 4px solid var(--color-surface);
  box-shadow: 0 0 0 3px var(--color-gradient-start);
}

.profile-card__info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  min-width: 0;
}

.profile-card__name {
  font: var(--font-headline-lg);
  letter-spacing: -0.01em;
  color: var(--color-on-surface);
}

.profile-card__role {
  font: var(--font-title-md);
  color: var(--color-primary);
}

.profile-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.contact-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  height: 36px;
  padding: 0 16px;
  border-radius: var(--radius-full);
  font: var(--font-label-md);
  background: var(--color-surface-container-low);
  color: var(--color-on-surface);
  text-decoration: none;
}

.contact-chip:hover {
  background: var(--color-primary-container);
}

.contact-chip__icon {
  display: inline-flex;
  flex: none;
  width: 20px;
  height: 20px;
}

/* ── Timeline ─────────────────────────────────────────── */
.timeline__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.timeline__fade {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 48px minmax(0, 1fr);
}

.timeline__fade-line {
  grid-column: 2;
  justify-self: center;
  width: 0;
  height: 120px;
  border-left: 2px dashed var(--color-primary-container);
  -webkit-mask-image: linear-gradient(to bottom, #000, transparent);
  mask-image: linear-gradient(to bottom, #000, transparent);
}

@media (max-width: 768px) {
  .profile-card {
    flex-direction: column;
    gap: var(--spacing-lg);
    text-align: center;
    padding: var(--spacing-lg);
  }

  .profile-card__portrait {
    width: 128px;
    height: 128px;
  }

  .profile-card__info {
    align-items: center;
  }

  .profile-card__chips {
    justify-content: center;
  }

  .timeline__fade {
    grid-template-columns: 24px minmax(0, 1fr);
    column-gap: var(--spacing-md);
  }

  .timeline__fade-line {
    grid-column: 1;
    height: 96px;
  }
}
</style>
