// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { applyTheme } from './apply-theme'
import { createTheme } from './theme'

/*
 * applyTheme (Parte B, C5, docs/specs/v2-plano.md seções 2.6 e 4.2): aplica no DOM o
 * resultado (puro) de createTheme. Sem opções, reproduz applyPalette de hoje; com `target`,
 * aplica num contêiner escopado por [data-rendra-root] (C4).
 */

const parceiro = createTheme({
  id: 'parceiro',
  name: 'Parceiro',
  mode: 'gerado',
  seed: {
    primary: '#7a1fa2',
    primaryHover: '#5e1780',
    secondary: '#f2994a',
    secondaryHover: '#d97a2b',
    gradient: ['#9c3fc4', '#5e1780', '#2e0b40'],
  },
})

describe('applyTheme, sem opções (reproduz applyPalette de hoje)', () => {
  it('injeta um <style> em document.head com :root[data-palette] claro e escuro', () => {
    applyTheme(parceiro)
    const style = document.head.querySelector('style[data-theme-runtime="parceiro"]')
    expect(style?.textContent).toContain(":root[data-palette='parceiro'] {")
    expect(style?.textContent).toContain(":root[data-palette='parceiro'].dark {")
    expect(style?.textContent).toContain('--rendra-primary: #7a1fa2;')
  })

  it('trocar de tema em tempo de execução atualiza o mesmo <style>, sem duplicar nem recarregar', () => {
    applyTheme(parceiro)
    // Reaplica com a mesma cor primária alterada, ainda com o id "parceiro".
    const trocado = createTheme({
      id: 'parceiro',
      name: 'Parceiro',
      mode: 'gerado',
      seed: {
        primary: '#1f6fa2',
        primaryHover: '#154f75',
        secondary: '#f2994a',
        secondaryHover: '#d97a2b',
        gradient: ['#9c3fc4', '#5e1780', '#2e0b40'],
      },
    })
    applyTheme(trocado)
    const styles = document.head.querySelectorAll('style[data-theme-runtime="parceiro"]')
    expect(styles).toHaveLength(1)
    expect(styles[0]?.textContent).toContain('--rendra-primary: #1f6fa2;')
  })
})

describe('applyTheme com target (contêiner escopado por [data-rendra-root])', () => {
  it('marca o contêiner com data-rendra-root e escopa o <style> por esse atributo', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    applyTheme(parceiro, { target: container })
    expect(container.getAttribute('data-rendra-root')).toBe('parceiro')
    const style = document.head.querySelector('style[data-theme-runtime="parceiro"]')
    expect(style?.textContent).toContain("[data-rendra-root='parceiro'] {")
    expect(style?.textContent).toContain("[data-rendra-root='parceiro'].dark {")
  })

  it('não toca :root quando aplicado num contêiner', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    applyTheme(parceiro, { target: container })
    const style = document.head.querySelector('style[data-theme-runtime="parceiro"]')
    expect(style?.textContent).not.toContain(':root[data-palette')
  })
})

describe('applyTheme com selector explícito', () => {
  it('usa o seletor informado para o claro e `${selector}.dark` para o escuro', () => {
    applyTheme(parceiro, { selector: '.tema-parceiro' })
    const style = document.head.querySelector('style[data-theme-runtime="parceiro"]')
    expect(style?.textContent).toContain('.tema-parceiro {')
    expect(style?.textContent).toContain('.tema-parceiro.dark {')
  })
})
