import { describe, expect, it } from 'vitest'

import { rootUrlFrom, routeUrl, sitemapXml } from './sitemap'

const DEMO = 'https://bsmagalhaes.github.io/rendra-ui-web/demo/'
const RAIZ = 'https://bsmagalhaes.github.io/rendra-ui-web/'

describe('routeUrl', () => {
  it('a raiz é a URL base e toda outra rota é pasta com barra final (B11)', () => {
    expect(routeUrl(DEMO, '/')).toBe(DEMO)
    expect(routeUrl(DEMO, '/clientes')).toBe(`${DEMO}clientes/`)
    expect(routeUrl(DEMO, '/clientes/1000')).toBe(`${DEMO}clientes/1000/`)
  })
})

describe('rootUrlFrom', () => {
  it('tira o demo/ final e deixa a raiz como está', () => {
    expect(rootUrlFrom(DEMO)).toBe(RAIZ)
    expect(rootUrlFrom(RAIZ)).toBe(RAIZ)
  })
})

describe('sitemapXml', () => {
  it('lista cada rota com lastmod e prioridade', () => {
    const xml = sitemapXml({ siteUrl: DEMO, routes: ['/', '/clientes'], today: '2026-09-30' })
    expect(xml).toContain(`<loc>${DEMO}</loc><lastmod>2026-09-30</lastmod><priority>1.0</priority>`)
    expect(xml).toContain(
      `<loc>${DEMO}clientes/</loc><lastmod>2026-09-30</lastmod><priority>0.7</priority>`,
    )
  })

  it('o sitemap da demo só lista URLs dentro de /demo/', () => {
    const xml = sitemapXml({ siteUrl: DEMO, routes: ['/', '/clientes'] })
    expect(xml).toContain(`<loc>${DEMO}clientes/</loc>`)
    expect(xml).not.toContain('storybook')
  })
})
