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
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ProjectCard from '@/components/ProjectCard.vue'
import type { Project } from '@/types/project'
import { getTagColor } from '@/utils/tagColor'

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
})
