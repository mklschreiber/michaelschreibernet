---
type: Architecture Concept
title: Minor Changes — Profile Card Links, Contact Email, Avatar, Flat Icons
description: Adds LinkedIn and GitHub links, fixes the public contact email to info@michaelschreiber.net everywhere, replaces the text-initials avatar with the supplied profile picture, replaces emoji icons with flat monochrome SVG icons on the About page business card, and (Round 2) makes every phone number and email address in Impressum, Kontakt, and Profil a clickable tel:/mailto: link.
tags: [minor-changes, about-page, i18n, contact, ui, impressum, datenschutz]
timestamp: 2026-09-18T00:00:00+02:00
status: draft
---

## Story

As a visitor to michaelschreiber.net, I want the About page's business card to
show accurate, complete, and consistently styled contact and profile
information (LinkedIn, GitHub, a correct public email address, a real profile
photo, and flat brand icons) so that I can reliably find and trust the ways to
reach or follow Michael Schreiber.

## Requirements Authority

Trello card: https://trello.com/c/Qd2fLMw5/11-minor-changes

The Trello card description is canonical for requirements, acceptance
criteria, dependencies, and ticket state. This card predates the project's
`MSNET-XXXX:` naming and `## User story` / `## Acceptance criteria` /
`## Scope and technical context` / `## Dependencies` template; per established
project precedent, it is treated as ready as-is. `minor-changes` is used as
the story-id slug for this concept and its filename, since the card has no
ticket ID prefix.

## Architecture Decisions

### 1. Scope confirmation

The "profile" referenced by all five acceptance criteria is the business-card
section (`about-page__card`) in `app/src/views/AboutPage.vue`. There is no
other social/contact-link surface in the app — `AppFooter.vue` only has
Impressum/Datenschutz legal links, and `ImpressumPage.vue` /
`DataProtectionPage.vue` already use `info@michaelschreiber.net` correctly.
The only other public-contact-email occurrence needing a fix is the i18n key
`contact.emailValue`, rendered by `ContactInformation.vue` on the Contact
page. `contact.form.emailPlaceholder` is an unrelated form-field placeholder
and is explicitly out of scope.

### 2. Email consistency

Replace every public-facing occurrence of `michael.schreiber@outlook.com`
with `info@michaelschreiber.net`:

- `AboutPage.vue`: the hardcoded `href="mailto:michael.schreiber@outlook.com"`
  becomes `href="mailto:info@michaelschreiber.net"`.
- `i18n/locales/de.ts` and `i18n/locales/en.ts`: `contact.emailValue` changes
  from `"michael.schreiber{'@'}outlook.com"` to
  `"info{'@'}michaelschreiber.net"`, keeping the existing `{'@'}` ICU
  message-syntax escaping convention already used for this key (and for
  `form.emailPlaceholder`, which is untouched).

No other files reference the outlook address (`ImpressumPage.vue` and
`DataProtectionPage.vue` were verified to already use
`info@michaelschreiber.net`).

### 3. Avatar: real photo instead of text initials

`app/public/profile-picture.jpeg` (800×800, already square) has been added to
the repo by the coordinator. The project's established convention for public
static assets is a root-relative `<img src="/...">` reference — not a Vite
`import.meta.env.BASE_URL`-prefixed path or a CSS `background-image` — as
seen in `LandingPage.vue` (`<img src="/logo_anim.gif">`,
`background-image: url('/bg_image-640.jpg')`). The router is the only place
that manually prefixes `import.meta.env.BASE_URL`, because it configures
history mode, not an asset URL.

Decision: use an `<img>` element, matching `LandingPage.vue`'s logo pattern
rather than introducing a new CSS `background-image` pattern into
`AboutPage.vue` for a single image:

```html
<div class="about-page__avatar">
  <img
    class="about-page__avatar-image"
    src="/profile-picture.jpeg"
    :alt="t('about.businessCard.avatarAlt')"
  />
</div>
```

- The existing `about.businessCard.avatarAlt` i18n key is reused verbatim as
  the `<img alt>` — this is the semantically correct place for alt text (an
  `<img>` in a role-less container), so the current `:aria-label` on the
  `.about-page__avatar` div is removed to avoid a redundant/conflicting
  accessible name between the container and the image.
- `.about-page__avatar` keeps its existing `width: 100px; height: 100px;
  border-radius: 50%;` and gains `overflow: hidden;` so the circular crop is
  enforced by the container regardless of the image's native aspect ratio.
  `background: var(--color-primary)` is kept as a fallback fill (visible
  briefly while the image loads, or if it fails to load), rather than removed.
- `.about-page__avatar-image` gets `width: 100%; height: 100%; object-fit:
  cover; display: block;` so an 800×800 source always fills the 100px circle
  without distortion, and stays correct if the avatar's box size ever changes.
- `.about-page__initials` (the "MS" span) and its CSS rule are removed; they
  are fully superseded by the photo.

### 4. Flat icons for the four business-card links

The AC requires the Xing/GitHub/etc. link icons to move from ad-hoc emoji
(`✉️`, `💼`) to a "flat styling." `ProjectCard.vue` already establishes one
inline-SVG convention in this codebase for its external-link arrow: no icon
library dependency, `xmlns="http://www.w3.org/2000/svg"`, sized via
width/height, `stroke="currentColor"` outline style, `fill="none"`.

That specific *outline* rendering (stroke-only, no fill) works for a generic
arrow glyph but does not work for brand marks: GitHub's octocat, LinkedIn's
"in" mark, and Xing's "X" mark are conventionally recognized as solid
silhouettes, not line-art, and official brand guidelines for all three only
provide solid monochrome variants. Redrawing them as stroke outlines would
produce unrecognizable, non-brand-accurate shapes.

Decision: introduce a second, narrowly-scoped flat-icon style for this one
link row, consistent with itself, rather than forcing a stroke-outline style
that doesn't fit brand marks:

- All four icons (email, Xing, GitHub, LinkedIn) are solid-fill, single-color
  SVGs: `viewBox="0 0 24 24"`, `fill="currentColor"`, no stroke. This keeps
  the row visually consistent (same fill technique, same color, same size)
  even though it differs from `ProjectCard.vue`'s unrelated outline arrow,
  which serves a different purpose (a generic "opens externally" affordance
  next to a project link, not brand identification) and is left unchanged.
- No icon font or icon-component library (e.g. no `@mdi/js`, no
  `simple-icons` npm package) is added as a runtime dependency — four static
  icons do not justify a new dependency (no gold plating). Brand mark path
  data is instead sourced as static markup: the developer should take the
  minimal single-`<path>` monochrome SVG data for the GitHub and LinkedIn
  marks from Simple Icons (https://simpleicons.org, CC0-licensed icon path
  data), and for Xing from an equivalent minimal monochrome source, and inline
  the `<path d="...">` directly in the new icon components below. This is
  copying static SVG path data into the repository, the same way the emoji it
  replaces was static content — it is not a package/runtime dependency.
  Email uses a simple original envelope glyph (no brand mark exists to
  source), drawn as a solid rounded rectangle + flap.
- Icon markup is extracted into four small, one-purpose SFCs under a new
  `app/src/components/icons/` directory — `IconEmail.vue`, `IconXing.vue`,
  `IconGithub.vue`, `IconLinkedin.vue` — rather than inlining four multi-line
  `<svg>` blocks directly in `AboutPage.vue`'s template. `ProjectCard.vue`
  only ever needed one inline SVG; four raw SVG blocks in one already
  non-trivial template (`AboutPage.vue` also owns the timeline rendering)
  would meaningfully hurt readability. Each icon component takes no props,
  renders a fixed `<svg>` with `aria-hidden="true"` set on the `<svg>` element
  itself (the accessible link text already conveys the link's purpose via
  `about.businessCard.email` / `xing` / `github` / `linkedin`), and sizes
  itself via CSS (`width: 100%; height: 100%;`) so the call site controls the
  rendered size uniformly.
- `AboutPage.vue` renders each icon inside a `.about-page__link-icon` wrapper
  span (`width: 20px; height: 20px; flex-shrink: 0; display: inline-flex;`)
  in place of the current `<span aria-hidden="true">✉️</span>` /
  `<span aria-hidden="true">💼</span>`. 20px (up from `ProjectCard.vue`'s 16px
  arrow) was chosen because these are primary identifying icons for the link
  row, not a secondary trailing affordance.

### 5. LinkedIn and GitHub links

Both are added to `.about-page__links` as new `<a>` elements, styled with the
existing `.about-page__link` class (no new CSS needed beyond the icon
wrapper), `target="_blank"` and `rel="noopener noreferrer"` — matching the
existing Xing link's treatment as an external profile link (the `mailto:`
link keeps no `target`/`rel`, unchanged):

```html
<a href="https://www.linkedin.com/in/mklschreiber" target="_blank" rel="noopener noreferrer" class="about-page__link">
  <span class="about-page__link-icon" aria-hidden="true"><IconLinkedin /></span>
  {{ t('about.businessCard.linkedin') }}
</a>
<a href="https://github.com/mklschreiber" target="_blank" rel="noopener noreferrer" class="about-page__link">
  <span class="about-page__link-icon" aria-hidden="true"><IconGithub /></span>
  {{ t('about.businessCard.github') }}
</a>
```

Final `.about-page__links` order: Email, Xing, LinkedIn, GitHub — the two
existing links keep their current position and order; the two new links are
appended in the same order the AC lists them (LinkedIn, then GitHub). This is
a low-stakes ordering call with no further significance.

### 6. i18n additions

New keys under `about.businessCard` in both locales, following the existing
`xing: 'Xing-Profil' / 'Xing Profile'` naming pattern:

| Key | `de.ts` | `en.ts` |
|---|---|---|
| `github` | `'GitHub-Profil'` | `'GitHub Profile'` |
| `linkedin` | `'LinkedIn-Profil'` | `'LinkedIn Profile'` |

`app/src/i18n/types.ts` defines `MessageSchema` as a plain TypeScript
interface assigned to each locale's default export (`const de: MessageSchema
= {...}`), so a missing or extra key is a compile-time type error, not a
runtime-only concern. `businessCard` in `MessageSchema` must gain `github:
string` and `linkedin: string` alongside the existing `email` and `xing`
fields, or `de.ts`/`en.ts` will fail to type-check.

### Round 2 — 2026-09-18T15:00:00+02:00 — Clickable phone/email links in Impressum, Kontakt, Profil

User review feedback on the merged Round 1 implementation (verbatim, German):
"Bitte alle Telefonnummern sowie Mail-Adressen im Impressum, Kontakt, Profil
als Links pflege d.h. mailto etc." — every phone number and email address in
Impressum, Kontakt (`ContactInformation.vue`), and Profil (the About page
business card) must become a clickable link (`mailto:` for email, `tel:` for
phone).

**7. Locations and current state (verified).** The public phone number
(`+49 (0) 15679 724718`) and email (`info@michaelschreiber.net`) appear as
plain, unlinked text in three places:

- `ImpressumPage.vue` — `<p>Telefon: +49 (0) 15679 724718</p>` and
  `<p>E-Mail: info@michaelschreiber.net</p>`.
- `DataProtectionPage.vue` — the same two values, combined in one `<p>` in
  the "Hinweis zur verantwortlichen Stelle" section:
  `<p>Telefon: +49 (0) 15679 724718<br />E-Mail: info@michaelschreiber.net</p>`.
- `ContactInformation.vue` — rendered via i18n keys
  `t('contact.emailValue')` / `t('contact.phoneValue')`
  (`de.ts`/`en.ts`, identical values in both locales).

The Profil business card (`AboutPage.vue`) already has a proper
`<a href="mailto:info@michaelschreiber.net">` link from Round 1 — nothing to
change there. **Profil has no phone number anywhere on the page**, so there
is nothing further to link for "Profil"; the AC's "Profil" clause is already
fully satisfied by the existing Round 1 email link, and no phone number is
being added to the business card (out of scope — the AC asks to link
*existing* numbers/addresses, not to add a new one).

**8. `tel:` URI value.** The displayed phone number uses the German
trunk-prefix convention `+49 (0) 15679 724718`: `+49` is the country code,
`(0)` is the *national trunk prefix*, parenthesized specifically to signal
"dial this `0` only when calling domestically without the country code, omit
it when the number is already prefixed with `+49`" (ITU-T E.123 notation),
and `15679 724718` is the subscriber number. A `tel:` URI (RFC 3966) must
carry the actual dialable global number, so the trunk `0` and all formatting
characters (spaces, parentheses) must be removed:

```
tel:+4915679724718
```

This is a semantic parse (drop the trunk prefix), not a naive
character-strip: mechanically stripping only spaces and parentheses from the
display string would incorrectly leave the trunk zero in place and yield
`tel:+490...15679724718`, an invalid/non-dialable number. Decision: the
`tel:` value is hardcoded as the literal `tel:+4915679724718`, not computed
from the display string at runtime — there is exactly one phone number in
the whole app, so a runtime formatter would be speculative generality for a
single fixed value (no gold plating).

**9. Markup per location — wrap existing display text, do not reformat
it.** In all three locations, the human-readable display text stays exactly
as it renders today; only an `<a>` wrapper is added around it:

- `ImpressumPage.vue`:
  ```html
  <p>Telefon: <a href="tel:+4915679724718">+49 (0) 15679 724718</a></p>
  <p>E-Mail: <a href="mailto:info@michaelschreiber.net">info@michaelschreiber.net</a></p>
  ```
- `DataProtectionPage.vue` (same block, phone and email each individually
  linked, `<br />` and surrounding text unchanged):
  ```html
  <p>
    Telefon: <a href="tel:+4915679724718">+49 (0) 15679 724718</a><br />
    E-Mail: <a href="mailto:info@michaelschreiber.net">info@michaelschreiber.net</a>
  </p>
  ```
- `ContactInformation.vue`:
  ```html
  <p><a href="tel:+4915679724718">{{ t('contact.phoneValue') }}</a></p>
  <p><a href="mailto:info@michaelschreiber.net">{{ t('contact.emailValue') }}</a></p>
  ```

**10. `ContactInformation.vue` href source: hardcoded, not derived from
i18n.** `contact.emailValue` / `contact.phoneValue` hold *display* text
(ICU-escaped `"info{'@'}michaelschreiber.net"`; spaced/parenthesized
`'+49 (0) 15679 724718'`) — they exist to control how the value is *shown*,
not what it *is*. Decision: hardcode the `mailto:`/`tel:` href directly in
the template as literal strings, the same way `AboutPage.vue`'s email link
already hardcodes `href="mailto:info@michaelschreiber.net"` rather than
deriving it from `contact.emailValue`. Reasons:
  - The href is a machine-readable URI scheme value, not translatable
    content — there is nothing for `de`/`en` to differ on, so a new i18n key
    would add indirection without adding any actual localization value.
  - Deriving the href from the display string at runtime (stripping the
    ICU escape and/or re-parsing digits out of the formatted phone number)
    would duplicate, in code, exactly the manual parsing decision made in
    §8 above, and would silently produce a wrong `tel:` value again if the
    display formatting ever changes (e.g. a future re-format of the phone
    number) without a corresponding fix to the parser.
  - This keeps a single clean separation already established in the
    codebase: i18n owns human-facing display text; the template owns fixed
    link targets.

**11. Link styling.** Decision: keep these as plain, unobtrusive inline
text links — not a repeat of Round 1's icon/flat-icon business-card
treatment, which is a distinct, branded link row that doesn't fit
informational legal/contact text.
  - `DataProtectionPage.vue` already has `.section a { color: inherit;
    text-decoration: underline; }` in its `<style scoped>` block (used today
    for its external GitHub/Google/e-recht24 links) and needs no CSS change
    — the new phone/email links inherit this rule automatically since they
    sit inside the same `.section` container.
  - `ImpressumPage.vue` uses the same `.section` container class but
    currently has no `a` styling rule at all (it has never had a link
    before). Decision: add the identical rule, copied verbatim from
    `DataProtectionPage.vue` for visual consistency between the two legal
    pages:
    ```css
    .section a {
      color: inherit;
      text-decoration: underline;
    }
    ```
  - `ContactInformation.vue` has no `.section` class and no existing link
    styling. Decision: add a small, scoped, equivalent rule targeting its
    own `.info-item` wrapper, using the same "inherit color, underline"
    treatment rather than `.about-page__link`'s flex/icon-row layout (which
    exists to lay out an icon plus label as a row and does not apply here —
    these are plain inline links inside a `<p>`, with no icon):
    ```css
    .info-item a {
      color: inherit;
      text-decoration: underline;
    }
    ```

**12. Drive-by fix: `DataProtectionPage.vue` file corruption.** Unrelated to
this feature, the file currently has two stray extraneous tokens: a
free-standing `ion` on line 1, before the `<script setup lang="ts">` tag, and
a free-standing `t` on the line after the closing `</style>` tag. Neither is
valid TS/Vue syntax; both are almost certainly artifacts of a bad
find-and-replace or an interrupted edit from an earlier round, and Vue's SFC
compiler happens to tolerate stray top/bottom-of-file text outside the
`<script>`/`<template>`/`<style>` blocks, which is why this was not caught by
build or lint. Since the Developer is already editing this file for the
`tel:`/`mailto:` change, delete both stray lines/tokens in the same change:
verify the file starts cleanly with `<script setup lang="ts">` on line 1 and
ends with `</style>` followed by a single trailing newline, with no other
content before or after those blocks. This is a drive-by cleanup, not a
scope change — it does not alter any rendered output or behavior.

## Affected Components

- `app/src/views/AboutPage.vue` — avatar markup/CSS (img instead of
  initials span), mailto href fix, new LinkedIn/GitHub links, icon markup
  replaced with the four new icon components, `.about-page__link-icon`
  CSS added, `.about-page__initials` CSS removed.
- `app/src/i18n/locales/de.ts` — `contact.emailValue` fix; new
  `about.businessCard.github` / `linkedin` keys.
- `app/src/i18n/locales/en.ts` — same two changes as `de.ts`.
- `app/src/i18n/types.ts` — `MessageSchema.about.businessCard` gains
  `github: string` and `linkedin: string`.
- `app/src/components/icons/IconEmail.vue` (new) — solid envelope glyph.
- `app/src/components/icons/IconXing.vue` (new) — solid Xing "X" mark.
- `app/src/components/icons/IconGithub.vue` (new) — solid GitHub octocat
  mark (path data sourced from Simple Icons).
- `app/src/components/icons/IconLinkedin.vue` (new) — solid LinkedIn "in"
  mark (path data sourced from Simple Icons).
- `app/public/profile-picture.jpeg` — already added by the coordinator;
  referenced as a static asset, no build-time processing needed.
- `app/src/__tests__/AboutPage.spec.ts` — existing assertions on
  `.about-page__initials` text `'MS'` and the outlook `mailto:` href will
  fail once this concept is implemented and must be updated by the
  Developer/Tester to assert against the `<img>` avatar, the corrected
  `mailto:info@michaelschreiber.net` href, and the new LinkedIn/GitHub
  links (not created or rewritten by this architecture concept itself).
- No changes needed in `app/src/components/AppFooter.vue` (verified already
  correct / out of scope).

**Round 2 additions:**

- `app/src/views/ImpressumPage.vue` — wraps the existing phone and email
  display text in `<a href="tel:+4915679724718">` /
  `<a href="mailto:info@michaelschreiber.net">`; adds a `.section a { color:
  inherit; text-decoration: underline; }` rule to `<style scoped>` (had none
  before).
- `app/src/views/DataProtectionPage.vue` — wraps the same phone/email pair
  (in the "Hinweis zur verantwortlichen Stelle" section) in the same two
  links; no CSS change needed (existing `.section a` rule already applies).
  Drive-by fix: remove the stray `ion` token on line 1 (before `<script
  setup lang="ts">`) and the stray `t` token after the closing `</style>`
  (see decision §12) — pre-existing, unrelated file corruption, not
  something this concept requires but appropriate to fix while already
  editing this file.
- `app/src/components/ContactInformation.vue` — wraps
  `{{ t('contact.phoneValue') }}` / `{{ t('contact.emailValue') }}` in
  `<a href="tel:+4915679724718">` / `<a href="mailto:info@michaelschreiber.net">`
  (hardcoded hrefs, not derived from the i18n values — see decision §10);
  adds a `.info-item a { color: inherit; text-decoration: underline; }`
  rule to `<style scoped>`.
- `app/src/views/AboutPage.vue` — no change. The existing Round 1
  `mailto:` link already satisfies the "Profil" part of this requirement,
  and the business card has no phone number to link (see decision §7).
- `app/src/i18n/locales/de.ts` / `en.ts` — no change. `contact.emailValue`
  / `contact.phoneValue` keep their current display-text values; only the
  href is added, in the template, around the existing `t(...)` calls.

## Data Flow

This is a static-content and presentation change with no new data flow,
state, store, or composable. At render time:

```
AboutPage.vue (template)
  ├─ t('about.businessCard.*')  → de.ts / en.ts via vue-i18n, typed by
  │                                 i18n/types.ts::MessageSchema
  ├─ <img src="/profile-picture.jpeg">
  │      → served as a static public asset (Vite copies app/public/* to
  │        the build output root; VITE_BASE_URL only affects the deployed
  │        base path, not this root-relative reference — consistent with
  │        the existing /logo_anim.gif and /bg_image-*.jpg usage)
  └─ <IconEmail/> <IconXing/> <IconGithub/> <IconLinkedin/>
         → app/src/components/icons/*.vue, each a static, prop-less SVG
           component with no reactive state
```

## Interfaces

`app/src/i18n/types.ts` — `MessageSchema.about.businessCard` (added fields
marked):

```ts
about: {
  title: string
  businessCard: {
    name: string
    role: string
    email: string
    xing: string
    github: string      // new
    linkedin: string    // new
    avatarAlt: string
  }
  // ...timeline unchanged
}
```

Each new icon component has no props and no emits:

```vue
<!-- app/src/components/icons/IconGithub.vue (shape shared by all four) -->
<script setup lang="ts"></script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="..." />
  </svg>
</template>

<style scoped>
svg {
  width: 100%;
  height: 100%;
}
</style>
```

## Open Questions

1. Exact SVG path data for the GitHub and LinkedIn brand marks is not
   pinned down in this document (Xing's is less standardized; a minimal
   monochrome "XING" wordmark/X-mark is acceptable). The Developer should
   source CC0/MIT-equivalent, license-compatible single-path monochrome
   markup (e.g. Simple Icons) and inline only the `<path d>` data — flag
   the Architect if a suitable simple single-path shape cannot be found for
   any of the three, so an alternative (e.g. a plain circumscribed
   monogram) can be decided instead.
2. `AboutPage.spec.ts` updates (avatar assertions, mailto assertion, new
   LinkedIn/GitHub link assertions, and icon rendering) are explicitly left
   to the Developer/Tester per the normal workflow split; this concept only
   flags which existing assertions will break.

**Round 2:**

3. None remaining. The `tel:` value (`tel:+4915679724718`), the three
   markup locations, the `ContactInformation.vue` href-hardcoding decision,
   and the link-styling decision are all fully specified above (§8–§11).
   Test updates for the new links (`ImpressumPage.spec.ts` if one exists,
   `DataProtectionPage.spec.ts` if one exists, `ContactInformation.vue`
   coverage) are left to the Developer/Tester per the normal workflow
   split, same as Round 1.

**Round 3 — 2026-09-18T03:20:00+02:00 — Address correction**

4. User review feedback: the street address was incorrect —
   "Grockelhofen 32a" corrected to "Grockelhofen 32" in `ImpressumPage.vue`
   and `DataProtectionPage.vue` (the only two occurrences; `Grockelhofen`
   does not appear anywhere else in `app/src` or `docs`). A literal text
   correction with no architecture decision involved; handled directly by
   the coordinator rather than through the full Architect → Developer →
   Tester → Reviewer pipeline, given there was nothing to design. Verified
   with `npm run lint:check`, `npm run test:unit -- --run` (70 tests,
   unaffected), and `npm run build`, all passing.
