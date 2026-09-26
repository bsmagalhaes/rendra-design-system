// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RendraProvider, type RendraLinkProps } from '@/components/rendra-provider'
import { renderApp } from '@/test/render'
import { List, type ListItem } from './list'

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

  it('tone mostra um selo textual (nunca só cor); neutral não mostra selo', () => {
    renderApp(
      <List
        items={[
          { id: '1', title: 'Cliente A', tone: 'success' },
          { id: '2', title: 'Cliente B', tone: 'neutral' },
        ]}
      />,
    )
    expect(screen.getByText('Sucesso')).toBeInTheDocument()
  })

  it('sem onReorder, a lista é só leitura e a alça não aparece', () => {
    renderApp(<List items={[{ id: '1', title: 'Cliente A' }]} />)
    expect(screen.queryByRole('button', { name: /Reordenar/ })).not.toBeInTheDocument()
    expect(screen.getByText('Cliente A').closest('[data-rendra="LIST-001"]')).toBeInTheDocument()
  })

  it('com onReorder, a alça usa LIST-002 e as setas do teclado movem o item uma posição', () => {
    const items: ListItem[] = [
      { id: '1', title: 'Cliente A' },
      { id: '2', title: 'Cliente B' },
    ]
    const onReorder = vi.fn()
    const { container } = renderApp(<List items={items} onReorder={onReorder} />)
    expect(container.querySelector('[data-rendra="LIST-002"]')).toBeInTheDocument()
    const handle = screen.getByRole('button', { name: 'Reordenar Cliente A' })
    fireEvent.keyDown(handle, { key: 'ArrowDown' })
    expect(onReorder).toHaveBeenCalledWith([
      { id: '2', title: 'Cliente B' },
      { id: '1', title: 'Cliente A' },
    ])
  })

  it('a primeira alça não move para cima nem a última para baixo (bordas)', () => {
    const items: ListItem[] = [
      { id: '1', title: 'Cliente A' },
      { id: '2', title: 'Cliente B' },
    ]
    const onReorder = vi.fn()
    renderApp(<List items={items} onReorder={onReorder} />)
    fireEvent.keyDown(screen.getByRole('button', { name: 'Reordenar Cliente A' }), {
      key: 'ArrowUp',
    })
    fireEvent.keyDown(screen.getByRole('button', { name: 'Reordenar Cliente B' }), {
      key: 'ArrowDown',
    })
    expect(onReorder).not.toHaveBeenCalled()
  })
})
