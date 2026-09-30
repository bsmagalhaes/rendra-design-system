import { describe, expect, it } from 'vitest'

import { buildRedirectStub, staleRoutePaths } from './redirect-stubs'

const DESTINO = 'https://bsmagalhaes.github.io/rendra-ui-web/demo/clientes/'

describe('buildRedirectStub', () => {
  it('leva ao endereço novo, com refresh, canonical e link visível', () => {
    const html = buildRedirectStub(DESTINO)
    expect(html).toContain(`<meta http-equiv="refresh" content="0; url=${DESTINO}">`)
    expect(html).toContain(`<link rel="canonical" href="${DESTINO}">`)
    expect(html).toContain('lang="pt-BR"')
    expect(html).toContain(`<a href="${DESTINO}">`)
  })

  it('preserva a query e o hash por script (o refresh sozinho perde ?imagem=)', () => {
    const html = buildRedirectStub(DESTINO)
    expect(html).toContain(
      `location.replace(${JSON.stringify(DESTINO)} + location.search + location.hash)`,
    )
  })

  it('não manda sinal conflitante: sem noindex junto do refresh e do canonical (O2)', () => {
    expect(buildRedirectStub(DESTINO)).not.toContain('noindex')
  })
})

describe('staleRoutePaths', () => {
  it('lista as rotas antigas sem colidir com destinos reservados', () => {
    expect(
      staleRoutePaths(['/', '/clientes', '/componentes/acoes', '/r', '/storybook', '/demo']),
    ).toEqual(['clientes', 'componentes/acoes'])
  })

  it('descarta também o que estiver dentro de um destino reservado', () => {
    expect(staleRoutePaths(['/demo/x', '/r/select', '/storybook/y', '/kanban'])).toEqual(['kanban'])
  })
})
