// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RendraProvider, type RendraLinkProps } from '@/components/rendra-provider'
import { renderApp } from '@/test/render'
import { Breadcrumb } from './breadcrumb'

const items = [{ label: 'Clientes', to: '/clientes' }, { label: 'Novo cliente' }]

/** Link falso, sem react-router: prova que o Breadcrumb só depende do RendraProvider. */
function FakeLink({ to, children }: RendraLinkProps) {
  return <a href={`fake:${to}`}>{children}</a>
}

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

  it('sem react-router: navega pelo linkComponent do RendraProvider', () => {
    render(
      <RendraProvider
        linkComponent={FakeLink}
        useCurrentPath={() => '/clientes/novo'}
        navigate={() => {}}
        goBack={() => {}}
      >
        <Breadcrumb items={items} variant="trail" />
      </RendraProvider>,
    )
    const link = screen.getByRole('link', { name: 'Clientes' })
    expect(link).toHaveAttribute('href', 'fake:/clientes')
  })
})
