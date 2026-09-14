---
type: Test Concept
title: Tests for Colored Project Tags
description: Unit coverage for the deterministic hash-to-hue color derivation and its integration into ProjectCard's technology badges.
tags: [colored-tags, tests]
timestamp: 2026-09-14T16:20:00+02:00
---

## Requirements Authority

Trello card: https://trello.com/c/u1IyHIJw/8-colored-tags

The Trello card description is canonical for requirements and acceptance
criteria (AC-01 deterministic per-value color, AC-02 regular text color,
AC-03 always light background).

## Scope

Tested:

- `app/src/utils/tagColor.ts` (`getTagColor`) as a pure, stateless unit:
  determinism, output shape/validity, the fixed light saturation/lightness
  constants, hue range, hue spread across different values, case/whitespace
  sensitivity per the architecture contract, and the empty-string edge case.
- `app/src/components/ProjectCard.vue` at the component level, for the
  integration concerns a pure-function unit test cannot cover: that each
  rendered `.tech-badge` actually receives `getTagColor`'s result as its
  inline `background-color`, that differently-valued tags get differently
  colored badges, and that text color is not bound inline per tag (it stays
  on the static `.tech-badge` CSS rule using `var(--color-text-primary)`).

Explicitly not tested:

- Exact rendered pixel/contrast values of `var(--color-text-primary)` against
  generated backgrounds — the architecture concept fixes lightness at 85% to
  guarantee readability by construction; no per-color contrast-ratio check is
  performed.
- `ProjectOverviewPage.vue` rendering of the full project list — out of scope
  for this card, which only touches tag-badge coloring inside `ProjectCard.vue`.
- Visual/manual browser check — not needed; both the pure function and the
  DOM binding are fully exercised by Vitest/jsdom, and jsdom's own hsl→rgb
  style normalization is neutralized in the component test by normalizing
  both sides of the comparison through a detached probe element.

## Test Cases

| Module | Test Case | Level | Status |
|--------|----------|-------|--------|
| tagColor | returns the same color for the same value across repeated calls | Unit | ✅ |
| tagColor | returns a valid hsl(...) string | Unit | ✅ |
| tagColor | fixes saturation at the documented light-color constant | Unit | ✅ |
| tagColor | fixes lightness at the documented light-color constant | Unit | ✅ |
| tagColor | always uses a lightness of 85%, guaranteeing a light color | Unit | ✅ |
| tagColor | produces a hue within the valid [0, 359] range | Unit | ✅ |
| tagColor | produces different hues for different tag values | Unit | ✅ |
| tagColor | is case-sensitive, so at least some differently-cased pairs differ | Unit | ✅ |
| tagColor | does not throw for an empty string and still returns a valid hsl(...) string | Unit | ✅ |
| tagColor | deterministically maps the empty string to the same color every time | Unit | ✅ |
| ProjectCard | renders one badge per technology | Component | ✅ |
| ProjectCard | applies the deterministic background color from getTagColor to each badge | Component | ✅ |
| ProjectCard | gives badges with different tag values different background colors | Component | ✅ |
| ProjectCard | only binds the background color inline, leaving text color to the static class | Component | ✅ |

## Untested Areas

- Cross-browser HSL rendering/gamut differences — out of scope; HSL is a
  standard CSS color function and the app targets evergreen browsers per the
  existing stack baseline.
- Hash collision probability across the real `projects.json` technology list
  is not exhaustively enumerated; the unit tests confirm the hash spreads
  across multiple sample values, which is sufficient evidence of the
  intended behavior without asserting collision-free output (not a stated
  acceptance criterion).
