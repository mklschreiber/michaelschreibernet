/**
 * Testing concept — MS-20 Redesign onepager (ProjectsSection)
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-20
 * Architecture: docs/architecture/MS-20-redesign-onepager.md (D6, D12).
 * Design: docs/design/MS-20-1/README.md ("Projekte").
 * Test concept: docs/architecture/MS-20-tests.md.
 *
 * Component level (real de/en locales): `#projects` labelled by its `h2`
 * "Projekte" / "Projects", the design subtitle, one `ProjectCard` per entry
 * of `data/projects.json` in data order with `h3` titles. Card content
 * details are in ProjectCard.spec.ts and projects.spec.ts. Source level
 * (jsdom applies no scoped CSS): the card list is a column with a 32px
 * (`--spacing-xl`) gap and no mobile override (D12: 32px on desktop and
 * mobile), on the projects gradient.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ProjectsSection from '@/components/sections/ProjectsSection.vue'
import projectsSectionSource from '@/components/sections/ProjectsSection.vue?raw'
import ProjectCard from '@/components/ProjectCard.vue'
import projectsData from '@/data/projects.json'
import de from '@/i18n/locales/de'
import en from '@/i18n/locales/en'
import type { MessageSchema } from '@/i18n/types'

// Vitest does not process CSS, so `?raw` CSS imports are empty; read the file from disk.
const variablesSource = readFileSync(resolve(__dirname, '../assets/styles/variables.css'), 'utf8')
const styleSource = projectsSectionSource.slice(projectsSectionSource.indexOf('<style'))

function mountProjects(locale: 'de' | 'en' = 'de') {
  const i18n = createI18n<[MessageSchema], 'de' | 'en'>({
    legacy: false,
    locale,
    messages: { de, en },
  })
  return mount(ProjectsSection, { global: { plugins: [i18n] } })
}

function ruleBody(selector: string): string {
  const start = styleSource.indexOf(`${selector} {`)
  return start === -1 ? '' : styleSource.slice(start, styleSource.indexOf('}', start))
}

describe('ProjectsSection', () => {
  it('renders the section with the id projects', () => {
    expect(mountProjects().get('section').attributes('id')).toBe('projects')
  })

  it('labels the section with its h2', () => {
    const wrapper = mountProjects()

    expect(wrapper.get('section').attributes('aria-labelledby')).toBe(wrapper.get('h2').attributes('id'))
  })

  it('shows the German title', () => {
    expect(mountProjects('de').get('h2').text()).toBe('Projekte')
  })

  it('shows the English title', () => {
    expect(mountProjects('en').get('h2').text()).toBe('Projects')
  })

  it('shows the German design subtitle', () => {
    expect(mountProjects('de').get('.section__subtitle').text()).toBe('Eine Auswahl meiner aktuellen Arbeiten')
  })

  it('renders one card per project', () => {
    expect(mountProjects().findAllComponents(ProjectCard)).toHaveLength(projectsData.length)
  })

  it('renders the cards in data order', () => {
    expect(mountProjects('de').findAll('.project-card h3').map((title) => title.text())).toEqual([
      'myStandby',
      'myStandby – LandingPage',
      'michaelschreiber.net',
    ])
  })
})

describe('ProjectsSection CSS (source level, D12)', () => {
  it('stacks the cards in a column', () => {
    expect(ruleBody('.projects-section__list')).toMatch(/flex-direction:\s*column;/)
  })

  it('separates the cards with the --spacing-xl gap', () => {
    expect(ruleBody('.projects-section__list')).toMatch(/gap:\s*var\(--spacing-xl\);/)
  })

  it('defines --spacing-xl as 32px', () => {
    expect(variablesSource).toMatch(/--spacing-xl:\s*32px;/)
  })

  it('keeps the 32px gap on mobile (no media override)', () => {
    expect(styleSource).not.toMatch(/@media/)
  })

  it('paints the section with the projects gradient', () => {
    expect(ruleBody('.projects-section')).toMatch(/background:\s*var\(--gradient-projects\);/)
  })
})
