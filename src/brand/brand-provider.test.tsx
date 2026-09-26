// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { brandConfig } from './brand.config'
import { BrandProvider } from './brand-provider'
import type { BrandConfig } from './types'

/* Estilo do rótulo (etapa 1.2.0-alpha.5): o BrandProvider escreve data-label no <html>. */

function renderWith(brand: BrandConfig) {
  render(
    <BrandProvider brands={[brand]} defaultBrand={brand} forcedMode="light">
      <span>conteúdo</span>
    </BrandProvider>,
  )
  return document.documentElement.dataset
}

describe('BrandProvider e o estilo do rótulo', () => {
  it('escreve data-label com o labelStyle do brand.config (discreto no Safira)', () => {
    expect(brandConfig.labelStyle).toBe('discreto')
    expect(renderWith(brandConfig).label).toBe('discreto')
  })

  it('escreve data-label="normal" quando a marca pede o rótulo normal', () => {
    expect(renderWith({ ...brandConfig, id: 'normal', labelStyle: 'normal' }).label).toBe('normal')
  })

  it('sem labelStyle, o padrão é discreto', () => {
    const semEstilo: BrandConfig = { ...brandConfig, id: 'sem-estilo' }
    delete semEstilo.labelStyle
    expect(renderWith(semEstilo).label).toBe('discreto')
  })
})
