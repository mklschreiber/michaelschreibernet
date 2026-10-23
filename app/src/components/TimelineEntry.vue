<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { TimelineEntry } from '@/data/timeline'

interface Props {
  entry: TimelineEntry
  side: 'left' | 'right'
  isVisible: boolean
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <li
    class="timeline-entry"
    :class="[`timeline-entry--${side}`, { 'timeline-entry--visible': isVisible }]"
    :data-entry-id="entry.id"
  >
    <div class="timeline-entry__axis" aria-hidden="true">
      <span class="timeline-entry__dot"></span>
    </div>
    <div class="timeline-entry__cell">
      <div class="timeline-entry__card">
        <span class="timeline-entry__date">{{ t(entry.date) }}</span>
        <h3 class="timeline-entry__company">{{ t(entry.titleKey) }}</h3>
        <p class="timeline-entry__role">{{ t(entry.descriptionKey) }}</p>
      </div>
    </div>
  </li>
</template>

<style scoped>
.timeline-entry {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 48px minmax(0, 1fr);
}

.timeline-entry__dot,
.timeline-entry__card {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.6s ease-out var(--delay, 0s),
    transform 0.6s ease-out var(--delay, 0s);
}

.timeline-entry--visible .timeline-entry__dot,
.timeline-entry--visible .timeline-entry__card {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .timeline-entry__dot,
  .timeline-entry__card {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

.timeline-entry__axis {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.timeline-entry__axis::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(50% - 1px);
  width: 2px;
  background: var(--color-primary-container);
}

.timeline-entry--left .timeline-entry__cell {
  grid-column: 1;
  grid-row: 1;
}

.timeline-entry--right .timeline-entry__cell {
  grid-column: 3;
  grid-row: 1;
}

.timeline-entry__dot {
  position: relative;
  z-index: 1;
  flex: none;
  margin-top: 28px;
  width: 20px;
  height: 20px;
  border: 3px solid var(--color-primary);
  border-radius: var(--radius-full);
  background: var(--color-surface);
}

.timeline-entry:first-child .timeline-entry__dot {
  margin-top: 60px;
}

.timeline-entry__cell {
  padding-bottom: var(--spacing-xl);
}

.timeline-entry:first-child .timeline-entry__cell {
  padding-top: var(--spacing-xl);
}

.timeline-entry__card {
  padding: var(--spacing-lg);
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.timeline-entry__date {
  display: block;
  font: var(--font-label-sm);
  color: var(--color-primary);
}

.timeline-entry__company {
  margin-top: var(--spacing-xs);
  font: var(--font-title-lg);
  color: var(--color-on-surface);
}

.timeline-entry__role {
  margin: 8px 0 0;
  font: var(--font-body-sm);
  color: var(--color-on-surface-variant);
}

@media (max-width: 768px) {
  .timeline-entry {
    grid-template-columns: 24px minmax(0, 1fr);
    column-gap: var(--spacing-md);
  }

  .timeline-entry__axis {
    grid-column: 1;
  }

  .timeline-entry--left .timeline-entry__cell,
  .timeline-entry--right .timeline-entry__cell {
    grid-column: 2;
  }

  .timeline-entry__cell {
    padding-bottom: var(--spacing-lg);
  }
}
</style>
