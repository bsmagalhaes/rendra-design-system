// @vitest-environment jsdom
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { DataToolbar, type ToolbarColumn } from './data-toolbar'

/*
 * DataToolbar é controlado: quem guarda o valor da busca e das colunas é quem usa o
 * componente. Por isso os testes montam um invólucro com estado, do jeito que a tela real
 * usaria, e afirmam o efeito na lista, não a chamada do onChange.
 */
function BuscaDemo({ items }: { items: string[] }) {
  const [value, setValue] = useState('')
  const filtered = items.filter((i) => i.toLowerCase().includes(value.toLowerCase()))
  return (
    <div>
      <DataToolbar search={{ value, onChange: setValue, placeholder: 'Buscar clientes' }} />
      <ul>
        {filtered.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  )
}

function ColunasDemo() {
  const [cols, setCols] = useState([
    { id: 'email', label: 'E-mail', visible: true },
    { id: 'telefone', label: 'Telefone', visible: true },
  ])
  const columns: ToolbarColumn[] = cols.map((c) => ({
    ...c,
    onToggle: (v: boolean) =>
      setCols((prev) => prev.map((p) => (p.id === c.id ? { ...p, visible: v } : p))),
  }))
  return (
    <div>
      <DataToolbar columns={columns} />
      <ul data-testid="lista-colunas">
        {cols
          .filter((c) => c.visible)
          .map((c) => (
            <li key={c.id}>{c.label}</li>
          ))}
      </ul>
    </div>
  )
}

describe('DataToolbar', () => {
  it('usa o código do catálogo e a busca filtra a lista mostrada', async () => {
    const { container } = renderApp(
      <BuscaDemo items={['Ana Ribeiro', 'Bruno Costa', 'Carla Mendes']} />,
    )
    expect(container.querySelector('[data-rendra="DTB-001"]')).toBeInTheDocument()
    const input = screen.getByPlaceholderText('Buscar clientes')
    await userEvent.type(input, 'bru')
    expect(input).toHaveValue('bru')
    expect(screen.getByText('Bruno Costa')).toBeInTheDocument()
    expect(screen.queryByText('Ana Ribeiro')).not.toBeInTheDocument()
    expect(screen.queryByText('Carla Mendes')).not.toBeInTheDocument()
  })

  it('busca sem resultado esvazia a lista mostrada', async () => {
    renderApp(<BuscaDemo items={['Ana Ribeiro', 'Bruno Costa']} />)
    const input = screen.getByPlaceholderText('Buscar clientes')
    await userEvent.type(input, 'zzz')
    expect(screen.queryByText('Ana Ribeiro')).not.toBeInTheDocument()
    expect(screen.queryByText('Bruno Costa')).not.toBeInTheDocument()
  })

  it('desmarcar uma coluna some com ela da lista de colunas visíveis', async () => {
    renderApp(<ColunasDemo />)
    expect(screen.getByText('E-mail')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Colunas' }))
    await userEvent.click(await screen.findByRole('menuitemcheckbox', { name: 'E-mail' }))
    const lista = screen.getByTestId('lista-colunas')
    expect(within(lista).queryByText('E-mail')).not.toBeInTheDocument()
    expect(within(lista).getByText('Telefone')).toBeInTheDocument()
  })
})
