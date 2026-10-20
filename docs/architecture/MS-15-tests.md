---
type: Test Concept
title: Tests for Update Profile
description: Covers the removed Xing link, the new phone, Facebook and Instagram chips and their order on the About page, the new and removed icon components, and the new phone number on the Contact, Impressum and Datenschutz pages.
tags: [MS-15, tests]
timestamp: 2026-10-20T00:00:00+02:00
---

## Scope

Tested (Vitest, Vue Test Utils, jsdom; files in `app/src/__tests__/`):

- `AboutPage.vue` business-card row: no Xing link or label; the phone chip
  (`tel:+491624337334`, no `target`/`rel`, label "Telefon" / "Phone"); the
  Facebook and Instagram chips (exact href, `target="_blank"`,
  `rel="noopener noreferrer"`, de and en label); six chips, each with an
  icon; the order Email, Phone, LinkedIn, GitHub, Facebook, Instagram.
- Icon components: `IconFacebook`, `IconInstagram` and `IconPhone` join the
  shared render contract (one `svg`, `viewBox="0 0 24 24"`,
  `fill="currentColor"`, `aria-hidden="true"`). A new contract check for all
  listed icons: a single `path`, no `stroke` (concept §2). `IconXing.vue`
  must not exist in `components/icons/`.
- New phone number: `ContactInformation.vue`, `ImpressumPage.vue` and
  `DataProtectionPage.vue` render `tel:+491624337334` (Impressum and
  Datenschutz with the text `+49 (0) 162 4337334`); `contact.phoneValue` is
  `+49 (0) 162 4337334` in de and en.
- Mail (AC 5): the existing tests already check
  `mailto:info@michaelschreiber.net` on About, Contact, Impressum and
  Datenschutz. No change was needed.

Not tested: the visual look of the icons (exact path data) and how the chip
row wraps on narrow screens. jsdom renders no layout.

## Test Cases

| Class / Module | Test Case | Level | Status |
|--------|----------|-------|--------|
| AboutPage | renders no Xing link | Component | ✅ |
| AboutPage | renders no Xing label in the business card | Component | ✅ |
| AboutPage | renders the phone link with the new tel: href and the German label | Component | ✅ |
| AboutPage | renders the phone link with the English label when locale is en | Component | ✅ |
| AboutPage | renders the phone link without target and rel | Component | ✅ |
| AboutPage | renders Facebook link with the correct href, target, rel, and localized label | Component | ✅ |
| AboutPage | renders Facebook link with the English label when locale is en | Component | ✅ |
| AboutPage | renders Instagram link with the correct href, target, rel, and localized label | Component | ✅ |
| AboutPage | renders Instagram link with the English label when locale is en | Component | ✅ |
| AboutPage | renders the business-card links in the order Email, Phone, LinkedIn, GitHub, Facebook, Instagram | Component | ✅ |
| AboutPage | renders exactly six business-card links, each with an icon (updated from four) | Component | ✅ |
| AboutPage | Xing link test removed | — | ✅ |
| icons (IconPhone, IconFacebook, IconInstagram, added) | renders exactly one flat, solid-fill svg with a 0 0 24 24 viewBox | Component | ✅ |
| icons (IconPhone, IconFacebook, IconInstagram, added) | hides the icon from assistive technology | Component | ✅ |
| icons (all eight listed icons) | draws a single solid path without a stroke | Component | ✅ |
| icons (IconXing) | removed from the list | — | ✅ |
| icon set | no longer contains the removed IconXing component | Unit | ✅ |
| ContactInformation | renders the phone number as a tel: link (`tel:+491624337334`, updated) | Component | ✅ |
| ContactInformation | shows the new phone number as the German phone display text | Unit | ✅ |
| ContactInformation | shows the same new phone number as the English phone display text | Unit | ✅ |
| ImpressumPage | renders the phone number as a tel: link with `+49 (0) 162 4337334` (updated) | Component | ✅ |
| DataProtectionPage | renders the phone number as a tel: link with `+49 (0) 162 4337334` (updated) | Component | ✅ |

Results: `npm run test:unit -- --run` 353/353 passed, `npm run lint` clean,
`npm run build` succeeded.

## Untested Areas

- Exact Simple Icons path data and how the icons look: they are static
  vector data, and checking them needs a visual check in the browser. The
  render contract above makes sure they follow the same pattern as the other
  icons.
- How six chips wrap on narrow screens: layout is CSS only (`flex-wrap` was
  there already), and jsdom applies no layout.
- That the old number is gone from the source: the rendered pages above
  check the new number. A manual `grep -rn "15679" app/src app/index.html`
  (concept §6) finds nothing.
- `app/index.html` JSON-LD: not changed in this story (concept §7).
