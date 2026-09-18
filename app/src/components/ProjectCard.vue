<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Project } from '@/types/project'
import { getTagColor } from '@/utils/tagColor'

interface Props {
  project: Project
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <article class="project-card">
    <h2>{{ t(project.titleKey) }}</h2>
    <p>{{ t(project.descriptionKey) }}</p>
    <div class="technologies">
      <span
        v-for="tech in project.technologies"
        :key="tech"
        class="tech-badge"
        :style="{ backgroundColor: getTagColor(tech) }"
      >
        {{ tech }}
      </span>
    </div>
    <a
      v-if="project.link"
      :href="project.link"
      target="_blank"
      rel="noopener noreferrer"
      class="project-link"
    >
      {{ t(project.linkTextKey!) }}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
      </svg>
    </a>
  </article>
</template>

<style scoped>
.project-card {
  position: relative;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  padding: var(--spacing-xl);
  padding-top: calc(var(--spacing-xl) + 4px);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
}

.project-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-brand);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-base);
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-glow);
  border-color: transparent;
}

.project-card:hover::before {
  transform: scaleX(1);
}

.project-card h2 {
  font-size: var(--font-size-2xl);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
}

.project-card p {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

.technologies {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.tech-badge {
  color: var(--color-text-primary);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  border: 1px solid rgba(24, 24, 27, 0.06);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.project-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  transition: color var(--transition-base);
  margin-top: var(--spacing-md);
}

.project-link:hover {
  color: var(--color-primary-hover);
}

.project-link svg {
  width: 16px;
  height: 16px;
  transition: transform var(--transition-base);
}

.project-link:hover svg {
  transform: translate(2px, -2px);
}
</style>
