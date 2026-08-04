---
type: Test Concept
title: Tests for Animated Landing-Page Logo
description: Verifies the landing-page integration and durable SVG animation markers.
tags: [animated-logo, tests]
timestamp: 2026-07-27T13:45:47+02:00
---

## Requirements Authority

Trello card: https://trello.com/c/OucC1ujv/7-animated-logo

The Trello card description is canonical for requirements and acceptance
criteria.

## Scope

Component tests verify that the logo is rendered above the landing-page heading
with localized alternative text. Asset tests verify that the SVG contains the
network drawing, stationary root, six moving child nodes, character-by-character
wordmark, and reduced-motion behavior.

## Test Cases

| Module | Test Case | Level | Status |
|---|---|---|---|
| LandingPage | Renders the logo above the welcome heading | Component | Implemented |
| logo_anim.gif | Defines the drawing, child-node movement, and character typing sequence | Unit | Implemented |
| logo_anim.gif | Defines the reduced-motion alternative | Unit | Implemented |

## Untested Areas

jsdom does not execute SVG animation, so timing and visual alignment of the
moving node with the source paths require a manual browser check.
