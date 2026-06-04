import { describe, it, expect } from 'vitest'
import { timelineEntries } from '@/data/timeline'
import type { TimelineEntry } from '@/data/timeline'

describe('timeline data', () => {
  it('exports exactly 8 entries', () => {
    expect(timelineEntries).toHaveLength(8)
  })

  it('has Mercedes-Benz Tech Innovation as first (most recent) entry', () => {
    expect(timelineEntries[0]?.id).toBe('mercedesBenz')
    expect(timelineEntries[0]?.date).toBe('about.timeline.entries.mercedesBenz.date')
  })

  it('each entry has all required fields', () => {
    timelineEntries.forEach((entry: TimelineEntry) => {
      expect(entry.id).toBeTruthy()
      expect(entry.date).toBeTruthy()
      expect(entry.titleKey).toBeTruthy()
      expect(entry.descriptionKey).toBeTruthy()
    })
  })

  it('all ids are unique', () => {
    const ids = timelineEntries.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('titleKey and descriptionKey follow about.timeline.entries.* pattern', () => {
    timelineEntries.forEach((entry) => {
      expect(entry.titleKey).toMatch(/^about\.timeline\.entries\..+\.company$/)
      expect(entry.descriptionKey).toMatch(/^about\.timeline\.entries\..+\.role$/)
    })
  })
})

