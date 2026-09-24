// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { EmptyState } from './empty-state'

describe('EmptyState', () => {
  it('mostra título, descrição e a ação', () => {
    renderApp(
      <EmptyState
        title="Nenhum contrato ainda"
        description="Os contratos aparecem aqui."
        actions={<button type="button">Novo contrato</button>}
      />,
    )
    expect(screen.getByText('Nenhum contrato ainda')).toBeInTheDocument()
    expect(screen.getByText('Os contratos aparecem aqui.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Novo contrato' })).toBeInTheDocument()
  })
})
