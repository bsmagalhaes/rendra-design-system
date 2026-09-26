import { describe, expect, it } from 'vitest'
import { CATALOG } from '../catalog/components'
import { codigos, formatCodigos } from './codigos'

describe('codigos', () => {
  it('lista todos os códigos do catálogo, sem duplicar', () => {
    const lista = codigos()
    expect(lista).toHaveLength(CATALOG.length)
    const codes = lista.map((entry) => entry.code)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('inclui um código conhecido do catálogo', () => {
    expect(codigos().some((entry) => entry.code === 'BTN-001')).toBe(true)
  })
})

describe('formatCodigos', () => {
  it('imprime uma linha por código, com nome e componente', () => {
    const saida = formatCodigos([
      {
        code: 'BTN-001',
        name: 'Botão primário',
        component: 'Button',
        file: 'components/ui/button.tsx',
        variantProps: { variant: 'primary' },
        whenToUse: 'x',
      },
    ])
    expect(saida).toBe('BTN-001  Botão primário (Button)')
  })

  it('devolve uma linha por código do catálogo inteiro, sem duplicar', () => {
    const linhas = formatCodigos().split('\n')
    expect(linhas).toHaveLength(CATALOG.length)
    expect(new Set(linhas).size).toBe(linhas.length)
  })
})
