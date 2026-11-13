import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import type { Plugin, ResolvedConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { renderStaticPage, staticPages } from './src/staticPages'

function staticPagesPlugin(): Plugin {
  let config: ResolvedConfig
  return {
    name: 'msnet-static-pages',
    apply: 'build',
    configResolved(resolved) {
      config = resolved
    },
    closeBundle() {
      const outDir = join(config.root, config.build.outDir)
      const indexHtml = readFileSync(join(outDir, 'index.html'), 'utf8')
      for (const page of staticPages) {
        const dir = join(outDir, page.path)
        const file = join(dir, 'index.html')
        if (existsSync(file)) throw new Error(`static page collides with ${file}`)
        mkdirSync(dir, { recursive: true })
        writeFileSync(file, renderStaticPage(indexHtml, page))
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Base URL for GitHub Pages
  // Use environment variable if set, otherwise default to '/'
  // For custom domain: base: '/'
  // For username.github.io/repo-name: base: '/repo-name/'
  base: process.env.VITE_BASE_URL || '/',
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('md-'),
        },
      },
    }),
    vueDevTools(),
    staticPagesPlugin(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
