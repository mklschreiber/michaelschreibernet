import { createRouter, createWebHashHistory } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'
import ProjectOverviewPage from '@/views/ProjectOverviewPage.vue'
import ContactPage from '@/views/ContactPage.vue'
import ImpressumPage from '@/views/ImpressumPage.vue'
import DataProtectionPage from '@/views/DataProtectionPage.vue'
import { isPageMetadata, pageMetadata, updatePageMetadata } from '@/seo'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingPage,
      meta: { seo: pageMetadata.landing },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutPage.vue'),
      meta: { seo: pageMetadata.about },
    },
    {
      path: '/projects',
      name: 'projects',
      component: ProjectOverviewPage,
      meta: { seo: pageMetadata.projects },
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactPage,
      meta: { seo: pageMetadata.contact },
    },
    {
      path: '/imprint',
      name: 'imprint',
      component: ImpressumPage,
      meta: { seo: pageMetadata.imprint },
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: DataProtectionPage,
      meta: { seo: pageMetadata.privacy },
    },
    // Legacy German paths (MS-16): keep old bookmarks working.
    { path: '/impressum', redirect: '/imprint' },
    { path: '/datenschutz', redirect: '/privacy' },
  ],
})

router.afterEach((to) => {
  const metadata = to.meta.seo

  if (isPageMetadata(metadata)) {
    updatePageMetadata(metadata, to.path)
  }
})

export default router
