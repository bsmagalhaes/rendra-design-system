#!/usr/bin/env node
/*
 * Gera a og-image do site (1200x630) sem servidor e sem regravar as capturas do README:
 *   npm run docs:og-image
 * Lê docs/images/safira-painel.png, monta a página com scripts/lib/og-html.ts, renderiza no
 * Chromium do Playwright e grava docs/og-image.png (página de apresentação) e public/og-image.png
 * (imagem social de toda página da demo). `npm run docs:images` continua sendo só das capturas.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
import { siteSeo } from '../src/config/seo.ts'
import { buildOgHtml } from './lib/og-html.ts'

// Selo oficial da família (padrão dos produtos, seção 2.8). Só o repositório do Rendra o leva:
// quem clona o projeto gera a própria og-image sem a marca (clone: ver docs/COMO_APLICAR.md).
const SELO_RENDRA =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44" aria-hidden="true"><rect width="44" height="44" rx="10" fill="#1c1c1c" stroke="#2c2c2c"/><path d="M15 31V13h9.2a5.6 5.6 0 0 1 1.6 11L31 31" fill="none" stroke="#e8650a" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const REPOSITORIO_RENDRA = 'https://github.com/bsmagalhaes/rendra-ui-web'

const html = buildOgHtml({
  produto: siteSeo.name,
  tagline: siteSeo.tagline,
  imagem: readFileSync('docs/images/safira-painel.png'),
  selo: siteSeo.repository === REPOSITORIO_RENDRA ? SELO_RENDRA : undefined,
})

const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  await page.setContent(html, { waitUntil: 'load' })
  const png = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1200, height: 630 } })
  writeFileSync('docs/og-image.png', png)
  writeFileSync('public/og-image.png', png)
  console.log(`og-image: OK (1200x630, ${png.length} bytes) em docs/ e public/`)
} finally {
  await browser.close()
}
