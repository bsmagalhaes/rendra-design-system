import { mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'

const BASE = 'http://localhost:5173'
const out = 'screenshots/layouts'
mkdirSync(out, { recursive: true })
const b = await chromium.launch()

async function shot(name, { brand = 'safira', layout = {}, width = 1280, act } = {}) {
  const ctx = await b.newContext({ viewport: { width, height: 760 } })
  await ctx.addInitScript(
    ([br, l]) => {
      localStorage.setItem('ui-brand', br)
      localStorage.setItem('ui-mode', 'light')
      localStorage.setItem('ui-shell-layout', JSON.stringify(l))
    },
    [brand, layout],
  )
  const p = await ctx.newPage()
  await p.goto(BASE + '/', { waitUntil: 'networkidle' })
  await p.evaluate(() => document.fonts.ready)
  if (act) await act(p)
  await p.waitForTimeout(500)
  await p.screenshot({ path: `${out}/${name}.png` })
  await ctx.close()
}

// 1. Padrão: recolhida, só ícones
await shot('1-recolhida', {})
// 2. Recolhida + mouse em cima: abre por cima do conteúdo
await shot('2-hover-sobrepoe', { act: (p) => p.hover('aside[aria-label="Menu lateral"] nav') })
// 3. Submenu em segunda barra (clique em Cadastros)
await shot('3-segunda-barra', {
  brand: 'equilibrio',
  layout: { sidebar: 'expanded' },
  act: (p) => p.click('button[aria-controls="submenu-painel"]'),
})
// 4. Submenu dentro da sidebar
await shot('4-submenu-inline', {
  brand: 'aurora',
  layout: { sidebar: 'expanded', submenu: 'inline' },
  act: (p) => p.getByRole('button', { name: 'Cadastros' }).click(),
})
// 5. Menu superior
await shot('5-menu-superior', { brand: 'aurora', layout: { navigation: 'topbar' } })
// 6. Mobile: gaveta aberta
await shot('6-mobile-gaveta', {
  brand: 'equilibrio',
  width: 390,
  act: (p) => p.getByRole('button', { name: 'Abrir menu' }).click(),
})
await b.close()
console.log('ok')
