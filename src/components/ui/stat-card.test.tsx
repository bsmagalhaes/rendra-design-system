// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { StatCard } from './stat-card'

describe('StatCard', () => {
  it('usa o código do catálogo, sobrepondo o do Card em que se apoia', () => {
    renderApp(<StatCard label="Receita" value="R$ 1.250,00" />)
    const card = screen.getByText('Receita').closest('[data-rendra]')
    expect(card).toHaveAttribute('data-rendra', 'STAT-001')
  })

  it('variação positiva mostra o ícone de alta e a cor de sucesso', () => {
    const { container } = renderApp(<StatCard label="Receita" value="R$ 1.250,00" change={12.5} />)
    const badge = screen.getByText('+12,5%').closest('span')
    expect(badge).toHaveClass('bg-success-soft')
    expect(container.querySelector('path[d="M7 7h10v10"]')).toBeInTheDocument()
  })

  it('variação negativa mostra o ícone de baixa e a cor de erro', () => {
    const { container } = renderApp(<StatCard label="Receita" value="R$ 1.250,00" change={-8} />)
    const badge = screen.getByText('-8%').closest('span')
    expect(badge).toHaveClass('bg-destructive-soft')
    expect(container.querySelector('path[d="m7 7 10 10"]')).toBeInTheDocument()
  })

  it('inverse troca as cores: variação negativa (custo caindo) mostra a cor de sucesso', () => {
    const { container } = renderApp(
      <StatCard label="Custo" value="R$ 1.250,00" change={-8} inverse />,
    )
    const badge = screen.getByText('-8%').closest('span')
    expect(badge).toHaveClass('bg-success-soft')
    expect(container.querySelector('path[d="m7 7 10 10"]')).toBeInTheDocument()
  })

  it('loading mostra o esqueleto no lugar do valor', () => {
    const { container } = renderApp(<StatCard label="Receita" value="R$ 1.250,00" loading />)
    expect(screen.queryByText('R$ 1.250,00')).not.toBeInTheDocument()
    expect(container.querySelector('[data-rendra="SKEL-001"]')).toBeInTheDocument()
  })
})
