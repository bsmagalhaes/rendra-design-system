// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Kanban } from './kanban'

describe('Kanban', () => {
  it('o quadro usa o código do catálogo', () => {
    const { container } = renderApp(
      <Kanban
        aria-label="Funil"
        columns={[{ id: 'novo', title: 'Novo' }]}
        cards={[{ id: '1', columnId: 'novo', title: 'Empresa X' }]}
      />,
    )
    expect(screen.getByText('Empresa X')).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="KANB-001"]')).toBeInTheDocument()
  })
})
