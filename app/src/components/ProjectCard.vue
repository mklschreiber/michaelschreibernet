<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import VueEasyLightbox from 'vue-easy-lightbox'
import type { Project } from '@/types/project'
import IconImagePlaceholder from '@/components/icons/IconImagePlaceholder.vue'
import IconOpenInNew from '@/components/icons/IconOpenInNew.vue'

interface Props {
  project: Project
}

const props = defineProps<Props>()

const { t } = useI18n()

/** Widths the responsive image variants were generated at, smallest first. */
const IMAGE_WIDTHS = [320, 640, 960, 1280, 1600, 1920]
const IMAGE_DEFAULT_WIDTH = 960
const IMAGE_FULL_WIDTH = 1920
/**
 * Rendered slide width: mobile 86% of (100vw - 2×24 section - 2×24 card - 2×1 border);
 * desktop 84% of the 5/12 column of (100vw - 2×32 - 2×36 - 2×1 - 48 gap), capped at the
 * 1180px content width. Keep in sync with the styles below.
 */
const IMAGE_SIZES =
  '(max-width: 768px) calc((100vw - 98px) * 0.86), (max-width: 1244px) calc((100vw - 186px) * 0.35), 371px'

const TAG_COLORS = ['lilac', 'sand', 'rose'] as const

function srcsetFor(base: string): string {
  return IMAGE_WIDTHS.map((width) => `${base}-${width}.jpg ${width}w`).join(', ')
}

function tagColor(index: number): (typeof TAG_COLORS)[number] {
  return TAG_COLORS[index % TAG_COLORS.length]!
}

const lightboxVisible = ref(false)
const lightboxIndex = ref(0)

const lightboxImgs = computed(
  () =>
    props.project.images?.map((image) => ({
      src: `${image.base}-${IMAGE_FULL_WIDTH}.jpg`,
      alt: t(image.altKey),
      title: t(image.altKey),
    })) ?? [],
)

function openLightbox(index: number) {
  lightboxIndex.value = index
  lightboxVisible.value = true
}

function revealImage(event: FocusEvent) {
  const image = event.target as HTMLElement
  image.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}
</script>

<template>
  <article class="project-card">
    <h3 class="project-card__title">{{ t(project.titleKey) }}</h3>
    <div
      v-if="project.images?.length"
      class="project-carousel"
      role="group"
      :aria-label="t('projects.galleryLabel', { title: t(project.titleKey) })"
    >
      <img
        v-for="(image, index) in project.images"
        :key="image.base"
        class="project-image"
        :src="`${image.base}-${IMAGE_DEFAULT_WIDTH}.jpg`"
        :srcset="srcsetFor(image.base)"
        :sizes="IMAGE_SIZES"
        :alt="t(image.altKey)"
        loading="lazy"
        decoding="async"
        role="button"
        tabindex="0"
        @click="openLightbox(index)"
        @focus="revealImage"
        @keydown.enter="openLightbox(index)"
        @keydown.space.prevent="openLightbox(index)"
      />
    </div>
    <div v-else class="project-image-placeholder" aria-hidden="true">
      <span class="project-image-placeholder__icon"><IconImagePlaceholder /></span>
    </div>
    <VueEasyLightbox
      :visible="lightboxVisible"
      :imgs="lightboxImgs"
      :index="lightboxIndex"
      teleport="body"
      loop
      rotate-disabled
      @hide="lightboxVisible = false"
    />
    <p class="project-card__description">{{ t(project.descriptionKey) }}</p>
    <div class="technologies">
      <span
        v-for="(tech, index) in project.technologies"
        :key="tech"
        :class="['tech-badge', `tech-badge--${tagColor(index)}`]"
      >
        {{ tech }}
      </span>
    </div>
    <div v-if="project.links?.length" class="project-links">
      <a
        v-for="(link, index) in project.links"
        :key="link.url"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        :class="['project-link', index === 0 ? 'project-link--filled' : 'project-link--outlined']"
      >
        {{ t(link.textKey) }}
        <span class="project-link__icon"><IconOpenInNew /></span>
      </a>
    </div>
  </article>
</template>

<style scoped>
.project-card {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  grid-template-rows: repeat(4, auto);
  align-content: start;
  align-items: start;
  column-gap: var(--spacing-2xl);
  row-gap: var(--spacing-lg);
  min-width: 0;
  padding: var(--spacing-card);
  border: 1px solid rgba(255, 255, 255, 0.75);
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.52);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  backdrop-filter: blur(16px) saturate(1.4);
  box-shadow: var(--shadow-glass);
  color: var(--color-on-primary-container);
}

.project-card__title {
  grid-column: 1 / -1;
  grid-row: 1;
  font: var(--font-headline-md);
  color: var(--color-on-surface);
  overflow-wrap: anywhere;
}

.project-carousel,
.project-image-placeholder {
  grid-column: 1;
  grid-row: 2 / span 3;
}

.project-carousel {
  display: flex;
  gap: var(--spacing-3);
  min-width: 0;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.project-carousel::-webkit-scrollbar {
  display: none;
}

.project-image {
  display: block;
  flex: none;
  width: 84%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: var(--radius-md);
  scroll-snap-align: start;
  cursor: pointer;
}

.project-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: var(--radius-md);
  background: var(--color-surface-container);
  color: var(--color-on-surface-variant);
}

.project-image-placeholder__icon {
  display: inline-flex;
  width: 48px;
  height: 48px;
}

.project-card__description {
  grid-column: 2;
  grid-row: 2;
  font: var(--font-body-sm);
  color: var(--color-on-primary-container);
}

.technologies {
  grid-column: 2;
  grid-row: 3;
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.tech-badge {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border-radius: var(--radius-full);
  font: var(--font-label-xs);
}

.tech-badge--lilac {
  background: var(--color-chip-lilac);
  color: var(--color-on-chip-lilac);
}

.tech-badge--sand {
  background: var(--color-chip-sand);
  color: var(--color-on-chip-sand);
}

.tech-badge--rose {
  background: var(--color-chip-rose);
  color: var(--color-on-chip-rose);
}

.project-links {
  grid-column: 2;
  grid-row: 4;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-3);
}

.project-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  height: 48px;
  padding: 0 24px;
  border-radius: var(--radius-full);
  font: var(--font-label-lg);
  text-decoration: none;
}

.project-link--filled {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.project-link--outlined {
  border: 1.5px solid var(--color-on-primary-container);
  color: var(--color-on-primary-container);
}

.project-link__icon {
  display: inline-flex;
  width: 20px;
  height: 20px;
}

@media (max-width: 768px) {
  .project-card {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-lg);
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
  }

  .project-image {
    width: 86%;
  }

  .project-links {
    flex-direction: column;
    align-items: stretch;
  }

  .project-link {
    display: flex;
    width: 100%;
  }
}
</style>
