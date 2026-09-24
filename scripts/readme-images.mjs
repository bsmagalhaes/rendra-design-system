#!/usr/bin/env node
/*
 * Gera as imagens do README em docs/images: npm run docs:images
 * Requer o app rodando (npm run dev). Todas as capturas usam o conteúdo real das rotas.
 */
import { mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = 'docs/images'
mkdirSync(OUT, { recursive: true })

const templates = ['safira', 'equilibrio', 'aurora']
const palettes = [...templates, 'ardosia']

async function shot(
  browser,
  {
    name,
    route,
    brand,
    palette = brand,
    mode = 'light',
    width = 1280,
    height = 800,
    layout = {},
    act,
  },
) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: width < 768 ? 2 : 1,
  })
  await ctx.addInitScript(
    ([b, p, m, l]) => {
      localStorage.setItem('ui-brand', b)
      localStorage.setItem('ui-palette', p)
      localStorage.setItem('ui-mode', m)
      localStorage.setItem('ui-shell-layout', JSON.stringify(l))
    },
    [brand, palette, mode, layout],
  )
  const page = await ctx.newPage()
  await page.goto(BASE + route, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  if (act) await act(page)
  await page.waitForTimeout(1800) // gráficos e ícones animados terminam
  await page.screenshot({ path: `${OUT}/${name}.png` })
  await ctx.close()
  console.log('ok', name)
}

const browser = await chromium.launch()

// Duas páginas de cada template, com as cores do próprio modelo
for (const t of templates) {
  await shot(browser, {
    name: `${t}-painel`,
    route: '/',
    brand: t,
    layout: { sidebar: 'expanded' },
  })
  await shot(browser, { name: `${t}-clientes`, route: '/clientes', brand: t })
  await shot(browser, { name: `${t}-mobile`, route: '/', brand: t, width: 390, height: 844 })
}

// Matriz: cada modelo com cada paleta (formato do modelo, cores da paleta)
for (const model of templates) {
  for (const palette of palettes) {
    await shot(browser, {
      name: `matriz-${model}-${palette}`,
      route: '/clientes/1000',
      brand: model,
      palette,
    })
  }
}

// Paleta avulsa Ardósia (modelo Equilíbrio): duas páginas
await shot(browser, {
  name: 'ardosia-painel',
  route: '/',
  brand: 'equilibrio',
  palette: 'ardosia',
  layout: { sidebar: 'expanded' },
})
await shot(browser, {
  name: 'ardosia-clientes',
  route: '/clientes',
  brand: 'equilibrio',
  palette: 'ardosia',
})

// Extras: modo escuro, login, drawer e vitrine
await shot(browser, {
  name: 'safira-escuro',
  route: '/',
  brand: 'safira',
  mode: 'dark',
  layout: { sidebar: 'expanded' },
})
await shot(browser, {
  name: 'equilibrio-escuro',
  route: '/clientes',
  brand: 'equilibrio',
  mode: 'dark',
})
await shot(browser, { name: 'aurora-login', route: '/login', brand: 'aurora' })
await shot(browser, {
  name: 'safira-drawer',
  route: '/clientes',
  brand: 'safira',
  act: (p) => p.getByRole('button', { name: 'Novo cliente' }).first().click(),
})
await shot(browser, {
  name: 'aurora-mega-menu',
  route: '/clientes',
  brand: 'aurora',
  layout: { navigation: 'topbar', topbarSubmenu: 'mega' },
  act: (p) => p.getByRole('button', { name: 'Operação' }).click(),
})
await shot(browser, {
  name: 'equilibrio-mobile-tabela',
  route: '/clientes',
  brand: 'equilibrio',
  width: 390,
  height: 844,
})
await browser.close()
