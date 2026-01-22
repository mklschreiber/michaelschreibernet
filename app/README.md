# michaelschreiber.net

Vue.js personal website with automated GitHub Pages deployment.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Preview Production Build

```sh
npm run preview
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Deployment

This project is configured for automatic deployment to GitHub Pages.

- **Trigger**: Every push to `main` branch
- **Workflow**: `.github/workflows/deploy.yml`
- **Build**: Automated via GitHub Actions

For detailed setup instructions, see [GITHUB_PAGES_SETUP.md](./GITHUB_PAGES_SETUP.md)

## Project Structure

- `/src` - Source code
  - `/assets/styles` - CSS variables and global styles
  - `/components` - Vue components
  - `/views` - Page components
  - `/i18n` - Internationalization
  - `/data` - JSON data files
  - `/types` - TypeScript interfaces
- `/.github/workflows` - GitHub Actions workflows
- `/dist` - Build output (auto-generated, not committed)

## Technology Stack

- **Framework**: Vue 3 (Composition API)
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Variables (Design System)
- **i18n**: Vue I18n
- **Router**: Vue Router
- **Testing**: Vitest
- **Deployment**: GitHub Pages (automated)

