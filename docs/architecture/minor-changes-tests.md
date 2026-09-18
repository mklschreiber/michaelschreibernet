---
type: Test Concept
title: Tests for Minor Changes — Profile Card Links, Contact Email, Avatar, Flat Icons
description: Component coverage for the About page business card's new LinkedIn/GitHub links, corrected email, photo avatar, and flat SVG icons, plus minimal render checks for the four new icon components, and (Round 2) first-time coverage of the new clickable tel:/mailto: links in Impressum, Kontakt, and Profil.
tags: [minor-changes, tests]
timestamp: 2026-09-18T16:00:00+02:00
---

## Requirements Authority

Trello card: https://trello.com/c/Qd2fLMw5/11-minor-changes

The Trello card description is canonical for requirements and acceptance
criteria (LinkedIn profile link, GitHub profile link, consistent
`info@michaelschreiber.net` public contact email, circular profile picture,
flat-styled Xing/GitHub/etc. icons).

## Scope

Tested:

- `app/src/views/AboutPage.vue` business card, at the component level, via
  `app/src/__tests__/AboutPage.spec.ts`:
  - the avatar renders an `<img>` (not the old "MS" text initials) with the
    correct `src="/profile-picture.jpeg"` and the correct localized `alt`
    text — the Developer had already fixed this assertion; verified it
    checks both attributes rather than just one, which it did, so no change
    was needed there.
  - the email link's `mailto:` href is `mailto:info@michaelschreiber.net`
    (regression check on the Developer's existing fix).
  - the existing Xing link still renders with `target="_blank"`,
    `rel="noopener noreferrer"`, extended to also assert its localized label
    text, which was previously unchecked.
  - the new LinkedIn link renders with the correct
    `href="https://www.linkedin.com/in/mklschreiber"`, `target="_blank"`,
    `rel="noopener noreferrer"`, and the correct localized label in both
    `de` (`LinkedIn-Profil`) and `en` (`LinkedIn Profile`).
  - the new GitHub link renders with the correct
    `href="https://github.com/mklschreiber"`, `target="_blank"`,
    `rel="noopener noreferrer"`, and the correct localized label in both
    `de` (`GitHub-Profil`) and `en` (`GitHub Profile`).
  - exactly four business-card links render, each containing an icon `<svg>`
    inside `.about-page__link-icon` — a coarse structural check that the
    icon wiring (email/Xing/LinkedIn/GitHub) is complete and in the expected
    container, without asserting icon identity (that is the icon
    components' own responsibility, tested separately below).
- The four new icon components (`IconEmail.vue`, `IconXing.vue`,
  `IconGithub.vue`, `IconLinkedin.vue`) via a new
  `app/src/__tests__/icons.spec.ts`, using `describe.each` since all four
  share an identical contract: each renders exactly one `<svg>` with
  `viewBox="0 0 24 24"`, `fill="currentColor"` (the flat, solid-fill styling
  the AC requires), and `aria-hidden="true"`. This is a deliberately thin
  test: it confirms each component mounts without error and honors the
  shared flat-icon contract from the architecture concept. It intentionally
  does **not** assert the exact `<path d="...">` string for any icon — that
  data is copied brand-mark/glyph artwork, not application logic; pinning it
  in a test would make the test brittle (it would break on any future path
  tweak or brand-mark refresh) without protecting any real behavior. Icon
  *placement/usage* within the page (are all four rendered, in the right
  links) is already covered by the `AboutPage.spec.ts` integration test
  above, so the icon spec's job is narrowly the components' own render
  contract, not their embedding.

Not tested / explicitly out of scope:

- `app/src/i18n/locales/de.ts` / `en.ts` and `app/src/i18n/types.ts` are not
  given dedicated unit tests — they are static data/typed literals with no
  transformation logic; their correctness is exercised end-to-end by the
  `AboutPage.spec.ts` assertions on rendered localized text in both `de` and
  `en`, and by `vue-tsc` (part of `npm run build`) type-checking
  `MessageSchema` conformance.
- `app/public/profile-picture.jpeg` itself (image content, dimensions,
  file format) — not verifiable or meaningful to assert in jsdom, which
  does not load image bytes; only the `<img src>`/`alt` wiring is tested.
- Visual/manual browser check for the circular avatar crop
  (`border-radius: 50%` + `overflow: hidden` on `.about-page__avatar`) and
  the icons' actual rendered flat appearance — jsdom does not render CSS or
  rasterize SVGs, so a rendered-pixel check is not achievable with Vitest.
  No manual check is recorded as strictly required for this delivery: the
  CSS properties are simple, static, and directly readable in
  `AboutPage.vue`'s `<style>` block (`width/height: 100px`,
  `border-radius: 50%`, `overflow: hidden`, `object-fit: cover` on the
  image), so a future visual regression would be caught by ordinary manual
  QA rather than needing a dedicated automated visual check here.
- `AppFooter.vue` — the architecture concept confirmed it already uses the
  correct email and is out of scope; no code changed there, so no tests were
  added.

### Round 2 — clickable phone/email links in Impressum, Kontakt, Profil

Round 1 confirmed `ImpressumPage.vue` and `DataProtectionPage.vue` already
used the correct email but left both out of test scope since no code
changed there at the time. Round 2 changes all three, so this scope note is
superseded: `ImpressumPage.vue`, `DataProtectionPage.vue`, and
`ContactInformation.vue` are now tested — this is first-time coverage for
all three (no test files previously existed for them, and `AboutPage.spec.ts`
does not mount them).

Tested:

- `app/src/views/ImpressumPage.vue`, via a new `ImpressumPage.spec.ts`: the
  "Kontakt" section's phone number is wrapped in
  `<a href="tel:+4915679724718">` with the display text unchanged
  (`+49 (0) 15679 724718`), and the email address is wrapped in
  `<a href="mailto:info@michaelschreiber.net">` with the display text
  unchanged (`info@michaelschreiber.net`).
- `app/src/views/DataProtectionPage.vue`, via a new
  `DataProtectionPage.spec.ts`: the same two link assertions, scoped to the
  "Hinweis zur verantwortlichen Stelle" section. This is a long, mostly
  static legal page (~480 lines with many unrelated external links in other
  sections), so the test queries narrowly by `a[href^="tel:"]` /
  `a[href^="mailto:"]` (each unique on the page) rather than snapshotting
  the whole rendered output or asserting against the surrounding paragraph
  structure.
- `app/src/components/ContactInformation.vue`, via a new
  `ContactInformation.spec.ts`, mounted with the same `createI18n`
  composition-API pattern used in `AboutPage.spec.ts`/`ProjectCard.spec.ts`:
  the email `<a>` has `href="mailto:info@michaelschreiber.net"` and its text
  equals `t('contact.emailValue')`; the phone `<a>` has
  `href="tel:+4915679724718"` and its text equals `t('contact.phoneValue')`.
  Comparing against `t(...)` rather than a hardcoded display string keeps
  the test aligned with the architecture's decision (§10) that the i18n
  keys own display text while the template owns the fixed href — the test
  would still pass if the display formatting changed, since only the href
  wiring is being verified here, not the display string's exact wording
  (which `AboutPage.spec.ts`-style locale assertions are not needed for,
  since `emailValue`/`phoneValue` are identical in `de` and `en`).

No dedicated regression test was added asserting the `tel:` href does not
contain `(0)` or whitespace (e.g. a `not.toMatch(/\(0\)|\s/)` assertion).
Reasoning: all three exact-href assertions above already compare against
the literal string `'tel:+4915679724718'` with `toBe`, which is strictly
stronger than a `not.toMatch` exclusion check — any regression that
reintroduces the trunk prefix or a stray space/paren would already fail
these `toBe` assertions. A separate negative-pattern test would be
redundant coverage of the same fact, not additional protection.

Not tested / explicitly out of scope (Round 2):

- The unrelated `DataProtectionPage.vue` drive-by cleanup (removal of the
  stray `ion`/`t` tokens outside the SFC blocks, decision §12) — this has no
  observable runtime behavior to assert; the file compiling and the page
  mounting successfully in `DataProtectionPage.spec.ts` already implicitly
  confirms the file is valid, which is the only thing there is to check.
- `AboutPage.vue` — explicitly unchanged this round (decision §7: the
  Round 1 mailto link already satisfies "Profil", and the business card has
  no phone number to link), so no new assertion was added; asserting
  "nothing changed" is not new behavior to cover.
- Link styling (`.section a` / `.info-item a` CSS rules) — not
  asserted, consistent with the Round 1 decision not to test
  `AboutPage.vue`'s CSS rules; jsdom does not apply scoped-style CSS, and
  `ProjectCard.spec.ts`'s raw-source rule-extraction approach was judged
  unnecessary here since these are simple, directly-reviewable one-line
  `color`/`text-decoration` rules, not a token-choice with a regression risk
  like `ProjectCard.vue`'s AC-02 hardcoded-color check.

## Test Cases

| Module | Test Case | Level | Status |
|--------|----------|-------|--------|
| AboutPage | renders navigation | Component | ✅ |
| AboutPage | renders avatar with profile picture image (src + alt) | Component | ✅ |
| AboutPage | renders name | Component | ✅ |
| AboutPage | renders role | Component | ✅ |
| AboutPage | renders email link with corrected mailto href | Component | ✅ |
| AboutPage | renders Xing link with noopener noreferrer and the localized label | Component | ✅ |
| AboutPage | renders LinkedIn link with the correct href, target, rel, and localized label | Component | ✅ |
| AboutPage | renders LinkedIn link with the English label when locale is en | Component | ✅ |
| AboutPage | renders GitHub link with the correct href, target, rel, and localized label | Component | ✅ |
| AboutPage | renders GitHub link with the English label when locale is en | Component | ✅ |
| AboutPage | renders exactly four business-card links, each with an icon | Component | ✅ |
| AboutPage | renders timeline section with aria-label | Component | ✅ |
| AboutPage | renders ol element for timeline | Component | ✅ |
| AboutPage | renders all 8 timeline entries | Component | ✅ |
| AboutPage | first entry has data-entry-id mercedesBenz (most recent) | Component | ✅ |
| AboutPage | alternates sides left/right | Component | ✅ |
| AboutPage | renders title in English when locale is en | Component | ✅ |
| IconEmail / IconXing / IconGithub / IconLinkedin | renders exactly one flat, solid-fill svg with a 0 0 24 24 viewBox | Component | ✅ |
| IconEmail / IconXing / IconGithub / IconLinkedin | hides the icon from assistive technology, relying on the surrounding link text | Component | ✅ |
| ImpressumPage | renders the phone number as a tel: link with the unchanged display text | Component | ✅ |
| ImpressumPage | renders the email address as a mailto: link with the unchanged display text | Component | ✅ |
| DataProtectionPage | renders the responsible-party phone number as a tel: link with the unchanged display text | Component | ✅ |
| DataProtectionPage | renders the responsible-party email address as a mailto: link with the unchanged display text | Component | ✅ |
| ContactInformation | renders the email as a mailto: link with the localized display text | Component | ✅ |
| ContactInformation | renders the phone number as a tel: link with the localized display text | Component | ✅ |

## Untested Areas

- Exact SVG brand-mark path data — not asserted, by design (see Scope); it
  is static copied artwork, not logic, and pinning it would only create
  brittleness.
- Rendered visual appearance of the circular avatar crop and flat icon
  styling — not achievable in jsdom; the underlying CSS is simple and
  statically reviewable, so no separate manual-check step is recorded as
  required.
- `MessageSchema` compile-time enforcement of the new `github`/`linkedin`
  keys — covered implicitly by `vue-tsc` during `npm run build`, not by a
  dedicated Vitest test (type-checking is not a Vitest concern).
- Round 2: a dedicated negative regression test for the `tel:` URI's exact
  format (no `(0)`, no whitespace) was considered and deliberately omitted
  — the exact-string `toBe('tel:+4915679724718')` assertions already used
  in `ImpressumPage.spec.ts`, `DataProtectionPage.spec.ts`, and
  `ContactInformation.spec.ts` are a strictly stronger check than a
  `not.toMatch` exclusion would be (see Scope, Round 2, above).
- Round 2: the `.section a` / `.info-item a` link-styling CSS rules are not
  asserted — jsdom does not apply scoped-style CSS, and these are simple,
  directly-reviewable one-line rules with no regression risk comparable to
  `ProjectCard.vue`'s AC-02 hardcoded-color case that justified a raw-source
  rule-extraction test.
- Round 2: the `DataProtectionPage.vue` stray-token drive-by cleanup
  (decision §12) is not separately tested; the file successfully compiling
  and mounting in `DataProtectionPage.spec.ts` is the only meaningful check
  available for a non-behavioral file-corruption fix.
