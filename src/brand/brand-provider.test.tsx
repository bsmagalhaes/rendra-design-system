// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { brandConfig } from './brand.config'
import { BrandProvider, type BrandStorage } from './brand-provider'
import { createTheme } from './theme'
import { useBrand } from './use-brand'
import type { BrandConfig, PaletteConfig } from './types'

// Isolamento entre testes: várias descrições abaixo usam o localStorage real (sem `storage`
// custom), e o provider persiste mesmo no modo controlado (ver setBrandId/setPaletteId/setMode).
beforeEach(() => localStorage.clear())

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

/*
 * BrandProvider controlado, tema em tempo de execução e storage plugável (C5, etapa
 * 2.0.0-alpha.4): docs/specs/v2-plano.md seções 2.6, 4.2 e a correção 6.2.3 (setBrandId não
 * zera a paleta sem chamar onPaletteIdChange no modo controlado).
 */

const outraMarca: BrandConfig = { ...brandConfig, id: 'outra', productName: 'Outra' }
const palettesFixture: PaletteConfig[] = [
  { id: brandConfig.id, name: brandConfig.productName, sidebarLogo: brandConfig.sidebarLogo },
  { id: outraMarca.id, name: outraMarca.productName, sidebarLogo: outraMarca.sidebarLogo },
]

/** Consumidor mínimo, com os dados e as ações do contexto expostos por texto e por botão. */
function Consumer() {
  const { brand, palette, mode, setBrandId, setPaletteId, setMode } = useBrand()
  return (
    <div>
      <span data-testid="brand-id">{brand.id}</span>
      <span data-testid="palette-id">{palette.id}</span>
      <span data-testid="mode">{mode}</span>
      <button onClick={() => setBrandId(outraMarca.id)}>trocar marca</button>
      <button onClick={() => setPaletteId(outraMarca.id)}>trocar paleta</button>
      <button onClick={() => setPaletteId(null)}>zerar paleta</button>
      <button onClick={() => setMode('dark')}>modo escuro</button>
    </div>
  )
}

describe('paletteId desconhecido cai no fallback (paleta do próprio modelo)', () => {
  it('forcedPaletteId sem correspondência em palettes usa a paleta do brand ativo', () => {
    render(
      <BrandProvider
        brands={[brandConfig]}
        palettes={palettesFixture}
        defaultBrand={brandConfig}
        forcedMode="light"
        forcedPaletteId="nao-existe"
      >
        <Consumer />
      </BrandProvider>,
    )
    expect(screen.getByTestId('palette-id').textContent).toBe(brandConfig.id)
  })
})

describe('theme (C5): aplica sem exigir id cadastrado em palettes.ts', () => {
  it('a paleta ativa vira o id/nome/sidebarLogo do tema, mesmo fora de palettes', () => {
    const theme = createTheme({
      id: 'tema-sem-cadastro',
      name: 'Tema sem cadastro',
      mode: 'gerado',
      seed: {
        primary: '#7a1fa2',
        primaryHover: '#5e1780',
        secondary: '#f2994a',
        secondaryHover: '#d97a2b',
        gradient: ['#9c3fc4', '#5e1780', '#2e0b40'],
      },
    })
    render(
      <BrandProvider
        brands={[brandConfig]}
        palettes={palettesFixture}
        defaultBrand={brandConfig}
        forcedMode="light"
        theme={theme}
      >
        <Consumer />
      </BrandProvider>,
    )
    expect(screen.getByTestId('palette-id').textContent).toBe('tema-sem-cadastro')
    expect(document.documentElement.dataset.palette).toBe('tema-sem-cadastro')
  })
})

describe('storage plugável (C5)', () => {
  it('storage={false} não persiste nada (nem lê, nem escreve)', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem')
    render(
      <BrandProvider
        brands={[brandConfig]}
        defaultBrand={brandConfig}
        forcedMode="light"
        storage={false}
      >
        <Consumer />
      </BrandProvider>,
    )
    fireEvent.click(screen.getByText('modo escuro'))
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('storage customizado é chamado na leitura inicial e nas trocas', () => {
    const store = new Map<string, string>()
    const custom: BrandStorage = {
      get: vi.fn((key: string) => store.get(key) ?? null),
      set: vi.fn((key: string, value: string) => {
        store.set(key, value)
      }),
    }
    render(
      <BrandProvider
        brands={[brandConfig]}
        defaultBrand={brandConfig}
        forcedMode="light"
        storage={custom}
      >
        <Consumer />
      </BrandProvider>,
    )
    expect(custom.get).toHaveBeenCalledWith('ui-brand')
    expect(custom.get).toHaveBeenCalledWith('ui-mode')
    expect(custom.get).toHaveBeenCalledWith('ui-palette')
    fireEvent.click(screen.getByText('modo escuro'))
    expect(custom.set).toHaveBeenCalledWith('ui-mode', 'dark')
  })
})

describe('modo controlado (brandId, paletteId, mode)', () => {
  it('brandId controlado: setBrandId não muda o brand exibido sem o pai reagir a onBrandIdChange', () => {
    const onBrandIdChange = vi.fn()
    render(
      <BrandProvider
        brands={[brandConfig, outraMarca]}
        palettes={palettesFixture}
        defaultBrand={brandConfig}
        forcedMode="light"
        brandId={brandConfig.id}
        onBrandIdChange={onBrandIdChange}
      >
        <Consumer />
      </BrandProvider>,
    )
    fireEvent.click(screen.getByText('trocar marca'))
    expect(onBrandIdChange).toHaveBeenCalledWith(outraMarca.id)
    // Continua no brand original: quem decide a mudança de verdade é o pai (prop controlada).
    expect(screen.getByTestId('brand-id').textContent).toBe(brandConfig.id)
  })

  it('paletteId controlado: setBrandId não zera a paleta por conta própria, só chama onPaletteIdChange', () => {
    const onPaletteIdChange = vi.fn()
    render(
      <BrandProvider
        brands={[brandConfig, outraMarca]}
        palettes={palettesFixture}
        defaultBrand={brandConfig}
        forcedMode="light"
        paletteId={outraMarca.id}
        onPaletteIdChange={onPaletteIdChange}
      >
        <Consumer />
      </BrandProvider>,
    )
    expect(screen.getByTestId('palette-id').textContent).toBe(outraMarca.id)
    fireEvent.click(screen.getByText('trocar marca'))
    expect(onPaletteIdChange).toHaveBeenCalledWith(null)
    // A paleta controlada continua a que o pai informou: não foi zerada por dentro do provider.
    expect(screen.getByTestId('palette-id').textContent).toBe(outraMarca.id)
  })

  it('mode controlado: onModeChange é chamado; o modo exibido só muda se o pai atualizar a prop', () => {
    const onModeChange = vi.fn()
    render(
      <BrandProvider
        brands={[brandConfig]}
        defaultBrand={brandConfig}
        mode="light"
        onModeChange={onModeChange}
      >
        <Consumer />
      </BrandProvider>,
    )
    fireEvent.click(screen.getByText('modo escuro'))
    expect(onModeChange).toHaveBeenCalledWith('dark')
    expect(screen.getByTestId('mode').textContent).toBe('light')
  })

  it('sem controle, setPaletteId(null) volta às cores do próprio modelo', () => {
    render(
      <BrandProvider
        brands={[brandConfig, outraMarca]}
        palettes={palettesFixture}
        defaultBrand={brandConfig}
        forcedMode="light"
      >
        <Consumer />
      </BrandProvider>,
    )
    fireEvent.click(screen.getByText('trocar paleta'))
    expect(screen.getByTestId('palette-id').textContent).toBe(outraMarca.id)
    fireEvent.click(screen.getByText('zerar paleta'))
    expect(screen.getByTestId('palette-id').textContent).toBe(brandConfig.id)
  })
})
