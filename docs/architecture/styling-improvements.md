---
type: Architecture Concept
title: Styling Improvements — Imprint and Data Protection Header/Card Alignment
description: Aligns the Impressum and Datenschutz page headers and content cards with the gradient-text heading and bordered/shadowed card treatment already used on the About page.
tags: [styling-improvements, views, css]
timestamp: 2026-09-19T10:00:00+02:00
status: draft
---

## Story

As a visitor, I want the Imprint and Data Protection pages to look
consistent with the rest of the site (matching the headers and cards used
on pages like About) so that the site feels cohesive and trustworthy while
I read legally required information.

## Requirements Authority

Trello card: https://trello.com/c/je22FOXk/12-styling-improvements

The Trello card description is canonical for requirements, acceptance
criteria, dependencies, and ticket state. Acceptance criteria (verbatim):

- The header of the imprint is styled like the other headers (About me…)
- The data protection header is styled like the other headers (About me…)
- The cards within the imprint are styled like the other cards for example
  in About me
- The cards within the data protection are styled like the other cards for
  example in About me

No dependencies are listed on the card.

## Architecture Decisions

### 1. Scope is CSS-only, inside the two existing view files

`ImpressumPage.vue` and `DataProtectionPage.vue` already use the correct
template structure (`<main class="content"><h1>…</h1><section
class="section">…</section>…</main>`) and the correct design tokens from
`app/src/assets/styles/variables.css`. Only their `<style scoped>` blocks
are out of date relative to the redesigned pages (`AboutPage.vue`,
`ContactPage.vue`, `ProjectOverviewPage.vue`). No template, script, i18n,
router, or test-fixture change is required to satisfy the four ACs. This
keeps the change minimal and avoids touching the `tel:`/`mailto:` links and
legal text that existing tests assert on.

### 2. No new shared header/card component is introduced

The gradient-text `<h1>` pattern is already duplicated verbatim across
`AboutPage.vue`, `ContactPage.vue`, and `ProjectOverviewPage.vue` (each
defines its own `.content h1` / `.about-page__content h1` rule with
identical properties). The bordered-card-with-gradient-trim pattern is
similarly duplicated across `AboutPage.vue`'s `.about-page__card`,
`ProjectCard.vue`'s `.project-card`, and `TimelineEntry.vue`'s
`.timeline-entry__card`. The codebase's established convention for this
kind of page-level visual styling is per-component scoped CSS duplication,
not a shared component or CSS mixin/utility class. Introducing a shared
`PageHeader`/`Card` component now would be a refactor beyond this ticket's
scope ("no gold plating") and would touch three already-working, unrelated
pages. The fix replicates the existing CSS properties into the two
out-of-date view files, consistent with how the pattern already exists
three times.

### 3. Header style: copy the `ContactPage.vue` / `ProjectOverviewPage.vue` `.content h1` recipe

`ImpressumPage.vue` and `DataProtectionPage.vue` both already name their
main-content wrapper class `.content` (the same class name `ContactPage.vue`
and `ProjectOverviewPage.vue` use), so no selector rename is needed — only
the declarations inside `.content h1` change from the current plain,
solid-color heading to the shared gradient-text treatment:

- `display: inline-block`
- `font-size: var(--font-size-5xl)` (was `--font-size-4xl`)
- `font-weight: var(--font-weight-bold)`
- `letter-spacing: -0.02em`
- `background: var(--gradient-text)` with `background-clip: text` /
  `-webkit-background-clip: text` and `color: transparent` (replaces the
  current solid `color: var(--color-text-primary)`)

`margin-bottom` stays `var(--spacing-xl)` (its current value) rather than
adopting the other pages' `var(--spacing-md)`, because those pages follow
the `<h1>` with a `.subtitle` paragraph that itself carries
`margin-bottom: var(--spacing-2xl)` before the next block; Impressum and
Datenschutz have no subtitle, so the existing `--spacing-xl` gap directly
before the first card is kept. This is a deliberate, narrow deviation from
a byte-for-byte copy, scoped only to spacing (not covered by the AC), to
avoid an unrelated layout regression.

The page-level hero gradient background (`min-height: 100vh; background:
linear-gradient(180deg, var(--color-*-light) 0%, var(--color-bg-primary)
20rem)`) used by `AboutPage.vue`/`ContactPage.vue`/`ProjectOverviewPage.vue`
is explicitly **out of scope**: the AC only names the header and the cards,
not the page background, and both legal pages are long, text-dense, and
currently use `min-height: 100%` — changing the background is a distinct
visual decision the card did not ask for. `.impressum-page` /
`.datenschutz-page` keep `min-height: 100%;` unchanged.

### 4. Card style: copy the `AboutPage.vue` `.about-page__card` recipe

The AC explicitly names "About me" as the reference for card styling (both
card ACs end with "for example in About me"), so the existing `.section`
rule in both files is aligned to `.about-page__card`'s recipe rather than
to `ProjectCard.vue`'s or `TimelineEntry.vue`'s (which use a smaller
`--radius-md` and `--shadow-glow` instead of `--radius-lg`/`--shadow-md`).
Concretely, `.section` changes from a flat `--color-bg-secondary` block to:

- `background: var(--color-bg-primary)` (was `--color-bg-secondary`)
- `border-radius: var(--radius-lg)` (was `--radius-md`)
- `box-shadow: var(--shadow-md)` (new declaration)
- `position: relative` (new declaration, required for the gradient-trim
  pseudo-element below)

`border: 1px solid var(--color-border-light)`, `padding: var(--spacing-xl)`,
and `margin-bottom: var(--spacing-lg)` are unchanged: padding/spacing are
page-specific content-density choices, not part of "styled like", and
changing them is not needed to satisfy the AC.

`.about-page__card` (like `.project-card` and `.timeline-entry__card`) also
carries a signature gradient top-trim: a `::before` pseudo-element that
draws a brand-gradient border which fades out after ~26px, using a
`mask-image` gradient and a `padding-box`/`border-box` background split.
This trim is the one visual element present in **all three** existing card
implementations across the redesigned pages, making it the strongest
"styled like the other cards" signal, so it is added identically to
`.section`, together with the matching `.section > *
{ position: relative; z-index: 1; }` rule needed to keep the section's text
content above the pseudo-element:

```css
.section {
  position: relative;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-md);
}

.section > * {
  position: relative;
  z-index: 1;
}

.section::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 2px solid transparent;
  background:
    linear-gradient(var(--color-bg-primary), var(--color-bg-primary)) padding-box,
    var(--gradient-brand-horizontal) border-box;
  mask-image: linear-gradient(to bottom, #000 0, #000 26px, transparent 50%);
  -webkit-mask-image: linear-gradient(to bottom, #000 0, #000 26px, transparent 50%);
  pointer-events: none;
}
```

This is added verbatim (same property values) to both `ImpressumPage.vue`
and `DataProtectionPage.vue`, replacing their current `.section` rule and
inserting the two new rules immediately after it.

### 5. `.section h2` (and DataProtectionPage's `h3`/`h4`) need no change

`.section h2 { font-size: var(--font-size-2xl); color:
var(--color-text-primary); margin-bottom: var(--spacing-md); }` in both
files already matches `.project-card h2`'s recipe (same font size, color,
and margin token). The AC only calls out the page header and the card
container itself, not the heading typography inside each card, so
`.section h2`/`h3`/`h4`/`p`/`li`/`a`/`.notice`/`.source` rules are left
untouched.

## Affected Components

- `app/src/views/ImpressumPage.vue` — `<style scoped>` only: `.content h1`
  rule updated to the gradient-text heading recipe; `.section` rule updated
  to the bordered/shadowed card recipe; two new rules added
  (`.section > *`, `.section::before`). No template or script change.
- `app/src/views/DataProtectionPage.vue` — same `<style scoped>` changes as
  `ImpressumPage.vue` (`.content h1`, `.section`, plus the two new rules).
  No template or script change.

No other file needs to change. `app/src/views/AboutPage.vue`,
`app/src/components/ProjectCard.vue`, and
`app/src/components/TimelineEntry.vue` are read-only references for this
ticket and are not modified. `app/src/assets/styles/variables.css` already
defines every token used (`--gradient-text`, `--gradient-brand-horizontal`,
`--shadow-md`, `--radius-lg`, `--color-bg-primary`) — no new tokens are
introduced.

## Data Flow

Styling-only change; no data, state, routing, or i18n flow is affected.

```
ImpressumPage.vue          DataProtectionPage.vue
  <style scoped>              <style scoped>
    .content h1  ───┐            .content h1  ───┐
    .section     ───┼── uses ──► CSS custom       │
    .section::before│           properties from   │
    .section > *  ──┘           variables.css   ◄─┘
```

## Interfaces

No TypeScript interfaces, props, composables, store state, or i18n keys
are added or changed. This ticket touches only two `<style scoped>` blocks.

## Open Questions

None. The card names both headers and both card locations explicitly and
cites "About me" as the styling reference for cards; the header reference
resolves unambiguously to the already-duplicated `.content h1` gradient-text
recipe shared by `ContactPage.vue` and `ProjectOverviewPage.vue`, and the
card reference resolves to `AboutPage.vue`'s `.about-page__card` recipe as
documented above (decision 4), rather than `ProjectCard.vue`'s or
`TimelineEntry.vue`'s, since the AC names "About me" specifically.
