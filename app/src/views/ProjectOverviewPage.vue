<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppNavigation from '@/components/AppNavigation.vue'
import ProjectCard from '@/components/ProjectCard.vue'
import type { Project } from '@/types/project'
import projectsData from '@/data/projects.json'

const { t } = useI18n()

const projects = ref<Project[]>(projectsData as Project[])
</script>

<template>
  <div class="project-overview">
    <AppNavigation />

    <main class="content">
      <h1>{{ t('projects.title') }}</h1>
      <p class="subtitle">{{ t('projects.subtitle') }}</p>

      <div class="projects-grid">
        <ProjectCard v-for="project in projects" :key="project.id" :project="project" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.project-overview {
  min-height: 100vh;
}

.content {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-xl);
}

.content h1 {
  font-size: var(--font-size-4xl);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-2xl);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-xl);
}
</style>
