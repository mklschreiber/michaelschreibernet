/**
 * Testing concept — MS-20 Redesign onepager (AppFooter container, R4)
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-20
 * Architecture: docs/architecture/MS-20-redesign-onepager.md (User Review Round 1, R4).
 * Test concept: docs/architecture/MS-20-tests.md.
 *
 * Source level (`AppFooter.vue?raw`): jsdom applies no scoped CSS and computes
 * no layout, so the box-model contract is checked in the style block — the
 * footer row includes the page padding in its max width, like `.section`, so
 * its content box is the 1180px content width. The visual alignment with the
 * section titles is a manual browser check. Footer links and copyright are
 * covered in App.spec.ts.
 */
import { describe, expect, it } from 'vitest'
import appFooterSource from '@/components/AppFooter.vue?raw'

const styleSource = appFooterSource.slice(appFooterSource.indexOf('<style'))
const mobileStart = styleSource.indexOf('@media (max-width: 768px)')
const desktopStyles = styleSource.slice(0, mobileStart)
const mobileBlock = styleSource.slice(mobileStart)

const containerRule = (source: string) => /\.footer-container\s*\{([^}]*)\}/.exec(source)?.[1] ?? ''

describe('AppFooter — container CSS (source level, MS-20 R4)', () => {
  it('includes the page padding in the footer row max width', () => {
    expect(containerRule(desktopStyles)).toMatch(
      /max-width:\s*calc\(var\(--container-max-width\) \+ 2 \* var\(--page-padding-inline\)\);/,
    )
  })

  it('pads the footer row horizontally with the page padding token', () => {
    expect(containerRule(desktopStyles)).toMatch(/padding:\s*var\(--spacing-lg\) var\(--page-padding-inline\);/)
  })

  it('keeps 24px padding on all sides on mobile', () => {
    expect(containerRule(mobileBlock)).toMatch(/padding:\s*var\(--spacing-lg\);/)
  })
})
