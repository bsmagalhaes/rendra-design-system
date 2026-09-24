import { mkdirSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { publicRoutes } from '../src/config/routes-list'
import {
  auditLayout,
  fitViewportToContent,
  MOBILE,
  openRoute,
  routeName,
  templates,
  useTheme,
} from './helpers'

/*
 * TESTE DE LAYOUT: toda rota, em toda largura, em todo modelo, no modo claro e no escuro.
 * Falha se houver rolagem horizontal, elemento maior que a tela, alvo de toque menor que
 * 44px no mobile ou erro de JavaScript (detalhes em tests/helpers.ts).
 * O modo escuro roda em 360px e 1280px: o layout é o mesmo, muda só a cor.
 * Gera capturas em screenshots/<modelo>[-escuro]/<rota>-<largura>.png para revisão visual.
 */

const runs = [
  { mode: 'light' as const, widths: [360, 390, 768, 1280, 1920] },
  { mode: 'dark' as const, widths: [360, 1280] },
]

for (const template of templates) {
  for (const { mode, widths } of runs) {
    for (const width of widths) {
      test.describe(`${template} ${mode === 'dark' ? 'escuro ' : ''}@ ${width}px`, () => {
        test.use({ viewport: { width, height: 800 } })
        test.beforeEach(({ page }) => useTheme(page, { brand: template, mode }))

        for (const route of publicRoutes) {
          test(`${route}`, async ({ page }) => {
            const errors = await openRoute(page, route)
            const res = await auditLayout(page, width < MOBILE)
            expect.soft(errors, 'erros de JavaScript na página').toEqual([])
            expect.soft(res.scroll, 'rolagem horizontal na página').toBeLessThanOrEqual(0)
            expect
              .soft(res.pageOverflowY, 'página mais alta que a tela fora do <main>')
              .toBeLessThanOrEqual(0)
            expect.soft(res.wide, 'elementos maiores que a tela').toEqual([])
            if (width < MOBILE)
              expect.soft(res.small, 'alvos de toque menores que 44px').toEqual([])

            await fitViewportToContent(page, width)
            const dir = `screenshots/${template}${mode === 'dark' ? '-escuro' : ''}`
            mkdirSync(dir, { recursive: true })
            await page.screenshot({
              path: `${dir}/${routeName(route)}-${width}.png`,
              fullPage: true,
            })
          })
        }
      })
    }
  }
}
