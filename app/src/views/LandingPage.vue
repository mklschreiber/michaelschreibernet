<script setup lang="ts">
import AppNavigation from '@/components/AppNavigation.vue'
import HomeSection from '@/components/sections/HomeSection.vue'
import ProjectsSection from '@/components/sections/ProjectsSection.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'
import { useActiveSection } from '@/composables/useActiveSection'
import { useSectionUrlSync } from '@/composables/useSectionUrlSync'

const { activeSection } = useActiveSection()
useSectionUrlSync(activeSection)
</script>

<template>
  <AppNavigation :active-section="activeSection" />
  <main>
    <HomeSection />
    <ProjectsSection />
    <AboutSection />
    <ContactSection />
  </main>
</template>
