/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 5173, strictPort: true },
  // Demo no GitHub Pages: o build de publicação define BASE_PATH=/rendra-design-system/.
  base: process.env.BASE_PATH ?? '/',
  // Testes unitários (Vitest). Os testes de layout (Playwright) ficam em tests/.
  test: { include: ['src/**/*.test.{ts,tsx}'], environment: 'node' },
})
