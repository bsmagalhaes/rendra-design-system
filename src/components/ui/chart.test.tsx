// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Chart } from './chart'

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
})
