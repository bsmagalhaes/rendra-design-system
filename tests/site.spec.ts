import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/*
 * PÁGINA DE APRESENTAÇÃO E COMPOSIÇÃO DO SITE (npm run test:site): serve a árvore de
 * .pages/rendra-ui-web (a mesma que o GitHub Pages publica) e confere a página da raiz, a demo em
 * /demo/, o registry, os stubs das rotas antigas, os sitemaps e o 404 com desvio.
 */

const REPO = 'rendra-ui-web'
const RAIZ = `https://bsmagalhaes.github.io/${REPO}/`
const PREFIXO_DEMO = `/${REPO}/demo/`
const PAGES = join(process.cwd(), '.pages', REPO)

/**
 * Existe como o GitHub Pages resolve? O `serve` responde `x/` com `x.html` e o Pages não (achado
 * B11): confere no disco. Pasta pede `index.html`; arquivo pede o próprio arquivo ou `<rota>.html`.
 */
function existePeloPages(caminho: string): boolean {
  const relativo = caminho.replace(new RegExp(`^${REPO}/?`), '')
  const noDisco = join(PAGES, relativo)
  if (relativo === '' || relativo.endsWith('/')) return existsSync(join(noDisco, 'index.html'))
  return (
    existsSync(`${noDisco}.html`) || existsSync(join(noDisco, 'index.html')) || existsSync(noDisco)
  )
}

/**
 * O Pages responde o `404.html` da raiz do projeto, com status 404, para todo endereço que não
 * existe. O `serve` local não faz isso; este roteador reproduz a regra para provar o desvio.
 */
async function comoOPagesResponde404(page: Page) {
  const html404 = readFileSync(join(PAGES, '404.html'), 'utf8')
  await page.route(`**/${REPO}/**`, async (route) => {
    const req = route.request()
    if (req.resourceType() !== 'document') return route.fallback()
    const caminho = decodeURIComponent(new URL(req.url()).pathname).replace(/^\//, '')
    if (existePeloPages(caminho)) return route.fallback()
    return route.fulfill({ status: 404, contentType: 'text/html; charset=utf-8', body: html404 })
  })
}

test.describe('página de apresentação do web', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./')
  })

  test('não tem rolagem horizontal', async ({ page }) => {
    const largo = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(largo).toBe(false)
  })

  test('metadados de SEO e AEO', async ({ page }) => {
    await expect(page).toHaveTitle(/Rendra Design System/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', RAIZ)
    const robots = await page
      .locator('meta[name="robots"]')
      .evaluateAll((ms) => ms.map((m) => m.getAttribute('content')))
    expect(robots).toEqual(expect.arrayContaining(['index, follow', 'noai, noimageai']))
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /og-image\.png$/,
    )
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents()
    const tipos = ld.flatMap((t) => {
      const j = JSON.parse(t) as { '@type': string } | Array<{ '@type': string }>
      return (Array.isArray(j) ? j : [j]).map((x) => x['@type'])
    })
    expect(tipos).toContain('SoftwareSourceCode')
  })

  test('hero com "Ver demo" para a demo', async ({ page }) => {
    await expect(page.locator('a.ver-demo[href="demo/"]').first()).toBeVisible()
  })

  test('sem violação séria ou crítica de acessibilidade', async ({ page }) => {
    await page.waitForLoadState('load')
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([])
  })

  test('links que saem da página abrem em nova aba; os do próprio site ficam na mesma aba', async ({
    page,
  }) => {
    const origem = new URL(page.url()).origin
    const links = await page.locator('a[href]').evaluateAll((as) =>
      as.map((a) => ({
        href: (a as HTMLAnchorElement).href,
        alvo: a.getAttribute('target'),
        rel: a.getAttribute('rel'),
      })),
    )
    const externos = links.filter((x) => x.href.startsWith('http') && !x.href.startsWith(origem))
    expect(externos.length).toBeGreaterThan(0)
    for (const l of externos) {
      expect(l.alvo, l.href).toBe('_blank')
      expect(l.rel ?? '', l.href).toContain('noopener')
    }
    // Demo, Storybook e registry são do próprio site (mesma origem): ficam na mesma aba.
    for (const l of links.filter((x) => x.href.startsWith(origem))) {
      expect(l.alvo, l.href).toBeNull()
    }
  })

  test('nenhum texto público promete preço ou gratuidade futura (W18)', async ({ page }) => {
    const texto = (await page.locator('body').innerText()).toLowerCase()
    for (const proibido of [
      'sem versão paga',
      'sempre gratuito',
      'sem assinatura',
      'grátis',
      'gratuito',
      'para sempre',
    ]) {
      expect(texto, proibido).not.toContain(proibido)
    }
  })

  test('?codigo= na raiz leva para a demo com o modelo aplicado (README 2.2.2, W9)', async ({
    page,
  }) => {
    await page.goto('./?codigo=T1-C4-M5')
    await expect(page).toHaveURL(new RegExp(`${PREFIXO_DEMO}$`))
    await expect(page.locator('html')).toHaveAttribute('data-palette', 'ardosia')
  })
})

test.describe('composição do site', () => {
  test('demo, registry e rota antiga (stub de redirecionamento)', async ({ request }) => {
    expect((await request.get('demo/')).status()).toBe(200)
    const registry = await request.get('r/select.json')
    expect(registry.status()).toBe(200)
    expect(((await registry.json()) as { name: string }).name).toBe('select')
    const stub = await request.get('clientes/')
    expect(stub.status()).toBe(200)
    const html = await stub.text()
    expect(html).toContain('http-equiv="refresh"')
    expect(html).toContain(`${RAIZ}demo/clientes/`)
    expect(html).toContain('location.search + location.hash')
  })

  test('o stub de uma rota antiga leva à demo e mantém a query (?imagem= do README 2.2.2)', async ({
    page,
  }) => {
    await page.goto('galeria/?imagem=safira-painel')
    await expect(page).toHaveURL(new RegExp(`${PREFIXO_DEMO}galeria/\\?imagem=safira-painel$`))
    await expect(page.locator('main#conteudo')).toBeVisible()
  })

  test('o sitemap da demo não lista o Storybook e o da raiz lista a página e a demo', async ({
    request,
  }) => {
    const demo = await (await request.get('demo/sitemap.xml')).text()
    expect(demo).toContain(`<loc>${RAIZ}demo/componentes/</loc>`)
    expect(demo).not.toContain('storybook')
    const raiz = await (await request.get('sitemap.xml')).text()
    expect(raiz).toContain(`<loc>${RAIZ}</loc>`)
    expect(raiz).toContain(`<loc>${RAIZ}demo/componentes/</loc>`)
    if (existsSync(join(PAGES, 'storybook', 'index.html'))) {
      expect(raiz).toContain(`<loc>${RAIZ}storybook/</loc>`)
    }
  })

  test('robots.txt e llms.txt da raiz e da demo', async ({ request }) => {
    const robots = await (await request.get('robots.txt')).text()
    expect(robots).toContain(`Sitemap: ${RAIZ}sitemap.xml`)
    expect(robots).toContain('User-agent: GPTBot\nDisallow: /')
    expect(robots).toContain('User-agent: OAI-SearchBot\nAllow: /')
    const llmsRaiz = await (await request.get('llms.txt')).text()
    expect(llmsRaiz).toContain(`${RAIZ}demo/`)
    expect(llmsRaiz).toContain(`${RAIZ}storybook/`)
    for (const proibido of ['gratuito', 'grátis', 'sem versão paga', 'para sempre']) {
      expect(llmsRaiz.toLowerCase(), proibido).not.toContain(proibido)
    }
    const llmsDemo = await (await request.get('demo/llms.txt')).text()
    expect(llmsDemo).toContain(`${RAIZ}storybook/`)
    expect(llmsDemo).not.toContain(`${RAIZ}demo/storybook/`)
  })

  test('o noscript da demo aponta o Storybook para a raiz do site (C13)', async ({ request }) => {
    const html = await (await request.get('demo/')).text()
    expect(html).toContain(`href="${RAIZ}storybook/"`)
    expect(html).not.toContain('/demo/storybook/')
  })
})

test.describe('demo em subcaminho', () => {
  test('abre em /demo/, mantém o prefixo ao navegar e ao voltar, sem 4xx', async ({ page }) => {
    const falhas: string[] = []
    page.on('response', (r) => {
      if (r.status() >= 400) falhas.push(`${r.status()} ${r.url()}`)
    })
    await page.goto('demo/componentes/')
    await expect(page.locator('main#conteudo')).toBeVisible()
    const hrefs = await page
      .locator('a[href^="/"]')
      .evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''))
    expect(hrefs.length).toBeGreaterThan(0)
    for (const href of hrefs) expect(href.startsWith(PREFIXO_DEMO), href).toBe(true)

    await page.locator('main a[href^="/"]').first().click()
    await expect(page).toHaveURL(new RegExp(`^http://localhost:4174${PREFIXO_DEMO}`))
    await expect(page.locator('main#conteudo')).toBeVisible()
    await page.goBack()
    await expect(page).toHaveURL(new RegExp(`${PREFIXO_DEMO}componentes/?$`))
    expect(falhas).toEqual([])
  })

  test('recarregar uma rota da demo responde 200 e hidrata', async ({ page }) => {
    for (const rota of ['demo/componentes/', 'demo/clientes/1000/']) {
      const resposta = await page.goto(rota)
      expect(resposta?.status(), rota).toBe(200)
      await expect(page.locator('main#conteudo'), rota).toBeVisible()
    }
  })

  test('?codigo= na demo aplica o modelo e sai da URL', async ({ page }) => {
    await page.goto('demo/?codigo=T1-C4-M5')
    await expect(page).toHaveURL(new RegExp(`${PREFIXO_DEMO}$`))
    await expect(page.locator('html')).toHaveAttribute('data-palette', 'ardosia')
  })

  test('endereço antigo fora da demo cai no 404 da raiz e é levado para dentro da demo (B10)', async ({
    page,
  }) => {
    await comoOPagesResponde404(page)
    await page.goto('clientes/1234')
    await expect(page).toHaveURL(new RegExp(`${PREFIXO_DEMO}clientes/1234$`))
    await expect(page.locator('main#conteudo')).toBeVisible()
  })

  test('endereço inexistente dentro da demo mostra a tela 404 da demo, sem laço', async ({
    page,
  }) => {
    await comoOPagesResponde404(page)
    let navegacoes = 0
    page.on('framenavigated', (f) => {
      if (f === page.mainFrame()) navegacoes += 1
    })
    await page.goto('demo/nao-existe')
    await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`${PREFIXO_DEMO}nao-existe$`))
    expect(navegacoes).toBeLessThanOrEqual(2)
  })
})
