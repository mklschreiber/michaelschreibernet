# Architecture Documentation

This directory holds current, durable architecture concepts for the web
application in `app/`. It is not a history of the removed legacy mobile-project
material.

## Baseline

- [Technology Stack and Tooling](stack.md) — verified Vue 3, TypeScript, Vite,
  test, lint, and deployment baseline.

## Current Concepts

- [Trello-Backed Delivery Workflow](msnet-wf-0001-trello-delivery-workflow.md) —
  makes Trello the authoritative ticket, dependency, and delivery-progress
  system, replacing local ticket files. *(superseded by MYS-44: Jira + ai-base)*
- [Relaxed Ticket Naming and Description-Based Workflow Log](msnet-wf-0003-relaxed-tickets-and-description-log.md) —
  drops the mandatory `MSNET-XXXX:` card-naming/template convention
  project-wide and moves all `[msnet-workflow]` log entries from Trello
  comments to the card description, since the connected Trello MCP tools
  have no comment-write action. *(superseded by MYS-44: Jira + ai-base)*
- [Animated Landing-Page Logo](animated-logo.md) — defines the self-contained
  SVG drawing sequence and landing-page integration. *(superseded by MS-17)*
- [Tests for Animated Landing-Page Logo](animated-logo-tests.md) — records the
  automated coverage and manual visual check for the SVG animation.
  *(superseded by MS-17)*
- [Colored Project Tags](colored-tags.md) — defines the deterministic,
  hash-to-hue HSL color derivation for project technology tags in
  `ProjectCard.vue`, keeping backgrounds light and text in the regular font
  color.
- [Tests for Colored Project Tags](colored-tags-tests.md) — records the unit
  coverage for `getTagColor` and the `ProjectCard.vue` badge integration.
- [CI Checks for Pull Requests](improve-ci-cd-setup.md) — defines a new
  `.github/workflows/ci.yml` with independent lint, unit-test, and build jobs
  triggered on pull requests, and a non-mutating `lint:check` npm script so
  the lint job actually gates on violations instead of silently
  auto-fixing them.
- [Tests for CI Checks for Pull Requests](improve-ci-cd-setup-tests.md) —
  records the local re-verification of `lint:check`, `test:unit -- --run`,
  and `build`, plus a static correctness review of the workflow YAML.
- [AI Review Gate](msnet-wf-0002-ai-review-gate.md) — adds a fourth agent
  role, Reviewer, and an independent AI review round between the Tester
  phase and the user's manual review, synchronized with the myStandby
  project's equivalent gate.
- [Tests for AI Review Gate](msnet-wf-0002-ai-review-gate-tests.md) —
  records the static/manual verification approach for this delivery-tooling
  change, since no Vue application code changed.
- [Minor Changes — Profile Card Links, Contact Email, Avatar, Flat Icons](minor-changes.md) —
  adds LinkedIn and GitHub links, standardizes the public contact email on
  `info@michaelschreiber.net`, replaces the About page's text-initials avatar
  with the supplied profile photo, replaces emoji link icons with four new
  solid-fill flat SVG icon components under `components/icons/`, and (Round 2)
  turns the phone number and email address in Impressum, Kontakt, and Profil
  into clickable `tel:`/`mailto:` links.
- [Tests for Minor Changes](minor-changes-tests.md) — records the
  `AboutPage.vue` business-card coverage for the new LinkedIn/GitHub links,
  the corrected email, and the photo avatar, plus the four new icon
  components' shared render contract, and (Round 2) first-time coverage for
  `ImpressumPage.vue`, `DataProtectionPage.vue`, and `ContactInformation.vue`
  asserting their new `tel:`/`mailto:` links.
- [Styling Improvements — Imprint and Data Protection Header/Card
  Alignment](styling-improvements.md) — aligns `ImpressumPage.vue`'s and
  `DataProtectionPage.vue`'s `.content h1` page headers with the
  gradient-text heading recipe already used by `ContactPage.vue` and
  `ProjectOverviewPage.vue`, and their `.section` content cards with
  `AboutPage.vue`'s bordered, shadowed, gradient-trimmed
  `.about-page__card` recipe. CSS-only change in two view files' `<style
  scoped>` blocks; no new shared component or design token.
- [Mobile Project Screenshot Carousel](mobile-project-screenshot-carousel.md) —
  fixes the project card overflowing the viewport on phones and portrait
  tablets. The root cause is the `1fr` grid track growing to the gallery row's
  min-content width, and the fix is `min-width: 0` plus `minmax(0, 1fr)`.
  At `max-width: 768px`, the card shows one screenshot at a time, switched by
  CSS from a `currentIndex` ref, with looping prev/next arrows styled like the
  `vue-easy-lightbox` arrows, localized `aria-label`s, and a polite live
  position status.
- [Tests for Mobile Project Screenshot Carousel](mobile-project-screenshot-carousel-tests.md) —
  records the `ProjectCard.vue` component coverage for the active image,
  looping arrows, localized labels and live status, lightbox index, and mobile
  `sizes` entry. It also records the raw-source checks for the overflow CSS
  (`min-width: 0`, `minmax(0, 1fr)`, the 768px media query), the two new
  chevron icons, and the manual phone-width browser check.
- [myStandby - LandingPage Project Entry](MS-1-mystandby-landingpage.md) —
  adds the myStandby landing page as the second project card. It has a
  short de/en description, a website link and a GitHub link, and two
  screenshots as `sips`-generated 320–1920px JPEG variants (quality 80). The
  project model changes from a single `link`/`linkTextKey` to a
  `links: ProjectLink[]` list.
- [Tests for myStandby - LandingPage Project Entry](MS-1-tests.md) —
  records the data tests for the new entry (position, id, links, tags,
  images), the `link` → `links` migration, an existence and real-pixel-width
  check for every `<base>-<w>.jpg` variant of every project, the de/en key
  resolution, the `ProjectCard` link-list component tests, and the rendered
  second card on `ProjectOverviewPage`.
- [myStandby - New Marketing Images](MS-14-mystandby-new-images.md) —
  puts the three new myStandby photos (Desk, Bedroom, Kitchen) in front of
  the existing screenshots of the myStandby card, as `sips`-generated
  320–1920px JPEG variants (quality 80) with committed originals and de/en
  alt texts. It reads "scaled to different aspect ratios" as responsive width
  variants, not crops, and fixes `sizesFor` for galleries of 5 or more images,
  which always scroll on desktop.
- [Tests for myStandby - New Marketing Images](MS-14-tests.md) — records
  the data tests for the new myStandby image order (Desk, Bedroom, Kitchen,
  then the old screenshots), the committed originals and their variants, the
  de/en alt texts, the rendered first card on `ProjectOverviewPage`, and the
  `ProjectCard` `sizes` value for galleries of 4, 5 and 6 images.
- [Update Profile](MS-15-update-profile.md) — removes the Xing link and
  `IconXing.vue`, adds Facebook, Instagram (new Simple Icons-based icon SFCs)
  and a `tel:` chip to the About page, replaces the old phone number with
  +49 (0) 162 4337334 (`tel:+491624337334`) everywhere, and confirms that all
  mail references already use `info@michaelschreiber.net`.
- [Tests for Update Profile](MS-15-tests.md) — records the `AboutPage`
  coverage for the removed Xing link, the new phone, Facebook and Instagram
  chips (href, `target`/`rel`, de/en labels) and their order, the icon render
  contract for `IconPhone`, `IconFacebook` and `IconInstagram` (plus a
  single-path, no-stroke check) and the removal of `IconXing`, and the new
  phone number on the Contact, Impressum and Datenschutz pages.
- [Animated SVG Logo Instead of GIF](MS-17-animated-svg-logo.md) — replaces
  the 160 KB `logo_anim.gif` on the landing page with a new inline
  `AnimatedLogo.vue` SVG (`role="img"`, `landing.logoAlt`, `currentColor`).
  The wordmark is outlined paths from the design input. CSS draws the nine
  traces with `pathLength="1"` and `stroke-dashoffset` as a tree from the
  root dot. As in the GIF, a circle rides every trace tip (`translate`
  keyframes): six of them become the end dots, and three head circles vanish.
  A mask cuts the ring holes out of the traces, so lines dock cleanly onto the
  rings. After the circuit, a blinking block cursor follows the 20 glyphs,
  typed in a hand-set rhythm with word pauses (5.0–9.18 s), and is gone at
  10.68 s. `prefers-reduced-motion` sets `animation: none` on an end-state
  base style. The GIF is deleted.
- [Tests for Animated SVG Logo Instead of GIF](MS-17-tests.md) — records the
  `AnimatedLogo` coverage: de/en `aria-label`, outlined wordmark without
  `<text>`, `currentColor` paint, and trace timing per the concept tables.
  It covers the travelling dot and head circles: each uses its trace's
  timing, and its `logo-move-*` keyframes lie on the trace vertices at the
  trace tip's time. The round 3 merge is covered as well: the P4 head and the
  D5 circle meet at the junction J at 1.487 s and continue together to D5. The
  round 2 hole mask is covered too: one hole per ring with the same centre
  and animation, and only the traces masked. The joint geometry checks that
  ring centres lie on their trace axis and that trace ends are 5.976–13.69
  from the centre. It also covers the D4 typing rhythm and the blinking
  cursor in sync with it, ending at 10.68 s. Geometry is compared to
  `logo-outlined.svg`. The raw-source CSS contract includes
  `prefers-reduced-motion` as the last rule block and a `steps(1, start)`
  regression guard for the glyph and dot reveals. It also records the
  `LandingPage` integration without the GIF and the browser checks for the
  joints and playback.

- [Consistent Routing — English Route Paths](MS-16-consistent-routing.md) —
  moves `/impressum` and `/datenschutz` to `/imprint` and `/privacy`. Route
  names and `pageMetadata` keys follow the paths; the old paths stay as
  Vue Router redirects so bookmarks keep working. Component file names, the
  German footer labels and page content are unchanged.
- [Tests for Consistent Routing — English Route Paths](MS-16-tests.md) —
  records the router coverage: only English page paths, name, SEO metadata
  and component of `/imprint` and `/privacy`, and the `/impressum` and
  `/datenschutz` redirects with the new title and canonical URL. It also
  covers the footer link targets in `App.spec.ts`.

## Reviews

<!-- New entries will be added here by the Reviewer Agent -->
<!-- Format: * [Review for Ticket Title](story-id-review.md) - Short description of the latest verdict -->
* [Review for Improve AI Setup](msnet-wf-0002-ai-review-gate-review.md) -
  Round 1: positive — symlinks, the `ai-review` phase enum, SKILL.md step
  renumbering/cross-references, and all index/handbook/CLAUDE.md wiring
  verified correct; one non-blocking wording note left for a future touch of
  `SKILL.md`.
* [Review for Minor Changes](minor-changes-review.md) -
  Round 2: positive — Round 1's five ACs (LinkedIn link, GitHub link,
  consistent `info@michaelschreiber.net` email, circular photo avatar, flat
  SVG icons) and Round 2's clickable `tel:`/`mailto:` links in Impressum,
  Kontakt, and Profil (including the verified `tel:+4915679724718` trunk-
  prefix math and the `DataProtectionPage.vue` drive-by cleanup) all verified
  in code and tests; unit tests, lint, and build all pass.
* [Review for Styling Improvements](styling-improvements-review.md) -
  Round 1: positive — the `.content h1` and `.section`/`.section > *`/
  `.section::before` rules added to `ImpressumPage.vue` and
  `DataProtectionPage.vue` verified byte-for-byte against the
  `ContactPage.vue`/`ProjectOverviewPage.vue` header recipe and
  `AboutPage.vue`'s `.about-page__card` recipe; diff confined to the two
  `<style scoped>` blocks with no template/script fallout; the no-new-tests
  judgment call for this CSS-only change is sound; unit tests (70/70), lint,
  and build all pass. One non-blocking note: this "Current Concepts" entry
  is missing its usual paired "Tests for ..." bullet linking
  `styling-improvements-tests.md`, unlike every other ticket in this index.
* [Review for Scaling but on mobile phones (project page)](mobile-project-screenshot-carousel-review.md) -
  Round 2: positive. Round 1's title-overflow finding is fixed with
  `overflow-wrap: anywhere` on `.project-card h2` and a source-level test. In
  headless Chrome at 280-1024px the title wraps inside the card, and the
  project card causes no page overflow. Lint, unit tests (106/106), and build
  pass. Non-blocking note: a pre-existing 1px overflow below 301px comes from
  the navigation hamburger, which is out of scope for this ticket.
* [Review for myStandby - LandingPage Project Entry](MS-1-review.md) -
  Round 3: positive. The concept entry in this index now says "a short
  de/en description". Nothing else changed since round 2. Unit tests
  (259/259), lint and build pass. Round 2: findings. The user-requested
  description was correct in the locales, tests, concept D4 and log, but this
  index still called it "AI-written". Round 1: positive. The second project card
  (id 3), the `link` → `links: ProjectLink[]` migration, the de/en texts,
  and the 12 `sips` width variants matched the concept.
* [Review for myStandby - New Marketing Images](MS-14-review.md) -
  Round 1: positive. The myStandby card lists Desk, Bedroom and Kitchen
  first and the old screenshots behind them, the 21 new files are byte copies
  of the Jira attachments plus `sips` variants matching the D3 table,
  `sizesFor` returns the short hint for 5 or more images, and the de/en alt
  texts match D6. Unit tests (329/329), lint and build pass. Non-blocking
  note: the user should confirm the D3 reading of AC-5 (width variants, not
  crops).
* [Review for Update Profile](MS-15-review.md) - Round 1: positive. Xing
  (link, key, `IconXing.vue`) is removed. The Facebook, Instagram and `tel:`
  chips match the hrefs, `target`/`rel`, labels and order in the concept. The
  new number `+49 (0) 162 4337334` replaces the old one in all four places,
  and every mail reference uses `info@michaelschreiber.net`. Unit tests
  (353/353), lint and build pass.
* [Review for Animated SVG Logo Instead of GIF](MS-17-review.md) - Round 4:
  positive. This round covers the user review round 3 request: the P4 and
  D5 circles reach the bottom-right junction J together at 1.487 s, merge,
  and run on as one ring to D5. The P4 head hides under D5 at 2.00 s
  without a visible pop. Every keyframe stop matches an independent
  tip-timing recomputation. In a real-time Chrome screencast from page load,
  no frame shows a line inside a ring hole, and the end state and reduced
  motion are clean. Unit tests (631/631), lint and build pass. Non-blocking:
  the manual Safari and Firefox check of the animated mask is still the gate,
  and `docs/design/MS-17/` must be committed. Rounds 1–3: positive.
* [Review for Consistent Routing](MS-16-review.md) - Round 1: positive.
  `/imprint` and `/privacy` replace `/impressum` and `/datenschutz`. Route
  names and `pageMetadata` keys follow the new paths. The old paths are
  unnamed redirects, and the canonical URL uses the new path. The footer
  links are updated and the German labels and component files are
  unchanged. No old route name or key is left in `app/`. Unit tests
  (647/647), lint and build pass.

When a feature requires a durable architecture decision, add a concise
Markdown concept document here, list it in this section, and record the
decision in [log.md](log.md).
