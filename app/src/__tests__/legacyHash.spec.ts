/**
 * Testing concept — MS-22 Canonical host and history routing (D7)
 *
 * Jira: https://mklschreiber.atlassian.net/browse/MS-22
 * Architecture: docs/architecture/MS-22-canonical-host-and-history-routing.md (D7).
 * Test concept: docs/architecture/MS-22-tests.md.
 *
 * - Unit level: `legacyHashPath` maps every legacy `#/…` hash (legal pages,
 *   German legacy paths, section routes, root, unknown paths, query strings)
 *   to the plain path and leaves non-route hashes (`#contact`, empty) alone
 *   (`null`).
 * - jsdom level: `translateLegacyHashUrl` rewrites the real jsdom location
 *   with `history.replaceState` (path set, hash removed, no new history
 *   entry, `history.state` kept) and is a no-op for `#contact` and for an
 *   address without a hash.
 * - Regression (review fix): hashes that would become a protocol-relative URL
 *   (`#//example.com/x`, `#/\example.com`) are not translated, the call does
 *   not throw and the URL stays unchanged; a throwing `replaceState` (spy) is
 *   swallowed so the router module can still load.
 * Isolation: the URL is reset to `/` with `history.replaceState` after every
 * test. No router is created here; the router integration (catch-all,
 * redirects, canonical) is covered in router.spec.ts.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { legacyHashPath, translateLegacyHashUrl } from '@/router/legacyHash'

afterEach(() => {
  vi.restoreAllMocks()
  window.history.replaceState(null, '', '/')
})

describe('legacyHashPath (MS-22, D7)', () => {
  it.each([
    ['#/imprint', '/imprint'],
    ['#/privacy', '/privacy'],
    ['#/impressum', '/impressum'],
    ['#/datenschutz', '/datenschutz'],
    ['#/projects', '/projects'],
    ['#/about', '/about'],
    ['#/contact', '/contact'],
    ['#/', '/'],
    ['#/foo', '/foo'],
    ['#/imprint?x=1', '/imprint?x=1'],
  ])('translates %s to %s', (hash, path) => {
    expect(legacyHashPath(hash)).toBe(path)
  })

  it.each(['#contact', '#', ''])('leaves %j alone', (hash) => {
    expect(legacyHashPath(hash)).toBeNull()
  })

  it.each(['#//example.com/x', '#/\\example.com'])(
    'refuses the protocol-relative hash %s',
    (hash) => {
      expect(legacyHashPath(hash)).toBeNull()
    },
  )
})

describe('translateLegacyHashUrl (MS-22, D7)', () => {
  it('moves a legacy hash route into the path', () => {
    window.history.replaceState(null, '', '/#/privacy')

    translateLegacyHashUrl()

    expect(window.location.pathname).toBe('/privacy')
  })

  it('removes the legacy hash', () => {
    window.history.replaceState(null, '', '/#/privacy')

    translateLegacyHashUrl()

    expect(window.location.hash).toBe('')
  })

  it('keeps the query of the hash route', () => {
    window.history.replaceState(null, '', '/#/imprint?x=1')

    translateLegacyHashUrl()

    expect(`${window.location.pathname}${window.location.search}`).toBe('/imprint?x=1')
  })

  it('replaces the current history entry instead of adding one', () => {
    window.history.replaceState(null, '', '/#/about')
    const length = window.history.length

    translateLegacyHashUrl()

    expect(window.history.length).toBe(length)
  })

  it('keeps the current history state', () => {
    window.history.replaceState({ marker: 'kept' }, '', '/#/about')

    translateLegacyHashUrl()

    expect(window.history.state).toEqual({ marker: 'kept' })
  })

  it('leaves a plain section fragment like #contact unchanged', () => {
    window.history.replaceState(null, '', '/#contact')

    translateLegacyHashUrl()

    expect(`${window.location.pathname}${window.location.hash}`).toBe('/#contact')
  })

  it('leaves an address without a hash unchanged', () => {
    window.history.replaceState(null, '', '/imprint/')

    translateLegacyHashUrl()

    expect(window.location.pathname).toBe('/imprint/')
  })

  it.each(['/#//example.com/x', '/#/\\example.com'])('does not throw for %s', (url) => {
    window.history.replaceState(null, '', url)

    expect(() => translateLegacyHashUrl()).not.toThrow()
  })

  it.each(['/#//example.com/x', '/#/\\example.com'])('leaves the URL %s unchanged', (url) => {
    window.history.replaceState(null, '', url)
    const before = window.location.href

    translateLegacyHashUrl()

    expect(window.location.href).toBe(before)
  })

  it('does not throw when replaceState throws', () => {
    window.history.replaceState(null, '', '/#/privacy')
    vi.spyOn(window.history, 'replaceState').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })

    expect(() => translateLegacyHashUrl()).not.toThrow()
  })
})
