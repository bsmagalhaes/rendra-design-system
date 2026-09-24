/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import svgr from 'vite-plugin-svgr'

// Endereço público do demo, usado no canonical, no Open Graph e no JSON-LD do index.html.
const SITE_URL = process.env.SITE_URL ?? 'https://bsmagalhaes.github.io/rendra-design-system/'
const siteUrl = (): Plugin => ({
  name: 'site-url',
  transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', SITE_URL),
})

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr(), siteUrl()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 5173, strictPort: true },
  // Demo no GitHub Pages: o build de publicação define BASE_PATH=/rendra-design-system/.
  base: process.env.BASE_PATH ?? '/',
  // Testes unitários (Vitest). Os testes de layout (Playwright) ficam em tests/.
  test: { include: ['src/**/*.test.{ts,tsx}'], environment: 'node' },
})
