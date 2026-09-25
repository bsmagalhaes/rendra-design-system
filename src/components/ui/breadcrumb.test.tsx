// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Breadcrumb } from './breadcrumb'

const items = [{ label: 'Clientes', to: '/clientes' }, { label: 'Novo cliente' }]

describe('Breadcrumb', () => {
  it('variant responsive (padrão) usa o código BRD-001', () => {
    renderApp(<Breadcrumb items={items} />)
    expect(screen.getByRole('navigation', { name: 'Trilha de navegação' })).toHaveAttribute(
      'data-rendra',
      'BRD-001',
    )
  })

  it('variant trail usa o código BRD-002', () => {
    renderApp(<Breadcrumb items={items} variant="trail" />)
    expect(screen.getByRole('navigation', { name: 'Trilha de navegação' })).toHaveAttribute(
      'data-rendra',
      'BRD-002',
    )
  })
})
