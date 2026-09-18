---
type: AI Review
title: Review for Minor Changes
description: Round 2 — positive; the new tel:/mailto: links in Impressum, Kontakt, and Profil match the architecture concept exactly, the tel: URI math checks out, and lint/build/unit tests all pass.
tags: [minor-changes, review]
timestamp: 2026-09-18T17:00:00+02:00
verdict: positive
---

## Round 1 — 2026-09-18T09:00:00+02:00

### Scope

Reviewed:

- Architecture concept `docs/architecture/minor-changes.md` and testing
  concept `docs/architecture/minor-changes-tests.md` (both undated `draft`,
  no prior review round).
- Working-tree code changes (uncommitted, on `misc/minor-changes` off
  `main`, which is currently at the same commit as `HEAD`):
  - `app/src/views/AboutPage.vue`
  - `app/src/i18n/locales/de.ts`, `app/src/i18n/locales/en.ts`,
    `app/src/i18n/types.ts`
  - New `app/src/components/icons/IconEmail.vue`, `IconXing.vue`,
    `IconGithub.vue`, `IconLinkedin.vue`
  - New `app/public/profile-picture.jpeg` (verified via `file`: JPEG,
    800×800, progressive)
  - `app/src/__tests__/AboutPage.spec.ts` (updated) and new
    `app/src/__tests__/icons.spec.ts`
  - `docs/architecture/index.md` and `docs/architecture/log.md` updates
- Ran from `app/`: `npm run test:unit -- --run` (10 files / 64 tests, all
  pass), `npm run lint` and `npm run lint:check` (both clean, exit 0),
  `npm run build` (type-check + Vite build succeed).
- Repo-wide `grep -rn "outlook"` across `app/src` confirmed no remaining
  occurrence of the old address outside this concept's own historical
  description in `minor-changes.md`.

### Findings

None.

Verification detail against the five ACs and the concept's specific call-outs:

1. **LinkedIn link** — added at
   `href="https://www.linkedin.com/in/mklschreiber"` with
   `target="_blank" rel="noopener noreferrer"`, localized label
   (`LinkedIn-Profil` / `LinkedIn Profile`), matches the concept's markup
   exactly.
2. **GitHub link** — added at `href="https://github.com/mklschreiber"`,
   same `target`/`rel` treatment, localized label
   (`GitHub-Profil` / `GitHub Profile`), matches the concept.
3. **Email consistency** — `AboutPage.vue`'s mailto and
   `contact.emailValue` (`de.ts`/`en.ts`, consumed by
   `ContactInformation.vue` via `t('contact.emailValue')`) now both use
   `info@michaelschreiber.net`; `ImpressumPage.vue` and
   `DataProtectionPage.vue` already used the correct address (confirmed via
   grep) and were correctly left untouched, matching the concept's scope
   decision.
4. **Profile picture as a circle** — `.about-page__avatar` keeps
   `width/height: 100px; border-radius: 50%;` and gains `overflow: hidden`;
   the new `<img class="about-page__avatar-image" src="/profile-picture.jpeg">`
   gets `width/height: 100%; object-fit: cover; display: block;`, exactly as
   specified. The `background: var(--color-primary)` fallback fill is
   retained. `alt` is bound to `about.businessCard.avatarAlt`, and the
   redundant `:aria-label` on the container div was removed as decided —
   the `<img alt>` is now the sole accessible name source for the avatar,
   which is correct (no accessibility regression: an `<img>` with a
   non-empty `alt` is exposed to assistive technology with that text as its
   accessible name, so removing the container's `aria-label` eliminates a
   redundant/conflicting name rather than removing an accessible one).
5. **Flat icon styling** — all four new icon components use
   `viewBox="0 0 24 24"`, `fill="currentColor"`, no stroke, `aria-hidden="true"`
   on the `<svg>`, sized via `width: 100%; height: 100%` in scoped CSS, no
   props/emits — matches the concept's shared interface shape exactly. The
   four `<path d="...">` strings were inspected for well-formedness (balanced
   command letters, no truncation, proper start/end): all four are complete,
   syntactically valid single-path shapes (IconGithub and IconLinkedin match
   the well-known Simple Icons GitHub/LinkedIn 24×24 mark data; IconEmail is
   the standard Material-style envelope glyph; IconXing is a plausible
   monochrome "X" wordmark path). None end in `Z`, which is fine for a
   solid-fill path (browsers implicitly close unclosed subpaths for fill
   purposes). `ProjectCard.vue`'s unrelated outline arrow icon is confirmed
   untouched, consistent with the concept's decision to leave it as a
   separate, narrowly-scoped style.

Other checks:

- `rel="noopener noreferrer"` is present on all three external `<a
  target="_blank">` links (Xing, LinkedIn, GitHub); the `mailto:` link
  correctly has neither `target` nor `rel`, matching the concept.
- `app/src/i18n/types.ts` gained `github: string` and `linkedin: string` on
  `MessageSchema.about.businessCard`; both `de.ts` and `en.ts` implement
  them, and `vue-tsc --build` (part of `npm run build`) passed, confirming
  the compile-time enforcement the concept relies on instead of a dedicated
  unit test.
- `.about-page__initials` class and its CSS rule are fully removed with no
  orphaned references (`grep` confirms zero remaining occurrences in
  `AboutPage.vue`).
- Test coverage matches the testing concept's table: `AboutPage.spec.ts`
  covers the avatar `<img>` (`src` + localized `alt`), the corrected
  `mailto:` href, the Xing link's `rel`/`target` plus its now-asserted
  localized label, the new LinkedIn/GitHub links' `href`/`target`/`rel` and
  labels in both `de` and `en`, and a structural "exactly four links, each
  with an icon `<svg>`" check. `icons.spec.ts` uses `describe.each` across
  all four icon components to assert the shared `viewBox`/`fill`/
  `aria-hidden` contract without pinning brand-mark path data, as the
  concept and testing concept both call for — this is a deliberate,
  documented scope choice, not a coverage gap. None of these are trivial
  happy-path assertions that would pass regardless of a bug: each targets
  the specific attribute/text the AC depends on (e.g. the LinkedIn/GitHub
  `href` values are asserted as exact strings via the CSS attribute
  selector used to locate the link, not just presence-of-any-link).
- `docs/architecture/index.md` "## Current Concepts" section already lists
  both `minor-changes.md` and `minor-changes-tests.md` with accurate
  one-line summaries; `docs/architecture/log.md` has corresponding dated
  entries for both the concept and test-concept rounds.

### Verdict

positive

## Round 2 — 2026-09-18T17:00:00+02:00

### Scope

Reviewed the Round 2 addition (clickable `tel:`/`mailto:` links in
Impressum, Kontakt, and Profil), triggered by the verbatim user review
feedback: "Bitte alle Telefonnummern sowie Mail-Adressen im Impressum,
Kontakt, Profil als Links pflege d.h. mailto etc."

- `docs/architecture/minor-changes.md`, "### Round 2" subsection
  (decisions §7–§12).
- `docs/architecture/minor-changes-tests.md`, "### Round 2" subsection.
- Working-tree code changes (uncommitted, on `misc/minor-changes` off
  `main`) via `git diff` / `git status`:
  - `app/src/views/ImpressumPage.vue`
  - `app/src/views/DataProtectionPage.vue`
  - `app/src/components/ContactInformation.vue`
  - New `app/src/__tests__/ImpressumPage.spec.ts`,
    `app/src/__tests__/DataProtectionPage.spec.ts`,
    `app/src/__tests__/ContactInformation.spec.ts`
  - Confirmed `app/src/views/AboutPage.vue` has no Round 2 diff (its only
    changes are the already-reviewed Round 1 hunks) and contains no
    phone/tel reference anywhere (`grep -in "tel\|phone\|telefon"` returned
    nothing).
- Ran from `app/`: `npm run test:unit -- --run` (13 files / 70 tests, all
  pass), `npm run lint` (clean, exit 0, no files touched), `npm run build`
  (type-check + Vite build succeed).

### Findings

None.

Verification detail:

1. **`tel:` URI math** — independently recomputed: `+49 (0) 15679 724718`
   is country code `49`, trunk prefix `(0)` (dropped for the
   internationally-dialable form per ITU-T E.123/RFC 3966), and subscriber
   number `15679724718` (11 digits). Concatenating `+49` with the 11-digit
   subscriber number yields `+4915679724718` (13 digits after the `+`),
   which is exactly the implemented `tel:+4915679724718` in all three
   locations. The trunk `0` is correctly dropped, not just whitespace/parens
   stripped — confirms the concept's §8 reasoning is both correct and
   correctly implemented.
2. **Display text unchanged** — in all three locations, the human-readable
   text inside the new `<a>` is byte-identical to the pre-Round-2 text:
   `ImpressumPage.vue` still shows `+49 (0) 15679 724718` and
   `info@michaelschreiber.net` as plain text content inside the new anchors
   (only the `<p>Telefon: ` / `<p>E-Mail: ` prefixes remain outside the
   link, unchanged); `DataProtectionPage.vue`'s combined `<p>` keeps its
   `<br />` and surrounding text untouched, each value individually wrapped;
   `ContactInformation.vue` wraps `{{ t('contact.phoneValue') }}` /
   `{{ t('contact.emailValue') }}` directly, with no i18n value changes in
   `de.ts`/`en.ts` (confirmed no diff to either locale file's `contact.*`
   keys).
3. **`AboutPage.vue` correctly left untouched** — `git diff` for this file
   contains only the already-reviewed Round 1 hunks (avatar, icons,
   LinkedIn/GitHub links); no phone number exists anywhere on the page
   (confirmed by grep), so the concept's §7 claim that "Profil" is already
   fully satisfied by the Round 1 mailto link, with no phone number to add,
   holds.
4. **`DataProtectionPage.vue` drive-by corruption fix** — the diff shows
   exactly two removed lines: the stray `ion` token before `<script setup
   lang="ts">` (was line 1) and the stray `t` token after the closing
   `</style>`. Confirmed via direct read: the file now starts cleanly with
   `<script setup lang="ts">` on line 1 and ends with `</style>` as the last
   line (480 total lines, no trailing stray content). No unintended change
   to surrounding content — the diff for this file contains only these two
   removed lines plus the two phone/email `<a>` wraps in the "Hinweis zur
   verantwortlichen Stelle" section, matching the concept's §12 and Round 2
   "Affected Components" entry exactly.
5. **Href hardcoding in `ContactInformation.vue`** — matches concept §10:
   the `mailto:`/`tel:` hrefs are literal strings in the template, not
   derived from `contact.emailValue`/`contact.phoneValue`; no i18n key was
   added for the href, consistent with the stated reasoning.
6. **Link styling** — `ImpressumPage.vue` gained a new `.section a { color:
   inherit; text-decoration: underline; }` rule (it had none before, as the
   concept states); `DataProtectionPage.vue` needed no CSS change (its
   `.section a` rule pre-existed and applies automatically); `Contact
   Information.vue` gained `.info-item a { color: inherit; text-decoration:
   underline; }`. All three match the concept's §11 markup exactly, and the
   diffs confirm no other CSS rules were touched.

Test coverage verification against the testing concept's Round 2 table:

- `ImpressumPage.spec.ts` and `DataProtectionPage.spec.ts` each assert exact
  `href` values via `toBe('tel:+4915679724718')` /
  `toBe('mailto:info@michaelschreiber.net')` and exact unchanged display
  text via `toBe(...)` on `.text()` — not mere presence checks. Selectors
  (`a[href^="tel:"]` / `a[href^="mailto:"]`) are unique per page, matching
  the concept's rationale for `DataProtectionPage.vue`'s long, mostly-static
  content.
- `ContactInformation.spec.ts` asserts the same exact hrefs and compares
  link text against `t('contact.emailValue')` / `t('contact.phoneValue')`
  (not a hardcoded string), consistent with the architecture's decision
  that the i18n keys own display text while the template owns the fixed
  href (§10) — this means the test would only fail on a wiring bug (wrong
  href, or link text detached from the i18n value), not on formatting
  changes, exactly as the testing concept intends.
- All three new spec files use the same `createI18n` + (for the two page
  specs) `createRouter`/`createMemoryHistory` mounting pattern already
  established by `AboutPage.spec.ts`, consistent with the codebase's
  existing test conventions.
- Confirmed no test regressions: `icons.spec.ts` and the Round 1
  `AboutPage.spec.ts` assertions (unrelated to Round 2) still pass
  unchanged.

Other checks:

- `docs/architecture/index.md` "## Current Concepts" bullet for
  `minor-changes.md` was updated to mention the Round 2 tel:/mailto:
  addition, and the `minor-changes-tests.md` bullet's Round 2 coverage is
  reflected accurately.
- No regression in the previously-reviewed Round 1 scope: `npm run
  test:unit -- --run` shows 70/70 passing across 13 files (up from 64/10 in
  Round 1, consistent with the 3 new spec files added this round), and
  `npm run build`/`npm run lint` are both clean.

### Verdict

positive
