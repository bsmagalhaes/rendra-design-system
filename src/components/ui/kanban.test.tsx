// @vitest-environment jsdom
import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import {
  Kanban,
  moveKanbanCard,
  type KanbanCard,
  type KanbanColumn,
  type KanbanDropTarget,
} from './kanban'

const setViewportWidth = (w: number) =>
  (globalThis as unknown as { setViewportWidth: (w: number) => void }).setViewportWidth(w)
afterEach(() => setViewportWidth(1280))

const columns: KanbanColumn[] = [
  { id: 'novo', title: 'Novo' },
  { id: 'ganho', title: 'Ganho' },
]
const cards: KanbanCard[] = [{ id: '1', columnId: 'novo', title: 'Empresa X' }]

/** Kanban controlado de verdade: aplica onCardMove com moveKanbanCard, para o teste ver o card
 * aparecer na coluna certa na tela. */
function ControlledKanban(props: {
  initial: KanbanCard[]
  dropTargets?: KanbanDropTarget[]
  onDropTarget?: (cardId: string, targetId: string) => void
}) {
  const [list, setList] = useState(props.initial)
  return (
    <Kanban
      aria-label="Funil"
      columns={columns}
      cards={list}
      onCardMove={(id, to, index) => setList((l) => moveKanbanCard(l, id, to, index))}
      dropTargets={props.dropTargets}
      onDropTarget={(cardId, targetId) => {
        props.onDropTarget?.(cardId, targetId)
        // Ganho/perdido tiram o card do quadro: efeito visível de sobra.
        setList((l) => l.filter((c) => c.id !== cardId))
      }}
    />
  )
}

describe('Kanban', () => {
  it('o quadro usa o código do catálogo e mostra os dados completos do card', () => {
    const { container } = renderApp(
      <Kanban
        aria-label="Funil"
        columns={[columns[0]!]}
        cards={[
          {
            id: '1',
            columnId: 'novo',
            title: 'Empresa X',
            subtitle: '12.345.678/0001-90',
            description: 'Cliente interessado no plano anual.',
            tags: [{ label: 'Quente', tone: 'error' }],
            contact: { name: 'Ana Ribeiro', phone: '(11) 99999-0000', email: 'ana@x.com' },
            assignee: 'Bruno Costa',
            meta: 'R$ 12.500,00',
          },
        ]}
      />,
    )
    expect(container.querySelector('[data-rendra="KANB-001"]')).toBeInTheDocument()
    expect(screen.getByText('Empresa X')).toBeInTheDocument()
    expect(screen.getByText('12.345.678/0001-90')).toBeInTheDocument()
    expect(screen.getByText('Cliente interessado no plano anual.')).toBeInTheDocument()
    expect(screen.getByText('Quente')).toBeInTheDocument()
    expect(screen.getByText('Ana Ribeiro')).toBeInTheDocument()
    expect(screen.getByText('(11) 99999-0000')).toBeInTheDocument()
    expect(screen.getByText('ana@x.com')).toBeInTheDocument()
    expect(screen.getByText('R$ 12.500,00')).toBeInTheDocument()
    // Sem onCardMove nem dropTargets, o card não tem menu "Mover para".
    expect(
      screen.queryByRole('button', { name: 'Ações do card Empresa X' }),
    ).not.toBeInTheDocument()
  })

  it('coluna com limite: acima do limite, o contador vira alerta', () => {
    renderApp(
      <Kanban
        aria-label="Funil"
        columns={[{ id: 'novo', title: 'Novo', limit: 1 }]}
        cards={[
          { id: '1', columnId: 'novo', title: 'Empresa X' },
          { id: '2', columnId: 'novo', title: 'Empresa Y' },
        ]}
      />,
    )
    expect(screen.getByText('2/1')).toBeInTheDocument()
  })

  it('onAddCard: o botão (+) do título da coluna chama onAddCard com o id da coluna', async () => {
    const onAddCard = vi.fn()
    renderApp(<Kanban aria-label="Funil" columns={columns} cards={cards} onAddCard={onAddCard} />)
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar card em Novo' }))
    expect(onAddCard).toHaveBeenCalledWith('novo')
  })

  it('arraste com mouse (HTML5 dnd) move o card para a coluna de destino, visível na tela', () => {
    renderApp(<ControlledKanban initial={cards} />)
    const sourceColumn = screen.getByRole('list', { name: 'Cards em Novo' })
    expect(within(sourceColumn).getByText('Empresa X')).toBeInTheDocument()
    const card = screen.getByText('Empresa X').closest('li')!
    const dataTransfer = { effectAllowed: '', setData: vi.fn() }
    fireEvent.dragStart(card, { dataTransfer })
    const targetColumn = screen.getByRole('list', { name: 'Cards em Ganho' })
    fireEvent.dragOver(targetColumn)
    fireEvent.drop(targetColumn)
    expect(within(targetColumn).getByText('Empresa X')).toBeInTheDocument()
    expect(within(sourceColumn).queryByText('Empresa X')).not.toBeInTheDocument()
  })

  it('sem dropTargets, "Mover para" lista as outras colunas e move o card, visível na coluna de destino', async () => {
    renderApp(<ControlledKanban initial={cards} />)
    await userEvent.click(screen.getByRole('button', { name: 'Ações do card Empresa X' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Ganho' }))
    expect(
      within(screen.getByRole('list', { name: 'Cards em Ganho' })).getByText('Empresa X'),
    ).toBeInTheDocument()
  })

  it('com dropTargets, "Mover para" lista os destinos; o desabilitado mostra o motivo e recusa (não some da tela)', async () => {
    const dropTargets: KanbanDropTarget[] = [
      { id: 'ganho', label: 'Marcar como ganho' },
      { id: 'arquivar', label: 'Arquivar', disabled: true, disabledReason: 'Só depois de ganho' },
    ]
    const onDropTarget = vi.fn()
    const { container } = renderApp(
      <ControlledKanban initial={cards} dropTargets={dropTargets} onDropTarget={onDropTarget} />,
    )
    expect(container.querySelector('[data-rendra="KANB-002"]')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Ações do card Empresa X' }))
    const disabledItem = await screen.findByRole('menuitem', { name: /Arquivar/ })
    expect(disabledItem).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByText('Só depois de ganho')).toBeInTheDocument()
    await userEvent.click(disabledItem)
    expect(onDropTarget).not.toHaveBeenCalled()
    expect(screen.getByText('Empresa X')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('menuitem', { name: 'Marcar como ganho' }))
    expect(onDropTarget).toHaveBeenCalledWith('1', 'ganho')
    expect(screen.queryByText('Empresa X')).not.toBeInTheDocument()
  })

  it('durante o arraste (mouse), a barra de destinos aparece e soltar no habilitado remove o card da tela', () => {
    const dropTargets: KanbanDropTarget[] = [{ id: 'ganho', label: 'Marcar como ganho' }]
    const onDropTarget = vi.fn()
    renderApp(
      <ControlledKanban initial={cards} dropTargets={dropTargets} onDropTarget={onDropTarget} />,
    )
    expect(screen.queryByLabelText('Soltar em')).not.toBeInTheDocument()
    const card = screen.getByText('Empresa X').closest('li')!
    fireEvent.dragStart(card, { dataTransfer: { effectAllowed: '', setData: vi.fn() } })
    const bar = screen.getByLabelText('Soltar em')
    expect(bar).toBeInTheDocument()

    fireEvent.drop(bar.querySelector('[data-kanban-target="ganho"]')!)
    expect(onDropTarget).toHaveBeenCalledWith('1', 'ganho')
    expect(screen.queryByText('Empresa X')).not.toBeInTheDocument()
  })

  it('soltar (mouse) no destino desabilitado recusa: não chama onDropTarget e o card continua na tela', () => {
    const dropTargets: KanbanDropTarget[] = [
      { id: 'arquivar', label: 'Arquivar', disabled: true, disabledReason: 'Só depois de ganho' },
    ]
    const onDropTarget = vi.fn()
    renderApp(
      <ControlledKanban initial={cards} dropTargets={dropTargets} onDropTarget={onDropTarget} />,
    )
    const card = screen.getByText('Empresa X').closest('li')!
    fireEvent.dragStart(card, { dataTransfer: { effectAllowed: '', setData: vi.fn() } })
    const bar = screen.getByLabelText('Soltar em')

    fireEvent.drop(bar.querySelector('[data-kanban-target="arquivar"]')!)
    expect(onDropTarget).not.toHaveBeenCalled()
    expect(screen.getByText('Empresa X')).toBeInTheDocument()
  })

  it('no celular, sem onCardMove nem dropTargets a alça de arraste não aparece', () => {
    setViewportWidth(360)
    renderApp(<Kanban aria-label="Funil" columns={columns} cards={cards} />)
    expect(screen.getByText('Empresa X')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Arrastar/ })).not.toBeInTheDocument()
  })

  it('no celular, arrastar a alça (toque) reordena dentro da coluna, visível na tela', () => {
    setViewportWidth(360)
    const twoCards: KanbanCard[] = [
      { id: '1', columnId: 'novo', title: 'Empresa X' },
      { id: '2', columnId: 'novo', title: 'Empresa Y' },
    ]
    renderApp(<ControlledKanban initial={twoCards} />)
    const list = screen.getByRole('list', { name: 'Cards em Novo' })
    expect(
      within(list)
        .getAllByText(/Empresa/)
        .map((el) => el.textContent),
    ).toEqual(['Empresa X', 'Empresa Y'])

    const targetRow = screen.getByText('Empresa Y').closest('[data-kanban-card]')!
    targetRow.getBoundingClientRect = () => ({ top: 100, height: 40, bottom: 140 }) as DOMRect
    document.elementFromPoint = (() => targetRow) as typeof document.elementFromPoint

    const handle = screen.getByRole('button', { name: 'Arrastar Empresa X' })
    fireEvent.pointerDown(handle, { pointerId: 1 })
    fireEvent.pointerMove(window, { clientX: 0, clientY: 105, pointerId: 1 })
    fireEvent.pointerUp(window, { pointerId: 1 })

    expect(
      within(list)
        .getAllByText(/Empresa/)
        .map((el) => el.textContent),
    ).toEqual(['Empresa Y', 'Empresa X'])
  })

  it('no celular, com dropTargets a alça (toque) solta no destino e remove o card da tela', () => {
    setViewportWidth(360)
    const dropTargets: KanbanDropTarget[] = [{ id: 'ganho', label: 'Marcar como ganho' }]
    const onDropTarget = vi.fn()
    renderApp(
      <ControlledKanban initial={cards} dropTargets={dropTargets} onDropTarget={onDropTarget} />,
    )
    expect(screen.queryByLabelText('Soltar em')).not.toBeInTheDocument()

    // A barra só aparece depois que o toque na alça inicia o arraste.
    const handle = screen.getByRole('button', { name: 'Arrastar Empresa X' })
    fireEvent.pointerDown(handle, { pointerId: 2 })
    const targetChip = screen
      .getByLabelText('Soltar em')
      .querySelector('[data-kanban-target="ganho"]')!
    ;(targetChip as HTMLElement).getBoundingClientRect = () =>
      ({ top: 500, height: 40, bottom: 540 }) as DOMRect
    document.elementFromPoint = (() => targetChip) as typeof document.elementFromPoint

    fireEvent.pointerMove(window, { clientX: 0, clientY: 505, pointerId: 2 })
    fireEvent.pointerUp(window, { pointerId: 2 })

    expect(onDropTarget).toHaveBeenCalledWith('1', 'ganho')
    expect(screen.queryByText('Empresa X')).not.toBeInTheDocument()
  })
})
