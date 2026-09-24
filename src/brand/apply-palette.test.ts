// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { applyPalette } from './palette'

const seeds = {
  id: 'parceiro',
  name: 'Parceiro',
  primary: '#7a1fa2',
  primaryHover: '#5e1780',
  secondary: '#f2994a',
  secondaryHover: '#d97a2b',
  gradient: ['#9c3fc4', '#5e1780', '#2e0b40'] as [string, string, string],
}

describe('applyPalette (white label em tempo de execução)', () => {
  it('injeta um <style> com o claro e o escuro da paleta', () => {
    applyPalette(seeds)
    const style = document.head.querySelector('style[data-palette-runtime="parceiro"]')
    expect(style?.textContent).toContain(":root[data-palette='parceiro'] {")
    expect(style?.textContent).toContain(":root[data-palette='parceiro'].dark {")
    expect(style?.textContent).toContain('--primary: #7a1fa2;')
  })

  it('reaplicar atualiza o mesmo <style>, sem duplicar', () => {
    applyPalette(seeds)
    applyPalette({ ...seeds, primary: '#1f6fa2' })
    const styles = document.head.querySelectorAll('style[data-palette-runtime="parceiro"]')
    expect(styles).toHaveLength(1)
    expect(styles[0]?.textContent).toContain('--primary: #1f6fa2;')
  })
})
