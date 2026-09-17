---
type: Architecture Concept
title: Colored Project Tags
description: Deterministic, light, per-value background colors for project technology tags, keeping the regular text color.
tags: [colored-tags, project-overview, components]
timestamp: 2026-09-14T00:00:00+02:00
status: draft
---

## Story

As a visitor of the site, I want tags to be displayed in distinct,
dynamically generated colors based on their value, so that I can visually
distinguish between different tags more easily.

## Requirements Authority

Trello card: https://trello.com/c/u1IyHIJw/8-colored-tags

The Trello card description is canonical for requirements, acceptance criteria,
dependencies, and ticket state. As fetched:

- AC-01: Colors are dynamically generated based on the tag value.
- AC-02: The text of the tag is colored in the regular font color.
- AC-03: The tag color is only a light color, to ensure readability.

## Architecture Decisions

**Where "tags" live today.** The card refers to the "project side" tags. The
only tag-like rendering in the app is the technology list on project cards:
`ProjectCard.vue` renders `project.technologies` (from
`app/src/data/projects.json`, typed by `app/src/types/project.ts`) as
`<span class="tech-badge">` elements inside `ProjectOverviewPage.vue`. Today
every badge uses the same hardcoded `background-color: var(--color-primary)`
and `color: white`. No other component renders tags, so this is the single
change surface.

**Deterministic color derivation (AC-01).** The background color must be a
pure function of the tag's string value: identical strings always produce
the identical color, and different strings usually differ. A simple
non-cryptographic string hash (djb2 variant: `hash = hash * 33 XOR
charCode`, reduced to an unsigned 32-bit integer) is sufficient — it needs
no security properties, only determinism and a reasonable spread across the
hue circle. The hash is reduced with `% 360` to select a **hue** in HSL
color space. Hue is the only hash-derived channel.

**Guaranteed light color (AC-03).** Saturation and lightness are **fixed
constants**, not derived from the hash: `saturation = 65%`, `lightness =
85%`. Only the hue varies per tag value. Fixing lightness at 85% guarantees
every generated color is light regardless of hue, satisfying AC-03 without
per-color luminance checks. HSL is used (over hashing directly to RGB/hex)
specifically because it lets hue vary freely while lightness/saturation stay
pinned, which is the simplest way to satisfy "any hue, always light."

**Regular text color (AC-02).** The badge text keeps the app's standard
foreground color token, `var(--color-text-primary)`, instead of the current
hardcoded `white`. It does not change with the tag value, and it is never
derived from or matched to the generated background. Since the background is
always light (85% lightness), `--color-text-primary` (`#1f1f1f`, a near-black
per `app/src/assets/styles/variables.css`) remains readable against it.

**Placement of the derivation logic.** The hashing/HSL logic is a small,
stateless, pure function with no Vue reactivity or lifecycle needs — it is
not a composable in the Vue sense (contrast with the stateful
`app/src/composables/useTimelineAnimation.ts`, which uses `ref`, `reactive`,
and lifecycle hooks). It is placed in a new `app/src/utils/` module rather
than forced into `composables/` under a misleading `use`-prefixed name. This
is a new top-level source folder; it is justified because pure presentation
utilities are a distinct concern from stateful composables and none of the
existing folders (`components`, `views`, `composables`, `data`, `types`,
`i18n`) fit a pure string-to-color function.

**No data-model change.** `project.technologies: string[]` is unchanged.
Colors are computed at render time from the existing string values; nothing
is persisted or added to `projects.json` or `Project`.

## Affected Components

- `app/src/utils/tagColor.ts` — **new**. Exports the pure color-derivation
  function described under Interfaces.
- `app/src/components/ProjectCard.vue` — **changed**. Imports
  `getTagColor`, binds it as an inline `background-color` style per badge,
  and changes the `.tech-badge` CSS rule to use `var(--color-text-primary)`
  for text instead of the hardcoded `white` background/text pair.
- `app/src/__tests__/` — **new test file** `tagColor.spec.ts` (unit tests
  for the pure function) is the expected coverage surface for the Tester
  agent; no other existing test file references tags or `ProjectCard.vue`
  today.

No changes to `app/src/types/project.ts`, `app/src/data/projects.json`,
`app/src/views/ProjectOverviewPage.vue`, i18n messages, routes, or stores —
none of them hold or need tag-color logic.

## Data Flow

```
projects.json (technologies: string[])
        │
        ▼
ProjectOverviewPage.vue  ──renders──▶  ProjectCard.vue (prop: project)
                                             │
                                             │ v-for tech in project.technologies
                                             ▼
                                   getTagColor(tech)  [app/src/utils/tagColor.ts]
                                             │
                                             │ deterministic hash(tech) → hue
                                             │ fixed saturation 65%, lightness 85%
                                             ▼
                                   "hsl(<hue>, 65%, 85%)"
                                             │
                                             ▼
                          <span class="tech-badge" :style="{ backgroundColor }">
                              text color: var(--color-text-primary) (CSS, static)
```

The function is called once per badge, per render, directly in the template
expression (or a small computed helper) — no caching or memoization is
required because it is cheap (one pass over a short string) and Vue only
re-renders when `project.technologies` changes.

## Interfaces

`app/src/utils/tagColor.ts`:

```ts
/**
 * Derives a deterministic, light HSL background color for a tag value.
 * Same input string always produces the same output string.
 */
export function getTagColor(value: string): string

/** Fixed channels — exported for reuse in tests, not meant to vary per tag. */
export const TAG_COLOR_SATURATION = 65 // percent
export const TAG_COLOR_LIGHTNESS = 85 // percent
```

Behavior contract for `getTagColor`:

- Pure function: no side effects, no randomness, no reliance on global/mutable
  state.
- Returns a string of the exact form `` `hsl(${hue}, ${TAG_COLOR_SATURATION}%, ${TAG_COLOR_LIGHTNESS}%)` ``
  where `hue` is an integer in `[0, 359]`.
- `hue` is derived by hashing `value` with a djb2-style 32-bit hash
  (`hash = (hash * 33) ^ value.charCodeAt(i)`, seeded at `5381`, coerced to
  unsigned with `>>> 0`) and reducing with `hue = hash % 360`.
- Case-sensitive and whitespace-sensitive: `value` is hashed as-is, with no
  normalization. This matches how `technologies` strings are already
  authored consistently in `projects.json` (e.g. `"Vue.js"`).
- Empty string input is valid and must not throw; it deterministically maps
  to whatever hue the hash of `""` (i.e., the seed `5381`) produces.

`ProjectCard.vue` template change (illustrative, not prescriptive of exact
formatting):

```html
<span
  v-for="tech in project.technologies"
  :key="tech"
  class="tech-badge"
  :style="{ backgroundColor: getTagColor(tech) }"
>
  {{ tech }}
</span>
```

```css
.tech-badge {
  /* background-color now set inline per tag via getTagColor(); no static value here */
  color: var(--color-text-primary);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}
```

## Open Questions

None. The Trello card has no dependencies and the scope is confined to the
single existing tag-rendering location identified above.
