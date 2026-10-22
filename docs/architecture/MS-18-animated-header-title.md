---
type: Architecture Concept
title: Animated Header Title
description: Moves the "michaelschreiber.net" typing animation from the landing-page logo SVG into the application header as real text ("schreiber" bold, "michael" and ".net" normal weight, no coloured ".net") with a blinking underscore cursor, driven by a timer-based typewriter composable that types once per page load, deletes on mouse hover of the brand link and retypes from the current position on leave, with a stable accessible name, no layout shift and a static title under prefers-reduced-motion.
tags: [MS-18, components, composables, views, tests]
timestamp: 2026-10-22T00:00:00+02:00
status: draft
---

## Story

As a visitor of michaelschreiber.net, I want the "michaelschreiber.net" typing
animation with its cursor to live in the application header (replacing the
current static brand text), so that the page feels alive.

Jira: MS-18 — https://mklschreiber.atlassian.net/browse/MS-18

Original issue text: "As software developer I want a cool page. Therefore the
current animation need to be adjusted. The animation of the
"michaelschreiber.net" with the cursor should move into the header of the
application. The current displayed static text should be replaced with the
animated text."

Acceptance criteria (Jira):

1. The animation of "michaelschreiber.net" is moved to the header.
2. The cursor changes from a block to an underscore.
3. The cursor stays after the animation has played and blinks.
4. Hovering the header removes the text, like pressing the delete key.
5. As soon as the mouse leaves the animated title, the regular typing
   animation plays from the character position shown at the moment of the
   leave.

No design artifact exists (`docs/design/MS-18/` is absent). The visual
reference is the current header (`AppNavigation.vue`) and the MS-17 typing
rhythm ([MS-17 concept](MS-17-animated-svg-logo.md), D4).

## Architecture Decisions

### D1. "Moved" means: the wordmark and cursor leave `AnimatedLogo.vue`

AC 1 says "moved", so the wordmark is not duplicated. `AnimatedLogo.vue` keeps
only the circuit ("MS" mark): mask, traces, dots and heads stay unchanged.
Removed:

- the whole `<g class="animated-logo__wordmark">` (20 `path.animated-logo__glyph`
  and the `rect.animated-logo__cursor`);
- the CSS rules `.animated-logo__glyph` and `.animated-logo__cursor`, the
  keyframes `logo-cursor-blink` and `logo-cursor-move`, and the two selectors
  `.animated-logo__glyph` and `.animated-logo__cursor` in the
  `@media (prefers-reduced-motion: reduce)` block. That block stays the last
  rule block of the `<style>`.
- `logo-show` stays (the dots and holes still use it).

**viewBox crop.** Without the wordmark, the lower third of the 512×512 box is
empty, and the hero heading would sit under about 80 px of blank space. The
circuit's ink box, computed from the ring centres ± the ring's outer radius
(10.144 + 8.336 / 2 = 14.312), is x 68.45–450.57, y 97.23–342.01. The trace
vertices (x 89.79–434.70, y 110.91–327.70) are inside it. The new viewBox is

```
viewBox="0 32 512 376"
```

It keeps the full width of 512, so the circuit is drawn at exactly the same
size in the hero (`.hero__logo { width: min(100%, 19rem) }` is unchanged). The
vertical padding is 65.2 above and 66.0 below the ink, which matches the
horizontal padding (61–68). The component CSS changes `aspect-ratio: 1` to
`aspect-ratio: 512 / 376`. The mask region (`x="0" y="0" width="512"
height="512"`, white rect 512×512) stays as it is; it still covers the cropped
box, and changing it would add risk for no gain.

`landing.logoAlt` ("Animated michaelschreiber.net logo as a connected IT
network") stays. It still describes the site's logo, and the mark is the logo.
No i18n change.

### D2. The header title is real text, not SVG glyphs

The header brand is small (`--font-size-lg`, 18 px) and set in the system font
next to the logo mark. Real text keeps the current size and font, can carry
the per-word weights (D2a), and needs no new geometry, and it scales with the user's font size. SVG glyphs at 18 px would
look different from the rest of the header and would cost about 20 KB of path
data.

The brand text is a fixed product name, not translated. It stays hard-coded,
as today, but as constants in the composable (D4), not in the template.

### D2a. Three segments: `michael` normal, `schreiber` bold, `.net` uncoloured (user change)

User change during MS-18 (verbatim): "ich hätte gerne wie bisher das
"schreiber" von michaelschreiber.net fett und das .net soll nicht mehr farbig
sein". As in the former MS-17 wordmark, `schreiber` is bold, and `michael` and
`.net` use the normal weight. `.net` is no longer indigo. All three segments
use the title's text colour (`--color-text-primary`, inherited from `body`).

The title is split into three segments by fixed character indices of
`BRAND_TITLE`:

| Segment | Indices | Text | Class | Weight token |
|---|---|---|---|---|
| first | 0–7 | `michael` | `.brand__first` | `--font-weight-normal` (400) |
| strong | 7–16 | `schreiber` | `.brand__strong` | `--font-weight-bold` (700) |
| tld | 16–20 | `.net` | `.brand__tld` | `--font-weight-normal` (400) |

The ranges are half-open (`[start, end)`), as with `String.prototype.slice`.
The visible part of each segment for a given `count` is
`BRAND_TITLE.slice(start, clamp(count, start, end))`.

CSS:

- `.brand__first, .brand__tld { font-weight: var(--font-weight-normal); }`
- `.brand__strong { font-weight: var(--font-weight-bold); }`
- The `color: var(--color-primary)` rule for `.brand__tld` is removed, so no
  segment sets a colour.
- The `font-weight: var(--font-weight-semibold)` on `.brand__name` is removed:
  every glyph is inside a segment that sets its own weight. Font size, colour
  and `white-space: nowrap` stay on `.brand__name`.

Why `bold` (700) and `normal` (400): these are the tokens in
`app/src/assets/styles/variables.css` with the clearest contrast. The MS-17
wordmark used a light/medium pair, but the header is set at 18 px in the system
font, and a 400/500 pair would hardly be visible there. Using `bold` also
matches the user's word "fett".

### D3. Header markup, accessibility and layout stability

New brand link content in `AppNavigation.vue` (classes are binding):

```html
<RouterLink
  to="/"
  class="brand"
  @click="closeMenu"
  @pointerenter="onPointerEnter"
  @pointerleave="onPointerLeave"
>
  <span class="brand__mark" aria-hidden="true">…unchanged img…</span>
  <span class="brand__name">
    <span class="brand__sr">michaelschreiber.net</span>
    <span class="brand__title" aria-hidden="true" :data-phase="phase">
      <span class="brand__ghost"><span class="brand__first">michael</span><span
          class="brand__strong">schreiber</span><span class="brand__tld">.net</span><span
          class="brand__cursor"></span></span>
      <span class="brand__typed"><span class="brand__first">{{ first }}</span><span
          class="brand__strong">{{ strong }}</span><span class="brand__tld">{{ tld }}</span><span
          class="brand__cursor"
          :class="{ 'brand__cursor--blinking': phase === 'idle' }"
        ></span></span>
    </span>
  </span>
</RouterLink>
```

Write the ghost and typed spans so that no whitespace text nodes appear
between the characters and the cursor. A space before the cursor would show
up as a gap. The ghost and typed content come from the same constants
(`BRAND_TITLE` and the segment indices, D2a), not literals; the snippet shows
the result. The three segment spans are always rendered, also when they are
empty (no `v-if`). The ghost and the typed span then have the same structure.

**Accessible name.** `.brand__sr` is visually hidden (scoped, standard
pattern: `position: absolute; width: 1px; height: 1px; padding: 0;
margin: -1px; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%);
white-space: nowrap; border: 0;`; the project has no global utility class)
and always contains the full `michaelschreiber.net`. The animated part is
`aria-hidden="true"`. So the link's accessible name is always
"michaelschreiber.net", whatever the animation state (the mark is already
`aria-hidden` with `alt=""`). Hidden text is chosen over `aria-label` on the
link because it survives translation tools and copy-and-paste in the same way
as visible text, and it keeps the RouterLink free of extra attributes.
Screen readers never hear partial words or live changes, so no `aria-live`.

**No layout shift.** `.brand__title` is `display: inline-grid`. The ghost and
the typed span both sit in the same cell (`grid-area: 1 / 1`). The ghost has
`visibility: hidden` and always holds the full text plus a cursor, so the
cell is always as wide and tall as the complete title. The ghost uses **the
same three segment spans and classes** as the typed text (D2a). Bold glyphs
are wider, and only the same weights per segment give the ghost exactly the
width of the fully typed title. The typed span is
`justify-self: start`. The brand link (already `flex-shrink: 0`) and the
navigation do not move while characters are deleted or typed, and the empty
state (count 0) keeps its line height. `white-space: nowrap` stays on
`.brand__name`.

### D4. State machine: generic `useTypewriter` plus brand wrapper `useBrandTitle`

Two composables in `app/src/composables/`:

- **`useTypewriter.ts`** — a generic, timer-based engine with no DOM, brand or
  media-query knowledge. It owns one pending `setTimeout` at a time and
  exposes `count` (visible characters) and `phase`. Unit tests drive it with
  fake timers.
- **`useBrandTitle.ts`** — the brand-specific wiring: constants, the
  once-per-page-load intro (D5), reduced motion (D7), touch filtering (D8) and
  the split into the `first` / `strong` / `tld` segments (D2a). `AppNavigation.vue`
  only calls `useBrandTitle()` and binds the result.

Why two: the engine's reversal and cleanup logic is the risky part and is
tested in isolation with short, generic delays. The brand rules are
policy that would clutter the engine. `useTimelineAnimation.ts` sets the
precedent for stateful behaviour in composables.

**Phases:** `'idle' | 'typing' | 'deleting'`.

**Engine rules** (`n = text.length`, `count` in `0…n`):

| Call | Effect |
|---|---|
| `type(leadDelay = 0)` | Cancels any pending step. If `count === n`: phase `idle`, nothing scheduled. If `leadDelay > 0`: **the phase is set to (or stays) `idle` during the lead**, and the only pending timer is the lead timer. When it fires, the phase switches to `typing` and the next character is scheduled after `typeDelays[count]` ms. If `leadDelay === 0`: phase `typing` at once, next character after `typeDelays[count]` ms. Every further character `k` follows after `typeDelays[k]` ms. After the last character: phase `idle`. |
| `erase()` | Cancels any pending step. If `count === 0`: phase `idle`. Otherwise phase `deleting`; **one character is removed at once** (synchronously, like the first press of the delete key), then one per `deleteDelay` ms. At `count === 0`: phase `idle`. |
| `stop()` | Cancels any pending step; phase `idle`; `count` unchanged. |
| scope dispose | `onScopeDispose(stop)`: no timer outlives the component. |

**Lead phase (resolves a contradiction found by the tester).** During the
lead the cursor must blink, as in a real terminal that waits for input. So the
lead belongs to the `idle` phase, not to `typing`. It is handled inside the
engine, not with a separate timer in `useBrandTitle`. That keeps the
"one pending timer, cancelled by every call" invariant in one place, and
`erase()` or `stop()` during the lead cancels it like any other step. The
pause `typeDelays[count]` after the lead is `typing` (solid cursor). For the
intro these are the 200 ms of hesitation before `m`, as in MS-17 D4a, where
the cursor was solid for 0.2 s before the first glyph. A retype on pointer
leave calls `type()` without a lead. It goes to `typing` at once, and the
cursor turns solid at the leave, as before.

Reversal in both directions falls out of "cancel, then continue from the
current `count`". Hover during typing deletes from the current position, and
leave during deleting types from the current position (AC 5). The typing
pause before character k is the same whether it is the intro or a retype, so
a retype keeps the human rhythm and the word pauses. `onScopeDispose` is used
instead of `onUnmounted`, so the engine also cleans up inside a bare
`effectScope` in the tests.

**Delete timing.** The key-repeat delay of a real keyboard (about 0.5 s
before auto-repeat starts) is left out on purpose: the first character goes
at once, then 60 ms per character, so all 20 are gone in 1.14 s. A 0.5 s
stall after the first character would read as lag on hover.

**Typing rhythm** — the MS-17 D4 intervals are reused, so the header types
exactly like the hero did. The pause before character k:

| k | 0 m | 1 i | 2 c | 3 h | 4 a | 5 e | 6 l | 7 s | 8 c | 9 h |
|---|---|---|---|---|---|---|---|---|---|---|
| ms | 200 | 170 | 210 | 190 | 230 | 180 | 200 | 450 | 190 | 170 |

| k | 10 r | 11 e | 12 i | 13 b | 14 e | 15 r | 16 . | 17 n | 18 e | 19 t |
|---|---|---|---|---|---|---|---|---|---|---|
| ms | 220 | 180 | 160 | 240 | 190 | 200 | 400 | 220 | 180 | 200 |

Sum: 4380 ms. The pause before `m` (200 ms) is the old "hesitation"; the
450 ms and 400 ms entries are the word pauses before `schreiber` and `.net`.

**Intro:** at mount the title is empty, and `type(BRAND_INTRO_DELAY_MS)` is
called with 800 ms. From 0 to 0.80 s the phase is `idle` (cursor blinking at
the start position). From 0.80 s it is `typing` (solid cursor, 200 ms
hesitation). `m` appears at 1.00 s, and the title is complete at 5.18 s. The intro starts in `onMounted`,
not during setup. The initial `count` is decided during setup (0 for the
intro, `n` otherwise), so the first render already has the correct text and
there is no flash.

### D5. The intro plays once per page load, not on every route change

`AppNavigation` is rendered by each view and remounts on every navigation.
Replaying the intro would blank the brand and retype it 5 s long on every
page change, which is noisy and makes the header flicker. So:

- `useBrandTitle.ts` holds a module-scoped `let introPlayed = false`. The first
  `useBrandTitle()` call of the page load sets it to `true` and plays the
  intro. Every later instance starts with the full title (`count = n`,
  `idle`, cursor blinking).
- A full reload (or a new tab) plays it again, because the module is
  re-evaluated.
- Navigating away during the intro: the old instance's timer is cleared on
  unmount, and the new instance shows the full title. The flag is set when
  the intro starts, not when it finishes.
- Clicking the brand link while it is hovered (and deleted) navigates to `/`.
  The new instance shows the full title. The browser fires `pointerenter` on
  the next pointer movement, which deletes it again. Accepted: keeping the
  deleted state across remounts would need state that outlives the component,
  for no visible benefit.
- `export function resetBrandTitleIntro(): void` sets the flag back to `false`.
  It is a test seam only (component tests need a predictable first mount). No
  production code calls it. A module flag is chosen over a Pinia store: the
  tests mount the views without Pinia, and adding Pinia to every page test for
  one boolean is not worth it.

Moving `AppNavigation` into `App.vue` (so that it never remounts) was
considered and rejected. It changes all six views and their tests, and the
story does not ask for it.

### D6. Underscore cursor and blinking

`.brand__cursor` is drawn with CSS, not with the `_` character. The underscore
glyph's width, thickness and depth below the baseline differ from font to
font in the system font stack.

```css
.brand__cursor {
  display: inline-block;
  width: 0.6em;
  height: max(2px, 0.1em);
  margin-left: 0.06em;
  background-color: currentColor; /* --color-text-primary from .brand__name */
  vertical-align: baseline;      /* an empty inline-block sits on the baseline */
}

.brand__cursor--blinking {
  animation: brand-cursor-blink 1s steps(1, end) infinite;
}

@keyframes brand-cursor-blink {
  0% { opacity: 1; }
  50% { opacity: 0; }
}
```

- The cursor is about as wide as a lowercase `n`, a classic terminal
  underscore. It uses the primary text colour, like every title segment
  (D2a).
- It blinks with the MS-17 period (1 s, 0.5 s on / 0.5 s off) **only in phase
  `idle`**: during the 800 ms intro lead (D4: the lead is `idle`), after the intro (AC 3: it stays and blinks
  forever), after a full delete and after a full retype. While typing or
  deleting it is solid, as in a real terminal. Removing the class while
  typing restarts the blink at "on" when the phase returns to `idle`.
- The ghost's cursor has no blinking class. It only reserves width.

### D7. `prefers-reduced-motion: reduce`

- `useBrandTitle` checks once during setup:
  `typeof window !== 'undefined' && typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches`. jsdom has no
  `matchMedia`, so tests count as "no preference" unless they stub it.
- With reduced motion: `count = n` from the start, no intro, and both pointer
  handlers do nothing. The title never types or deletes.
- The cursor stays visible as a steady underscore (it is part of the brand
  look and does not move). A scoped rule
  `@media (prefers-reduced-motion: reduce) { .brand__cursor--blinking { animation: none; } }`
  stops the blink. It comes after the blink rule. The global rule in `App.vue`
  would only shorten it to one 0.01 ms iteration; the explicit rule makes the
  intent clear and does not depend on that rule.
- The setting is read once per instance and is not watched. Changing the OS
  setting takes effect on the next navigation or reload. That is good enough
  for this story.

### D8. Hover target, touch devices and keyboard focus

- **Hover target: the brand link** (`a.brand`, logo mark plus title), not the
  whole `<header>`. AC 4 says "header", but AC 5 says "moved away from the
  animated title". If the whole bar were the target, every trip to the
  navigation links would delete the title, which feels broken. The brand link
  is the "animated title" area in the header and a comfortable target. The
  ghost (D3) keeps its size constant, so the pointer cannot fall out of the
  target because the text shrinks. If the user wants the whole header as the
  target, move the two listeners to `<header>` (Open Question 1).
- **Pointer events with a touch filter.** `pointerenter` / `pointerleave`, and
  the handlers return early when `event.pointerType === 'touch'`. A tap on a
  touch screen fires the enter event and emulated mouse events. A
  `mouseenter` listener would delete the title on every tap and leave it
  deleted ("sticky hover") until the next tap elsewhere. Mouse and pen hover
  work. An event without `pointerType` (empty string or undefined, as in
  jsdom) is treated as a mouse.
- **Keyboard focus does not delete.** A keyboard user who tabs to the link
  would see the focused link lose its visible text, while the focus outline
  surrounds an empty box. The ACs only ask for the mouse. Focus keeps the
  current `:focus-visible` outline; no focus or blur listeners.

### D9. Tests

Vitest + Vue Test Utils, `vi.useFakeTimers()` for all timing, no real
delays. Tests live in `app/src/__tests__/`.

## Affected Components

| File | Change |
|---|---|
| `app/src/composables/useTypewriter.ts` | **New.** Generic typing/deleting engine (D4). |
| `app/src/composables/useBrandTitle.ts` | **New.** Brand constants, intro once per page load, reduced motion, touch filter, `first`/`strong`/`tld` split (D2a), `resetBrandTitleIntro()` test seam (D4, D5, D7, D8). |
| `app/src/components/AppNavigation.vue` | Brand link markup (D3), pointer listeners, segment weights without `.net` colour (D2a), cursor and layout CSS (D3, D6, D7). Hamburger, navigation and other styles unchanged. |
| `app/src/components/AnimatedLogo.vue` | Wordmark, cursor, their CSS and keyframes removed; viewBox `0 32 512 376`; `aspect-ratio: 512 / 376` (D1). |
| `app/src/__tests__/useTypewriter.spec.ts` | **New.** |
| `app/src/__tests__/useBrandTitle.spec.ts` | **New** (may be merged into the AppNavigation spec if the tester prefers; the coverage below is what counts). |
| `app/src/__tests__/AppNavigation.spec.ts` | **New.** |
| `app/src/__tests__/AnimatedLogo.spec.ts` | Wordmark, typing and cursor tests removed or inverted; viewBox and bounds tests updated (see Tests). |
| `app/src/__tests__/LandingPage.spec.ts` | Unchanged unless it relies on the logo's wordmark; the `aria-label` assertions stay. |

No change to i18n messages, router, stores, types, `material-web.ts`,
`App.vue`, `LandingPage.vue` or dependencies. `MS-17-*.md` documents are
records and stay unchanged; the index notes that MS-18 moved the wordmark.

## Data Flow

```
AppNavigation.vue (setup, per view mount)
  └─ useBrandTitle()
       ├─ reducedMotion = matchMedia(...)?.matches ?? false
       ├─ playIntro = !introPlayed && !reducedMotion; introPlayed = true
       ├─ useTypewriter(BRAND_TITLE, { typeDelays, deleteDelay: 60,
       │                               initialCount: playIntro ? 0 : 20 })
       │     count: Ref<0..20>, phase: Ref<'idle'|'typing'|'deleting'>
       │     one setTimeout at a time, cleared on scope dispose
       ├─ onMounted: playIntro && type(800)
       ├─ first  = BRAND_TITLE.slice(0,  clamp(count, 0, 7))    "michael"
       ├─ strong = BRAND_TITLE.slice(7,  clamp(count, 7, 16))   "schreiber" (bold)
       ├─ tld    = BRAND_TITLE.slice(16, clamp(count, 16, 20))  ".net"
       └─ onPointerEnter(e) → touch/reducedMotion ? noop : erase()
          onPointerLeave(e) → touch/reducedMotion ? noop : type()

template
  a.brand (pointerenter / pointerleave)
    .brand__sr  "michaelschreiber.net"   ← accessible name, never changes
    .brand__title[aria-hidden][data-phase]
       .brand__ghost  first|strong|tld full + cursor (hidden, same weights)
       .brand__typed  <.brand__first>{{ first }}</><.brand__strong>{{ strong }}</>
                      <.brand__tld>{{ tld }}</> + cursor
                      cursor blinks only when phase === 'idle'

Timeline (intro, first mount of the page load):
  0.00 s        empty, phase idle, cursor blinking at start (lead)
  0.80 s        phase typing, cursor solid (200 ms hesitation)
  1.00 s        "m" … typing, cursor solid
  5.18 s        "michaelschreiber.net", idle, cursor blinks forever
hover          delete 1 char at once, then 1 per 60 ms → empty, idle, blink
leave          type from current count with the D4 pauses → full, idle, blink
```

## Interfaces

```ts
// app/src/composables/useTypewriter.ts
import type { Ref } from 'vue'

export type TypewriterPhase = 'idle' | 'typing' | 'deleting'

export interface TypewriterOptions {
  /** Pause in ms before character k is typed; length must equal text.length. */
  typeDelays: readonly number[]
  /** Pause in ms between two deleted characters (the first one goes at once). */
  deleteDelay: number
  /** Characters visible at start, 0…text.length. Default 0. */
  initialCount?: number
}

export interface Typewriter {
  count: Readonly<Ref<number>>
  phase: Readonly<Ref<TypewriterPhase>>
  /**
   * Types forward from the current count. A leadDelay > 0 is spent in phase
   * 'idle'; the phase becomes 'typing' when the lead ends (at once if 0).
   */
  type(leadDelay?: number): void
  /** Deletes backwards from the current count; the first character goes synchronously. */
  erase(): void
  /** Cancels the pending step and goes idle; count is kept. */
  stop(): void
}

export function useTypewriter(text: string, options: TypewriterOptions): Typewriter
```

Use `readonly(ref)` (or `shallowReadonly`) for the returned refs. Clamp
`initialCount` to `0…text.length`. If `typeDelays.length !== text.length`,
throw an `Error` (a programming error, caught by the brand tests).

```ts
// app/src/composables/useBrandTitle.ts
import type { ComputedRef, Ref } from 'vue'
import type { TypewriterPhase } from './useTypewriter'

export const BRAND_TITLE = 'michaelschreiber.net'
/** Half-open [start, end) character ranges of the three title segments (D2a). */
export const BRAND_SEGMENTS = {
  first: [0, 7], // "michael"   — normal weight
  strong: [7, 16], // "schreiber" — bold
  tld: [16, 20], // ".net"      — normal weight, not coloured
} as const
export const BRAND_TYPE_DELAYS_MS: readonly number[] = [
  200, 170, 210, 190, 230, 180, 200, 450, 190, 170,
  220, 180, 160, 240, 190, 200, 400, 220, 180, 200,
]
export const BRAND_DELETE_DELAY_MS = 60
export const BRAND_INTRO_DELAY_MS = 800

export interface BrandTitle {
  /** Visible part of "michael". */
  first: ComputedRef<string>
  /** Visible part of "schreiber" (empty until the "s" is typed). */
  strong: ComputedRef<string>
  /** Visible part of ".net" (empty until the "." is typed). */
  tld: ComputedRef<string>
  phase: Readonly<Ref<TypewriterPhase>>
  onPointerEnter(event: PointerEvent): void
  onPointerLeave(event: PointerEvent): void
}

export function useBrandTitle(): BrandTitle
/** Test seam: makes the next useBrandTitle() call play the intro again. */
export function resetBrandTitleIntro(): void
```

`AppNavigation.vue` keeps no props and no emits. Template contract (relied on
by the tests): `a.brand` with the listeners; inside `.brand__name`, exactly
one `.brand__sr` with the text `michaelschreiber.net`, one
`.brand__title[aria-hidden="true"][data-phase]` containing `.brand__ghost`
and `.brand__typed`; `.brand__typed` contains the visible text, an optional
`.brand__first`, `.brand__strong` and `.brand__tld` (always rendered, in
this order; the ghost has the same three), and exactly one `.brand__cursor`, which has
`.brand__cursor--blinking` if and only if the phase is `idle`.

`AnimatedLogo.vue` contract changes: root `viewBox="0 32 512 376"`; no
`g.animated-logo__wordmark`, no `.animated-logo__glyph`, no
`.animated-logo__cursor`, no `<rect>` outside the mask. Everything else in the
MS-17 contract is unchanged.

## Tests

The Tester writes `MS-18-tests.md`. Expected coverage:

`useTypewriter.spec.ts` (run inside `effectScope()`, fake timers, short
delays such as `[10, 20, 30]` and `deleteDelay: 5`)

- Initial state: `count` equals `initialCount` (default 0, clamped), phase
  `idle`; throws when the delay count does not match the text length.
- `type()` types one character per configured pause (check `count` just
  before and at each boundary), phase `typing`, then `idle` at the end;
  `type(lead)` delays only the first character by `lead`; phase is `idle`
  until `lead` has elapsed (just before `lead`: `idle`; at `lead`: `typing`)
  with exactly one pending timer; `type()` without a lead is `typing` at
  once; `erase()` or `stop()` during the lead cancels it (no timer left,
  phase as per the engine table).
- `type()` at full count stays `idle` and schedules nothing
  (`vi.getTimerCount() === 0`).
- `erase()` removes one character synchronously, then one per `deleteDelay`,
  phase `deleting`, `idle` at 0; `erase()` at 0 stays idle with no timer.
- Reversal: `erase()` during typing continues from the current count
  downwards; `type()` during deleting continues upwards from the current
  count with `typeDelays[count]` as the next pause; repeated alternation
  never leaves more than one pending timer.
- `stop()` keeps `count` and clears the timer.
- Stopping the scope clears the pending timer (`vi.getTimerCount() === 0`,
  `count` unchanged after `vi.runAllTimers()`).

`useBrandTitle.spec.ts` (or the AppNavigation spec; `resetBrandTitleIntro()`
in `beforeEach`)

- `BRAND_TITLE === 'michaelschreiber.net'`; 20 delays, equal to the D4 table,
  sum 4380; the delays before `s` and `.` are larger than any other.
- First instance: empty at mount, phase `idle` from 0 to 799 ms, `typing`
  from 800 ms, `m` at 1000 ms, full at 5180 ms, then `idle`.
- Second instance in the same page load: full at once, no timers.
- With `window.matchMedia` stubbed to match reduced motion: full at once, no
  timers, pointer handlers do nothing.
- `BRAND_SEGMENTS` covers 0–20 without gaps; the slices are `michael`,
  `schreiber` and `.net`.
- `first`/`strong`/`tld` split: count 5 → `micha` / `""` / `""`; count 7 →
  `michael` / `""` / `""`; count 10 → `michael` / `sch` / `""`; count 16 →
  `michael` / `schreiber` / `""`; count 18 → `michael` / `schreiber` / `.n`;
  count 20 → all full.
- Pointer events with `pointerType: 'touch'` are ignored; `'mouse'`, `'pen'`
  and a missing `pointerType` act.

`AppNavigation.spec.ts` (router stub or memory router, real i18n, fake
timers, `resetBrandTitleIntro()` in `beforeEach`)

- The brand link's `.brand__sr` text is `michaelschreiber.net` in every state
  (at mount, mid-typing, fully deleted); `.brand__title` has
  `aria-hidden="true"`; the mark stays `aria-hidden`.
- `.brand__ghost` always contains the full text and a cursor (layout
  reservation), also when the title is empty.
- Intro: `.brand__typed` text is empty at mount, grows over time and equals
  `michaelschreiber.net` after 5180 ms; `michael`, `schreiber` and `.net`
  are in `.brand__first`, `.brand__strong` and `.brand__tld`; the ghost has the
  same three segment classes with the full texts; `data-phase` goes `idle` → `typing` → `idle`.
- Cursor: exactly one `.brand__cursor` in `.brand__typed`, with
  `--blinking` exactly when `data-phase="idle"` (including after the intro).
- Hover: `trigger('pointerenter')` after the intro removes one character at
  once, empties the title after 19 × 60 ms, `data-phase="idle"`.
- Leave mid-delete (for example at count 12) types from 12 onwards with no
  jump back to full; leave restores the full text in the end. Hover
  mid-typing deletes from the current count.
- `trigger('focus')` changes nothing.
- A touch `pointerenter` (`pointerType: 'touch'`) changes nothing.
- Unmount during typing leaves no pending timer.
- Remount (second mount in the same test after the first is unmounted) shows
  the full title at once.
- If jsdom lacks `PointerEvent`, dispatch a `MouseEvent` named
  `pointerenter`/`pointerleave` and define `pointerType` on it with
  `Object.defineProperty`.
- Source level (`AppNavigation.vue?raw`): the blink keyframes and
  `steps(1, end) infinite`; `.brand__strong` uses `var(--font-weight-bold)`,
  `.brand__first` and `.brand__tld` use `var(--font-weight-normal)`; no rule
  sets `color` on `.brand__tld` and `--color-primary` is not used in the brand
  rules; a reduced-motion block with `animation: none` for
  the blinking cursor after the blink rule; `visibility: hidden` on the
  ghost.

`AnimatedLogo.spec.ts` (update the MS-17 suite)

- `viewBox="0 32 512 376"`; source contains `aspect-ratio: 512 / 376`.
- No `g.animated-logo__wordmark`, no `.animated-logo__glyph`, no
  `.animated-logo__cursor`, no `<rect>` outside the mask; no
  `logo-cursor-*` keyframes in the source.
- Root children order: mask defs, masked traces, dots, heads (no wordmark).
- Every ring (dots and heads at their final centres) plus the outer radius
  14.312 lies inside the viewBox (`32 ≤ y ≤ 408`).
- Remove the D4/D4a tests (typing rhythm, cursor markup, "circuit completes
  before the cursor", cursor CSS contract) and the wordmark fitting transform
  test; keep everything else (traces, rings, mask, joints, merge,
  `steps(1, start)` guard, reduced-motion block last).

Other page specs that mount a view (and so `AppNavigation`) need no change:
`.brand__sr` keeps the brand text in `wrapper.text()`. Pending intro timers in
those specs are cleared when the wrapper unmounts.

Manual browser check (Chrome, Safari, Firefox; jsdom has no layout):

- Reload any page: the cursor blinks at the start, the title types in the
  MS-17 rhythm, and the cursor keeps blinking after `.net`. `schreiber` is
  bold, `michael` and `.net` are normal weight, and `.net` has the same colour
  as the rest (no indigo). The header does not shift when the bold part is
  typed or deleted.
- Hover the brand: the title is deleted from the right, and the cursor is
  solid while deleting and blinks when empty. Leave halfway: typing resumes
  from that character. The navigation links never move.
- Navigate between pages: the title stays complete (no replay).
- Landing page: the hero shows only the circuit, at the same width, with no
  large gap above the heading, and the circuit is not clipped.
- Touch device (or DevTools touch emulation): tapping the brand navigates
  with no deletion.
- `prefers-reduced-motion: reduce`: full title at once, a steady underscore,
  no reaction to hover.
- VoiceOver/NVDA: the link is announced as "michaelschreiber.net, link" at
  any moment.

## Open Questions

Not blocking; the defaults below are implemented unless the user decides
otherwise in review:

1. **Hover target** (D8): the brand link (mark + title), not the whole header
   bar. Changing it means moving the two listeners to `<header>`.
2. **Intro replay** (D5): once per page load. The alternative is a replay on
   every route change.
3. **Delete speed** (D4): 60 ms per character with no key-repeat delay (about
   1.1 s for the full title).
4. **Intro lead** (D4): 800 ms of blinking before the 200 ms hesitation, so
   the first character appears at 1.0 s; complete at 5.18 s.
5. **Cursor look** (D6): a 0.6 em underscore in the primary text colour,
   solid while typing or deleting, blinking at 1 Hz when idle.
6. **Weights** (D2a): 400 for `michael` and `.net`, 700 for `schreiber`. If
   700 looks too heavy at 18 px, `--font-weight-semibold` (600) is the
   fallback.
