// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { resetWidgetLayout, WidgetGrid, type Widget } from './widget-grid'

// jsdom não faz layout de verdade: a grade sempre mediria 0px de largura, o que sempre cairia
// no formato de celular (empilhado, sem edição). Fixa uma largura de desktop para medir a
// posição real dos widgets, como o image-cropper.test.tsx já faz.
const originalClientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth')
beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 1200 })
})
afterEach(() => {
  if (originalClientWidth)
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', originalClientWidth)
  localStorage.clear()
})

const widgets: Widget[] = [
  { id: 'a', w: 4, h: 3, content: <p>Bloco A</p> },
  { id: 'b', w: 4, h: 3, content: <p>Bloco B</p> },
]

/**
 * Topo (em px) do widget com este texto. O react-grid-layout posiciona com
 * transform: translate(x, y), não com left/top.
 */
function topOf(text: string) {
  const el = screen.getByText(text).closest('.react-grid-item') as HTMLElement
  const match = /translate\(\s*[-\d.]+px,\s*([-\d.]+)px\s*\)/.exec(el.style.transform)
  return match ? Number.parseFloat(match[1]!) : Number.NaN
}

function savedLayout(order: 'padrao' | 'invertido') {
  const [primeiro, segundo] = order === 'padrao' ? ['a', 'b'] : ['b', 'a']
  const items = [
    { i: primeiro, x: 0, y: 0, w: 4, h: 3 },
    { i: segundo, x: 0, y: 5, w: 4, h: 3 },
  ]
  return { lg: items, md: items, sm: items }
}

describe('WidgetGrid', () => {
  it('renderiza os widgets e usa o código do catálogo', () => {
    const { container } = renderApp(
      <WidgetGrid widgets={[{ id: '1', w: 4, h: 4, content: <p>Bloco 1</p> }]} />,
    )
    expect(screen.getByText('Bloco 1')).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="WDG-001"]')).toBeInTheDocument()
  })

  it('editable mostra a alça de arrastar em cada widget; sem editable, ela não aparece', () => {
    const { rerender } = renderApp(<WidgetGrid widgets={widgets} />)
    expect(screen.queryAllByRole('img', { name: 'Arrastar widget' })).toHaveLength(0)

    rerender(<WidgetGrid widgets={widgets} editable />)
    expect(screen.getAllByRole('img', { name: 'Arrastar widget' })).toHaveLength(2)
  })

  it('usa o layout salvo no navegador ao montar, em vez do padrão calculado', () => {
    localStorage.setItem('grade-teste', JSON.stringify(savedLayout('invertido')))
    renderApp(<WidgetGrid widgets={widgets} storageKey="grade-teste" />)
    // No layout salvo, B foi guardado na linha de cima (y=0) e A embaixo (y=5).
    expect(topOf('Bloco B')).toBeLessThan(topOf('Bloco A'))
  })

  function PainelComRestauracao() {
    const [version, setVersion] = useState(0)
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            resetWidgetLayout('grade-restaurar')
            setVersion((v) => v + 1)
          }}
        >
          Restaurar padrão
        </button>
        <WidgetGrid key={version} widgets={widgets} storageKey="grade-restaurar" />
      </div>
    )
  }

  it('restaurar padrão apaga a arrumação salva e volta ao layout calculado', async () => {
    localStorage.setItem('grade-restaurar', JSON.stringify(savedLayout('invertido')))
    renderApp(<PainelComRestauracao />)
    expect(topOf('Bloco B')).toBeLessThan(topOf('Bloco A'))

    await userEvent.click(screen.getByRole('button', { name: 'Restaurar padrão' }))
    // Padrão: A e B cabem lado a lado na mesma linha (4 + 4 de 12 colunas), mesmo topo.
    expect(topOf('Bloco A')).toBe(topOf('Bloco B'))
    expect(localStorage.getItem('grade-restaurar')).toBeNull()
  })
})
