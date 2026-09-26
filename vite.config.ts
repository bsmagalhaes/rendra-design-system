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
        'src/brand/theme.ts',
        'src/brand/apply-theme.ts',
        'src/brand/brand-provider.tsx',
        'src/hooks/**',
        'src/components/ui/**',
        'src/components/rendra-provider.tsx',
        'src/components/rendra-router-bridge.tsx',
        'src/components/app-shell/**',
        'scripts/lib/**',
        'src/catalog/**',
        'src/cli/**',
      ],
      exclude: ['**/*.test.{ts,tsx}'],
      reporter: ['text-summary', 'html'],
      // Piso por arquivo (linhas): a cobertura de quem já tem teste não pode cair. Componente
      // novo ou alterado entra com o próprio teste (ao lado dele) e ganha uma linha aqui.
      thresholds: {
        'src/lib/{masks,lookup,validators}.ts': { lines: 85 },
        'src/brand/palette.ts': { lines: 90 },
        'src/brand/theme.ts': { lines: 90 },
        'src/brand/apply-theme.ts': { lines: 90 },
        'src/brand/brand-provider.tsx': { lines: 95 },
        'src/hooks/use-lookup.ts': { lines: 90 },
        'src/hooks/use-reduced-motion.ts': { lines: 90 },
        'scripts/lib/var-prefix.ts': { lines: 90 },
        'src/catalog/components.ts': { lines: 90 },
        'src/components/rendra-provider.tsx': { lines: 90 },
        'src/components/rendra-router-bridge.tsx': { lines: 90 },
        'src/components/app-shell/navigation-utils.ts': { lines: 95 },
        'src/components/app-shell/{shell-context,layout}.ts': { lines: 90 },
        'src/components/app-shell/app-shell.tsx': { lines: 65 },
        'src/components/app-shell/command-search.tsx': { lines: 85 },
        'src/components/app-shell/notifications.tsx': { lines: 55 },
        'src/components/app-shell/sidebar.tsx': { lines: 60 },
        'src/components/app-shell/header.tsx': { lines: 60 },
        'src/components/app-shell/mega-menu.tsx': { lines: 60 },
        'scripts/lib/help-length.ts': { lines: 95 },
        'src/components/ui/rendra-credit.tsx': { lines: 90 },
        'src/components/ui/color-picker.tsx': { lines: 85 },
        'src/components/ui/spinner.tsx': { lines: 90 },
        'src/components/ui/{input,select,modal,alert,accordion,checkbox,field,radio-group,switch,tabs,textarea}.tsx':
          { lines: 85 },
        'src/components/ui/{table,drawer,button}.tsx': { lines: 75 },
        'src/components/ui/{pagination,otp-input}.tsx': { lines: 60 },
        'src/lib/sortable.ts': { lines: 95 },
        'src/components/ui/{list,timeline}.tsx': { lines: 95 },
        'src/components/ui/upload.tsx': { lines: 80 },
        'src/components/ui/image-cropper.tsx': { lines: 80 },
        'src/components/ui/kanban.tsx': { lines: 70 },
        'src/components/ui/{progress,image-viewer}.tsx': { lines: 85 },
        'src/lib/qr-encode.ts': { lines: 90 },
        'src/components/ui/{qr-code,rating,repeatable-field,checklist}.tsx': { lines: 85 },
        'src/components/ui/document-viewer.tsx': { lines: 60 },
        'src/cli/codigos.ts': { lines: 95 },
        'src/cli/auditar.ts': { lines: 90 },
        'src/cli/trocar.ts': { lines: 85 },
        'src/cli/typescript-loader.ts': { lines: 80 },
        'scripts/lib/robots.ts': { lines: 100 },
      },
    },
  },
})
