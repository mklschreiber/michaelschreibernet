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
    <div class="timeline-entry__dot"></div>
    <div class="timeline-entry__connector"></div>
    <div class="timeline-entry__card">
      <span class="timeline-entry__date">{{ t(entry.date) }}</span>
      <h3 class="timeline-entry__company">{{ t(entry.titleKey) }}</h3>
      <p class="timeline-entry__role">{{ t(entry.descriptionKey) }}</p>
    </div>
  </li>
</template>

<style scoped>
.timeline-entry {
  display: flex;
  align-items: center;
  width: 50%;
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.6s ease-out var(--delay, 0s),
    transform 0.6s ease-out var(--delay, 0s);
}

.timeline-entry--visible {
  opacity: 1;
  transform: translateY(0);
}

/* Left: card left of the line → flex-direction row-reverse: Card | Connector | Dot */
.timeline-entry--left {
  align-self: flex-start;
  flex-direction: row-reverse;
}

/* Right: card right of the line → flex-direction row: Dot | Connector | Card */
.timeline-entry--right {
  align-self: flex-end;
  flex-direction: row;
}

.timeline-entry__dot {
  width: 16px;
  height: 16px;
  min-width: 16px;
  border-radius: 50%;
  background-color: var(--color-primary);
  border: 3px solid var(--color-bg-primary);
  box-shadow: 0 0 0 2px var(--color-primary);
  flex-shrink: 0;
  z-index: 1;
  position: relative;
}

/* Shift dot so its center aligns with the vertical timeline line */
.timeline-entry--left .timeline-entry__dot {
  margin-right: -8px; /* dot is rightmost in row-reverse: push right by half width */
}

.timeline-entry--right .timeline-entry__dot {
  margin-left: -8px; /* dot is leftmost in row: push left by half width */
}

.timeline-entry__connector {
  border-top: 2px dashed var(--color-border);
  flex-grow: 1;
  min-width: 20px;
  max-width: 60px;
}

.timeline-entry__card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  flex: 1;
}

.timeline-entry__date {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  display: block;
  margin-bottom: var(--spacing-xs);
}

.timeline-entry__company {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs);
}

.timeline-entry__role {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
}

/* Mobile: all cards left-aligned */
@media (max-width: 768px) {
  .timeline-entry {
    width: 100%;
    align-self: stretch;
  }

  .timeline-entry--left,
  .timeline-entry--right {
    flex-direction: row;
  }

  /* Reset desktop offsets; mobile line position is adjusted in AboutPage */
  .timeline-entry--left .timeline-entry__dot,
  .timeline-entry--right .timeline-entry__dot {
    margin-right: 0;
    margin-left: 0;
  }
}
</style>

