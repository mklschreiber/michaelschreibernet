/**
 * Testing concept — MS-1 myStandby - LandingPage (ProjectCard links)
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-1
 * Architecture: docs/architecture/MS-1-mystandby-landingpage.md (D1).
 * Test concept: docs/architecture/MS-1-tests.md.
 * `Project.link`/`linkTextKey` became `links?: ProjectLink[]`. Component
 * tests check one `a.project-link` per entry, in order, inside a single
 * `.project-links` wrapper, each with href, `target="_blank"`,
 * `rel="noopener noreferrer"`, the external-link icon and the localized text;
 * and no wrapper when `links` is missing or empty. The raw source confirms
 * the top margin moved from `.project-link` to `.project-links`.
 *
 * Testing concept — MS-20 Redesign onepager (ProjectCard, D12)
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-20
 * Architecture: docs/architecture/MS-20-redesign-onepager.md (D12).
 * Test concept: docs/architecture/MS-20-tests.md.
 * Component level (real de/en locales): `article` card with an `h3` title;
 * scroll-snap carousel as a labelled `role="group"` ("Bildergalerie: …");
 * every image is a focusable `role="button"`, lazy, with the one shared
 * `sizes` constant and the unchanged srcset; click / Enter / Space open the
 * lightbox at that image's index with the 1920px variants; focusing an image
 * scrolls it into the track (`scrollIntoView` stubbed, jsdom lacks it); no
 * arrow buttons or position status remain; placeholder without images;
 * positional tag colours lilac → sand → rose → lilac; first link filled,
 * the following ones outlined, each with the open-in-new icon.
 */
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import VueEasyLightbox from 'vue-easy-lightbox'
import ProjectCard from '@/components/ProjectCard.vue'
import IconOpenInNew from '@/components/icons/IconOpenInNew.vue'
import IconImagePlaceholder from '@/components/icons/IconImagePlaceholder.vue'
import de from '@/i18n/locales/de'
import en from '@/i18n/locales/en'
import type { MessageSchema } from '@/i18n/types'
import projectCardSource from '@/components/ProjectCard.vue?raw'
import type { Project } from '@/types/project'

// jsdom/vitest do not inject scoped SFC <style> blocks into the DOM, so CSS
// rules are asserted on the raw source.
function extractRuleBody(source: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`).exec(source)
  const body = match?.[1]
  if (body === undefined) {
    throw new Error(`Could not find CSS rule for selector "${selector}" in ProjectCard.vue`)
  }
  return body
}

const mockProject: Project = {
  id: 1,
  titleKey: 'projects.mock.title',
  descriptionKey: 'projects.mock.description',
  technologies: ['Vue.js', 'TypeScript'],
  links: [{ url: 'https://example.com', textKey: 'projects.mock.linkText' }],
}

function createWrapper(project: Project) {
  const i18n = createI18n({
    legacy: false,
    locale: 'de',
    messages: {
      de: {
        projects: {
          mock: {
            title: 'Mock Project',
            description: 'A mock project description.',
            linkText: 'View project',
          },
        },
      },
    },
  })
  return mount(ProjectCard, { props: { project }, global: { plugins: [i18n] } })
}

describe('ProjectCard', () => {
  it('renders one badge per technology', () => {
    const wrapper = createWrapper(mockProject)

    expect(wrapper.findAll('.tech-badge')).toHaveLength(2)
  })

  it('lets the card shrink below its min-content width', () => {
    expect(extractRuleBody(projectCardSource, '.project-card')).toMatch(/min-width:\s*0;/)
  })
})

const twoLinkProject: Project = {
  ...mockProject,
  links: [
    { url: 'https://example.com', textKey: 'projects.mock.linkText' },
    { url: 'https://github.com/example/repo', textKey: 'projects.mock.repoLinkText' },
  ],
}

function createLinkWrapper(project: Project, locale: 'de' | 'en' = 'de') {
  const i18n = createI18n({
    legacy: false,
    locale,
    messages: {
      de: {
        projects: {
          mock: {
            title: 'Mock-Projekt',
            description: 'Eine Mock-Projektbeschreibung.',
            linkText: 'Projekt ansehen',
            repoLinkText: 'Code ansehen',
          },
        },
      },
      en: {
        projects: {
          mock: {
            title: 'Mock project',
            description: 'A mock project description.',
            linkText: 'View project',
            repoLinkText: 'View code',
          },
        },
      },
    },
  })
  return mount(ProjectCard, { props: { project }, global: { plugins: [i18n] } })
}

describe('ProjectCard links', () => {
  it('renders one link per entry', () => {
    const wrapper = createLinkWrapper(twoLinkProject)

    expect(wrapper.findAll('a.project-link')).toHaveLength(2)
  })

  it('renders all links inside a single .project-links wrapper', () => {
    const wrapper = createLinkWrapper(twoLinkProject)

    expect(wrapper.findAll('.project-links > a.project-link')).toHaveLength(2)
  })

  it('renders the links in data order with their URLs', () => {
    const wrapper = createLinkWrapper(twoLinkProject)

    expect(wrapper.findAll('a.project-link').map((link) => link.attributes('href'))).toEqual([
      'https://example.com',
      'https://github.com/example/repo',
    ])
  })

  it('opens every link in a new tab', () => {
    const wrapper = createLinkWrapper(twoLinkProject)

    expect(wrapper.findAll('a.project-link').map((link) => link.attributes('target'))).toEqual([
      '_blank',
      '_blank',
    ])
  })

  it('sets rel="noopener noreferrer" on every link', () => {
    const wrapper = createLinkWrapper(twoLinkProject)

    expect(wrapper.findAll('a.project-link').map((link) => link.attributes('rel'))).toEqual([
      'noopener noreferrer',
      'noopener noreferrer',
    ])
  })

  it('shows the German link texts', () => {
    const wrapper = createLinkWrapper(twoLinkProject, 'de')

    expect(wrapper.findAll('a.project-link').map((link) => link.text())).toEqual([
      'Projekt ansehen',
      'Code ansehen',
    ])
  })

  it('shows the English link texts', () => {
    const wrapper = createLinkWrapper(twoLinkProject, 'en')

    expect(wrapper.findAll('a.project-link').map((link) => link.text())).toEqual([
      'View project',
      'View code',
    ])
  })

  it('keeps the external-link icon in every link', () => {
    const wrapper = createLinkWrapper(twoLinkProject)

    expect(wrapper.findAll('a.project-link svg')).toHaveLength(2)
  })

  it('renders a single link for a project with one link', () => {
    const wrapper = createLinkWrapper(mockProject)

    expect(wrapper.find('a.project-link').attributes('href')).toBe('https://example.com')
  })

  it('renders no link wrapper when links is missing', () => {
    const wrapper = createLinkWrapper({ ...mockProject, links: undefined })

    expect(wrapper.find('.project-links').exists()).toBe(false)
  })

  it('renders no link wrapper when links is empty', () => {
    const wrapper = createLinkWrapper({ ...mockProject, links: [] })

    expect(wrapper.find('.project-links').exists()).toBe(false)
  })

  it('lets the links wrap on narrow screens', () => {
    expect(extractRuleBody(projectCardSource, '.project-links')).toMatch(/flex-wrap:\s*wrap;/)
  })

  it('no longer puts a top margin on each .project-link', () => {
    expect(extractRuleBody(projectCardSource, '.project-link')).not.toMatch(/margin-top/)
  })
})

const galleryProject: Project = {
  id: 2,
  titleKey: 'projects.projectTitle',
  descriptionKey: 'projects.projectDescription',
  technologies: ['Android', 'Kotlin', 'GitHub CI/CD', 'Firebase'],
  images: [
    { base: '/shot_a', altKey: 'projects.screenshotMyStandbyLockScreenAlt' },
    { base: '/shot_b', altKey: 'projects.screenshotMyStandbyCalendarAlt' },
    { base: '/shot_c', altKey: 'projects.screenshotMyStandbyLockScreenCloseUpAlt' },
  ],
  links: [
    { url: 'https://example.com/a', textKey: 'projects.projectTitle' },
    { url: 'https://example.com/b', textKey: 'projects.projectTitle' },
    { url: 'https://example.com/c', textKey: 'projects.projectTitle' },
  ],
}

const IMAGE_SIZES =
  '(max-width: 768px) calc((100vw - 98px) * 0.86), (max-width: 1244px) calc((100vw - 186px) * 0.35), 371px'

function mountGallery(project: Project = galleryProject, locale: 'de' | 'en' = 'de') {
  const i18n = createI18n<[MessageSchema], 'de' | 'en'>({
    legacy: false,
    locale,
    messages: { de, en },
  })
  return mount(ProjectCard, { props: { project }, global: { plugins: [i18n] } })
}

describe('ProjectCard layout (MS-20)', () => {
  it('renders the card as an article', () => {
    expect(mountGallery().element.tagName).toBe('ARTICLE')
  })

  it('renders the title as h3', () => {
    expect(mountGallery().get('h3.project-card__title').text()).toBe('myStandby')
  })

  it('renders the localized description', () => {
    expect(mountGallery(galleryProject, 'en').get('.project-card__description').text()).toBe(
      en.projects.projectDescription,
    )
  })
})

describe('ProjectCard carousel (MS-20, D12)', () => {
  const scrollIntoView = vi.fn()

  beforeEach(() => {
    Element.prototype.scrollIntoView = scrollIntoView
  })

  afterEach(() => {
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
    scrollIntoView.mockReset()
  })

  it('renders the images in a group', () => {
    expect(mountGallery().get('.project-carousel').attributes('role')).toBe('group')
  })

  it('labels the group with the German gallery label', () => {
    expect(mountGallery().get('.project-carousel').attributes('aria-label')).toBe('Bildergalerie: myStandby')
  })

  it('labels the group with the English gallery label', () => {
    expect(mountGallery(galleryProject, 'en').get('.project-carousel').attributes('aria-label')).toBe(
      'Image gallery: myStandby',
    )
  })

  it('renders every image in the track', () => {
    expect(mountGallery().findAll('.project-carousel > img.project-image')).toHaveLength(3)
  })

  it('uses the 960px variant as src', () => {
    expect(mountGallery().get('img.project-image').attributes('src')).toBe('/shot_a-960.jpg')
  })

  it('lists all six width variants in the srcset', () => {
    expect(mountGallery().get('img.project-image').attributes('srcset')).toBe(
      '/shot_a-320.jpg 320w, /shot_a-640.jpg 640w, /shot_a-960.jpg 960w, ' +
        '/shot_a-1280.jpg 1280w, /shot_a-1600.jpg 1600w, /shot_a-1920.jpg 1920w',
    )
  })

  it('gives every image the one sizes value of the new layout', () => {
    expect(mountGallery().findAll('img.project-image').map((image) => image.attributes('sizes'))).toEqual([
      IMAGE_SIZES,
      IMAGE_SIZES,
      IMAGE_SIZES,
    ])
  })

  it('loads the images lazily', () => {
    expect(mountGallery().findAll('img.project-image').map((image) => image.attributes('loading'))).toEqual([
      'lazy',
      'lazy',
      'lazy',
    ])
  })

  it('makes every image a focusable button', () => {
    expect(
      mountGallery()
        .findAll('img.project-image')
        .map((image) => [image.attributes('role'), image.attributes('tabindex')]),
    ).toEqual([
      ['button', '0'],
      ['button', '0'],
      ['button', '0'],
    ])
  })

  it('uses the localized alt texts', () => {
    expect(mountGallery().get('img.project-image').attributes('alt')).toBe(
      de.projects.screenshotMyStandbyLockScreenAlt,
    )
  })

  it('renders no arrow buttons', () => {
    expect(mountGallery().findAll('button')).toHaveLength(0)
  })

  it('renders no position status', () => {
    expect(mountGallery().find('[aria-live]').exists()).toBe(false)
  })

  it('keeps the lightbox closed initially', () => {
    expect(mountGallery().findComponent(VueEasyLightbox).props('visible')).toBe(false)
  })

  it('opens the lightbox at the clicked image', async () => {
    const wrapper = mountGallery()

    await wrapper.findAll('img.project-image')[2]!.trigger('click')

    expect([
      wrapper.findComponent(VueEasyLightbox).props('visible'),
      wrapper.findComponent(VueEasyLightbox).props('index'),
    ]).toEqual([true, 2])
  })

  it('opens the lightbox at the image on Enter', async () => {
    const wrapper = mountGallery()

    await wrapper.findAll('img.project-image')[1]!.trigger('keydown', { key: 'Enter' })

    expect(wrapper.findComponent(VueEasyLightbox).props('index')).toBe(1)
  })

  it('opens the lightbox on Space', async () => {
    const wrapper = mountGallery()

    await wrapper.findAll('img.project-image')[1]!.trigger('keydown', { key: ' ' })

    expect(wrapper.findComponent(VueEasyLightbox).props('visible')).toBe(true)
  })

  it('closes the lightbox when it emits hide', async () => {
    const wrapper = mountGallery()
    await wrapper.get('img.project-image').trigger('click')

    wrapper.findComponent(VueEasyLightbox).vm.$emit('hide')
    await wrapper.vm.$nextTick()

    expect(wrapper.findComponent(VueEasyLightbox).props('visible')).toBe(false)
  })

  it('passes the 1920px variants to the lightbox', () => {
    expect(
      (mountGallery().findComponent(VueEasyLightbox).props('imgs') as { src: string }[]).map((img) => img.src),
    ).toEqual(['/shot_a-1920.jpg', '/shot_b-1920.jpg', '/shot_c-1920.jpg'])
  })

  it('scrolls a focused image into the track', async () => {
    const wrapper = mountGallery()
    const image = wrapper.findAll('img.project-image')[1]!

    await image.trigger('focus')

    expect(scrollIntoView.mock.contexts).toEqual([image.element])
  })

  it('scrolls a focused image only as far as needed', async () => {
    const wrapper = mountGallery()

    await wrapper.get('img.project-image').trigger('focus')

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' })
  })
})

describe('ProjectCard without images (MS-20, D12)', () => {
  const noImageProject: Project = { ...galleryProject, images: undefined }

  it('renders the placeholder', () => {
    expect(mountGallery(noImageProject).findComponent(IconImagePlaceholder).exists()).toBe(true)
  })

  it('hides the placeholder from assistive technology', () => {
    expect(mountGallery(noImageProject).get('.project-image-placeholder').attributes('aria-hidden')).toBe('true')
  })

  it('renders no carousel', () => {
    expect(mountGallery(noImageProject).find('.project-carousel').exists()).toBe(false)
  })

  it('renders the placeholder for an empty image list', () => {
    expect(mountGallery({ ...galleryProject, images: [] }).find('.project-image-placeholder').exists()).toBe(true)
  })
})

describe('ProjectCard tags and links (MS-20, D12)', () => {
  it('colours the tags by position: lilac, sand, rose, then lilac again', () => {
    expect(
      mountGallery()
        .findAll('.tech-badge')
        .map((badge) => badge.classes().find((name) => name.startsWith('tech-badge--'))),
    ).toEqual(['tech-badge--lilac', 'tech-badge--sand', 'tech-badge--rose', 'tech-badge--lilac'])
  })

  it('shows the technology names', () => {
    expect(mountGallery().findAll('.tech-badge').map((badge) => badge.text())).toEqual([
      'Android',
      'Kotlin',
      'GitHub CI/CD',
      'Firebase',
    ])
  })

  it('fills the first link and outlines the following ones', () => {
    expect(
      mountGallery()
        .findAll('a.project-link')
        .map((link) => link.classes().find((name) => name.startsWith('project-link--'))),
    ).toEqual(['project-link--filled', 'project-link--outlined', 'project-link--outlined'])
  })

  it('renders the open-in-new icon in every link', () => {
    expect(mountGallery().findAllComponents(IconOpenInNew)).toHaveLength(3)
  })
})
