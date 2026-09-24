#!/usr/bin/env node
/*
 * Capturas para revisão visual: node scripts/screenshots.mjs [rota...]
 * Requer o servidor rodando (npm run dev). Gera screenshots/<marca>-<modo>/<rota>-<largura>.png
 */
import { mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const routes = process.argv.slice(2).length ? process.argv.slice(2) : ['/tokens']
const widths = (process.env.WIDTHS ?? '360,1280').split(',').map(Number)
const brands = (process.env.BRANDS ?? 'safira,equilibrio,aurora').split(',')
const modes = (process.env.MODES ?? 'light,dark').split(',')

const browser = await chromium.launch()
for (const brand of brands) {
  for (const mode of modes) {
    const dir = `screenshots/${brand}-${mode}`
    mkdirSync(dir, { recursive: true })
    for (const width of widths) {
      const ctx = await browser.newContext({
        viewport: { width, height: 800 },
        deviceScaleFactor: 1,
      })
      await ctx.addInitScript(
        ([b, m]) => {
          localStorage.setItem('ui-brand', b)
          localStorage.setItem('ui-mode', m)
        },
        [brand, mode],
      )
      for (const route of routes) {
        // Página nova por rota: a janela ampliada de uma rota não vaza para a próxima.
        const page = await ctx.newPage()
        await page.goto(BASE + route, { waitUntil: 'networkidle' })
        await page.evaluate(() => document.fonts.ready)
        await page.waitForTimeout(700)
        // O AppShell rola só no <main>: aumenta a janela até caber todo o conteúdo.
        const extra = await page.evaluate(() => {
          const m = document.querySelector('main#conteudo')
          return m ? m.scrollHeight - m.clientHeight : 0
        })
        if (extra > 0) await page.setViewportSize({ width, height: 800 + extra })
        const name = route.replace(/^\//, '').replace(/\//g, '_') || 'home'
        await page.screenshot({ path: `${dir}/${name}-${width}.png`, fullPage: true })
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        )
        console.log(
          `${brand}/${mode} ${route} @${width}px  rolagem horizontal: ${overflow > 0 ? overflow + 'px' : 'nenhuma'}`,
        )
        await page.close()
      }
      await ctx.close()
    }
  }
}
await browser.close()
