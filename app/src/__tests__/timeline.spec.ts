/**
 * Testing concept — timeline data module; MS-20 adds AC-6 (only the newest
 * 3 CV entries are shown).
 *
 * MS-20 (docs/architecture/MS-20-redesign-onepager.md, D14; test concept
 * docs/architecture/MS-20-tests.md): data level — the full CV stays as data,
 * `LATEST_TIMELINE_ENTRY_COUNT` is 3 and `latestTimelineEntries` is the first
 * three entries of the newest-first list (Mercedes-Benz, Daimler TSS Senior,
 * Daimler TSS Consultant). i18n level — the Daimler TSS Senior date uses an
 * en dash in both locales.
 */
import { describe, it, expect } from 'vitest'
import { LATEST_TIMELINE_ENTRY_COUNT, latestTimelineEntries, timelineEntries } from '@/data/timeline'
import type { TimelineEntry } from '@/data/timeline'
import de from '@/i18n/locales/de'
import en from '@/i18n/locales/en'

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

describe('latest timeline entries (MS-20, AC-6)', () => {
  it('limits the onepage to 3 entries', () => {
    expect(LATEST_TIMELINE_ENTRY_COUNT).toBe(3)
  })

  it('contains exactly LATEST_TIMELINE_ENTRY_COUNT entries', () => {
    expect(latestTimelineEntries).toHaveLength(LATEST_TIMELINE_ENTRY_COUNT)
  })

  it('contains the three newest entries, newest first', () => {
    expect(latestTimelineEntries.map((entry) => entry.id)).toEqual([
      'mercedesBenz',
      'daimlerTssSenior',
      'daimlerTssConsultant',
    ])
  })

  it('takes the entries from the head of the full CV', () => {
    expect(latestTimelineEntries).toEqual(timelineEntries.slice(0, 3))
  })

  it('keeps the older entries in the full CV data', () => {
    expect(timelineEntries.slice(3).map((entry) => entry.id)).toEqual([
      'uniUlm',
      'daimlerWerkstudent',
      'hsUlm',
      'toUlm',
      'asys',
    ])
  })
})

describe('timeline i18n (MS-20, D14)', () => {
  it('uses an en dash in the German Daimler TSS Senior date', () => {
    expect(de.about.timeline.entries.daimlerTssSenior.date).toBe('Mai 2018 – März 2022')
  })

  it('uses an en dash in the English Daimler TSS Senior date', () => {
    expect(en.about.timeline.entries.daimlerTssSenior.date).toBe('May 2018 – March 2022')
  })
})
