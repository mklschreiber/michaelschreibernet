import { onMounted, onUnmounted, readonly, ref } from 'vue'
import type { Ref } from 'vue'
import { isSectionId, SECTION_IDS } from './useSectionNavigation'
import type { SectionId } from './useSectionNavigation'

/** A 1%-high band at 40% of the viewport height; the section crossing it is active. */
const ACTIVE_SECTION_ROOT_MARGIN = '-40% 0px -59% 0px'

export function useActiveSection(): { activeSection: Readonly<Ref<SectionId>> } {
  const activeSection = ref<SectionId>('home')
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (typeof IntersectionObserver === 'undefined') return

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && isSectionId(entry.target.id)) {
            activeSection.value = entry.target.id
          }
        }
      },
      { rootMargin: ACTIVE_SECTION_ROOT_MARGIN, threshold: 0 },
    )

    for (const id of SECTION_IDS) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
  })

  onUnmounted(() => {
    observer?.disconnect()
    observer = null
  })

  return { activeSection: readonly(activeSection) }
}
