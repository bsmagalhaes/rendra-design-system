import { describe, expect, it } from 'vitest'
import { packageBanner } from './pkg-banner'

describe('packageBanner', () => {
  it('grava a versão exata recebida, sem número fixo', () => {
    expect(packageBanner('2.1.0-alpha.1')).toBe(
      '/*! Rendra Design System v2.1.0-alpha.1 | MIT | © 2026 Bruno Magalhaes | brunomagalhaes.me */',
    )
  })

  it('muda com a versão, para nunca ficar desatualizado no cabeçalho', () => {
    expect(packageBanner('3.0.0')).toBe(
      '/*! Rendra Design System v3.0.0 | MIT | © 2026 Bruno Magalhaes | brunomagalhaes.me */',
    )
  })

  it('assina com o autor, para o crédito acompanhar todo arquivo publicado', () => {
    expect(packageBanner('2.1.0')).toContain('Bruno Magalhaes')
    expect(packageBanner('2.1.0')).toContain('brunomagalhaes.me')
  })
})
