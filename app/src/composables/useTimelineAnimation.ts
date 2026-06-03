import { ref, reactive, onMounted, onUnmounted } from 'vue'

/**
 * Composable for the timeline animation.
 * Observes multiple elements via IntersectionObserver.
 * Once an element becomes visible, it is marked in visibilityMap
 * and observation is stopped (once-behavior).
 */
export function useTimelineAnimation() {
  const entryRefs = ref<HTMLElement[]>([])
  const visibilityMap = reactive<Record<string, boolean>>({})
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset.entryId
            if (id) {
              visibilityMap[id] = true
            }
            observer?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' },
    )

    entryRefs.value.forEach((el) => {
      if (el) observer?.observe(el)
    })
  })

  onUnmounted(() => {
    observer?.disconnect()
    observer = null
  })

  return { entryRefs, visibilityMap }
}

