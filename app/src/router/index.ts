import { createRouter, createWebHashHistory } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'
import ImpressumPage from '@/views/ImpressumPage.vue'
import DataProtectionPage from '@/views/DataProtectionPage.vue'
import { isPageMetadata, pageMetadata, updatePageMetadata } from '@/seo'
import type { PageMetadata } from '@/seo'
import { isSectionId, scrollToSection } from '@/composables/useSectionNavigation'
import type { SectionId } from '@/composables/useSectionNavigation'
import { consumeSilentSectionSync } from '@/composables/useSectionUrlSync'

declare module 'vue-router' {
  interface RouteMeta {
    seo?: PageMetadata
    section?: SectionId
  }
}

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: LandingPage,
      meta: { seo: pageMetadata.home, section: 'home' },
    },
    {
      path: '/projects',
      name: 'projects',
      component: LandingPage,
      meta: { seo: pageMetadata.home, section: 'projects' },
    },
    {
      path: '/about',
      name: 'about',
      component: LandingPage,
      meta: { seo: pageMetadata.home, section: 'about' },
    },
    {
      path: '/contact',
      name: 'contact',
      component: LandingPage,
      meta: { seo: pageMetadata.home, section: 'contact' },
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
  scrollBehavior(to, from, savedPosition) {
    if (consumeSilentSectionSync(to.meta.section)) return false

    // Positions without `behavior` would follow `html { scroll-behavior: smooth }`.
    const inPage = isSectionId(to.meta.section) && isSectionId(from.meta.section)
    const behavior = inPage ? 'auto' : 'instant'

    if (savedPosition) return { ...savedPosition, behavior }

    if (isSectionId(to.meta.section)) {
      scrollToSection(to.meta.section, behavior)
      return false
    }

    return { top: 0, behavior: 'instant' }
  },
})

router.afterEach((to) => {
  const metadata = to.meta.seo

  if (isPageMetadata(metadata)) {
    updatePageMetadata(metadata, isSectionId(to.meta.section) ? '/' : to.path)
  }
})

export default router
