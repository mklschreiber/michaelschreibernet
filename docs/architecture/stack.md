---
type: Architecture Reference
title: Technology Stack and Tooling
description: Verified baseline for the Vue 3, TypeScript, and Vite web application in app/.
tags: [stack, vue, typescript, vite, web]
timestamp: 2026-07-26T18:31:40+02:00
status: current
---

## Application

- The web application lives in `app/`.
- **Vue 3** is used with Vue single-file components, the Composition API, and
  **TypeScript**.
- **Vite** provides development and production builds.
- The Vite alias `@` resolves to `app/src`.
- Vite's base URL is `VITE_BASE_URL` when set, otherwise `/`. Tags beginning
  with `md-` are configured as custom elements.

## Client Libraries

- **Vue Router** for routing.
- **Pinia** is installed for application state.
- **Vue I18n** for internationalization.
- **@material/web** for Material web components.

No backend, server-side rendering, end-to-end test setup, or additional data
layer is documented by this baseline.

## Source Layout

Within `app/src`, the repository documents:

- `assets/styles` for CSS variables (`variables.css`, the MS-20 design tokens), the
  self-hosted font declaration (`fonts.css`) and global styles and shared design classes
  (`base.css`: `.section`, `.section__inner`, `.section__title`, `.section__subtitle`,
  `.card`, focus ring, reduced motion);
- `assets/fonts` for the self-hosted **Inter** variable font (Latin subset, SIL OFL, licence
  in `app/public/fonts/Inter-OFL.txt`, shipped with the deployed site); no Google Fonts request and no font npm package;
- `components` for Vue components (`components/sections` for the onepage sections);
- `views` for page components;
- `i18n` for internationalization;
- `data` for JSON data files;
- `types` for TypeScript interfaces; and
- `__tests__` for unit tests.

## Build, Test, and Lint

Run commands from `app/`:

| Command | Configured action |
|---|---|
| `npm run build` | Runs `vue-tsc --build` and `vite build`. |
| `npm run test:unit` | Runs Vitest. |
| `npm run lint` | Runs ESLint with `--fix` and a cache. |

Vitest uses the `jsdom` environment and excludes `e2e/**`. ESLint uses Vue's
essential rules, the recommended Vue TypeScript configuration, and the
recommended Vitest configuration for `src/**/__tests__/*`; generated build and
coverage directories are ignored.

## Deployment

GitHub Pages deployment is defined in `.github/workflows/deploy.yml`. On pushes
to `main` (and on manual dispatch), the workflow runs from `app/`, uses Node
24, installs with `npm ci`, builds with `npm run build`, and deploys
`app/dist`. The deployment workflow supplies `VITE_BASE_URL=/`. The CI
workflow (`.github/workflows/ci.yml`) uses the same Node version. All actions
are on their Node 24 majors (`checkout@v7`, `setup-node@v7`,
`configure-pages@v6`, `upload-pages-artifact@v5`, `deploy-pages@v5`).
