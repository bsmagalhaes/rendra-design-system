// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { Kanban, type KanbanDropTarget } from './kanban'

const columns = [
  { id: 'novo', title: 'Novo' },
  { id: 'ganho', title: 'Ganho' },
]
const cards = [{ id: '1', columnId: 'novo', title: 'Empresa X' }]

describe('Kanban', () => {
  it('o quadro usa o código do catálogo', () => {
    const { container } = renderApp(
      <Kanban aria-label="Funil" columns={[columns[0]!]} cards={cards} />,
    )
    expect(screen.getByText('Empresa X')).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="KANB-001"]')).toBeInTheDocument()
  })

  it('sem dropTargets, "Mover para" lista as outras colunas e move o card ao escolher', async () => {
    const onCardMove = vi.fn()
    renderApp(<Kanban aria-label="Funil" columns={columns} cards={cards} onCardMove={onCardMove} />)
    await userEvent.click(screen.getByRole('button', { name: 'Ações do card Empresa X' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Ganho' }))
    expect(onCardMove).toHaveBeenCalledWith('1', 'ganho', 0)
  })

  it('com dropTargets, "Mover para" lista os destinos (equivalente por teclado) e recusa o desabilitado', async () => {
    const dropTargets: KanbanDropTarget[] = [
      { id: 'ganho', label: 'Marcar como ganho' },
      { id: 'arquivar', label: 'Arquivar', disabled: true, disabledReason: 'Só depois de ganho' },
    ]
    const onDropTarget = vi.fn()
    const { container } = renderApp(
      <Kanban
        aria-label="Funil"
        columns={columns}
        cards={cards}
        dropTargets={dropTargets}
        onDropTarget={onDropTarget}
      />,
    )
    expect(container.querySelector('[data-rendra="KANB-002"]')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Ações do card Empresa X' }))
    expect(await screen.findByRole('menuitem', { name: 'Marcar como ganho' })).toBeInTheDocument()
    const disabledItem = screen.getByRole('menuitem', { name: /Arquivar/ })
    expect(disabledItem).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByText('Só depois de ganho')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('menuitem', { name: 'Marcar como ganho' }))
    expect(onDropTarget).toHaveBeenCalledWith('1', 'ganho')
  })

  it('durante o arraste (mouse), a barra de destinos aparece e soltar nela chama onDropTarget', () => {
    const dropTargets: KanbanDropTarget[] = [{ id: 'ganho', label: 'Marcar como ganho' }]
    const onDropTarget = vi.fn()
    renderApp(
      <Kanban
        aria-label="Funil"
        columns={columns}
        cards={cards}
        dropTargets={dropTargets}
        onDropTarget={onDropTarget}
      />,
    )
    expect(screen.queryByLabelText('Soltar em')).not.toBeInTheDocument()
    const card = screen.getByText('Empresa X').closest('li')!
    const dataTransfer = { effectAllowed: '', setData: vi.fn() }
    fireEvent.dragStart(card, { dataTransfer })
    const bar = screen.getByLabelText('Soltar em')
    expect(bar).toBeInTheDocument()
    const target = bar.querySelector('[data-kanban-target="ganho"]')!
    fireEvent.drop(target)
    expect(onDropTarget).toHaveBeenCalledWith('1', 'ganho')
  })
})
