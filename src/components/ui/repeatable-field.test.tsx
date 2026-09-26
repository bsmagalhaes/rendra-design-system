// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { Input } from '@/components/ui/input'
import { renderApp } from '@/test/render'
import { RepeatableField, type RepeatableItem } from './repeatable-field'

interface Phone extends RepeatableItem {
  number: string
}

/** Componente controlado: a lista renderizada precisa refletir a mudança, não só chamar onChange. */
function Demo({
  initial,
  showPrimary = false,
  maxItems,
}: {
  initial: Phone[]
  showPrimary?: boolean
  maxItems?: number
}) {
  const [items, setItems] = useState<Phone[]>(initial)
  return (
    <RepeatableField<Phone>
      items={items}
      onChange={setItems}
      createItem={() => ({ id: `novo-${items.length}`, number: '' })}
      renderField={(item, update, index) => (
        <Input
          aria-label={`Telefone ${index + 1}`}
          value={item.number}
          onChange={(v) => update({ number: v })}
        />
      )}
      showPrimary={showPrimary}
      maxItems={maxItems}
      addLabel="Adicionar telefone"
      emptyLabel="Nenhum telefone ainda."
    />
  )
}

describe('RepeatableField', () => {
  it('sem itens, mostra o texto vazio e data-rendra REP-001', () => {
    const { container } = renderApp(<Demo initial={[]} />)
    expect(screen.getByText('Nenhum telefone ainda.')).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="REP-001"]')).toBeInTheDocument()
  })

  it('adicionar faz a nova linha aparecer na tela (e some o texto vazio)', async () => {
    renderApp(<Demo initial={[]} />)
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar telefone' }))

    expect(screen.getByRole('textbox', { name: 'Telefone 1' })).toBeInTheDocument()
    expect(screen.queryByText('Nenhum telefone ainda.')).not.toBeInTheDocument()
  })

  it('respeita maxItems: o botão de adicionar desabilita no limite e não cria uma terceira linha', async () => {
    renderApp(
      <Demo
        initial={[
          { id: '1', number: '111' },
          { id: '2', number: '222' },
        ]}
        maxItems={2}
      />,
    )
    const addButton = screen.getByRole('button', { name: 'Adicionar telefone' })
    expect(addButton).toBeDisabled()

    await userEvent.click(addButton)
    expect(screen.getAllByRole('textbox')).toHaveLength(2)
  })

  it('marcar um item como principal mostra "Principal" nele e "Tornar principal" no outro', async () => {
    renderApp(
      <Demo
        initial={[
          { id: '1', number: '111', isPrimary: true },
          { id: '2', number: '222' },
        ]}
        showPrimary
      />,
    )
    expect(screen.getByRole('button', { name: 'Principal' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Tornar principal' }))

    expect(screen.getAllByRole('button', { name: 'Principal' })).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Tornar principal' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Telefone 1' })).toHaveValue('111')
    expect(screen.getByRole('textbox', { name: 'Telefone 2' })).toHaveValue('222')
  })

  it('remover o item principal faz o primeiro restante virar "Principal" na tela', async () => {
    renderApp(
      <Demo
        initial={[
          { id: '1', number: '111', isPrimary: true },
          { id: '2', number: '222' },
          { id: '3', number: '333' },
        ]}
        showPrimary
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Remover item 1' }))

    expect(screen.queryByDisplayValue('111')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Telefone 1' })).toHaveValue('222')
    expect(screen.getAllByRole('button', { name: 'Principal' })).toHaveLength(1)
    // O que passou a ser o primeiro item (222) é quem agora tem o botão "Principal".
    const rows = screen.getAllByRole('textbox')
    expect(rows[0]).toHaveValue('222')
  })

  it('remover um item que não é o principal não muda quem tem o selo "Principal"', async () => {
    renderApp(
      <Demo
        initial={[
          { id: '1', number: '111', isPrimary: true },
          { id: '2', number: '222' },
        ]}
        showPrimary
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Remover item 2' }))

    expect(screen.getAllByRole('textbox')).toHaveLength(1)
    expect(screen.getByRole('textbox', { name: 'Telefone 1' })).toHaveValue('111')
    expect(screen.getByRole('button', { name: 'Principal' })).toBeInTheDocument()
  })
})
