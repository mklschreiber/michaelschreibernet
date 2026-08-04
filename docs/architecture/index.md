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
  system, replacing local ticket files.
- [Animated Landing-Page Logo](animated-logo.md) — defines the self-contained
  SVG drawing sequence and landing-page integration.
- [Tests for Animated Landing-Page Logo](animated-logo-tests.md) — records the
  automated coverage and manual visual check for the SVG animation.

When a feature requires a durable architecture decision, add a concise
Markdown concept document here, list it in this section, and record the
decision in [log.md](log.md).
