/**
 * Testing concept — MS-14 myStandby - New Marketing Images (projects data module)
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-14
 * Architecture: docs/architecture/MS-14-mystandby-new-images.md.
 * Test concept: docs/architecture/MS-14-tests.md.
 *
 * - Data level (`projects.json`): the myStandby entry (id 1) lists exactly
 *   Desk, Bedroom, Kitchen first (AC-1 to AC-3) and the three old screenshots
 *   behind them in their old order (AC-4, D1).
 * - Asset level (Node `fs`): the existing data-driven variant tests pick up the
 *   three new bases (existence + real pixel width, AC-5). New cases check the
 *   committed unsuffixed originals (D4).
 * - i18n level: the three new alt keys have the exact de/en texts from D6.
 * - Page level (Vue Test Utils): the first card on `ProjectsSection`
 *   renders six images whose `src` follow the data order, the first image
 *   carries the localized Desk alt text.
 */
/**
 * Testing concept — MS-1 myStandby - LandingPage (projects data module)
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-1
 * Architecture: docs/architecture/MS-1-mystandby-landingpage.md.
 * Test concept: docs/architecture/MS-1-tests.md.
 *
 * - Data level (`projects.json`): the new entry exists (AC-1), is the second
 *   element (D2), carries the description key (AC-2), the website link first
 *   and the GitHub link second (AC-3, AC-4, D1), and the tech tags from D3.
 *   The existing entries keep their URLs after the `link` → `links` migration
 *   and no entry still uses the removed `link`/`linkTextKey` fields.
 * - Asset level (Node `fs` on `app/public/`): for every image `base` of every
 *   project, all six width variants exist and each JPEG really has the pixel
 *   width named in its suffix (AC-5). This also guards future entries.
 * - i18n level: every `titleKey`, `descriptionKey`, link `textKey` and image
 *   `altKey` used in `projects.json` resolves to a non-empty string in both
 *   `de` and `en`; the new texts match the concept (D3, D4).
 * - Page level (Vue Test Utils): `ProjectsSection` renders the new card as
 *   the second card with its localized title, description and both links.
 */
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ProjectsSection from '@/components/sections/ProjectsSection.vue'
import projectsData from '@/data/projects.json'
import de from '@/i18n/locales/de'
import en from '@/i18n/locales/en'
import type { MessageSchema } from '@/i18n/types'
import type { Project } from '@/types/project'

const projects = projectsData as Project[]

const MY_STANDBY_IMAGES = [
  { base: '/mystandby_desk', altKey: 'projects.screenshotMyStandbyDeskAlt' },
  { base: '/mystandby_bedroom', altKey: 'projects.screenshotMyStandbyBedroomAlt' },
  { base: '/mystandby_kitchen', altKey: 'projects.screenshotMyStandbyKitchenAlt' },
  { base: '/mystandby_1_phone', altKey: 'projects.screenshotMyStandbyLockScreenAlt' },
  { base: '/mystandby_2_phone', altKey: 'projects.screenshotMyStandbyCalendarAlt' },
  { base: '/mystandby_3_phone', altKey: 'projects.screenshotMyStandbyLockScreenCloseUpAlt' },
]
const NEW_MY_STANDBY_BASES = ['/mystandby_desk', '/mystandby_bedroom', '/mystandby_kitchen']

const myStandby = projects.find((project) => project.id === 1)

const LANDING_PAGE_TITLE_KEY = 'projects.projectTitleMyStandbyLandingPage'
const WEBSITE_URL = 'https://www.mystandby.app'
const GITHUB_URL = 'https://github.com/mklschreiber/myStandby-LandingPage'
const IMAGE_WIDTHS = [320, 640, 960, 1280, 1600, 1920]

const landingPage = projects.find((project) => project.titleKey === LANDING_PAGE_TITLE_KEY)

// jsdom gives import.meta.url an http scheme, so resolve from the module directory.
const publicDir = resolve(__dirname, '../../public')

function publicFile(path: string): string {
  return resolve(publicDir, `.${path}`)
}

/** Reads the pixel width from the first SOF marker of a JPEG file. */
function jpegWidth(file: string): number {
  const bytes = readFileSync(file)
  let offset = 2
  while (offset < bytes.length) {
    const marker = bytes[offset + 1] ?? 0
    const isStartOfFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)
    if (isStartOfFrame) return bytes.readUInt16BE(offset + 7)
    offset += 2 + bytes.readUInt16BE(offset + 2)
  }
  throw new Error(`No SOF marker found in ${file}`)
}

/** Resolves a dotted i18n key such as `projects.projectTitle` in a locale. */
function message(locale: MessageSchema, key: string): unknown {
  return key
    .split('.')
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined,
      locale,
    )
}

const imageVariants = projects.flatMap((project) =>
  (project.images ?? []).flatMap((image) =>
    IMAGE_WIDTHS.map((width) => ({ file: `${image.base}-${width}.jpg`, width })),
  ),
)

const usedKeys = [
  ...new Set(
    projects.flatMap((project) => [
      project.titleKey,
      project.descriptionKey,
      ...(project.links ?? []).map((link) => link.textKey),
      ...(project.images ?? []).map((image) => image.altKey),
    ]),
  ),
]

const keysPerLocale = (['de', 'en'] as const).flatMap((locale) =>
  usedKeys.map((key) => ({ locale, key })),
)

const locales: Record<'de' | 'en', MessageSchema> = { de, en }

describe('projects data — myStandby - LandingPage entry', () => {
  it('contains the myStandby - LandingPage entry', () => {
    expect(landingPage).toBeDefined()
  })

  it('lists the entry second, directly after the myStandby app', () => {
    expect(projects.map((project) => project.titleKey)).toEqual([
      'projects.projectTitle',
      LANDING_PAGE_TITLE_KEY,
      'projects.projectTitleMichaelSchreiberNet',
    ])
  })

  it('uses id 3 without renumbering the existing ids', () => {
    expect(projects.map((project) => project.id)).toEqual([1, 3, 2])
  })

  it('references its short description key', () => {
    expect(landingPage?.descriptionKey).toBe('projects.projectDescriptionMyStandbyLandingPage')
  })

  it('links the website first and the GitHub repository second', () => {
    expect(landingPage?.links).toEqual([
      { url: WEBSITE_URL, textKey: 'projects.projectLinkTextWebsite' },
      { url: GITHUB_URL, textKey: 'projects.projectLinkTextGithub' },
    ])
  })

  it('uses the same tech tags as michaelschreiber.net', () => {
    expect(landingPage?.technologies).toEqual(['Vue.js', 'GitHub CI/CD', 'GitHub Pages'])
  })

  it('shows the MacBook screenshot first and the phone screenshot second', () => {
    expect(landingPage?.images).toEqual([
      {
        base: '/mystandby_landing_macbook',
        altKey: 'projects.screenshotMyStandbyLandingMacbookAlt',
      },
      { base: '/mystandby_landing_phone', altKey: 'projects.screenshotMyStandbyLandingPhoneAlt' },
    ])
  })
})

describe('projects data — links migration', () => {
  it('keeps the Play Store link of the myStandby app', () => {
    expect(projects[0]?.links).toEqual([
      {
        url: 'https://play.google.com/store/apps/details?id=io.software_lab.mystandby',
        textKey: 'projects.projectLinkText',
      },
    ])
  })

  it('keeps the GitHub link of michaelschreiber.net', () => {
    expect(projects[2]?.links).toEqual([
      {
        url: 'https://github.com/mklschreiber/michaelschreibernet',
        textKey: 'projects.projectLinkTextGithub',
      },
    ])
  })

  it.each(['link', 'linkTextKey'])('no longer uses the removed %s field', (field) => {
    expect(projectsData.flatMap((project) => Object.keys(project))).not.toContain(field)
  })
})

describe('projects data — responsive image variants', () => {
  it.each(imageVariants)('has the variant $file in app/public', ({ file }) => {
    expect(existsSync(publicFile(file))).toBe(true)
  })

  it.each(imageVariants)('scales $file to $width px wide', ({ file, width }) => {
    expect(jpegWidth(publicFile(file))).toBe(width)
  })
})

describe('projects data — i18n keys', () => {
  it.each(keysPerLocale)('resolves $key in $locale', ({ locale, key }) => {
    expect(message(locales[locale], key)).toEqual(expect.stringMatching(/\S/))
  })

  it('uses the untranslated product name as the title in both locales', () => {
    expect([
      de.projects.projectTitleMyStandbyLandingPage,
      en.projects.projectTitleMyStandbyLandingPage,
    ]).toEqual(['myStandby – LandingPage', 'myStandby – LandingPage'])
  })

  it('has the English website link text', () => {
    expect(en.projects.projectLinkTextWebsite).toBe('Visit website')
  })

  it('has the German website link text', () => {
    expect(de.projects.projectLinkTextWebsite).toBe('Website besuchen')
  })

  it('describes the landing page in English', () => {
    expect(en.projects.projectDescriptionMyStandbyLandingPage).toBe(
      'A Vue application serving as the landing page for my app myStandby.',
    )
  })

  it('describes the landing page in German', () => {
    expect(de.projects.projectDescriptionMyStandbyLandingPage).toBe(
      'Eine Vue-Applikation als Landing-Page für meine App myStandby.',
    )
  })
})

function mountPage(locale: 'de' | 'en') {
  const i18n = createI18n<[MessageSchema], 'de' | 'en'>({
    legacy: false,
    locale,
    messages: { de, en },
  })
  return mount(ProjectsSection, {
    global: { plugins: [i18n] },
  })
}

function secondCard(locale: 'de' | 'en') {
  return mountPage(locale).findAll('.project-card')[1]
}

describe('ProjectsSection — myStandby - LandingPage card', () => {
  it('renders three project cards', () => {
    expect(mountPage('en').findAll('.project-card')).toHaveLength(3)
  })

  it('shows the landing page title on the second card', () => {
    expect(secondCard('en')?.find('h3').text()).toBe('myStandby – LandingPage')
  })

  it('shows the English description on the second card', () => {
    expect(secondCard('en')?.text()).toContain(
      'A Vue application serving as the landing page for my app myStandby.',
    )
  })

  it('shows the German description on the second card', () => {
    expect(secondCard('de')?.text()).toContain(
      'Eine Vue-Applikation als Landing-Page für meine App myStandby.',
    )
  })

  it('links the website and the GitHub repository on the second card', () => {
    const hrefs = secondCard('en')
      ?.findAll('a.project-link')
      .map((link) => link.attributes('href'))

    expect(hrefs).toEqual([WEBSITE_URL, GITHUB_URL])
  })

  it('shows the German link texts on the second card', () => {
    const texts = secondCard('de')
      ?.findAll('a.project-link')
      .map((link) => link.text())

    expect(texts).toEqual(['Website besuchen', 'Auf GitHub ansehen'])
  })

  it('renders both screenshots with width-suffixed variants on the second card', () => {
    const sources = secondCard('en')
      ?.findAll('img.project-image')
      .map((image) => image.attributes('src'))

    expect(sources).toEqual([
      '/mystandby_landing_macbook-960.jpg',
      '/mystandby_landing_phone-960.jpg',
    ])
  })
})

describe('projects data — myStandby marketing images (MS-14)', () => {
  it('keeps the myStandby app as the first entry', () => {
    expect(projects[0]?.id).toBe(1)
  })

  it('lists Desk, Bedroom and Kitchen first, then the old screenshots in their old order', () => {
    expect(myStandby?.images).toEqual(MY_STANDBY_IMAGES)
  })

  it('shows the Desk image first', () => {
    expect(myStandby?.images?.[0]?.base).toBe('/mystandby_desk')
  })

  it('shows the Bedroom image second', () => {
    expect(myStandby?.images?.[1]?.base).toBe('/mystandby_bedroom')
  })

  it('shows the Kitchen image third', () => {
    expect(myStandby?.images?.[2]?.base).toBe('/mystandby_kitchen')
  })

  it('keeps all old screenshots behind the new images', () => {
    expect(myStandby?.images?.slice(3).map((image) => image.base)).toEqual([
      '/mystandby_1_phone',
      '/mystandby_2_phone',
      '/mystandby_3_phone',
    ])
  })

  it.each(NEW_MY_STANDBY_BASES)('commits the unsuffixed original %s.jpg', (base) => {
    expect(existsSync(publicFile(`${base}.jpg`))).toBe(true)
  })

  it.each(NEW_MY_STANDBY_BASES)(
    'keeps the original %s.jpg wider than the largest variant',
    (base) => {
      expect(jpegWidth(publicFile(`${base}.jpg`))).toBeGreaterThan(1920)
    },
  )
})

describe('projects data — myStandby marketing image alt texts (MS-14)', () => {
  it('describes the Desk image in English', () => {
    expect(en.projects.screenshotMyStandbyDeskAlt).toBe(
      'myStandby on a smartphone in a charging stand on a desk, showing a flip clock and a photo stack',
    )
  })

  it('describes the Desk image in German', () => {
    expect(de.projects.screenshotMyStandbyDeskAlt).toBe(
      'myStandby auf einem Smartphone in einer Ladestation auf dem Schreibtisch, mit Klappuhr und Fotostapel',
    )
  })

  it('describes the Bedroom image in English', () => {
    expect(en.projects.screenshotMyStandbyBedroomAlt).toBe(
      'myStandby on a smartphone on a bedside table at night, showing the time and date',
    )
  })

  it('describes the Bedroom image in German', () => {
    expect(de.projects.screenshotMyStandbyBedroomAlt).toBe(
      'myStandby auf einem Smartphone auf dem Nachttisch bei Nacht, mit Uhrzeit und Datum',
    )
  })

  it('describes the Kitchen image in English', () => {
    expect(en.projects.screenshotMyStandbyKitchenAlt).toBe(
      'myStandby on a smartphone in a charging stand on a kitchen counter, showing a photo stack',
    )
  })

  it('describes the Kitchen image in German', () => {
    expect(de.projects.screenshotMyStandbyKitchenAlt).toBe(
      'myStandby auf einem Smartphone in einer Ladestation auf der Küchenarbeitsplatte, mit Fotostapel',
    )
  })
})

function firstCard(locale: 'de' | 'en') {
  return mountPage(locale).findAll('.project-card')[0]
}

describe('ProjectsSection — myStandby card with marketing images (MS-14)', () => {
  it('renders the six images in data order on the first card', () => {
    const sources = firstCard('en')
      ?.findAll('img.project-image')
      .map((image) => image.attributes('src'))

    expect(sources).toEqual([
      '/mystandby_desk-960.jpg',
      '/mystandby_bedroom-960.jpg',
      '/mystandby_kitchen-960.jpg',
      '/mystandby_1_phone-960.jpg',
      '/mystandby_2_phone-960.jpg',
      '/mystandby_3_phone-960.jpg',
    ])
  })

  it('shows the English Desk alt text on the first image', () => {
    expect(firstCard('en')?.find('img.project-image').attributes('alt')).toBe(
      en.projects.screenshotMyStandbyDeskAlt,
    )
  })

  it('shows the German Desk alt text on the first image', () => {
    expect(firstCard('de')?.find('img.project-image').attributes('alt')).toBe(
      de.projects.screenshotMyStandbyDeskAlt,
    )
  })

  it('offers width-suffixed variants of the Desk image', () => {
    expect(firstCard('en')?.find('img.project-image').attributes('srcset')).toBe(
      '/mystandby_desk-320.jpg 320w, /mystandby_desk-640.jpg 640w, ' +
        '/mystandby_desk-960.jpg 960w, /mystandby_desk-1280.jpg 1280w, ' +
        '/mystandby_desk-1600.jpg 1600w, /mystandby_desk-1920.jpg 1920w',
    )
  })
})
