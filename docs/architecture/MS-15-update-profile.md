---
type: Architecture Concept
title: Update Profile
description: Updates the contact channels on the profile — removes Xing, adds Facebook, Instagram and a tel: link on the About page, replaces the old phone number +49 15679 724718 with +49 162 4337334 everywhere, and confirms that all mail references already use info@michaelschreiber.net.
tags: [MS-15, views, components, i18n, tests]
timestamp: 2026-10-20T00:00:00+02:00
status: draft
---

## Story

As a user, I want the latest contact information on the profile, so that I
can reach Michael through his current channels.

Jira: MS-15 — https://mklschreiber.atlassian.net/browse/MS-15

Acceptance criteria (Jira):

1. Remove link to Xing.
2. Add link to Facebook (username: `mklschreiber`).
3. Add link to Instagram (username: `mklschreiber`).
4. Insert new link to phone number +49 162 4337334.
5. Change all mail references to `info@michaelschreiber.net`.

User decision (2026-10-20): the new number +49 162 4337334 **replaces** the
old number +49 15679 724718 everywhere it appears (`ContactInformation.vue`,
de/en `contact.phoneValue`, `ImpressumPage.vue`, `DataProtectionPage.vue`).
The About page additionally gets a `tel:` link next to the mail and social
links.

No design artifact exists for this story (`docs/design/MS-15/` does not
exist). The existing business-card link row on the About page is the visual
reference.

## Architecture Decisions

### 1. Xing is removed completely, including dead code

The Xing `<a>` in `AboutPage.vue`, its `IconXing` import, the i18n key
`about.businessCard.xing` (`types.ts`, `de.ts`, `en.ts`) and the component
`app/src/components/icons/IconXing.vue` are deleted. Nothing else uses
`IconXing`; keeping it would be dead code. Its entry in `icons.spec.ts` is
removed with it.

Historical architecture documents (`minor-changes*.md`, `log.md`) that
mention Xing or the old phone number are records of past decisions and stay
unchanged.

### 2. Facebook and Instagram follow the existing icon pattern

Two new icon SFCs, `IconFacebook.vue` and `IconInstagram.vue`, are added to
`app/src/components/icons/`. They follow the established brand-icon rules
from [Minor Changes](minor-changes.md) §4 exactly, like `IconGithub.vue`:

- `<script setup lang="ts"></script>`, no props.
- One `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
  fill="currentColor" aria-hidden="true">` with a single solid `<path>`, no
  stroke.
- Scoped style `svg { width: 100%; height: 100%; }`.
- Path data: the monochrome Facebook and Instagram marks from Simple Icons
  (https://simpleicons.org, CC0), copied as static `d="…"` data. No icon
  package is added as a dependency. If Simple Icons does not offer a mark,
  use an equivalent minimal monochrome single-path glyph in a 24×24 box.

Why: the row stays visually consistent (same fill, color and size), and two
static icons do not justify a new dependency.

### 3. Profile URLs and link attributes

| Link | `href` | `target` / `rel` |
|---|---|---|
| Facebook | `https://www.facebook.com/mklschreiber` | `_blank` / `noopener noreferrer` |
| Instagram | `https://www.instagram.com/mklschreiber/` | `_blank` / `noopener noreferrer` |
| Phone | `tel:+491624337334` | none |

External profile links get the same `target="_blank"` and
`rel="noopener noreferrer"` as the LinkedIn and GitHub links (and the
removed Xing link). The `tel:` link gets no `target`/`rel`, the same as the
existing `mailto:` link, because it opens a local handler, not a page.
The Instagram URL keeps the trailing slash, Instagram's canonical profile
URL form.

### 4. Link order on the About page

Final `.about-page__links` order:

1. Email (unchanged)
2. Phone (new)
3. LinkedIn (unchanged)
4. GitHub (unchanged)
5. Facebook (new)
6. Instagram (new)

Why: direct channels (mail, phone) come first, then the professional
profiles, then the private social profiles in the order the AC lists them.
The row already uses `flex-wrap: wrap`, so six chips wrap cleanly on narrow
screens; no CSS change is needed.

### 5. About-page phone chip shows a label, not the number

The new phone chip renders the `IconPhone` icon (already used by
`ContactInformation.vue`) and the label `about.businessCard.phone`
("Telefon" / "Phone"), exactly like the email chip shows "E-Mail" / "Email"
and not the address. Why: all chips in the row use a short channel label;
the number itself is visible on the Contact, Impressum and Datenschutz pages.

### 6. Phone number format

The new number follows the existing format style (`+49 (0) <prefix>
<subscriber>`):

- Display: `+49 (0) 162 4337334` — the same in de and en (the old value was
  also locale-independent).
- `href`: `tel:+491624337334` — E.164 without the trunk `0`.

It replaces `+49 (0) 15679 724718` / `tel:+4915679724718` in all four places:

| File | Change |
|---|---|
| `app/src/i18n/locales/de.ts` | `contact.phoneValue: '+49 (0) 162 4337334'` |
| `app/src/i18n/locales/en.ts` | `contact.phoneValue: '+49 (0) 162 4337334'` |
| `app/src/components/ContactInformation.vue` | `href="tel:+491624337334"` (text stays `t('contact.phoneValue')`) |
| `app/src/views/ImpressumPage.vue` | `<a href="tel:+491624337334">+49 (0) 162 4337334</a>` |
| `app/src/views/DataProtectionPage.vue` | `<a href="tel:+491624337334">+49 (0) 162 4337334</a>` |

The hardcoded hrefs stay hardcoded (no shared constant). Why: that is the
existing approach from Minor Changes Round 2; a constant for one number in
four places is not required by this story.

After the change, `grep -rn "15679" app/src app/index.html` must find
nothing.

### 7. Mail references: verified, no change

All mail references already use `info@michaelschreiber.net`:

- `app/index.html` — JSON-LD `"email": "mailto:info@michaelschreiber.net"`
- `ContactInformation.vue`, `AboutPage.vue`, `ImpressumPage.vue`,
  `DataProtectionPage.vue` — `mailto:` hrefs and display texts
- `de.ts` / `en.ts` — `contact.emailValue`

A search of `app/src`, `app/index.html` and `app/public` finds no other
address (the `example.com` form placeholders are not contact addresses).
AC 5 is met without code change; the existing tests already check it.

The JSON-LD block in `index.html` is not extended with `telephone` or
`sameAs`. It currently lists no phone and no profiles, and the story does
not ask for SEO changes (no gold plating).

## Affected Components

Changed:

- `app/src/views/AboutPage.vue` — remove Xing link and `IconXing` import;
  import `IconPhone`, `IconFacebook`, `IconInstagram`; add phone, Facebook
  and Instagram links in the order from §4.
- `app/src/components/ContactInformation.vue` — new `tel:` href.
- `app/src/views/ImpressumPage.vue` — new number (href and text).
- `app/src/views/DataProtectionPage.vue` — new number (href and text).
- `app/src/i18n/types.ts` — `about.businessCard`: remove `xing`, add
  `phone`, `facebook`, `instagram`.
- `app/src/i18n/locales/de.ts`, `app/src/i18n/locales/en.ts` — same keys;
  new `contact.phoneValue`.
- Tests: `AboutPage.spec.ts`, `icons.spec.ts`, `ContactInformation.spec.ts`,
  `ImpressumPage.spec.ts`, `DataProtectionPage.spec.ts`.

Created:

- `app/src/components/icons/IconFacebook.vue`
- `app/src/components/icons/IconInstagram.vue`

Deleted:

- `app/src/components/icons/IconXing.vue`

Not changed: `app/index.html`, routes, stores, composables, data modules.

## Data Flow

Static content only. No state, no network.

```
de.ts / en.ts ──(vue-i18n t())──► AboutPage.vue ──► chip labels
                                 ContactInformation.vue ──► phone display text
hardcoded hrefs (mailto:, tel:, https://…) ──► <a> elements
icons/Icon*.vue ──► inline SVG inside .about-page__link-icon
```

## Interfaces

### i18n schema (`app/src/i18n/types.ts`)

```ts
about: {
  businessCard: {
    name: string
    role: string
    email: string
    phone: string      // new
    github: string
    linkedin: string
    facebook: string   // new
    instagram: string  // new
    avatarAlt: string
    // xing: removed
  }
}
```

### Messages

| Key | de | en |
|---|---|---|
| `about.businessCard.phone` | `Telefon` | `Phone` |
| `about.businessCard.facebook` | `Facebook-Profil` | `Facebook Profile` |
| `about.businessCard.instagram` | `Instagram-Profil` | `Instagram Profile` |
| `contact.phoneValue` | `+49 (0) 162 4337334` | `+49 (0) 162 4337334` |

The labels follow the existing `…-Profil` / `… Profile` pattern of the
LinkedIn and GitHub labels.

### AboutPage link markup

```html
<a href="mailto:info@michaelschreiber.net" class="about-page__link">…</a>
<a href="tel:+491624337334" class="about-page__link">
  <span class="about-page__link-icon" aria-hidden="true"><IconPhone /></span>
  {{ t('about.businessCard.phone') }}
</a>
<!-- LinkedIn, GitHub unchanged -->
<a
  href="https://www.facebook.com/mklschreiber"
  target="_blank"
  rel="noopener noreferrer"
  class="about-page__link"
>
  <span class="about-page__link-icon" aria-hidden="true"><IconFacebook /></span>
  {{ t('about.businessCard.facebook') }}
</a>
<a
  href="https://www.instagram.com/mklschreiber/"
  target="_blank"
  rel="noopener noreferrer"
  class="about-page__link"
>
  <span class="about-page__link-icon" aria-hidden="true"><IconInstagram /></span>
  {{ t('about.businessCard.instagram') }}
</a>
```

### Test changes (guidance for Tester)

- `AboutPage.spec.ts`: replace the Xing test with a test that no
  `a[href*="xing"]` exists; add tests for the Facebook and Instagram links
  (href, `target`, `rel`, de and en label) and for the phone link
  (`tel:+491624337334`, no `target`, label "Telefon" / "Phone"); check the
  link order from §4.
- `icons.spec.ts`: remove `IconXing`; add `IconFacebook`, `IconInstagram`
  and `IconPhone` (now used in the business-card row).
- `ContactInformation.spec.ts`, `ImpressumPage.spec.ts`,
  `DataProtectionPage.spec.ts`: expect `tel:+491624337334` and the text
  `+49 (0) 162 4337334`.

## Open Questions

None. The phone-number replacement and the About-page `tel:` link were
decided by the user on 2026-10-20.
