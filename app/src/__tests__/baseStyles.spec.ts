/**
 * Testing concept — MS-20 Redesign onepager (global styles, D2, D8, D11)
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-20
 * Architecture: docs/architecture/MS-20-redesign-onepager.md (D2, D8, D11).
 * Test concept: docs/architecture/MS-20-tests.md.
 *
 * Source level: Vitest does not process CSS (and `?raw` CSS imports are
 * empty), so `base.css`, `variables.css`, `fonts.css` and `main.ts` are read
 * from disk. The scroll contract of AC-2 lives in CSS, not in the router:
 * sections keep `scroll-margin-top: var(--nav-height)`, `--nav-height` is
 * 80px / 72px on mobile, `html` scrolls smoothly and falls back to `auto`
 * under `prefers-reduced-motion`. Also: the global focus ring, the shared
 * `.section` / `.card` classes, self-hosted Inter (no Google Fonts request,
 * licence shipped at `public/fonts/Inter-OFL.txt`)
 * and the style import order in `main.ts`. Visual results need the manual
 * browser checks listed in MS-20-tests.md.
 */
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const srcDir = resolve(__dirname, '..')
const read = (path: string) => readFileSync(resolve(srcDir, path), 'utf8')

const baseCss = read('assets/styles/base.css')
const variablesCss = read('assets/styles/variables.css')
const fontsCss = read('assets/styles/fonts.css')
const mainTs = read('main.ts')

/** Body of the first top-level block that starts with `prelude {`, nested braces included. */
function block(source: string, prelude: string): string {
  const start = source.indexOf(`${prelude} {`)
  if (start === -1) return ''
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

const reducedMotion = block(baseCss, '@media (prefers-reduced-motion: reduce)')
const mobileVariables = block(variablesCss, '@media (max-width: 768px)')

describe('scroll offset and behaviour (AC-2, D2, D11)', () => {
  it('offsets section scroll targets by the header height', () => {
    expect(block(baseCss, '.section')).toMatch(/scroll-margin-top:\s*var\(--nav-height\);/)
  })

  it('defines the desktop header height as 80px', () => {
    expect(block(variablesCss, ':root')).toMatch(/--nav-height:\s*80px;/)
  })

  it('reduces the header height to 72px on mobile', () => {
    expect(mobileVariables).toMatch(/--nav-height:\s*72px;/)
  })

  it('scrolls the page smoothly', () => {
    expect(block(baseCss, 'html')).toMatch(/scroll-behavior:\s*smooth;/)
  })

  it('scrolls without animation under prefers-reduced-motion', () => {
    expect(reducedMotion).toMatch(/html\s*\{\s*scroll-behavior:\s*auto;\s*\}/)
  })

  it('shortens all animations and transitions under prefers-reduced-motion', () => {
    expect(reducedMotion).toMatch(
      /animation-duration:\s*0\.01ms !important;[\s\S]*transition-duration:\s*0\.01ms !important;/,
    )
  })
})

describe('shared design classes (D8)', () => {
  it('draws the focus ring 3px solid primary with 3px offset', () => {
    expect(block(baseCss, ':focus-visible')).toMatch(
      /outline:\s*3px solid var\(--color-primary\);\s*outline-offset:\s*3px;/,
    )
  })

  it('switches the focus ring to the footer text colour inside the footer', () => {
    expect(block(baseCss, '.app-footer :focus-visible')).toMatch(/outline-color:\s*var\(--color-on-footer\);/)
  })

  it('limits section content to the content max width', () => {
    expect(block(baseCss, '.section__inner')).toMatch(/max-width:\s*var\(--container-max-width\);/)
  })

  it('sets the content max width to 1180px', () => {
    expect(block(variablesCss, ':root')).toMatch(/--container-max-width:\s*1180px;/)
  })

  it('sets the page padding to 32px on desktop', () => {
    expect(block(variablesCss, ':root')).toMatch(/--page-padding-inline:\s*32px;/)
  })

  it('reduces the page padding to 24px on mobile', () => {
    expect(mobileVariables).toMatch(/--page-padding-inline:\s*24px;/)
  })

  it('keeps the old brand gradient as --gradient-brand-mark for the header tile (R2)', () => {
    expect(block(variablesCss, ':root')).toMatch(
      /--gradient-brand-mark:\s*linear-gradient\(135deg, #4f46e5 0%, #7c3aed 55%, #06b6d4 100%\);/,
    )
  })

  it('defines no plain --gradient-brand token any more (R2)', () => {
    expect(variablesCss).not.toMatch(/--gradient-brand:/)
  })

  it('gives cards the gradient border', () => {
    expect(block(baseCss, '.card')).toMatch(/var\(--gradient-border\) border-box;/)
  })

  it('maps the primary colour token', () => {
    expect(block(variablesCss, ':root')).toMatch(/--color-primary:\s*#4338ca;/i)
  })
})

describe('self-hosted Inter font (D8)', () => {
  it('declares Inter with font-display swap', () => {
    expect(block(fontsCss, '@font-face')).toMatch(/font-family:\s*['"]?Inter['"]?;[\s\S]*font-display:\s*swap;/)
  })

  it('loads the font from the bundled woff2 file', () => {
    expect(fontsCss).toContain('inter-latin-wght-normal.woff2')
  })

  it('ships the bundled font file', () => {
    expect(existsSync(resolve(srcDir, 'assets/fonts/inter-latin-wght-normal.woff2'))).toBe(true)
  })

  it('ships the Inter licence text in public/fonts', () => {
    expect(existsSync(resolve(srcDir, '../public/fonts/Inter-OFL.txt'))).toBe(true)
  })

  it('no longer keeps the licence next to the font source', () => {
    expect(existsSync(resolve(srcDir, 'assets/fonts/OFL.txt'))).toBe(false)
  })

  it('points to the licence file from fonts.css', () => {
    expect(fontsCss).toContain('public/fonts/Inter-OFL.txt')
  })

  it('does not request Google Fonts', () => {
    expect(`${fontsCss}\n${baseCss}\n${variablesCss}`).not.toMatch(/fonts\.(googleapis|gstatic)\.com/)
  })

  it('uses Inter as the base font family', () => {
    expect(variablesCss).toMatch(/--font-family-base:\s*Inter,/)
  })
})

describe('style imports in main.ts (D8)', () => {
  it('imports fonts, variables and base styles in this order', () => {
    const order = ['fonts.css', 'variables.css', 'base.css'].map((file) => mainTs.indexOf(`styles/${file}`))

    expect([order.every((index) => index > -1), [...order].sort((a, b) => a - b)]).toEqual([true, order])
  })
})
