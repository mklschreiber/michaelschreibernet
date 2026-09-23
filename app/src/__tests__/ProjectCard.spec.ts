/**
 * Testing concept — Colored Tags (ProjectCard integration)
 *
 * Trello card: https://trello.com/c/u1IyHIJw/8-colored-tags
 * The Trello card description is canonical for requirements and acceptance
 * criteria. `getTagColor`'s own behavior (determinism, hsl shape, always
 * light) is covered in tagColor.spec.ts. This component test only checks
 * the integration points that a pure-function unit test cannot: that each
 * `.tech-badge` gets its inline background-color from `getTagColor` (AC-01),
 * and that the badge text color is the standard token rather than a
 * hardcoded white (AC-02).
 */
/**
 * Testing concept — Mobile Project Screenshot Carousel
 *
 * Trello card: https://trello.com/c/Ha7XlAGu/13-scaling-but-on-mobile-phones-project-page
 * The Trello card description is canonical for requirements. Architecture:
 * docs/architecture/mobile-project-screenshot-carousel.md. Test concept:
 * docs/architecture/mobile-project-screenshot-carousel-tests.md.
 *
 * - Component level (Vue Test Utils + real de/en locales): the
 *   `project-image--active` class follows `currentIndex`; prev/next wrap
 *   around; arrows and the live position status render only when a project
 *   has more than one image; arrows carry localized aria-labels; the status
 *   text is localized; the lightbox opens at the active index and is not
 *   opened by the arrows; the `sizes` attribute starts with the mobile entry.
 * - Source level (raw SFC via `?raw`): jsdom does not apply scoped styles, so
 *   the CSS contract that actually fixes the overflow (AC-1) is asserted on
 *   the source: `min-width: 0` on `.project-card`, `minmax(0, 1fr)` on
 *   `.projects-grid`, and the `@media (max-width: 768px)` block that hides the
 *   non-active images and shows the arrows.
 * - Real rendering at phone widths stays a manual browser check (see the
 *   test concept document).
 */
import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import VueEasyLightbox from 'vue-easy-lightbox'
import ProjectCard from '@/components/ProjectCard.vue'
import projectCardSource from '@/components/ProjectCard.vue?raw'
import projectOverviewPageSource from '@/views/ProjectOverviewPage.vue?raw'
import de from '@/i18n/locales/de'
import en from '@/i18n/locales/en'
import type { MessageSchema } from '@/i18n/types'
import type { Project } from '@/types/project'
import { getTagColor } from '@/utils/tagColor'

// jsdom/vitest do not inject scoped SFC <style> blocks into the DOM, so
// getComputedStyle can't observe the compiled `.tech-badge` CSS rule here.
// Reading the raw source and asserting on the rule's declaration is what
// actually exercises AC-02 (the text-color token, not a hardcoded color).
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
  link: 'https://example.com',
  linkTextKey: 'projects.mock.linkText',
}

// jsdom normalizes an inline `background-color: hsl(...)` style to `rgb(...)`
// when serializing the style attribute. Reproducing that normalization on a
// detached element keeps the comparison behavior-focused (same visible
// color) instead of asserting on the raw, unnormalized hsl string.
function normalizedBackgroundColor(cssColor: string): string {
  const probe = document.createElement('div')
  probe.style.backgroundColor = cssColor
  return probe.style.backgroundColor
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

  it('applies the deterministic background color from getTagColor to each badge', () => {
    const wrapper = createWrapper(mockProject)
    const [vueBadge, typeScriptBadge] = wrapper.findAll<HTMLElement>('.tech-badge')

    expect(vueBadge?.element.style.backgroundColor).toBe(
      normalizedBackgroundColor(getTagColor('Vue.js')),
    )
    expect(typeScriptBadge?.element.style.backgroundColor).toBe(
      normalizedBackgroundColor(getTagColor('TypeScript')),
    )
  })

  it('gives badges with different tag values different background colors', () => {
    const wrapper = createWrapper(mockProject)
    const [firstBadge, secondBadge] = wrapper.findAll('.tech-badge')

    expect(firstBadge?.attributes('style')).not.toBe(secondBadge?.attributes('style'))
  })

  it('only binds the background color inline, leaving text color to the static class', () => {
    const wrapper = createWrapper(mockProject)
    const badge = wrapper.find('.tech-badge')

    // Text color is styled via the static `.tech-badge` class rule
    // (var(--color-text-primary)), never as an inline "color" tied to the
    // tag value, so it stays the regular font color regardless of the
    // generated background (AC-02).
    expect(badge.classes()).toContain('tech-badge')
    expect(badge.attributes('style') ?? '').not.toMatch(/(?<!background-)color:/)
  })

  it('styles .tech-badge text with the standard text-color token, not a hardcoded color', () => {
    const rule = extractRuleBody(projectCardSource, '.tech-badge')

    expect(rule).toMatch(/color:\s*var\(--color-text-primary\)/)
    expect(rule).not.toMatch(/color:\s*(white|#fff(?:fff)?)\s*;/i)
  })
})

// Returns the body of the first `@media <query> { ... }` block, matching
// nested braces, so rules can be asserted to live inside that media query.
// Searches for the `{` opener so comments that mention the query are skipped.
function extractMediaBlock(source: string, query: string): string {
  const start = source.indexOf(`@media ${query} {`)
  if (start === -1) {
    throw new Error(`Could not find "@media ${query}" in source`)
  }
  const open = source.indexOf('{', start)
  let depth = 0
  let end = open
  do {
    if (source[end] === '{') depth++
    if (source[end] === '}') depth--
    end++
  } while (depth > 0 && end < source.length)
  return source.slice(open + 1, end - 1)
}

const galleryProject: Project = {
  id: 2,
  titleKey: 'projects.projectTitle',
  descriptionKey: 'projects.projectDescription',
  technologies: ['Android'],
  images: [
    { base: '/shot_a', altKey: 'projects.screenshotMyStandbyLockScreenAlt' },
    { base: '/shot_b', altKey: 'projects.screenshotMyStandbyCalendarAlt' },
    { base: '/shot_c', altKey: 'projects.screenshotMyStandbyLockScreenCloseUpAlt' },
  ],
}

const singleImageProject: Project = {
  ...galleryProject,
  images: [{ base: '/shot_a', altKey: 'projects.screenshotMyStandbyLockScreenAlt' }],
}

const noImageProject: Project = {
  id: 3,
  titleKey: 'projects.projectTitle',
  descriptionKey: 'projects.projectDescription',
  technologies: ['Android'],
}

function createGalleryWrapper(project: Project, locale: 'de' | 'en' = 'de') {
  const i18n = createI18n<[MessageSchema], 'de' | 'en'>({
    legacy: false,
    locale,
    messages: { de, en },
  })
  return mount(ProjectCard, { props: { project }, global: { plugins: [i18n] } })
}

function activeImageSrc(wrapper: ReturnType<typeof createGalleryWrapper>): string | undefined {
  return wrapper.find('.project-image--active').attributes('src')
}

describe('ProjectCard mobile screenshot carousel', () => {
  it('marks only the first image as active initially', () => {
    const wrapper = createGalleryWrapper(galleryProject)

    expect(wrapper.findAll('.project-image--active')).toHaveLength(1)
    expect(activeImageSrc(wrapper)).toBe('/shot_a-960.jpg')
  })

  it('keeps every image in the DOM so CSS decides what is visible', () => {
    const wrapper = createGalleryWrapper(galleryProject)

    expect(wrapper.findAll('img.project-image')).toHaveLength(3)
  })

  it('renders a previous and a next native button for multiple images', () => {
    const wrapper = createGalleryWrapper(galleryProject)

    expect(wrapper.find('button.gallery-nav--prev').attributes('type')).toBe('button')
    expect(wrapper.find('button.gallery-nav--next').attributes('type')).toBe('button')
  })

  it('orders the gallery as prev arrow, image row, next arrow, status', () => {
    const wrapper = createGalleryWrapper(galleryProject)
    const children = Array.from(wrapper.find('.project-gallery').element.children)

    expect(children.map((child) => child.className)).toEqual([
      'gallery-nav gallery-nav--prev',
      'project-images project-images--gallery',
      'gallery-nav gallery-nav--next',
      'gallery-status',
    ])
  })

  it('renders chevron icons that are hidden from assistive technology', () => {
    const wrapper = createGalleryWrapper(galleryProject)

    expect(wrapper.findAll('.gallery-nav__icon svg[aria-hidden="true"]')).toHaveLength(2)
  })

  it('labels the arrows with the German texts', () => {
    const wrapper = createGalleryWrapper(galleryProject, 'de')

    expect(wrapper.find('.gallery-nav--prev').attributes('aria-label')).toBe(
      'Vorheriger Screenshot',
    )
    expect(wrapper.find('.gallery-nav--next').attributes('aria-label')).toBe('Nächster Screenshot')
  })

  it('labels the arrows with the English texts', () => {
    const wrapper = createGalleryWrapper(galleryProject, 'en')

    expect(wrapper.find('.gallery-nav--prev').attributes('aria-label')).toBe('Previous screenshot')
    expect(wrapper.find('.gallery-nav--next').attributes('aria-label')).toBe('Next screenshot')
  })

  it('moves the active image forward on next', async () => {
    const wrapper = createGalleryWrapper(galleryProject)

    await wrapper.find('.gallery-nav--next').trigger('click')

    expect(activeImageSrc(wrapper)).toBe('/shot_b-960.jpg')
  })

  it('reaches the last image after two nexts', async () => {
    const wrapper = createGalleryWrapper(galleryProject)

    await wrapper.find('.gallery-nav--next').trigger('click')
    await wrapper.find('.gallery-nav--next').trigger('click')

    expect(activeImageSrc(wrapper)).toBe('/shot_c-960.jpg')
  })

  it('wraps from the last image back to the first on next', async () => {
    const wrapper = createGalleryWrapper(galleryProject)

    await wrapper.find('.gallery-nav--next').trigger('click')
    await wrapper.find('.gallery-nav--next').trigger('click')
    await wrapper.find('.gallery-nav--next').trigger('click')

    expect(activeImageSrc(wrapper)).toBe('/shot_a-960.jpg')
  })

  it('wraps from the first image to the last on previous', async () => {
    const wrapper = createGalleryWrapper(galleryProject)

    await wrapper.find('.gallery-nav--prev').trigger('click')

    expect(activeImageSrc(wrapper)).toBe('/shot_c-960.jpg')
  })

  it('moves the active image backward on previous', async () => {
    const wrapper = createGalleryWrapper(galleryProject)

    await wrapper.find('.gallery-nav--next').trigger('click')
    await wrapper.find('.gallery-nav--next').trigger('click')
    await wrapper.find('.gallery-nav--prev').trigger('click')

    expect(activeImageSrc(wrapper)).toBe('/shot_b-960.jpg')
  })

  it('announces the position in a polite live region', () => {
    const wrapper = createGalleryWrapper(galleryProject)

    expect(wrapper.find('.gallery-status').attributes('aria-live')).toBe('polite')
  })

  it('shows the initial German position status', () => {
    const wrapper = createGalleryWrapper(galleryProject, 'de')

    expect(wrapper.find('.gallery-status').text()).toBe('Screenshot 1 von 3')
  })

  it('updates the German status text after next', async () => {
    const wrapper = createGalleryWrapper(galleryProject, 'de')

    await wrapper.find('.gallery-nav--next').trigger('click')

    expect(wrapper.find('.gallery-status').text()).toBe('Screenshot 2 von 3')
  })

  it('updates the English status text after previous wraps around', async () => {
    const wrapper = createGalleryWrapper(galleryProject, 'en')

    await wrapper.find('.gallery-nav--prev').trigger('click')

    expect(wrapper.find('.gallery-status').text()).toBe('Screenshot 3 of 3')
  })

  it('opens the lightbox at the active image when it is clicked', async () => {
    const wrapper = createGalleryWrapper(galleryProject)

    await wrapper.find('.gallery-nav--next').trigger('click')
    await wrapper.find('.project-image--active').trigger('click')

    const lightbox = wrapper.findComponent(VueEasyLightbox)
    expect(lightbox.props('visible')).toBe(true)
    expect(lightbox.props('index')).toBe(1)
  })

  it('opens the lightbox at the active image on Enter', async () => {
    const wrapper = createGalleryWrapper(galleryProject)

    await wrapper.find('.gallery-nav--prev').trigger('click')
    await wrapper.find('.project-image--active').trigger('keydown', { key: 'Enter' })

    expect(wrapper.findComponent(VueEasyLightbox).props('index')).toBe(2)
  })

  it('does not open the lightbox when an arrow is clicked', async () => {
    const wrapper = createGalleryWrapper(galleryProject)

    await wrapper.find('.gallery-nav--next').trigger('click')
    await wrapper.find('.gallery-nav--prev').trigger('click')
    await nextTick()

    expect(wrapper.findComponent(VueEasyLightbox).props('visible')).toBe(false)
  })

  it('renders no arrows for a single image', () => {
    const wrapper = createGalleryWrapper(singleImageProject)

    expect(wrapper.findAll('.gallery-nav')).toHaveLength(0)
  })

  it('renders no position status for a single image', () => {
    const wrapper = createGalleryWrapper(singleImageProject)

    expect(wrapper.find('.gallery-status').exists()).toBe(false)
  })

  it('marks the only image as active for a single image', () => {
    const wrapper = createGalleryWrapper(singleImageProject)

    expect(wrapper.find('img.project-image').classes()).toContain('project-image--active')
  })

  it('renders the placeholder without arrows or status for a project without images', () => {
    const wrapper = createGalleryWrapper(noImageProject)

    expect(wrapper.find('.project-images--placeholder').exists()).toBe(true)
    expect(wrapper.find('.gallery-nav').exists()).toBe(false)
    expect(wrapper.find('.gallery-status').exists()).toBe(false)
  })

  it('advertises the mobile content width first, then the unchanged desktop sizes', () => {
    const wrapper = createGalleryWrapper(galleryProject)

    expect(wrapper.find('img.project-image').attributes('sizes')).toBe(
      '(max-width: 768px) calc(100vw - 128px), ' +
        '(max-width: 804px) 220px, ' +
        '(max-width: 1200px) calc((100vw - 144px) / 3), ' +
        '352px',
    )
  })
})

// jsdom does not apply scoped SFC styles, so the layout contract that fixes
// the overflow (AC-1) and shows one image at a time is asserted on the source.
describe('ProjectCard mobile overflow CSS contract (raw source)', () => {
  const mobileBlock = extractMediaBlock(projectCardSource, '(max-width: 768px)')

  it('lets the card shrink below its min-content width', () => {
    expect(extractRuleBody(projectCardSource, '.project-card')).toMatch(/min-width:\s*0;/)
  })

  it('lets long unbreakable card titles wrap instead of widening the card', () => {
    expect(extractRuleBody(projectCardSource, '.project-card h2')).toMatch(
      /overflow-wrap:\s*anywhere;/,
    )
  })

  it('lets the project grid track shrink below its content width', () => {
    expect(extractRuleBody(projectOverviewPageSource, '.projects-grid')).toMatch(
      /grid-template-columns:\s*minmax\(0,\s*1fr\);/,
    )
  })

  it('hides every non-active image inside the 768px media query', () => {
    expect(extractRuleBody(mobileBlock, '.project-image:not(.project-image--active)')).toMatch(
      /display:\s*none;/,
    )
  })

  it('drops the 220px image min-width inside the 768px media query', () => {
    expect(extractRuleBody(mobileBlock, '.project-image')).toMatch(/min-width:\s*0;/)
  })

  it('hides the arrows and the status outside the media query', () => {
    expect(extractRuleBody(projectCardSource, '.gallery-nav,\n.gallery-status')).toMatch(
      /display:\s*none;/,
    )
  })

  it('shows the arrows inside the 768px media query', () => {
    expect(extractRuleBody(mobileBlock, '.gallery-nav')).toMatch(/display:\s*inline-flex;/)
  })

  it('keeps the TypeScript breakpoint in sync with the CSS media query', () => {
    expect(projectCardSource).toMatch(/const MOBILE_BREAKPOINT = 768\b/)
  })
})
