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
// Os 6 tipos de menu (códigos M1 a M6 de src/config/presets.ts), com o submenu aberto
const menus = [
  {
    code: 'm1',
    layout: { navigation: 'sidebar', sidebar: 'collapsed', expandOnHover: true, submenu: 'panel' },
  },
  {
    code: 'm2',
    layout: { navigation: 'sidebar', sidebar: 'collapsed', expandOnHover: true, submenu: 'inline' },
    hover: true,
  },
  { code: 'm3', layout: { navigation: 'sidebar', sidebar: 'expanded', submenu: 'panel' } },
  { code: 'm4', layout: { navigation: 'sidebar', sidebar: 'expanded', submenu: 'inline' } },
  { code: 'm5', layout: { navigation: 'topbar', topbarSubmenu: 'dropdown' }, top: true },
  { code: 'm6', layout: { navigation: 'topbar', topbarSubmenu: 'mega' }, top: true },
]
for (const m of menus) {
  await shot(browser, {
    name: `menu-${m.code}`,
    route: '/',
    brand: 'safira',
    layout: m.layout,
    act: async (p) => {
      try {
        if (m.top) return await p.getByRole('button', { name: 'Operação' }).first().click()
        if (m.hover) await p.locator('aside').first().hover()
        await p
          .getByRole('button', { name: /Cadastros/ })
          .first()
          .click({ timeout: 3000 })
      } catch {
        // sem submenu para abrir: fica a navegação como está
      }
    },
  })
}

// Atendimento, painel em modo de ajuste, calendário, agenda e kanban
await shot(browser, {
  name: 'safira-atendimento',
  route: '/atendimento',
  brand: 'safira',
  width: 1440,
  height: 900,
  act: async (p) => {
    await p.getByRole('button', { name: /Clínica Vida Plena/ }).click()
  },
})
await shot(browser, {
  name: 'aurora-atendimento-mobile',
  route: '/atendimento',
  brand: 'aurora',
  width: 390,
  height: 844,
  act: async (p) => {
    await p.getByRole('button', { name: /Clínica Vida Plena/ }).click()
  },
})
await shot(browser, {
  name: 'safira-dashboard-ajuste',
  route: '/',
  brand: 'safira',
  act: (p) => p.getByRole('button', { name: 'Ajustar dashboard' }).click(),
})

await shot(browser, { name: 'safira-calendario', route: '/agenda', brand: 'safira' })
await shot(browser, {
  name: 'equilibrio-agenda',
  route: '/agenda',
  brand: 'equilibrio',
  act: (p) => p.getByRole('radio', { name: 'Semana', exact: true }).click(),
})
await shot(browser, { name: 'aurora-kanban', route: '/kanban', brand: 'aurora' })
await shot(browser, {
  name: 'safira-kanban-mobile',
  route: '/kanban',
  brand: 'safira',
  width: 390,
  height: 844,
})
await browser.close()
