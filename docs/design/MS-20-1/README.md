# Design MS-20 — One-page concept

| | |
|---|---|
| Issue | [MS-20 Redesign onepager](https://mklschreiber.atlassian.net/browse/MS-20) |
| Artifact | https://claude.ai/artifact/KqEMjbHSR4wEEU3wRonQ7j (title "michaelschreiber.net – One-Page-Konzept") |
| Artifact version | `1792713069-9153` |
| Copied | 2026-10-23 |
| Design system | `michaelschreiber.net` (namespace `michaelschreiber-net`), version `1792569206-7439` ([source](https://claude.ai/code/artifact/7b75e4bb-b496-4f8e-9518-d71fa982d1a9)) → [ds/michaelschreiber-net/tokens.json](ds/michaelschreiber-net/tokens.json) |
| Language of texts | German (the app is localized; take the texts as the German strings) |

**Source of truth:** the HTML files and `tokens.json` for every value. The PNGs are for the
overall layout only. The HTML needs the design tool's runtime (`support.js`, not copied) to
render; the PNGs were rendered from a copy with the runtime placeholders resolved to the light
theme and closed mobile menu.

**Images:** the design references its images as `/_blob/<id>` (not downloadable). For the PNG
render they were replaced with existing app assets: logo → `app/public/logo.svg`, project
photos → `app/public/mystandby_desk-960.jpg` / `mystandby_landing_macbook-960.jpg`, portrait →
`app/public/profile-picture.jpeg`. The 20px contact icons were not available (broken icons in
the PNGs); use the existing `app/src/components/icons/*`. `[Bild 2]`, `[Bild 3]`,
`[Projektbild]` and the bracketed timeline texts are placeholders — use the app's existing
project images and CV data.

## Screens

| Board (canvas.json) | Size | Shows | Files |
|---|---|---|---|
| Desktop | 1440 × 4600 | Full one-page layout: sticky app bar with in-page nav, Home hero, Projekte, Über mich (profile + 3-entry timeline), Kontakt form, footer | [screens/Main.dc.html](screens/Main.dc.html), [screens/Main.png](screens/Main.png) |
| Mobil (Menü antippen) | 390 × 5000 | Same sections stacked; app bar with menu button that opens a dropdown nav (interactive) | [screens/Mobile.dc.html](screens/Mobile.dc.html), [screens/Mobile.png](screens/Mobile.png) |

Both boards also have a `dark` prop (dark theme via the `.ms-dark` token set, logos inverted).

## Structure and key values

Font: Inter (400/500/600/700). Icons: Material Symbols Outlined. Colors as CSS variables mapped
from `tokens.json` (light: primary `#4338ca`, primary-container `#e3e0fb`, surface `#ffffff`,
surface-container-low `#f6f5fc`, on-surface `#1b1b1f`, on-surface-variant `#47464f`, outline
`#79757f`, outline-variant `#cac4d0`, gradient `#6a3de0 → #3b8fcf`, footer gradient
`#352b94 → #4a44d4 (55%) → #3b73a6`). Focus ring: 3px solid primary, 3px offset.

### App bar (sticky, `z-index: 10`)
- Desktop: height 80px, content max-width 1312px, padding 0 32px; background
  `color-mix(surface 70%, transparent)` + `backdrop-filter: blur(16px) saturate(1.4)`; bottom
  border 1px outline-variant.
- Left: logo link to `#home` (aria-label "michaelschreiber.net – zum Anfang"): 48px logo image,
  gap 12px, wordmark 24px/32px "michael**schreiber**.net" with a blinking underscore cursor
  (`ms-blink`, 1.06s steps; off for reduced motion) — i.e. the existing typing header title.
- Right (desktop): `<nav aria-label="Hauptnavigation">` with links Home / Projekte / Über mich /
  Kontakt → `#home`, `#projekte`, `#ueber-mich`, `#kontakt`. Link: height 48px, padding 0 16px,
  radius full, 18px/500, on-surface-variant; hover and active (`.on`, `aria-current`):
  primary-container background, active text primary.
- Mobile: height 72px, padding 0 16px 0 24px, 40px logo, wordmark 20px/28px; 48px icon button
  "Menü" (`aria-expanded`, icon `menu` / `close`) toggles a nav below the bar (border-top
  outline-variant, padding 8px 0 16px) with full-width links (height 56px, padding 0 24px);
  tapping a link closes the menu.
- Sections use `scroll-margin-top: 80px` (mobile 72px); `scroll-behavior: smooth`.

### Home (`#home`)
- `min-height: max(560px, calc(100svh - 80px))` (mobile `- 72px`), background gradient
  surface-container-low → surface, centered column, padding 64px 32px (mobile 48px 24px).
- MS monogram logo 360px wide (mobile 240px), margin-bottom 48px (mobile 40px) — the existing
  animated MS logo.
- `h1` "Willkommen" 52px/60px 700, letter-spacing −0.02em, gradient text (mobile 44px/52px).
- Subtitle "Entdecke meine Projekte und nimm Kontakt auf." 22px/32px on-surface-variant,
  margin-top 16px, max-width 560px.
- Round 56px scroll button (border 1px outline, icon `keyboard_arrow_down` 28px primary) →
  `#projekte`, aria-label „Zu „Projekte“ scrollen“, margin-top 48px (mobile 40px).

### Projekte (`#projekte`)
- Background gradient 135° footer-start → footer-mid 55% → footer-end, text on-footer,
  padding 64px 32px (mobile 48px 24px).
- `h2` "Projekte" 52px/60px gradient text `#ffffff → #5cc8ff` (mobile 44px/52px); subtitle
  "Eine Auswahl meiner aktuellen Arbeiten" 20px/28px, opacity .88, margin 8px 0 48px (mobile 32px).
- Cards stacked, gap 32px. Glass card: background `rgba(255,255,255,.52)`, border 1px
  `rgba(255,255,255,.75)`, backdrop blur 16px saturate 1.4, shadow
  `0 8px 24px rgba(10,5,60,.25), inset 0 1px 0 rgba(255,255,255,.25)`, radius 28px, padding 36px
  (mobile radius 16px, padding 24px, single column, gap 24px).
- Desktop card grid: columns `5fr 7fr`, column-gap 48px, row-gap 24px. Row 1: title `h3`
  28px/36px 700 across both columns. Left (rows 2–4): image carousel (horizontal scroll-snap,
  gap 12px, slides 84% wide, 16:10, radius 12px; mobile 86%). Right: description 18px/28px
  `#1d1470`; tag chips (height 28px, padding 0 12px, 14px/20px, colors by position: lilac, sand,
  rose); link buttons (height 48px, padding 0 24px, radius full, 18px/600, trailing icon
  `open_in_new`; first filled primary, second outlined 1.5px `#1d1470`). Mobile buttons full width,
  stacked with gap 12px.
- Content: myStandby (Android, Kotlin, GitHub CI/CD; "Im Play Store ansehen"),
  myStandby – Landing Page (Vue.js, GitHub CI/CD, GitHub Pages; "Website besuchen",
  "Auf GitHub ansehen"), michaelschreiber.net (Vue.js, GitHub CI/CD, GitHub Pages;
  "Auf GitHub ansehen").

### Über mich (`#ueber-mich`)
- Background gradient surface-container-low → surface, padding 64px 32px (mobile 48px 24px).
- `h2` "Über mich" (gradient text) + subtitle "Eine Übersicht über mich und meine Stationen".
- Profile card (`.card`: surface fill with 2px gradient border 135° gs → ge, shadow-card,
  hover shadow-raised on desktop), radius 28px, padding 36px, row with gap 48px (mobile: column,
  centered, radius 16px, padding 24px).
  - Portrait 176px (mobile 128px), round, 4px surface border + 3px gradient-start ring.
  - Name `h3` 32px/40px 700 "Michael Schreiber"; role 20px/28px 500 primary "Senior Software
    Engineer".
  - Contact chips (height 36px, padding 0 16px, radius full, 18px/500, surface-container-low,
    20px icon, gap 8px): E-Mail (mailto), Telefon (tel), LinkedIn, GitHub, Facebook, Instagram, X.
- Timeline directly below the profile card, **only the 3 newest CV entries**:
  - Desktop: alternating left / right in a `1fr 48px 1fr` grid; axis 2px primary-container with
    a 20px ring dot (3px primary border); first entry on the left, second right, third left.
    Ends in a 120px dashed connector fading out.
  - Mobile: `24px 1fr` grid, axis left, all cards right; dashed fade-out 96px.
  - Entry card: surface, border 1px outline-variant, radius 16px, padding 24px, shadow-card.
    Date 16px/24px 500 primary; employer `h3` 22px/28px 600; role 18px/28px on-surface-variant.

### Kontakt (`#kontakt`)
- Padding 64px 32px 96px (mobile 48px 24px 64px). `h2` "Kontakt" + subtitle "Lass uns in
  Verbindung treten".
- Form card (`.card`, radius 28px, padding 36px, gap 24px; mobile radius 16px, padding 24px):
  Name + E-Mail side by side (2 columns, gap 24px; mobile stacked), then Nachricht. Labels
  18px/24px 500. Fields: height 56px, padding 0 16px, border 1px outline, radius 8px, 18px/28px;
  textarea 176px. Placeholders "Dein Name", "deine.email@example.com", "Deine Nachricht".
- Submit button "Nachricht senden" with leading icon `send`: height 56px, padding 0 32px, radius
  full, primary, 18px/600, shadow-card (hover shadow-raised); mobile full width.

### Footer
- Gradient 90° footer-start → footer-mid 55% → footer-end, min-height 76px, max-width 1312px,
  padding 24px 32px, space-between.
- `<nav aria-label="Rechtliches">`: Impressum, Datenschutz (18px/600, gap 32px; mobile stacked,
  gap 8px). Copyright "Copyright 2026 - michael**schreiber**.net" 16px/500.
