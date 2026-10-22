import { onScopeDispose, readonly, ref } from 'vue'
import type { Ref } from 'vue'

export type TypewriterPhase = 'idle' | 'typing' | 'deleting'

export interface TypewriterOptions {
  /** Pause in ms before character k is typed; length must equal text.length. */
  typeDelays: readonly number[]
  /** Pause in ms between two deleted characters (the first one goes at once). */
  deleteDelay: number
  /** Characters visible at start, 0…text.length. Default 0. */
  initialCount?: number
}

export interface Typewriter {
  count: Readonly<Ref<number>>
  phase: Readonly<Ref<TypewriterPhase>>
  /**
   * Types forward from the current count. A leadDelay > 0 is spent in phase
   * 'idle'; the phase becomes 'typing' when the lead ends (at once if 0).
   */
  type(leadDelay?: number): void
  /** Deletes backwards from the current count; the first character goes synchronously. */
  erase(): void
  /** Cancels the pending step and goes idle; count is kept. */
  stop(): void
}

export function useTypewriter(text: string, options: TypewriterOptions): Typewriter {
  const length = text.length
  const { typeDelays, deleteDelay } = options

  if (typeDelays.length !== length) {
    throw new Error(
      `useTypewriter: expected ${length} type delays, got ${typeDelays.length}`,
    )
  }

  const count = ref(Math.min(Math.max(options.initialCount ?? 0, 0), length))
  const phase = ref<TypewriterPhase>('idle')
  let timer: ReturnType<typeof setTimeout> | undefined

  function cancel(): void {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
  }

  function stop(): void {
    cancel()
    phase.value = 'idle'
  }

  function scheduleType(delay: number): void {
    timer = setTimeout(() => {
      timer = undefined
      count.value += 1
      if (count.value >= length) {
        phase.value = 'idle'
        return
      }
      scheduleType(typeDelays[count.value]!)
    }, delay)
  }

  function type(leadDelay = 0): void {
    cancel()
    if (count.value >= length) {
      phase.value = 'idle'
      return
    }
    if (leadDelay > 0) {
      phase.value = 'idle'
      timer = setTimeout(() => {
        timer = undefined
        startTyping()
      }, leadDelay)
      return
    }
    startTyping()
  }

  function startTyping(): void {
    phase.value = 'typing'
    scheduleType(typeDelays[count.value]!)
  }

  function deleteStep(): void {
    count.value -= 1
    if (count.value <= 0) {
      phase.value = 'idle'
      return
    }
    timer = setTimeout(() => {
      timer = undefined
      deleteStep()
    }, deleteDelay)
  }

  function erase(): void {
    cancel()
    if (count.value <= 0) {
      phase.value = 'idle'
      return
    }
    phase.value = 'deleting'
    deleteStep()
  }

  onScopeDispose(stop)

  return {
    count: readonly(count),
    phase: readonly(phase),
    type,
    erase,
    stop,
  }
}
