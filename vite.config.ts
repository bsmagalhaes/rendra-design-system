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
  test: {
    // scripts/lib cobre a lógica compartilhada com scripts/check-design-rules.mjs (regra
    // variavel-sem-prefixo-rendra), que precisa de teste próprio (etapa 2.0.0-alpha.2).
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.{ts,tsx}'],
    // Funções puras no Node; testes de componente pedem jsdom na primeira linha do arquivo.
    environment: 'node',
    setupFiles: ['src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'src/lib/**',
        'src/brand/palette.ts',
        'src/hooks/**',
        'src/components/ui/**',
        'scripts/lib/**',
      ],
      exclude: ['**/*.test.{ts,tsx}'],
      reporter: ['text-summary', 'html'],
      // Piso por arquivo (linhas): a cobertura de quem já tem teste não pode cair. Componente
      // novo ou alterado entra com o próprio teste (ao lado dele) e ganha uma linha aqui.
      thresholds: {
        'src/lib/{masks,lookup,validators}.ts': { lines: 85 },
        'src/brand/palette.ts': { lines: 90 },
        'src/hooks/use-lookup.ts': { lines: 90 },
        'scripts/lib/var-prefix.ts': { lines: 90 },
        'src/components/ui/{input,select,modal,alert,accordion,checkbox,field,radio-group,switch,tabs,textarea}.tsx':
          { lines: 85 },
        'src/components/ui/{table,drawer,button}.tsx': { lines: 75 },
        'src/components/ui/{pagination,otp-input,upload}.tsx': { lines: 60 },
      },
    },
  },
})
