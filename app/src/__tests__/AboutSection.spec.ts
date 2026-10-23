/**
 * Testing concept — MS-15 Update Profile (business-card link row), moved from
 * AboutPage.spec.ts to the MS-20 AboutSection
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-15
 * Concept: docs/architecture/MS-15-update-profile.md
 *
 * Component level (Vue Test Utils, jsdom), because the change is static
 * markup plus i18n labels:
 * - Xing is gone: no `a[href*="xing"]` and no "Xing" text in the card.
 * - New phone chip: `tel:+491624337334`, no `target`/`rel` (local handler,
 *   like `mailto:`), label "Telefon" / "Phone" (label, not the number — §5).
 * - New Facebook and Instagram chips: exact href (Instagram with trailing
 *   slash), `target="_blank"`, `rel="noopener noreferrer"`, de and en label.
 * - Link order: Email, Phone, LinkedIn, GitHub, Facebook, Instagram (§4).
 * Icon render contract is covered in icons.spec.ts.
 *
 * Testing concept — MS-20 Redesign onepager (AboutSection, D13, AC-6)
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-20
 * Test concept: docs/architecture/MS-20-tests.md.
 * Component level: `#about` labelled by its `h2` "Über mich", the design
 * subtitle, the profile card (`.card`, `h3` name, portrait with explicit
 * 176×176 size), brand-name chip texts, no X chip (open question 1), the
 * timeline limited to `latestTimelineEntries` with `h3` employers in the
 * localized texts, and the `aria-hidden` dashed fade-out connector.
 * User review round 1 (R3): the stagger `--delay` (index × 0.15s) on each
 * entry, no entry visible before the observer reports, and only the
 * intersecting entry turning visible (the stub keeps the observer callback
 * and is called synchronously). The animation itself is a manual check.
 */
import { describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import AboutSection from '@/components/sections/AboutSection.vue'
import { latestTimelineEntries } from '@/data/timeline'
import de from '@/i18n/locales/de'
import en from '@/i18n/locales/en'
import type { MessageSchema } from '@/i18n/types'

/** Callback of the most recent observer, so tests can report intersections synchronously. */
let observerCallback: IntersectionObserverCallback | null = null

vi.stubGlobal(
  'IntersectionObserver',
  class {
    constructor(callback: IntersectionObserverCallback) {
      observerCallback = callback
    }
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  },
)

function createWrapper(locale: 'de' | 'en' = 'de') {
  const i18n = createI18n<[MessageSchema], 'de' | 'en'>({
    legacy: false,
    locale,
    messages: { de, en },
  })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/about', component: { template: '<div />' } },
      { path: '/projects', component: { template: '<div />' } },
      { path: '/contact', component: { template: '<div />' } },
      { path: '/imprint', component: { template: '<div />' } },
      { path: '/privacy', component: { template: '<div />' } },
    ],
  })
  return mount(AboutSection, { global: { plugins: [i18n, router] } })
}

describe('AboutSection', () => {
  it('renders avatar with profile picture image', () => {
    const wrapper = createWrapper()
    const image = wrapper.find('img.profile-card__portrait')
    expect(image.exists()).toBe(true)
    expect(image.attributes('src')).toBe('/profile-picture.jpeg')
    expect(image.attributes('alt')).toBe('Profilbild von Michael Schreiber')
  })

  it('renders name', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.profile-card__name').text()).toBe('Michael Schreiber')
  })

  it('renders role', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.profile-card__role').text()).toBe('Senior Software Engineer')
  })

  it('renders email link with mailto href', () => {
    const wrapper = createWrapper()
    const emailLink = wrapper.find('a[href^="mailto:"]')
    expect(emailLink.exists()).toBe(true)
    expect(emailLink.attributes('href')).toBe('mailto:info@michaelschreiber.net')
  })

  it('renders no Xing link', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('a[href*="xing"]').exists()).toBe(false)
  })

  it('renders no Xing label in the business card', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.profile-card__chips').text()).not.toMatch(/xing/i)
  })

  it('renders the phone link with the new tel: href and the German label', () => {
    const wrapper = createWrapper()
    const phoneLink = wrapper.find('.profile-card__chips a[href^="tel:"]')
    expect(phoneLink.attributes('href')).toBe('tel:+491624337334')
    expect(phoneLink.text()).toBe('Telefon')
  })

  it('renders the phone link with the English label when locale is en', () => {
    const wrapper = createWrapper('en')
    const phoneLink = wrapper.find('.profile-card__chips a[href="tel:+491624337334"]')
    expect(phoneLink.text()).toBe('Phone')
  })

  it('renders the phone link without target and rel', () => {
    const wrapper = createWrapper()
    const phoneLink = wrapper.find('.profile-card__chips a[href="tel:+491624337334"]')
    expect(phoneLink.attributes()).not.toHaveProperty('target')
    expect(phoneLink.attributes()).not.toHaveProperty('rel')
  })

  it('renders Facebook link with the correct href, target, rel, and localized label', () => {
    const wrapper = createWrapper()
    const facebookLink = wrapper.find('a[href="https://www.facebook.com/mklschreiber"]')
    expect(facebookLink.exists()).toBe(true)
    expect(facebookLink.attributes('target')).toBe('_blank')
    expect(facebookLink.attributes('rel')).toBe('noopener noreferrer')
    expect(facebookLink.text()).toBe('Facebook')
    expect(facebookLink.attributes('aria-label')).toBe('Facebook-Profil')
  })

  it('renders Facebook link with the English label when locale is en', () => {
    const wrapper = createWrapper('en')
    const facebookLink = wrapper.find('a[href="https://www.facebook.com/mklschreiber"]')
    expect(facebookLink.attributes('aria-label')).toBe('Facebook Profile')
  })

  it('renders Instagram link with the correct href, target, rel, and localized label', () => {
    const wrapper = createWrapper()
    const instagramLink = wrapper.find('a[href="https://www.instagram.com/mklschreiber/"]')
    expect(instagramLink.exists()).toBe(true)
    expect(instagramLink.attributes('target')).toBe('_blank')
    expect(instagramLink.attributes('rel')).toBe('noopener noreferrer')
    expect(instagramLink.text()).toBe('Instagram')
    expect(instagramLink.attributes('aria-label')).toBe('Instagram-Profil')
  })

  it('renders Instagram link with the English label when locale is en', () => {
    const wrapper = createWrapper('en')
    const instagramLink = wrapper.find('a[href="https://www.instagram.com/mklschreiber/"]')
    expect(instagramLink.attributes('aria-label')).toBe('Instagram Profile')
  })

  it('renders the business-card links in the order Email, Phone, LinkedIn, GitHub, Facebook, Instagram', () => {
    const wrapper = createWrapper()
    const hrefs = wrapper
      .findAll('.profile-card__chips > .contact-chip')
      .map((link) => link.attributes('href'))
    expect(hrefs).toEqual([
      'mailto:info@michaelschreiber.net',
      'tel:+491624337334',
      'https://www.linkedin.com/in/mklschreiber',
      'https://github.com/mklschreiber',
      'https://www.facebook.com/mklschreiber',
      'https://www.instagram.com/mklschreiber/',
    ])
  })

  it('renders LinkedIn link with the correct href, target, rel, and localized label', () => {
    const wrapper = createWrapper()
    const linkedinLink = wrapper.find('a[href="https://www.linkedin.com/in/mklschreiber"]')
    expect(linkedinLink.exists()).toBe(true)
    expect(linkedinLink.attributes('target')).toBe('_blank')
    expect(linkedinLink.attributes('rel')).toBe('noopener noreferrer')
    expect(linkedinLink.text()).toBe('LinkedIn')
    expect(linkedinLink.attributes('aria-label')).toBe('LinkedIn-Profil')
  })

  it('renders LinkedIn link with the English label when locale is en', () => {
    const wrapper = createWrapper('en')
    const linkedinLink = wrapper.find('a[href="https://www.linkedin.com/in/mklschreiber"]')
    expect(linkedinLink.attributes('aria-label')).toBe('LinkedIn Profile')
  })

  it('renders GitHub link with the correct href, target, rel, and localized label', () => {
    const wrapper = createWrapper()
    const githubLink = wrapper.find('a[href="https://github.com/mklschreiber"]')
    expect(githubLink.exists()).toBe(true)
    expect(githubLink.attributes('target')).toBe('_blank')
    expect(githubLink.attributes('rel')).toBe('noopener noreferrer')
    expect(githubLink.text()).toBe('GitHub')
    expect(githubLink.attributes('aria-label')).toBe('GitHub-Profil')
  })

  it('renders GitHub link with the English label when locale is en', () => {
    const wrapper = createWrapper('en')
    const githubLink = wrapper.find('a[href="https://github.com/mklschreiber"]')
    expect(githubLink.attributes('aria-label')).toBe('GitHub Profile')
  })

  it('renders exactly six business-card links, each with an icon', () => {
    const wrapper = createWrapper()
    const links = wrapper.findAll('.profile-card__chips > .contact-chip')
    expect(links).toHaveLength(6)
    links.forEach((link) => {
      expect(link.find('.contact-chip__icon svg').exists()).toBe(true)
    })
  })

  it('renders the timeline list with aria-label', () => {
    const wrapper = createWrapper()
    const list = wrapper.find('ol[aria-label]')
    expect(list.exists()).toBe(true)
  })

  it('renders ol element for timeline', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('ol').exists()).toBe(true)
  })

  it('renders only the 3 newest timeline entries', () => {
    const wrapper = createWrapper()
    const entries = wrapper.findAll('[data-entry-id]')
    expect(entries).toHaveLength(3)
  })

  it('first entry has data-entry-id mercedesBenz (most recent)', () => {
    const wrapper = createWrapper()
    const entries = wrapper.findAll('[data-entry-id]')
    expect(entries[0]?.attributes('data-entry-id')).toBe('mercedesBenz')
  })

  it('alternates sides left/right', () => {
    const wrapper = createWrapper()
    const entries = wrapper.findAll('[data-entry-id]')
    expect(entries[0]?.classes()).toContain('timeline-entry--left')
    expect(entries[1]?.classes()).toContain('timeline-entry--right')
    expect(entries[2]?.classes()).toContain('timeline-entry--left')
  })

  it('renders title in English when locale is en', () => {
    const wrapper = createWrapper('en')
    expect(wrapper.find('.profile-card__name').text()).toBe('Michael Schreiber')
    // Timeline list's aria-label should be in English (no visible heading)
    expect(wrapper.find('ol[aria-label]').attributes('aria-label')).toBe(
      'Professional Experience',
    )
  })
})

describe('AboutSection — onepage section (MS-20)', () => {
  it('renders the section with the id about', () => {
    expect(createWrapper().get('section').attributes('id')).toBe('about')
  })

  it('labels the section with its h2', () => {
    const wrapper = createWrapper()

    expect(wrapper.get('section').attributes('aria-labelledby')).toBe(wrapper.get('h2').attributes('id'))
  })

  it('shows the German title', () => {
    expect(createWrapper('de').get('h2').text()).toBe('Über mich')
  })

  it('shows the German design subtitle', () => {
    expect(createWrapper('de').get('.section__subtitle').text()).toBe(
      'Eine Übersicht über mich und meine Stationen',
    )
  })

  it('renders the profile name as h3', () => {
    expect(createWrapper().find('h3.profile-card__name').exists()).toBe(true)
  })

  it('uses the shared card style for the profile card', () => {
    expect(createWrapper().get('.profile-card').classes()).toContain('card')
  })

  it('reserves the portrait size with width and height attributes', () => {
    const image = createWrapper().get('img.profile-card__portrait')

    expect([image.attributes('width'), image.attributes('height')]).toEqual(['176', '176'])
  })

  it('shows the chip texts E-Mail, Telefon and the brand names', () => {
    expect(createWrapper('de').findAll('.contact-chip').map((chip) => chip.text())).toEqual([
      'E-Mail',
      'Telefon',
      'LinkedIn',
      'GitHub',
      'Facebook',
      'Instagram',
    ])
  })

  it('does not add an X chip', () => {
    expect(createWrapper().find('a[href*="x.com"], a[href*="twitter.com"]').exists()).toBe(false)
  })

  it('renders the timeline entries of latestTimelineEntries in order', () => {
    expect(createWrapper().findAll('[data-entry-id]').map((item) => item.attributes('data-entry-id'))).toEqual(
      latestTimelineEntries.map((entry) => entry.id),
    )
  })

  it('renders the employers as h3 in German', () => {
    expect(createWrapper('de').findAll('.timeline__list h3').map((heading) => heading.text())).toEqual([
      de.about.timeline.entries.mercedesBenz.company,
      de.about.timeline.entries.daimlerTssSenior.company,
      de.about.timeline.entries.daimlerTssConsultant.company,
    ])
  })

  it('renders no older CV entries', () => {
    expect(createWrapper().find('[data-entry-id="uniUlm"]').exists()).toBe(false)
  })

  it('ends the timeline with a fade-out connector hidden from assistive technology', () => {
    expect(createWrapper().get('.timeline__fade').attributes('aria-hidden')).toBe('true')
  })
})

describe('AboutSection — timeline fly-in (MS-20 R3)', () => {
  it('staggers the entries with --delay index × 0.15s', () => {
    const wrapper = createWrapper()
    const delays = wrapper
      .findAll('[data-entry-id]')
      .map((entry) => (entry.element as HTMLElement).style.getPropertyValue('--delay'))
    expect(delays).toEqual(['0s', '0.15s', '0.3s'])
  })

  it('shows no entry as visible before the observer reports', () => {
    const wrapper = createWrapper()
    expect(wrapper.findAll('.timeline-entry--visible')).toHaveLength(0)
  })

  it('marks only the intersecting entry as visible', async () => {
    const wrapper = createWrapper()
    const first = wrapper.get('[data-entry-id="mercedesBenz"]').element
    observerCallback?.(
      [{ isIntersecting: true, target: first } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )
    await nextTick()
    expect(wrapper.findAll('.timeline-entry--visible').map((entry) => entry.attributes('data-entry-id'))).toEqual([
      'mercedesBenz',
    ])
  })
})
