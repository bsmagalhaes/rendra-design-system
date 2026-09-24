// @vitest-environment jsdom
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { Table, type TableColumn, type TableQuery } from './table'

interface Row {
  id: string
  nome: string
  cidade: string
  valor: number
}

const rows: Row[] = [
  { id: '1', nome: 'Carla', cidade: 'Recife', valor: 300 },
  { id: '2', nome: 'Ana', cidade: 'São Paulo', valor: 1250.5 },
  { id: '3', nome: 'Bruno', cidade: 'Curitiba', valor: 90 },
]
const columns: TableColumn<Row>[] = [
  { id: 'nome', header: 'Nome', accessor: (r) => r.nome, sortable: true, mobile: 'primary' },
  { id: 'cidade', header: 'Cidade', accessor: (r) => r.cidade },
  { id: 'valor', header: 'Valor', accessor: (r) => r.valor, kind: 'currency', sortable: true },
]

const renderTable = (props: Partial<Parameters<typeof Table<Row>>[0]> = {}) =>
  renderApp(
    <Table<Row>
      aria-label="Clientes"
      data={rows}
      columns={columns}
      getRowId={(r) => r.id}
      {...props}
    />,
  )

/** Nomes na ordem em que aparecem nas linhas do corpo. */
const names = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((r) => within(r).queryAllByRole('cell')[0]?.textContent ?? '')

const setViewportWidth = (w: number) =>
  (globalThis as unknown as { setViewportWidth: (w: number) => void }).setViewportWidth(w)
afterEach(() => setViewportWidth(1280))

describe('Table', () => {
  it('mostra as linhas e formata moeda', () => {
    renderTable()
    expect(names()).toEqual(['Carla', 'Ana', 'Bruno'])
    expect(
      screen.getByText('R$ 1.250,50', { normalizer: (t) => t.replace(/\s/g, ' ') }),
    ).toBeInTheDocument()
  })

  it('ordena ao clicar no cabeçalho, e inverte no segundo clique', async () => {
    renderTable()
    await userEvent.click(screen.getByRole('button', { name: /Nome/ }))
    expect(names()).toEqual(['Ana', 'Bruno', 'Carla'])
    await userEvent.click(screen.getByRole('button', { name: /Nome/ }))
    expect(names()).toEqual(['Carla', 'Bruno', 'Ana'])
  })

  it('busca em todas as colunas', () => {
    renderTable({ globalFilter: 'curitiba' })
    expect(names()).toEqual(['Bruno'])
  })

  it('pagina conforme pageSize', async () => {
    renderTable({ pageSize: 2 })
    expect(names()).toHaveLength(2)
    await userEvent.click(screen.getAllByRole('button', { name: /Próxima/ })[0]!)
    expect(names()).toEqual(['Bruno'])
  })

  it('seleção entrega as linhas escolhidas às ações em massa', async () => {
    const bulk = vi.fn()
    renderTable({
      selectable: true,
      toolbar: {},
      bulkActions: (selected) => (
        <button type="button" onClick={() => bulk(selected.map((r) => r.id))}>
          Arquivar
        </button>
      ),
    })
    const [, first, second] = screen.getAllByRole('checkbox')
    await userEvent.click(first!)
    await userEvent.click(second!)
    await userEvent.click(screen.getByRole('button', { name: 'Arquivar' }))
    expect(bulk).toHaveBeenCalledWith(['1', '2'])
  })

  it('ação da linha recebe a própria linha', async () => {
    const onClick = vi.fn()
    renderTable({ rowActions: [{ label: 'Editar', onClick }] })
    await userEvent.click(screen.getAllByRole('button', { name: /Editar/ })[1]!)
    expect(onClick).toHaveBeenCalledWith(rows[1])
  })

  it('mostra o estado vazio', () => {
    renderTable({ data: [], empty: { title: 'Nenhum cliente ainda' } })
    expect(screen.getByText('Nenhum cliente ainda')).toBeInTheDocument()
  })

  it('modo remoto: pede ao servidor só a página, com a busca', async () => {
    const source = vi.fn(async (q: TableQuery) => ({
      rows: rows.filter((r) => r.nome.toLowerCase().includes(q.search.toLowerCase())),
      total: 42,
    }))
    renderTable({ data: undefined, source, globalFilter: 'ana', pageSize: 25 })
    await waitFor(() => expect(names()).toEqual(['Ana']))
    expect(source).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 25, search: 'ana' }),
    )
  })

  it('no celular vira cartões, sem tabela e com o mesmo conteúdo', () => {
    setViewportWidth(360)
    renderTable()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.getByText('Carla')).toBeInTheDocument()
    expect(screen.getByText('Bruno')).toBeInTheDocument()
  })
})
