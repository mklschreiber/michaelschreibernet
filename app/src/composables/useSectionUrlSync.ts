import { onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { isNavigationFailure, useRouter } from 'vue-router'
import type { Router } from 'vue-router'
import { isSectionId } from './useSectionNavigation'
import type { SectionId } from './useSectionNavigation'

export const SECTION_URL_SYNC_IDLE_MS = 150

let silentSyncTarget: SectionId | null = null

export function consumeSilentSectionSync(id: SectionId | undefined): boolean {
  const matches = silentSyncTarget !== null && silentSyncTarget === id
  silentSyncTarget = null
  return matches
}

export async function replaceSectionSilently(router: Router, id: SectionId): Promise<void> {
  const current = router.currentRoute.value.meta.section
  if (!isSectionId(current) || current === id) return

  silentSyncTarget = id
  const result = await router.replace({ name: id })
  // No scrollBehavior call follows a failed navigation, so the marker would leak.
  if (isNavigationFailure(result)) silentSyncTarget = null
}

export function useSectionUrlSync(activeSection: Readonly<Ref<SectionId>>): void {
  const router = useRouter()
  let timer: ReturnType<typeof setTimeout> | null = null
  let removeGuard: (() => void) | null = null

  function clearTimer(): void {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  function onScroll(): void {
    clearTimer()
    timer = setTimeout(() => {
      timer = null
      void replaceSectionSilently(router, activeSection.value)
    }, SECTION_URL_SYNC_IDLE_MS)
  }

  onMounted(() => {
    removeGuard = router.beforeEach(() => clearTimer())
    window.addEventListener('scroll', onScroll, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
    clearTimer()
    removeGuard?.()
    removeGuard = null
  })
}
