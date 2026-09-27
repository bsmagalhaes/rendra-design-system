// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Chart } from './chart'

const setViewportWidth = (w: number) =>
  (globalThis as unknown as { setViewportWidth: (w: number) => void }).setViewportWidth(w)
afterEach(() => setViewportWidth(1280))

const manyMonths = [
  { mes: 'Jan', valor: 10 },
  { mes: 'Fev', valor: 12 },
  { mes: 'Mar', valor: 14 },
  { mes: 'Abr', valor: 9 },
  { mes: 'Mai', valor: 18 },
  { mes: 'Jun', valor: 20 },
  { mes: 'Jul', valor: 22 },
  { mes: 'Ago', valor: 25 },
  { mes: 'Set', valor: 30 },
]

describe('Chart', () => {
  it('gauge usa o código CHT-006', () => {
    renderApp(<Chart type="gauge" aria-label="Meta do mês" value={80} max={100} />)
    expect(screen.getByRole('figure', { name: 'Meta do mês' })).toHaveAttribute(
      'data-rendra',
      'CHT-006',
    )
  })

  it('funnel usa o código CHT-007', () => {
    renderApp(
      <Chart
        type="funnel"
        aria-label="Funil de vendas"
        stages={[
          { label: 'Topo', value: 100 },
          { label: 'Fundo', value: 20 },
        ]}
      />,
    )
    expect(screen.getByRole('figure', { name: 'Funil de vendas' })).toHaveAttribute(
      'data-rendra',
      'CHT-007',
    )
  })

  it('bar usa o código CHT-002', () => {
    renderApp(
      <Chart
        type="bar"
        aria-label="Vendas por mês"
        data={[{ mes: 'Jan', valor: 10 }]}
        xKey="mes"
        series={[{ key: 'valor', label: 'Valor' }]}
      />,
    )
    expect(screen.getByRole('figure', { name: 'Vendas por mês' })).toHaveAttribute(
      'data-rendra',
      'CHT-002',
    )
  })

  it('no mobile, com muitos pontos, "Ver como lista" troca o gráfico pelos valores em lista', async () => {
    setViewportWidth(360)
    renderApp(
      <Chart
        type="line"
        aria-label="Vendas por mês"
        data={manyMonths}
        xKey="mes"
        series={[{ key: 'valor', label: 'Valor' }]}
      />,
    )
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Ver como lista' }))
    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()
    expect(screen.getByText('Set')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Ver gráfico' }))
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
