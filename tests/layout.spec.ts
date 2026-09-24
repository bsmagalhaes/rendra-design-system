import { mkdirSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'
import { publicRoutes } from '../src/config/routes-list'

/*
 * TESTE DE LAYOUT: toda rota, em toda largura, em todo template.
 * Falha se:
 *   1. a página tiver rolagem horizontal (scrollWidth > clientWidth);
 *   2. algum elemento ultrapassar a largura da tela (exceto tabela larga no desktop,
 *      que rola dentro do próprio contêiner, marcado com data-allow-overflow);
 *   3. no mobile, algum elemento clicável tiver área de toque menor que 44x44px.
 * Gera capturas em screenshots/<template>/<rota>-<largura>.png para revisão visual.
 */

const widths = [360, 390, 768, 1280, 1920]
const templates = (process.env.TEMPLATES ?? 'safira,equilibrio,aurora').split(',')
const MOBILE = 768

async function audit(page: Page, mobile: boolean) {
  return page.evaluate((mobile) => {
    const vw = document.documentElement.clientWidth
    const wide: string[] = []
    const small: string[] = []
    const describe = (el: Element) =>
      `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''} "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 40)}"`
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el)
      if (cs.display === 'none' || cs.visibility === 'hidden') continue
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      if (r.right > vw + 1 && !el.closest('[data-allow-overflow]')) wide.push(describe(el))
      const clickable = el.matches(
        'a[href], button, [role="button"], input, select, textarea, [role="radio"], [role="tab"], [role="combobox"]',
      )
      if (
        mobile &&
        clickable &&
        !el.closest('.sr-only') &&
        el.getAttribute('aria-hidden') !== 'true' &&
        cs.pointerEvents !== 'none'
      ) {
        // Área de toque real: rótulo que envolve, moldura do campo ou área ampliada.
        const target = el.closest('label') ?? el.closest('[data-slot="control"]') ?? el
        let t: { width: number; height: number } = target.getBoundingClientRect()
        if (el.getAttribute('data-touch') === 'expanded')
          t = { width: t.width + 24, height: t.height + 24 }
        if (t.width < 43.5 || t.height < 43.5)
          small.push(`${describe(el)} ${Math.round(t.width)}x${Math.round(t.height)}`)
      }
    }
    return {
      scroll: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      wide: [...new Set(wide)].slice(0, 10),
      small: [...new Set(small)].slice(0, 10),
    }
  }, mobile)
}

for (const template of templates) {
  for (const width of widths) {
    test.describe(`${template} @ ${width}px`, () => {
      test.use({ viewport: { width, height: 800 } })
      test.beforeEach(async ({ page }) => {
        await page.addInitScript((t) => {
          localStorage.setItem('ui-brand', t)
          localStorage.setItem('ui-mode', 'light')
          localStorage.removeItem('ui-palette')
          localStorage.removeItem('ui-shell-layout')
        }, template)
      })

      for (const route of publicRoutes) {
        test(`${route}`, async ({ page }) => {
          const errors: string[] = []
          page.on('pageerror', (e) => errors.push(e.message))
          await page.goto(route, { waitUntil: 'networkidle' })
          await page.evaluate(() => document.fonts.ready)
          await page.waitForTimeout(300)

          const res = await audit(page, width < MOBILE)
          expect.soft(errors, 'erros de JavaScript na página').toEqual([])
          expect.soft(res.scroll, 'rolagem horizontal na página').toBeLessThanOrEqual(0)
          expect.soft(res.wide, 'elementos maiores que a tela').toEqual([])
          if (width < MOBILE) expect.soft(res.small, 'alvos de toque menores que 44px').toEqual([])

          // Captura para revisão: o AppShell rola só no <main>, então a janela cresce até caber.
          const extra = await page.evaluate(() => {
            const m = document.querySelector('main#conteudo')
            return m ? m.scrollHeight - m.clientHeight : 0
          })
          if (extra > 0) await page.setViewportSize({ width, height: Math.min(800 + extra, 16000) })
          const dir = `screenshots/${template}`
          mkdirSync(dir, { recursive: true })
          const name = route === '/' ? 'painel' : route.slice(1).replace(/\//g, '_')
          await page.screenshot({ path: `${dir}/${name}-${width}.png`, fullPage: true })
        })
      }
    })
  }
}
