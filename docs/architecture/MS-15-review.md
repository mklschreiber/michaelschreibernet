---
type: AI Review
title: Review for Update Profile
description: Round 1 is positive. Xing is removed, the Facebook, Instagram and phone chips match the concept, the new number replaces the old one everywhere, the mail references are correct, and all checks pass.
tags: [MS-15, review]
timestamp: 2026-10-20T07:20:00+02:00
verdict: positive
---

## Round 1 — 2026-10-20T07:20:00+02:00

### Scope

- Concept: [MS-15-update-profile.md](MS-15-update-profile.md) (draft,
  2026-10-20), including the user decision that the new number replaces the
  old one everywhere.
- Testing concept: [MS-15-tests.md](MS-15-tests.md).
- Design copy: none (`docs/design/MS-15/` does not exist, as the concept says).
- Code: uncommitted changes on `feature/MS-15-update-profile` against `HEAD`
  (`d68d452`). These are `AboutPage.vue`, `ContactInformation.vue`,
  `ImpressumPage.vue`, `DataProtectionPage.vue`, `i18n/types.ts`, `de.ts`,
  `en.ts`, the new untracked `IconFacebook.vue` and `IconInstagram.vue`, and
  the staged deletion of `IconXing.vue`.
- Tests: `AboutPage.spec.ts`, `icons.spec.ts`, `ContactInformation.spec.ts`,
  `ImpressumPage.spec.ts`, `DataProtectionPage.spec.ts`.
- Checks (in `app/`): `npm run test:unit -- --run` (14 files, 353/353
  passed), `npm run lint:check` (clean), `npm run build` (succeeded).

Verified against the concept:

- §1: the Xing link, the `IconXing` import, the `about.businessCard.xing` key
  (types, de, en), `IconXing.vue` and its test entry are all removed.
  `grep -rni xing app/src app/index.html` finds only the negative tests.
- §2: `IconFacebook.vue` and `IconInstagram.vue` follow the `IconGithub.vue`
  pattern: empty `<script setup lang="ts">`, the same `<svg>` attributes, one
  solid `<path>` with Simple Icons data, and the scoped 100% size style. No
  new dependency was added.
- §3/§4/§5: the hrefs are as specified (Facebook without and Instagram with
  the trailing slash). The external links have `target="_blank"` and
  `rel="noopener noreferrer"`. The `tel:` chip has no `target`/`rel` and
  shows `IconPhone` with the label "Telefon"/"Phone". The order is Email,
  Phone, LinkedIn, GitHub, Facebook, Instagram.
- §6: `tel:+491624337334` and `+49 (0) 162 4337334` appear in all four places
  (Contact, Impressum, Datenschutz, de/en `contact.phoneValue`).
  `grep -rn 15679 app/src app/index.html` finds nothing.
- §7: every mail address in `app/src`, `app/index.html` and `app/public` is
  `info@michaelschreiber.net`, apart from the `example.com` form
  placeholders. `index.html` is unchanged.
- Tests: the cases in the testing concept exist. They assert exact values
  (hrefs, labels in both locales, order, the absence of `target`/`rel`), so
  they would fail on a regression. I checked the `import.meta.glob` keys in
  the `IconXing` absence test by transforming the spec with Vite. They have
  the form `/src/components/icons/<Name>.vue`, so the `not.toContain` check
  is not vacuous.

### Findings

None.

Non-blocking note (no owner): the change set is only partly staged. The
deletion of `IconXing.vue` is staged, while `IconFacebook.vue`,
`IconInstagram.vue` and the MS-15 docs are untracked. The commit must include
the untracked files, or `AboutPage.vue` and `icons.spec.ts` will fail to
build in CI.

### Verdict

positive
