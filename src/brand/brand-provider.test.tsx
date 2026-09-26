// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { brandConfig } from './brand.config'
import { BrandProvider, type BrandStorage } from './brand-provider'
import { createTheme } from './theme'
import { useBrand } from './use-brand'
import type { BrandConfig, PaletteConfig } from './types'

// Isolamento entre testes: várias descrições abaixo usam o localStorage real (sem `storage`
// custom), e o provider persiste mesmo no modo controlado (ver setBrandId/setPaletteId/setMode).
beforeEach(() => localStorage.clear())
// O BrandProvider escreve direto em document.documentElement (data-brand, data-palette,
// data-label, data-shape, classe dark): isso não é desfeito pelo cleanup do Testing Library
// (que só desmonta a árvore React), então cada teste que confere esse efeito visível precisa
// de um <html> limpo antes do próximo.
afterEach(() => {
  document.documentElement.className = ''
  delete document.documentElement.dataset.brand
  delete document.documentElement.dataset.shape
  delete document.documentElement.dataset.label
  delete document.documentElement.dataset.palette
})

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
 * BrandProvider controlado, tema em tempo de execução e storage plugável: cobre também o
 * caso em que setBrandId não pode zerar a paleta sem avisar quem controla o estado
 * (onPaletteIdChange precisa disparar no modo controlado, senão a UI do host fica com a
 * paleta antiga enquanto o BrandProvider já mudou de marca por dentro).
 */

const outraMarca: BrandConfig = { ...brandConfig, id: 'outra', productName: 'Outra' }
const palettesFixture: PaletteConfig[] = [
  { id: brandConfig.id, name: brandConfig.productName, sidebarLogo: brandConfig.sidebarLogo },
  { id: outraMarca.id, name: outraMarca.productName, sidebarLogo: outraMarca.sidebarLogo },
  // Paleta sem correspondência em nenhuma marca: usada para provar o guard sem depender da
  // coincidência de que trocar a marca também levaria a essa mesma paleta pelo fallback.
  { id: 'parceiro-y', name: 'Parceiro Y', sidebarLogo: 'light' },
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
  it('storage={false} não persiste nada (nem lê, nem escreve), mas o efeito visível continua (classe dark no html)', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem')
    render(
      <BrandProvider brands={[brandConfig]} defaultBrand={brandConfig} storage={false}>
        <Consumer />
      </BrandProvider>,
    )
    fireEvent.click(screen.getByText('modo escuro'))
    // Efeito real, não só a chamada do spy: nada foi de fato escrito no localStorage.
    expect(spy).not.toHaveBeenCalled()
    expect(localStorage.getItem('ui-mode')).toBeNull()
    // A troca de modo continua visível (não é a persistência que liga a classe): sem
    // forcedMode, depois de setMode('dark') o modo resolvido só pode ser 'dark'.
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    spy.mockRestore()
  })

  it('storage customizado é chamado na leitura inicial e nas trocas, e o valor persistido reflete a troca de verdade', () => {
    const store = new Map<string, string>()
    const custom: BrandStorage = {
      get: vi.fn((key: string) => store.get(key) ?? null),
      set: vi.fn((key: string, value: string) => {
        store.set(key, value)
      }),
    }
    render(
      <BrandProvider brands={[brandConfig]} defaultBrand={brandConfig} storage={custom}>
        <Consumer />
      </BrandProvider>,
    )
    expect(custom.get).toHaveBeenCalledWith('ui-brand')
    expect(custom.get).toHaveBeenCalledWith('ui-mode')
    expect(custom.get).toHaveBeenCalledWith('ui-palette')
    fireEvent.click(screen.getByText('modo escuro'))
    expect(custom.set).toHaveBeenCalledWith('ui-mode', 'dark')
    // Efeito de verdade no backing store informado, não só a chamada do mock.
    expect(store.get('ui-mode')).toBe('dark')
    // E o efeito visível no <html>, na mesma troca.
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    // Nada foi escrito no localStorage real: o storage customizado substituiu, não somou.
    expect(localStorage.getItem('ui-mode')).toBeNull()
  })

  it('storage.remove (quando existe) é chamado para zerar a paleta, em vez de set com string vazia', () => {
    const store = new Map<string, string>()
    const custom: BrandStorage = {
      get: (key) => store.get(key) ?? null,
      set: vi.fn((key: string, value: string) => {
        store.set(key, value)
      }),
      remove: vi.fn((key: string) => {
        store.delete(key)
      }),
    }
    render(
      <BrandProvider
        brands={[brandConfig, outraMarca]}
        palettes={palettesFixture}
        defaultBrand={brandConfig}
        storage={custom}
      >
        <Consumer />
      </BrandProvider>,
    )
    fireEvent.click(screen.getByText('trocar paleta'))
    expect(store.get('ui-palette')).toBe(outraMarca.id)
    fireEvent.click(screen.getByText('zerar paleta'))
    expect(custom.remove).toHaveBeenCalledWith('ui-palette')
    expect(store.has('ui-palette')).toBe(false)
    // set nunca foi chamado com string vazia para essa chave: remove sempre que existir.
    expect(custom.set).not.toHaveBeenCalledWith('ui-palette', '')
  })

  it('storage sem remove (adaptador antigo, só get/set) cai de volta em set(key, ""), sem quebrar', () => {
    const store = new Map<string, string>()
    const semRemove: BrandStorage = {
      get: (key) => store.get(key) ?? null,
      set: (key, value) => {
        store.set(key, value)
      },
    }
    render(
      <BrandProvider
        brands={[brandConfig, outraMarca]}
        palettes={palettesFixture}
        defaultBrand={brandConfig}
        storage={semRemove}
      >
        <Consumer />
      </BrandProvider>,
    )
    fireEvent.click(screen.getByText('trocar paleta'))
    fireEvent.click(screen.getByText('zerar paleta'))
    expect(store.get('ui-palette')).toBe('')
    expect(screen.getByTestId('palette-id').textContent).toBe(brandConfig.id)
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
    // Efeito visível no <html>: data-brand também continua o original, não o pedido no clique.
    expect(document.documentElement.dataset.brand).toBe(brandConfig.id)
  })

  it('paletteId controlado: setBrandId não zera a paleta por conta própria, só chama onPaletteIdChange', () => {
    const onPaletteIdChange = vi.fn()
    const { rerender } = render(
      <BrandProvider
        brands={[brandConfig, outraMarca]}
        palettes={palettesFixture}
        defaultBrand={brandConfig}
        forcedMode="light"
        paletteId="parceiro-y"
        onPaletteIdChange={onPaletteIdChange}
      >
        <Consumer />
      </BrandProvider>,
    )
    expect(screen.getByTestId('palette-id').textContent).toBe('parceiro-y')
    expect(document.documentElement.dataset.palette).toBe('parceiro-y')
    fireEvent.click(screen.getByText('trocar marca'))
    expect(onPaletteIdChange).toHaveBeenCalledWith(null)
    // Efeito visível imediato: a paleta controlada continua a que o pai informou, não foi
    // zerada por dentro do provider (isso sozinho já seria verdade mesmo com o guard quebrado,
    // porque paletteId controlado sempre espelha a prop). data-palette no <html> também não mudou.
    expect(screen.getByTestId('palette-id').textContent).toBe('parceiro-y')
    expect(document.documentElement.dataset.palette).toBe('parceiro-y')

    // Prova de verdade do guard: se o provider tivesse chamado setPaletteIdState(null) por
    // dentro (guard quebrado), esse null ficaria "escondido" no estado interno enquanto
    // controlado. Ao devolver o controle ao provider (o pai reage a onPaletteIdChange
    // removendo a prop, como o padrão de "handoff" de componente controlado sugere), o estado
    // interno voltaria a ficar visível: com o guard intacto, ele nunca foi tocado e continua
    // "parceiro-y" (o valor lido na montagem, sem relação com nenhuma marca); com o guard
    // quebrado, apareceria null e cairia no fallback da marca ("outra", divergente).
    rerender(
      <BrandProvider
        brands={[brandConfig, outraMarca]}
        palettes={palettesFixture}
        defaultBrand={brandConfig}
        forcedMode="light"
      >
        <Consumer />
      </BrandProvider>,
    )
    expect(screen.getByTestId('palette-id').textContent).toBe('parceiro-y')
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
    // Efeito visível no <html>: sem o pai atualizar a prop `mode`, a classe dark não liga.
    expect(document.documentElement.classList.contains('dark')).toBe(false)
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
    expect(localStorage.getItem('ui-palette')).toBe(outraMarca.id)
    fireEvent.click(screen.getByText('zerar paleta'))
    expect(screen.getByTestId('palette-id').textContent).toBe(brandConfig.id)
    // clearKey usa removeItem (BrandStorage.remove), não deixa "ui-palette" gravado como
    // string vazia: a chave some de vez do localStorage, não fica lá dentro com valor ''.
    expect(localStorage.getItem('ui-palette')).toBeNull()
    expect('ui-palette' in localStorage).toBe(false)
  })
})
