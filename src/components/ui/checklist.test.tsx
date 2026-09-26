// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Checklist, type ChecklistItem } from './checklist'

/** Componente controlado: a lista renderizada precisa refletir a mudança, não só chamar onChange. */
function Demo({ initial, disabled }: { initial: ChecklistItem[]; disabled?: boolean }) {
  const [value, setValue] = useState<ChecklistItem[]>(initial)
  return <Checklist value={value} onChange={setValue} disabled={disabled} aria-label="Tarefas" />
}

describe('Checklist', () => {
  it('sem itens, mostra só o botão de adicionar, com data-rendra CKLT-001', () => {
    const { container } = renderApp(<Demo initial={[]} />)
    expect(screen.getByRole('button', { name: 'Adicionar item' })).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="CKLT-001"]')).toBeInTheDocument()
  })

  it('adicionar faz o item novo aparecer na tela, vazio e com o foco', async () => {
    renderApp(<Demo initial={[]} />)
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar item' }))

    const novoCampo = screen.getByRole('textbox', { name: 'Nome do item 1' })
    expect(novoCampo).toBeInTheDocument()
    expect(novoCampo).toHaveValue('')
    expect(novoCampo).toHaveFocus()
  })

  it('digitar no campo do item muda o texto mostrado (renomear por teclado)', async () => {
    renderApp(<Demo initial={[{ id: '1', label: 'Item', checked: false }]} />)
    const input = screen.getByRole('textbox', { name: 'Nome do item 1' })

    await userEvent.type(input, 'X')

    expect(screen.getByRole('textbox', { name: 'Nome do item 1' })).toHaveValue('ItemX')
  })

  it('marcar o item risca o texto (checkbox marcado e classe de riscado no campo)', async () => {
    renderApp(<Demo initial={[{ id: '1', label: 'Regar as plantas', checked: false }]} />)
    const checkbox = screen.getByRole('checkbox', { name: 'Marcar Regar as plantas' })
    const input = screen.getByRole('textbox', { name: 'Nome do item 1' })
    expect(checkbox).not.toBeChecked()
    expect(input).not.toHaveClass('line-through')

    await userEvent.click(checkbox)

    expect(checkbox).toBeChecked()
    expect(input).toHaveClass('line-through')

    await userEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
    expect(input).not.toHaveClass('line-through')
  })

  it('remover o item faz a linha dele sumir da tela', async () => {
    renderApp(
      <Demo
        initial={[
          { id: '1', label: 'Um', checked: false },
          { id: '2', label: 'Dois', checked: false },
        ]}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Remover item 1' }))

    expect(screen.queryByDisplayValue('Um')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Nome do item 1' })).toHaveValue('Dois')
    expect(screen.getAllByRole('textbox')).toHaveLength(1)
  })

  it('disabled desabilita marcar, renomear e remover', () => {
    renderApp(<Demo initial={[{ id: '1', label: 'Um', checked: false }]} disabled />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Nome do item 1' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Remover item 1' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Adicionar item' })).toBeDisabled()
  })
})
