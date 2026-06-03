export interface TimelineEntry {
  id: string
  date: string
  titleKey: string
  descriptionKey: string
}

/**
 * CV entries – chronologically descending (most recent first).
 */
export const timelineEntries: TimelineEntry[] = [
  {
    id: 'mercedesBenz',
    date: 'about.timeline.entries.mercedesBenz.date',
    titleKey: 'about.timeline.entries.mercedesBenz.company',
    descriptionKey: 'about.timeline.entries.mercedesBenz.role',
  },
  {
    id: 'daimlerTssSenior',
    date: 'about.timeline.entries.daimlerTssSenior.date',
    titleKey: 'about.timeline.entries.daimlerTssSenior.company',
    descriptionKey: 'about.timeline.entries.daimlerTssSenior.role',
  },
  {
    id: 'daimlerTssConsultant',
    date: 'about.timeline.entries.daimlerTssConsultant.date',
    titleKey: 'about.timeline.entries.daimlerTssConsultant.company',
    descriptionKey: 'about.timeline.entries.daimlerTssConsultant.role',
  },
  {
    id: 'uniUlm',
    date: 'about.timeline.entries.uniUlm.date',
    titleKey: 'about.timeline.entries.uniUlm.company',
    descriptionKey: 'about.timeline.entries.uniUlm.role',
  },
  {
    id: 'daimlerWerkstudent',
    date: 'about.timeline.entries.daimlerWerkstudent.date',
    titleKey: 'about.timeline.entries.daimlerWerkstudent.company',
    descriptionKey: 'about.timeline.entries.daimlerWerkstudent.role',
  },
  {
    id: 'hsUlm',
    date: 'about.timeline.entries.hsUlm.date',
    titleKey: 'about.timeline.entries.hsUlm.company',
    descriptionKey: 'about.timeline.entries.hsUlm.role',
  },
  {
    id: 'toUlm',
    date: 'about.timeline.entries.toUlm.date',
    titleKey: 'about.timeline.entries.toUlm.company',
    descriptionKey: 'about.timeline.entries.toUlm.role',
  },
  {
    id: 'asys',
    date: 'about.timeline.entries.asys.date',
    titleKey: 'about.timeline.entries.asys.company',
    descriptionKey: 'about.timeline.entries.asys.role',
  },
]

