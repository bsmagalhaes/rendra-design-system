// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RendraProvider, type RendraLinkProps } from '@/components/rendra-provider'
import { renderApp } from '@/test/render'
import { List } from './list'

/** Link falso, sem react-router: prova que a List só depende do RendraProvider. */
function FakeLink({ to, children }: RendraLinkProps) {
  return <a href={`fake:${to}`}>{children}</a>
}

describe('List', () => {
  it('renderiza os itens e usa o código do catálogo', () => {
    renderApp(<List items={[{ id: '1', title: 'Cliente A' }]} />)
    expect(screen.getByText('Cliente A').closest('[data-rendra="LIST-001"]')).toBeInTheDocument()
  })

  it('sem react-router: item navegável usa o linkComponent do RendraProvider', () => {
    render(
      <RendraProvider
        linkComponent={FakeLink}
        useCurrentPath={() => '/clientes'}
        navigate={() => {}}
        goBack={() => {}}
      >
        <List items={[{ id: '1', title: 'Cliente A', to: '/clientes/1' }]} />
      </RendraProvider>,
    )
    expect(screen.getByRole('link', { name: 'Cliente A' })).toHaveAttribute(
      'href',
      'fake:/clientes/1',
    )
  })
})
