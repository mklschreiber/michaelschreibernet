import { createRouter, createWebHashHistory } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'
import ProjectOverviewPage from '@/views/ProjectOverviewPage.vue'
import ContactPage from '@/views/ContactPage.vue'
import ImpressumPage from '@/views/ImpressumPage.vue'
import DataProtectionPage from '@/views/DataProtectionPage.vue'

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
    {
      path: '/impressum',
      name: 'impressum',
      component: ImpressumPage,
    },
    {
      path: '/datenschutz',
      name: 'datenschutz',
      component: DataProtectionPage,
    },
  ],
})

export default router
