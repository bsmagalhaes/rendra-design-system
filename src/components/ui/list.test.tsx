// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { RendraProvider, type RendraLinkProps } from '@/components/rendra-provider'
import { renderApp } from '@/test/render'
import { List, type ListItem } from './list'

/** Lista controlada: aplica onReorder de verdade, para o teste ver a ordem na tela mudar. */
function ControlledList({ initial }: { initial: ListItem[] }) {
  const [items, setItems] = useState(initial)
  return <List items={items} onReorder={setItems} />
}

/** Ordem visível dos títulos na tela (na ordem em que aparecem no DOM). */
function visibleOrder() {
  return screen.getAllByText(/^Cliente /).map((el) => el.textContent)
}

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

  it('tone mostra um selo textual nos quatro tons (nunca só cor), inclusive neutral', () => {
    renderApp(
      <List
        items={[
          { id: '1', title: 'Cliente A', tone: 'success' },
          { id: '2', title: 'Cliente B', tone: 'warning' },
          { id: '3', title: 'Cliente C', tone: 'error' },
          { id: '4', title: 'Cliente D', tone: 'neutral' },
          { id: '5', title: 'Cliente E' },
        ]}
      />,
    )
    expect(screen.getByText('Sucesso')).toBeInTheDocument()
    expect(screen.getByText('Atenção')).toBeInTheDocument()
    expect(screen.getByText('Erro')).toBeInTheDocument()
    expect(screen.getByText('Neutro')).toBeInTheDocument()
    // Cada selo aparece uma única vez; Cliente E, sem tone nenhum, não ganha selo algum.
    expect(screen.getAllByText('Sucesso')).toHaveLength(1)
    expect(screen.getAllByText('Atenção')).toHaveLength(1)
    expect(screen.getAllByText('Erro')).toHaveLength(1)
    expect(screen.getAllByText('Neutro')).toHaveLength(1)
  })

  it('sem onReorder, a lista é só leitura e a alça não aparece', () => {
    renderApp(<List items={[{ id: '1', title: 'Cliente A' }]} />)
    expect(screen.queryByRole('button', { name: /Reordenar/ })).not.toBeInTheDocument()
    expect(screen.getByText('Cliente A').closest('[data-rendra="LIST-001"]')).toBeInTheDocument()
  })

  it('com onReorder, a alça usa LIST-002 e a seta ↓ troca a ordem visível na tela', () => {
    const { container } = renderApp(
      <ControlledList
        initial={[
          { id: '1', title: 'Cliente A' },
          { id: '2', title: 'Cliente B' },
        ]}
      />,
    )
    expect(container.querySelector('[data-rendra="LIST-002"]')).toBeInTheDocument()
    expect(visibleOrder()).toEqual(['Cliente A', 'Cliente B'])
    fireEvent.keyDown(screen.getByRole('button', { name: 'Reordenar Cliente A' }), {
      key: 'ArrowDown',
    })
    expect(visibleOrder()).toEqual(['Cliente B', 'Cliente A'])
  })

  it('arrastar a alça (pointer down/move/up) troca a ordem visível na tela', () => {
    renderApp(
      <ControlledList
        initial={[
          { id: '1', title: 'Cliente A' },
          { id: '2', title: 'Cliente B' },
          { id: '3', title: 'Cliente C' },
        ]}
      />,
    )
    expect(visibleOrder()).toEqual(['Cliente A', 'Cliente B', 'Cliente C'])

    const targetRow = screen.getByText('Cliente C').closest('[data-sortable-id]')!
    targetRow.getBoundingClientRect = () => ({ top: 100, height: 40, bottom: 140 }) as DOMRect
    document.elementFromPoint = (() => targetRow) as typeof document.elementFromPoint

    const handle = screen.getByRole('button', { name: 'Reordenar Cliente A' })
    fireEvent.pointerDown(handle, { pointerId: 1 })
    fireEvent.pointerMove(window, { clientX: 0, clientY: 105, pointerId: 1 })
    fireEvent.pointerUp(window, { pointerId: 1 })

    expect(visibleOrder()).toEqual(['Cliente B', 'Cliente A', 'Cliente C'])
  })

  it('a primeira alça não move para cima nem a última para baixo (bordas): ordem não muda', () => {
    renderApp(
      <ControlledList
        initial={[
          { id: '1', title: 'Cliente A' },
          { id: '2', title: 'Cliente B' },
        ]}
      />,
    )
    fireEvent.keyDown(screen.getByRole('button', { name: 'Reordenar Cliente A' }), {
      key: 'ArrowUp',
    })
    fireEvent.keyDown(screen.getByRole('button', { name: 'Reordenar Cliente B' }), {
      key: 'ArrowDown',
    })
    expect(visibleOrder()).toEqual(['Cliente A', 'Cliente B'])
  })
})
