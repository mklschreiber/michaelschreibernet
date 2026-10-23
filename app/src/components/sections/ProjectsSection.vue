<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ProjectCard from '@/components/ProjectCard.vue'
import type { Project } from '@/types/project'
import projectsData from '@/data/projects.json'

const { t } = useI18n()

const projects: Project[] = projectsData as Project[]
</script>

<template>
  <section id="projects" class="section projects-section" aria-labelledby="projects-title">
    <div class="section__inner">
      <h2 id="projects-title" class="section__title projects-section__title">
        {{ t('projects.title') }}
      </h2>
      <p class="section__subtitle projects-section__subtitle">{{ t('projects.subtitle') }}</p>

      <div class="projects-section__list">
        <ProjectCard v-for="project in projects" :key="project.id" :project="project" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.projects-section {
  background: var(--gradient-projects);
  color: var(--color-on-footer);
}

.projects-section__title {
  background-image: var(--gradient-text-inverse);
}

.projects-section__subtitle {
  color: var(--color-on-footer);
  opacity: 0.88;
}

.projects-section__list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}
</style>
