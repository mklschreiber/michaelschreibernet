import { isNavigationFailure, NavigationFailureType, useRouter } from 'vue-router'

export const SECTION_IDS = ['home', 'projects', 'about', 'contact'] as const
export type SectionId = (typeof SECTION_IDS)[number]

export function isSectionId(value: unknown): value is SectionId {
  return typeof value === 'string' && (SECTION_IDS as readonly string[]).includes(value)
}

/** home → window.scrollTo top 0; others → element.scrollIntoView({ block: 'start' }). */
export function scrollToSection(id: SectionId, behavior: 'auto' | 'instant'): void {
  if (id === 'home') {
    window.scrollTo({ top: 0, behavior })
    return
  }

  document.getElementById(id)?.scrollIntoView({ block: 'start', behavior })
}

export interface SectionNavigation {
  sectionHref(id: SectionId): string
  goToSection(id: SectionId, event?: MouseEvent): Promise<void>
}

function isModifiedClick(event: MouseEvent): boolean {
  return (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
}

export function useSectionNavigation(): SectionNavigation {
  const router = useRouter()

  function sectionHref(id: SectionId): string {
    return router.resolve({ name: id }).href
  }

  async function goToSection(id: SectionId, event?: MouseEvent): Promise<void> {
    if (event) {
      if (isModifiedClick(event)) return
      event.preventDefault()
    }

    const failure = await router.push({ name: id })

    if (isNavigationFailure(failure, NavigationFailureType.duplicated)) {
      scrollToSection(id, 'auto')
    }
  }

  return { sectionHref, goToSection }
}
