import { describe, expect, it } from 'vitest'
import { escapeHtml } from './html.ts'

describe('escapeHtml', () => {
  it.each([
    ['&', '&amp;'],
    ['<', '&lt;'],
    ['>', '&gt;'],
    ['"', '&quot;'],
    ["'", '&#39;'],
  ])('escapa %s', (entrada, saida) => {
    expect(escapeHtml(entrada)).toBe(saida)
  })

  it('escapa o & primeiro, sem duplicar as entidades geradas', () => {
    expect(escapeHtml('<a href="x">&</a>')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;')
  })

  it('deixa o texto comum como está', () => {
    expect(escapeHtml('Rendra Design System')).toBe('Rendra Design System')
  })
})
