import { expect, test } from '@playwright/test'
import { publicRoutes } from '../src/config/routes-list'
import { openRoute, routeName, templates, useTheme } from './helpers'

/*
 * REGRESSÃO VISUAL: compara cada tela com a referência aprovada em
 * tests/__screenshots__/linux/. Pega o que o teste de layout não vê: cor que mudou,
 * espaçamento que quebrou, ícone que sumiu.
 *
 * A renderização de fonte muda entre sistemas operacionais, por isso as referências são
 * geradas e comparadas no Linux (CI do GitHub). Para atualizar depois de uma mudança
 * visual intencional, aplique o rótulo "atualizar-visual" no Pull Request (ou, localmente
 * no Linux, rode npm run test:visual:update).
 */

const widths = [360, 1280]
const runs = [
  ...templates.map((brand) => ({ brand, mode: 'light' as const })),
  { brand: 'safira', mode: 'dark' as const },
]

// Data fixa: telas com "hoje" ou contagem regressiva ficam sempre iguais.
const NOW = new Date('2026-09-23T10:00:00-03:00')

for (const run of runs) {
  for (const width of widths) {
    test.describe(`${run.brand} ${run.mode === 'dark' ? 'escuro ' : ''}@ ${width}px`, () => {
      test.use({ viewport: { width, height: 800 } })
      test.beforeEach(async ({ page }) => {
        await page.clock.setFixedTime(NOW)
        await useTheme(page, run)
      })

      for (const route of publicRoutes) {
        test(`${route}`, async ({ page }) => {
          await openRoute(page, route)
          await expect(page).toHaveScreenshot(
            `${run.brand}${run.mode === 'dark' ? '-escuro' : ''}-${routeName(route)}-${width}.png`,
            { animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.01 },
          )
        })
      }
    })
  }
}
