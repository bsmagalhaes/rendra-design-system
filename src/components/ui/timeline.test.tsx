// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Timeline } from './timeline'

describe('Timeline', () => {
  it('usa o código do catálogo', () => {
    renderApp(<Timeline events={[{ id: '1', title: 'Criado', date: '22/09/2026 10:00' }]} />)
    expect(screen.getByText('Criado').closest('[data-rendra="TLN-001"]')).toBeInTheDocument()
  })

  it('status mostra o texto do resultado (nunca só a cor): sucesso, falha e ignorado', () => {
    renderApp(
      <Timeline
        events={[
          { id: '1', title: 'Contrato assinado', date: '22/09/2026', status: 'succeeded' },
          { id: '2', title: 'Cobrança recusada', date: '15/09/2026', status: 'failed' },
          { id: '3', title: 'Lembrete ignorado', date: '13/09/2026', status: 'skipped' },
          { id: '4', title: 'Cadastro', date: '02/09/2026' },
        ]}
      />,
    )
    expect(screen.getByText('Concluído')).toBeInTheDocument()
    expect(screen.getByText('Falhou')).toBeInTheDocument()
    expect(screen.getByText('Ignorado')).toBeInTheDocument()
    // Sem status, nenhum dos três textos aparece perto do evento "Cadastro".
    expect(screen.queryAllByText('Concluído')).toHaveLength(1)
  })
})
