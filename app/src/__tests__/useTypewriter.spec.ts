/**
 * Testing concept — MS-18 Animated Header Title (useTypewriter)
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-18
 * Architecture: docs/architecture/MS-18-animated-header-title.md (D4).
 * Test concept: docs/architecture/MS-18-tests.md.
 *
 * Unit level: the generic engine runs inside a bare `effectScope()` with
 * `vi.useFakeTimers()` and short, distinct delays (`[10, 20, 30]`,
 * `deleteDelay: 5`) so that each boundary can be checked 1 ms before and at
 * the step. Covered: initial state (default, clamped, mismatched delays),
 * typing rhythm, the lead delay (spent in phase `idle` with exactly one
 * pending timer, `typing` when it ends, cancelled by `erase()`/`stop()`), deleting (first character synchronously, then
 * per delay), no-op calls at the ends, reversals in both directions from the
 * current count, at most one pending timer, `stop()`, and cleanup when the
 * scope is disposed.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import type { EffectScope } from 'vue'
import { useTypewriter } from '@/composables/useTypewriter'
import type { Typewriter, TypewriterOptions } from '@/composables/useTypewriter'

const TEXT = 'abc'
const DELAYS = [10, 20, 30] as const
const DELETE_DELAY = 5

let scope: EffectScope

function createTypewriter(options: Partial<TypewriterOptions> = {}, text = TEXT): Typewriter {
  scope = effectScope()
  return scope.run(() =>
    useTypewriter(text, { typeDelays: DELAYS, deleteDelay: DELETE_DELAY, ...options }),
  )!
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  scope?.stop()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('useTypewriter — initial state', () => {
  it('starts with count 0 by default', () => {
    const typewriter = createTypewriter()

    expect(typewriter.count.value).toBe(0)
  })

  it('starts idle', () => {
    const typewriter = createTypewriter()

    expect(typewriter.phase.value).toBe('idle')
  })

  it('starts with the given initialCount', () => {
    const typewriter = createTypewriter({ initialCount: 2 })

    expect(typewriter.count.value).toBe(2)
  })

  it('clamps a negative initialCount to 0', () => {
    const typewriter = createTypewriter({ initialCount: -4 })

    expect(typewriter.count.value).toBe(0)
  })

  it('clamps an initialCount above the text length to the text length', () => {
    const typewriter = createTypewriter({ initialCount: 99 })

    expect(typewriter.count.value).toBe(3)
  })

  it('schedules nothing on creation', () => {
    createTypewriter()

    expect(vi.getTimerCount()).toBe(0)
  })

  it('throws when the number of type delays does not match the text length', () => {
    expect(() => createTypewriter({ typeDelays: [10, 20] })).toThrow(Error)
  })
})

describe('useTypewriter — type()', () => {
  it('switches to phase typing', () => {
    const typewriter = createTypewriter()

    typewriter.type()

    expect(typewriter.phase.value).toBe('typing')
  })

  it('does not show the first character before its pause', () => {
    const typewriter = createTypewriter()

    typewriter.type()
    vi.advanceTimersByTime(9)

    expect(typewriter.count.value).toBe(0)
  })

  it('shows the first character after typeDelays[0]', () => {
    const typewriter = createTypewriter()

    typewriter.type()
    vi.advanceTimersByTime(10)

    expect(typewriter.count.value).toBe(1)
  })

  it('does not show the second character before typeDelays[1]', () => {
    const typewriter = createTypewriter()

    typewriter.type()
    vi.advanceTimersByTime(10 + 19)

    expect(typewriter.count.value).toBe(1)
  })

  it('shows the second character after typeDelays[1]', () => {
    const typewriter = createTypewriter()

    typewriter.type()
    vi.advanceTimersByTime(10 + 20)

    expect(typewriter.count.value).toBe(2)
  })

  it('stays typing before the last character', () => {
    const typewriter = createTypewriter()

    typewriter.type()
    vi.advanceTimersByTime(10 + 20 + 29)

    expect([typewriter.count.value, typewriter.phase.value]).toEqual([2, 'typing'])
  })

  it('shows the full text after the sum of all pauses', () => {
    const typewriter = createTypewriter()

    typewriter.type()
    vi.advanceTimersByTime(60)

    expect(typewriter.count.value).toBe(3)
  })

  it('goes idle after the last character', () => {
    const typewriter = createTypewriter()

    typewriter.type()
    vi.advanceTimersByTime(60)

    expect(typewriter.phase.value).toBe('idle')
  })

  it('leaves no timer once the text is complete', () => {
    const typewriter = createTypewriter()

    typewriter.type()
    vi.advanceTimersByTime(60)

    expect(vi.getTimerCount()).toBe(0)
  })

  it('delays only the first character by the lead delay', () => {
    const typewriter = createTypewriter()

    typewriter.type(100)
    vi.advanceTimersByTime(109)
    const beforeFirst = typewriter.count.value
    vi.advanceTimersByTime(1)
    const atFirst = typewriter.count.value
    vi.advanceTimersByTime(20)

    expect([beforeFirst, atFirst, typewriter.count.value]).toEqual([0, 1, 2])
  })

  it('continues from initialCount with the pause of that character', () => {
    const typewriter = createTypewriter({ initialCount: 2 })

    typewriter.type()
    vi.advanceTimersByTime(29)
    const before = typewriter.count.value
    vi.advanceTimersByTime(1)

    expect([before, typewriter.count.value]).toEqual([2, 3])
  })

  it('stays idle and schedules nothing at full count', () => {
    const typewriter = createTypewriter({ initialCount: 3 })

    typewriter.type()

    expect([typewriter.phase.value, vi.getTimerCount()]).toEqual(['idle', 0])
  })

  it('restarts the pending pause when called again while typing', () => {
    const typewriter = createTypewriter()

    typewriter.type()
    vi.advanceTimersByTime(8)
    typewriter.type()
    vi.advanceTimersByTime(8)
    const before = typewriter.count.value
    vi.advanceTimersByTime(2)

    expect([before, typewriter.count.value, vi.getTimerCount()]).toEqual([0, 1, 1])
  })
})

describe('useTypewriter — lead delay (D4 lead phase)', () => {
  it('stays idle during the lead (blinking cursor)', () => {
    const typewriter = createTypewriter()

    typewriter.type(100)

    expect(typewriter.phase.value).toBe('idle')
  })

  it('is still idle 1 ms before the lead ends', () => {
    const typewriter = createTypewriter()

    typewriter.type(100)
    vi.advanceTimersByTime(99)

    expect(typewriter.phase.value).toBe('idle')
  })

  it('switches to typing when the lead ends', () => {
    const typewriter = createTypewriter()

    typewriter.type(100)
    vi.advanceTimersByTime(100)

    expect([typewriter.phase.value, typewriter.count.value]).toEqual(['typing', 0])
  })

  it('keeps exactly one pending timer during the lead', () => {
    const typewriter = createTypewriter()

    typewriter.type(100)

    expect(vi.getTimerCount()).toBe(1)
  })

  it('keeps exactly one pending timer after the lead ends', () => {
    const typewriter = createTypewriter()

    typewriter.type(100)
    vi.advanceTimersByTime(100)

    expect(vi.getTimerCount()).toBe(1)
  })

  it('goes idle during the lead even when called while typing', () => {
    const typewriter = createTypewriter()
    typewriter.type()

    typewriter.type(100)

    expect(typewriter.phase.value).toBe('idle')
  })

  it('is typing at once without a lead', () => {
    const typewriter = createTypewriter()

    typewriter.type()

    expect([typewriter.phase.value, vi.getTimerCount()]).toEqual(['typing', 1])
  })

  it('treats type(0) like type() (typing at once)', () => {
    const typewriter = createTypewriter()

    typewriter.type(0)

    expect(typewriter.phase.value).toBe('typing')
  })

  it('stays idle and schedules nothing for a lead at full count', () => {
    const typewriter = createTypewriter({ initialCount: 3 })

    typewriter.type(100)

    expect([typewriter.phase.value, vi.getTimerCount()]).toEqual(['idle', 0])
  })

  it('stop() during the lead cancels it: idle, no timer, count kept', () => {
    const typewriter = createTypewriter()

    typewriter.type(100)
    vi.advanceTimersByTime(50)
    typewriter.stop()
    vi.runAllTimers()

    expect([typewriter.phase.value, vi.getTimerCount(), typewriter.count.value]).toEqual(['idle', 0, 0])
  })

  it('erase() during the lead at count 0 cancels it: idle, no timer', () => {
    const typewriter = createTypewriter()

    typewriter.type(100)
    typewriter.erase()
    vi.runAllTimers()

    expect([typewriter.phase.value, vi.getTimerCount(), typewriter.count.value]).toEqual(['idle', 0, 0])
  })

  it('erase() during the lead with visible characters deletes instead of typing', () => {
    const typewriter = createTypewriter({ initialCount: 2 })

    typewriter.type(100)
    typewriter.erase()

    expect([typewriter.phase.value, typewriter.count.value, vi.getTimerCount()]).toEqual(['deleting', 1, 1])
  })

  it('erase() during the lead never types afterwards', () => {
    const typewriter = createTypewriter({ initialCount: 2 })

    typewriter.type(100)
    typewriter.erase()
    vi.runAllTimers()

    expect(typewriter.count.value).toBe(0)
  })

  it('disposing the scope during the lead clears the timer', () => {
    const typewriter = createTypewriter()
    typewriter.type(100)

    scope.stop()

    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('useTypewriter — erase()', () => {
  it('removes one character synchronously', () => {
    const typewriter = createTypewriter({ initialCount: 3 })

    typewriter.erase()

    expect(typewriter.count.value).toBe(2)
  })

  it('switches to phase deleting', () => {
    const typewriter = createTypewriter({ initialCount: 3 })

    typewriter.erase()

    expect(typewriter.phase.value).toBe('deleting')
  })

  it('removes the next character only after deleteDelay', () => {
    const typewriter = createTypewriter({ initialCount: 3 })

    typewriter.erase()
    vi.advanceTimersByTime(4)
    const before = typewriter.count.value
    vi.advanceTimersByTime(1)

    expect([before, typewriter.count.value]).toEqual([2, 1])
  })

  it('reaches count 0 after (n - 1) × deleteDelay', () => {
    const typewriter = createTypewriter({ initialCount: 3 })

    typewriter.erase()
    vi.advanceTimersByTime(2 * DELETE_DELAY)

    expect(typewriter.count.value).toBe(0)
  })

  it('goes idle at count 0 and leaves no timer', () => {
    const typewriter = createTypewriter({ initialCount: 3 })

    typewriter.erase()
    vi.advanceTimersByTime(2 * DELETE_DELAY)

    expect([typewriter.phase.value, vi.getTimerCount()]).toEqual(['idle', 0])
  })

  it('goes idle at once when only one character is left', () => {
    const typewriter = createTypewriter({ initialCount: 1 })

    typewriter.erase()

    expect([typewriter.count.value, typewriter.phase.value, vi.getTimerCount()]).toEqual([0, 'idle', 0])
  })

  it('stays idle and schedules nothing at count 0', () => {
    const typewriter = createTypewriter()

    typewriter.erase()

    expect([typewriter.count.value, typewriter.phase.value, vi.getTimerCount()]).toEqual([0, 'idle', 0])
  })

  it('never goes below 0', () => {
    const typewriter = createTypewriter({ initialCount: 3 })

    typewriter.erase()
    vi.runAllTimers()

    expect(typewriter.count.value).toBe(0)
  })
})

describe('useTypewriter — reversals (AC 4, AC 5)', () => {
  it('erase() during typing deletes from the current count', () => {
    const typewriter = createTypewriter()

    typewriter.type()
    vi.advanceTimersByTime(30)
    typewriter.erase()

    expect([typewriter.count.value, typewriter.phase.value]).toEqual([1, 'deleting'])
  })

  it('erase() during typing never types another character', () => {
    const typewriter = createTypewriter()

    typewriter.type()
    vi.advanceTimersByTime(30)
    typewriter.erase()
    vi.runAllTimers()

    expect(typewriter.count.value).toBe(0)
  })

  it('type() during deleting continues upwards from the current count', () => {
    const typewriter = createTypewriter({ initialCount: 3 })

    typewriter.erase()
    typewriter.type()

    expect([typewriter.count.value, typewriter.phase.value]).toEqual([2, 'typing'])
  })

  it('type() during deleting uses typeDelays[count] as the next pause', () => {
    const typewriter = createTypewriter({ initialCount: 3 })

    typewriter.erase()
    vi.advanceTimersByTime(DELETE_DELAY)
    typewriter.type()
    vi.advanceTimersByTime(19)
    const before = typewriter.count.value
    vi.advanceTimersByTime(1)

    expect([before, typewriter.count.value]).toEqual([1, 2])
  })

  it('type() during deleting ends with the full text, idle', () => {
    const typewriter = createTypewriter({ initialCount: 3 })

    typewriter.erase()
    typewriter.type()
    vi.runAllTimers()

    expect([typewriter.count.value, typewriter.phase.value]).toEqual([3, 'idle'])
  })

  it('never keeps more than one pending timer while alternating', () => {
    const typewriter = createTypewriter({ initialCount: 3 })
    const timerCounts: number[] = []

    typewriter.erase()
    timerCounts.push(vi.getTimerCount())
    typewriter.type()
    timerCounts.push(vi.getTimerCount())
    typewriter.erase()
    timerCounts.push(vi.getTimerCount())
    typewriter.type(50)
    timerCounts.push(vi.getTimerCount())

    expect(Math.max(...timerCounts)).toBe(1)
  })
})

describe('useTypewriter — stop() and scope disposal', () => {
  it('stop() keeps the count', () => {
    const typewriter = createTypewriter()

    typewriter.type()
    vi.advanceTimersByTime(30)
    typewriter.stop()

    expect(typewriter.count.value).toBe(2)
  })

  it('stop() goes idle', () => {
    const typewriter = createTypewriter()

    typewriter.type()
    typewriter.stop()

    expect(typewriter.phase.value).toBe('idle')
  })

  it('stop() clears the pending timer', () => {
    const typewriter = createTypewriter()

    typewriter.type()
    typewriter.stop()

    expect(vi.getTimerCount()).toBe(0)
  })

  it('disposing the scope clears the pending timer', () => {
    const typewriter = createTypewriter()

    typewriter.type()
    scope.stop()

    expect([vi.getTimerCount(), typewriter.phase.value]).toEqual([0, 'idle'])
  })

  it('disposing the scope freezes the count', () => {
    const typewriter = createTypewriter()

    typewriter.type()
    vi.advanceTimersByTime(10)
    scope.stop()
    vi.runAllTimers()

    expect(typewriter.count.value).toBe(1)
  })

  it('disposing the scope while deleting freezes the count', () => {
    const typewriter = createTypewriter({ initialCount: 3 })

    typewriter.erase()
    scope.stop()
    vi.runAllTimers()

    expect(typewriter.count.value).toBe(2)
  })
})

describe('useTypewriter — readonly state', () => {
  it('exposes count as readonly', () => {
    const typewriter = createTypewriter()
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    ;(typewriter.count as { value: number }).value = 2

    expect(typewriter.count.value).toBe(0)
  })
})
