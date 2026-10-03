import { describe, expect, it } from 'vitest'

import { buildOgHtml } from './og-html'

const PNG = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])
const base64 = 'iVBORw0KGgo='
const SELO = '<svg viewBox="0 0 44 44"><rect width="44" height="44"/></svg>'
const entrada = {
  produto: 'Rendra Design System',
  tagline: 'Layout de sistema em React',
  imagem: PNG,
}

describe('buildOgHtml', () => {
  it('monta a página de 1200x630 com o título, a tagline e o print como data URI', () => {
    const html = buildOgHtml(entrada)
    expect(html).toContain('width:1200px')
    expect(html).toContain('height:630px')
    expect(html).toContain('Rendra Design <span>System</span>')
    expect(html).toContain('Layout de sistema em React')
    expect(html).toContain(`src="data:image/webp;base64,${base64}"`)
  })

  it('usa a identidade da família: fundo #111111, título #f2f2f2, destaque #e8650a, tagline #c4c4c4', () => {
    const html = buildOgHtml(entrada)
    for (const cor of ['#111111', '#f2f2f2', '#e8650a', '#c4c4c4', '#9a9a9a']) {
      expect(html).toContain(cor)
    }
    expect(html).not.toContain('Poppins')
  })

  it('com o selo (só o Rendra informa), traz o selo e a marca RENDRA WEB', () => {
    const html = buildOgHtml({ ...entrada, selo: SELO })
    expect(html).toContain('<svg')
    expect(html).toContain('RENDRA <span>WEB</span>')
  })

  it('sem o selo (clone), não carrega a marca Rendra', () => {
    const html = buildOgHtml({ produto: 'Meu Sistema', tagline: 'Gestão', imagem: PNG })
    expect(html).not.toContain('<svg')
    expect(html).not.toContain('RENDRA')
  })

  it('escapa HTML no texto recebido', () => {
    const html = buildOgHtml({ ...entrada, produto: 'A<b>&B', tagline: '"x"' })
    expect(html).toContain('A&lt;b&gt;&amp;B')
    expect(html).toContain('&quot;x&quot;')
  })
})
