// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { Checklist, type ChecklistItem } from './checklist'

describe('Checklist', () => {
  it('sem itens, mostra só o botão de adicionar, com data-rendra CKLT-001', () => {
    const onChange = vi.fn()
    const { container } = renderApp(
      <Checklist value={[]} onChange={onChange} aria-label="Tarefas" />,
    )
    expect(screen.getByRole('button', { name: 'Adicionar item' })).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="CKLT-001"]')).toBeInTheDocument()
  })

  it('adicionar cria um item vazio e move o foco para o nome dele', async () => {
    const onChange = vi.fn()
    const value: ChecklistItem[] = []
    renderApp(<Checklist value={value} onChange={onChange} aria-label="Tarefas" />)
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar item' }))
    expect(onChange).toHaveBeenCalledTimes(1)
    const created = onChange.mock.calls[0]?.[0] as ChecklistItem[]
    expect(created).toHaveLength(1)
    expect(created[0]).toMatchObject({ label: '', checked: false })
  })

  it('digitar no campo do item renomeia (tudo por teclado)', async () => {
    const onChange = vi.fn()
    renderApp(
      <Checklist
        value={[{ id: '1', label: 'Item', checked: false }]}
        onChange={onChange}
        aria-label="Tarefas"
      />,
    )
    const input = screen.getByRole('textbox', { name: 'Nome do item 1' })
    await userEvent.type(input, 'X')
    expect(onChange).toHaveBeenLastCalledWith([{ id: '1', label: 'ItemX', checked: false }])
  })

  it('marcar o item chama onChange com checked invertido', async () => {
    const onChange = vi.fn()
    renderApp(
      <Checklist
        value={[{ id: '1', label: 'Regar as plantas', checked: false }]}
        onChange={onChange}
        aria-label="Tarefas"
      />,
    )
    await userEvent.click(screen.getByRole('checkbox', { name: 'Marcar Regar as plantas' }))
    expect(onChange).toHaveBeenCalledWith([{ id: '1', label: 'Regar as plantas', checked: true }])
  })

  it('remover o item chama onChange sem ele', async () => {
    const onChange = vi.fn()
    renderApp(
      <Checklist
        value={[
          { id: '1', label: 'Um', checked: false },
          { id: '2', label: 'Dois', checked: false },
        ]}
        onChange={onChange}
        aria-label="Tarefas"
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Remover item 1' }))
    expect(onChange).toHaveBeenCalledWith([{ id: '2', label: 'Dois', checked: false }])
  })

  it('disabled desabilita marcar, renomear e remover', () => {
    const onChange = vi.fn()
    renderApp(
      <Checklist
        value={[{ id: '1', label: 'Um', checked: false }]}
        onChange={onChange}
        disabled
        aria-label="Tarefas"
      />,
    )
    expect(screen.getByRole('checkbox')).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Nome do item 1' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Remover item 1' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Adicionar item' })).toBeDisabled()
  })
})
