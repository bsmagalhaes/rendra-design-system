// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { EmptyState } from './empty-state'

describe('EmptyState', () => {
  it('mostra título, descrição e a ação', () => {
    const { container } = renderApp(
      <EmptyState
        title="Nenhum contrato ainda"
        description="Os contratos aparecem aqui."
        actions={<button type="button">Novo contrato</button>}
      />,
    )
    expect(screen.getByText('Nenhum contrato ainda')).toBeInTheDocument()
    expect(screen.getByText('Os contratos aparecem aqui.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Novo contrato' })).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="VAZ-001"]')).toBeInTheDocument()
  })

  it('sem ação, não mostra nenhum botão', () => {
    renderApp(<EmptyState title="Nenhum contrato ainda" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('o tipo escolhido muda o ícone de feedback mostrado', () => {
    const { container } = renderApp(<EmptyState title="Falha ao carregar" type="error" />)
    const svgs = container.querySelectorAll('[data-rendra="BFI-001"] svg')
    const glyphPath = svgs[svgs.length - 1]?.querySelector('path')
    expect(glyphPath).toHaveAttribute('d', 'M4 4l4 4M8 4 4 8')
  })
})
