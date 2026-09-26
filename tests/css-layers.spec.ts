import { expect, test } from '@playwright/test'
import { openRoute, useTheme } from './helpers'

/*
 * TESTE DE NAVEGADOR: CSS em camadas (C4, docs/specs/v2-plano.md seção 2.4 e etapa
 * 2.0.0-alpha.8). Três provas, contra o app de verdade (não CSS isolado em jsdom):
 *
 *   1. uma classe utilitária do host (camada `utilities`) sempre vence uma regra de
 *      `rendra.components` no mesmo elemento, mesmo que o texto da folha injetada
 *      declare o bloco de `rendra.components` depois do de `utilities` — a ordem que
 *      manda é a já registrada por globals.css (@layer theme, base, rendra.base,
 *      components, rendra.components, utilities;), não a ordem de aparição na folha;
 *   2. conteúdo de um portal do Radix (o painel do Select, montado direto em <body>,
 *      fora de #root) lê as variáveis --rendra-* normalmente, porque elas vêm do
 *      :root (<html>), ancestral comum de #root e do portal;
 *   3. data-rendra-root (escopo do CSS em camadas) e data-rendra="<código>" (catálogo
 *      de componente) convivem no mesmo elemento sem colisão de seletor nem erro.
 */

test.beforeEach(({ page }) => useTheme(page, { brand: 'safira', mode: 'light' }))

test('utility do host vence rendra.components no mesmo elemento (ordem de camada)', async ({
  page,
}) => {
  await openRoute(page, '/componentes')

  await page.addStyleTag({
    content: `
      @layer rendra.components {
        .css-layers-probe { color: rgb(1, 2, 3); background-color: rgb(1, 2, 3); }
      }
      @layer utilities {
        .css-layers-probe { color: rgb(4, 5, 6); }
      }
    `,
  })

  const result = await page.evaluate(() => {
    const el = document.createElement('div')
    el.className = 'css-layers-probe'
    document.body.appendChild(el)
    const cs = getComputedStyle(el)
    const out = { color: cs.color, backgroundColor: cs.backgroundColor }
    el.remove()
    return out
  })

  // utilities venceu a cor (mesma especificidade, camada posterior sempre vence).
  expect(result.color).toBe('rgb(4, 5, 6)')
  // background-color só existe em rendra.components (não sobrescrito): continua vindo dela,
  // provando que utilities não anula a camada inteira, só a propriedade que de fato disputa.
  expect(result.backgroundColor).toBe('rgb(1, 2, 3)')
})

test('conteúdo em portal do Radix (painel do Select) lê as variáveis --rendra-*', async ({
  page,
}) => {
  await openRoute(page, '/componentes')

  const rootPrimary = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--rendra-primary').trim(),
  )
  expect(rootPrimary).toMatch(/^#[0-9a-f]{6}$/)

  // O rótulo visível do campo é "Cidade" (Field), mas o nome acessível do combobox, na
  // vitrine, é o título do exemplo ("Com busca"); localizamos pelo texto do placeholder,
  // que é único nessa seção e não depende de qual rótulo vence a computação de nome acessível.
  const trigger = page.getByRole('combobox').filter({ hasText: 'Escolha a cidade' })
  await trigger.scrollIntoViewIfNeeded()
  await trigger.click()

  const option = page.getByText('São Paulo', { exact: true })
  await expect(option).toBeVisible()

  const check = await option.evaluate((el) => ({
    // Radix monta o painel direto em <body>: fora da árvore de #root.
    insideAppRoot: Boolean(el.closest('#root')),
    primary: getComputedStyle(el).getPropertyValue('--rendra-primary').trim(),
  }))
  expect(check.insideAppRoot).toBe(false)
  expect(check.primary).toBe(rootPrimary)

  await page.keyboard.press('Escape')
})

test('data-rendra-root e data-rendra="<código>" convivem no mesmo elemento', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await openRoute(page, '/componentes')

  const trigger = page.getByRole('combobox').filter({ hasText: 'Escolha a cidade' })
  await trigger.scrollIntoViewIfNeeded()

  const before = await trigger.evaluate((el) => ({
    rendraCode: el.getAttribute('data-rendra'),
    color: getComputedStyle(el).color,
  }))
  expect(before.rendraCode).toBe('SEL-001')

  // Liga o escopo de contêiner (C4) no mesmo elemento que já carrega o código do catálogo.
  const after = await trigger.evaluate((el) => {
    el.setAttribute('data-rendra-root', 'sonda-css-layers')
    return {
      rendraCode: el.getAttribute('data-rendra'),
      rendraRoot: el.getAttribute('data-rendra-root'),
      color: getComputedStyle(el).color,
    }
  })

  expect(after.rendraCode).toBe('SEL-001')
  expect(after.rendraRoot).toBe('sonda-css-layers')
  // Nenhuma colisão de seletor: o elemento continua com a mesma cor de texto de antes.
  expect(after.color).toBe(before.color)
  expect(errors).toEqual([])

  await trigger.evaluate((el) => el.removeAttribute('data-rendra-root'))
})
