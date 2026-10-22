import { computed, onMounted } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { useTypewriter } from './useTypewriter'
import type { TypewriterPhase } from './useTypewriter'

export const BRAND_TITLE = 'michaelschreiber.net'
/** Half-open [start, end) character ranges of the three title segments (D2a). */
export const BRAND_SEGMENTS = {
  first: [0, 7],
  strong: [7, 16],
  tld: [16, 20],
} as const
export const BRAND_TYPE_DELAYS_MS: readonly number[] = [
  200, 170, 210, 190, 230, 180, 200, 450, 190, 170, 220, 180, 160, 240, 190, 200, 400, 220, 180,
  200,
]
export const BRAND_DELETE_DELAY_MS = 60
export const BRAND_INTRO_DELAY_MS = 800

export interface BrandTitle {
  /** Visible part of "michael". */
  first: ComputedRef<string>
  /** Visible part of "schreiber" (empty until the "s" is typed). */
  strong: ComputedRef<string>
  /** Visible part of ".net" (empty until the "." is typed). */
  tld: ComputedRef<string>
  phase: Readonly<Ref<TypewriterPhase>>
  onPointerEnter(event: PointerEvent): void
  onPointerLeave(event: PointerEvent): void
}

let introPlayed = false

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function useBrandTitle(): BrandTitle {
  const reducedMotion = prefersReducedMotion()
  const playIntro = !introPlayed && !reducedMotion
  introPlayed = true

  const { count, phase, type, erase } = useTypewriter(BRAND_TITLE, {
    typeDelays: BRAND_TYPE_DELAYS_MS,
    deleteDelay: BRAND_DELETE_DELAY_MS,
    initialCount: playIntro ? 0 : BRAND_TITLE.length,
  })

  onMounted(() => {
    if (playIntro) type(BRAND_INTRO_DELAY_MS)
  })

  const segment = ([start, end]: readonly [number, number]): ComputedRef<string> =>
    computed(() => BRAND_TITLE.slice(start, Math.min(Math.max(count.value, start), end)))
  const first = segment(BRAND_SEGMENTS.first)
  const strong = segment(BRAND_SEGMENTS.strong)
  const tld = segment(BRAND_SEGMENTS.tld)

  function ignores(event: PointerEvent): boolean {
    return reducedMotion || event.pointerType === 'touch'
  }

  function onPointerEnter(event: PointerEvent): void {
    if (ignores(event)) return
    erase()
  }

  function onPointerLeave(event: PointerEvent): void {
    if (ignores(event)) return
    type()
  }

  return { first, strong, tld, phase, onPointerEnter, onPointerLeave }
}

/** Test seam: makes the next useBrandTitle() call play the intro again. */
export function resetBrandTitleIntro(): void {
  introPlayed = false
}
