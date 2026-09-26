// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Input } from '@/components/ui/input'
import { renderApp } from '@/test/render'
import { RepeatableField, type RepeatableItem } from './repeatable-field'

interface Phone extends RepeatableItem {
  number: string
}

function Demo({
  items,
  onChangeSpy,
  showPrimary = false,
  maxItems,
}: {
  items: Phone[]
  onChangeSpy: (items: Phone[]) => void
  showPrimary?: boolean
  maxItems?: number
}) {
  return (
    <RepeatableField<Phone>
      items={items}
      onChange={onChangeSpy}
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
    const onChangeSpy = vi.fn()
    const { container } = renderApp(<Demo items={[]} onChangeSpy={onChangeSpy} />)
    expect(screen.getByText('Nenhum telefone ainda.')).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="REP-001"]')).toBeInTheDocument()
  })

  it('adicionar chama onChange com um item novo', async () => {
    const onChangeSpy = vi.fn()
    renderApp(<Demo items={[]} onChangeSpy={onChangeSpy} />)
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar telefone' }))
    expect(onChangeSpy).toHaveBeenCalledWith([{ id: 'novo-0', number: '' }])
  })

  it('respeita maxItems: o botão de adicionar desabilita no limite', () => {
    const onChangeSpy = vi.fn()
    renderApp(
      <Demo
        items={[
          { id: '1', number: '111' },
          { id: '2', number: '222' },
        ]}
        onChangeSpy={onChangeSpy}
        maxItems={2}
      />,
    )
    expect(screen.getByRole('button', { name: 'Adicionar telefone' })).toBeDisabled()
  })

  it('marcar um item como principal desmarca os outros', async () => {
    const onChangeSpy = vi.fn()
    renderApp(
      <Demo
        items={[
          { id: '1', number: '111', isPrimary: true },
          { id: '2', number: '222' },
        ]}
        onChangeSpy={onChangeSpy}
        showPrimary
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Tornar principal' }))
    expect(onChangeSpy).toHaveBeenCalledWith([
      { id: '1', number: '111', isPrimary: false },
      { id: '2', number: '222', isPrimary: true },
    ])
  })

  it('remover o item principal passa o papel para o primeiro restante', async () => {
    const onChangeSpy = vi.fn()
    renderApp(
      <Demo
        items={[
          { id: '1', number: '111', isPrimary: true },
          { id: '2', number: '222' },
          { id: '3', number: '333' },
        ]}
        onChangeSpy={onChangeSpy}
        showPrimary
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Remover item 1' }))
    expect(onChangeSpy).toHaveBeenCalledWith([
      { id: '2', number: '222', isPrimary: true },
      { id: '3', number: '333' },
    ])
  })

  it('remover um item que não é o principal não altera quem é principal', async () => {
    const onChangeSpy = vi.fn()
    renderApp(
      <Demo
        items={[
          { id: '1', number: '111', isPrimary: true },
          { id: '2', number: '222' },
        ]}
        onChangeSpy={onChangeSpy}
        showPrimary
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Remover item 2' }))
    expect(onChangeSpy).toHaveBeenCalledWith([{ id: '1', number: '111', isPrimary: true }])
  })
})
