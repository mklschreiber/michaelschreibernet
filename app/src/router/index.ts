import { createRouter, createWebHashHistory } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'
import ProjectOverviewPage from '@/views/ProjectOverviewPage.vue'
import ContactPage from '@/views/ContactPage.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingPage,
    },
    {
      path: '/projects',
      name: 'projects',
      component: ProjectOverviewPage,
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactPage,
    },
  ],
})

export default router
