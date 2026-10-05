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
 * - Page level (Vue Test Utils): `ProjectOverviewPage` renders the new card as
 *   the second card with its localized title, description and both links.
 */
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ProjectOverviewPage from '@/views/ProjectOverviewPage.vue'
import projectsData from '@/data/projects.json'
import de from '@/i18n/locales/de'
import en from '@/i18n/locales/en'
import type { MessageSchema } from '@/i18n/types'
import type { Project } from '@/types/project'

const projects = projectsData as Project[]

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
    ]).toEqual(['myStandby - LandingPage', 'myStandby - LandingPage'])
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
  return mount(ProjectOverviewPage, {
    global: { plugins: [i18n], stubs: { AppNavigation: true } },
  })
}

function secondCard(locale: 'de' | 'en') {
  return mountPage(locale).findAll('.project-card')[1]
}

describe('ProjectOverviewPage — myStandby - LandingPage card', () => {
  it('renders three project cards', () => {
    expect(mountPage('en').findAll('.project-card')).toHaveLength(3)
  })

  it('shows the landing page title on the second card', () => {
    expect(secondCard('en')?.find('h2').text()).toBe('myStandby - LandingPage')
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
