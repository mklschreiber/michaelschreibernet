---
type: Architecture Concept
title: Animated Landing-Page Logo
description: One-time SVG drawing sequence for the user-supplied logo on the landing page.
tags: [animated-logo, svg, landing-page]
timestamp: 2026-07-27T13:45:47+02:00
status: current
---

## Requirements Authority

Trello card: https://trello.com/c/OucC1ujv/7-animated-logo

The Trello card is canonical for requirements and acceptance criteria.

## Decision

Keep the supplied `app/public/logo_anim.gif` as the single logo asset and make the
animation self-contained in that SVG. CSS draws the existing connection paths
once while the existing root node nearest the `s` in the wordmark remains
stationary. Each visible route has a normalized SVG path that drives both its
line drawing and its corresponding child-node motion, keeping their progress
synchronized. The six existing child nodes begin over the root and travel these
routes to their final positions. The wordmark then appears one character at a
time beside a moving cursor, retaining the original font weights and layout.

`LandingPage.vue` renders the asset with an `<img>` immediately before the
existing `h1`. This retains the public-asset delivery path and avoids a
component-specific duplicate of the logo geometry.

## Accessibility and Motion

The image has descriptive alternative text. `prefers-reduced-motion` disables
the drawing and cursor effects while leaving the complete logo visible.

## Testing

Vitest verifies the landing-page placement and the SVG's animation markers.
Visual timing and path alignment require a manual browser check because jsdom
does not execute SVG animation.
