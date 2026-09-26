// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Card } from './card'

describe('Card', () => {
  it('usa CARD-001 por padrão', () => {
    renderApp(<Card data-testid="card">Conteúdo</Card>)
    expect(screen.getByTestId('card')).toHaveAttribute('data-rendra', 'CARD-001')
  })

  it('aceita o código de um componente composto que o usa como raiz (Calendar, FormSection, StatCard, Table)', () => {
    renderApp(
      <Card data-testid="card" data-rendra="CAL-001">
        Conteúdo
      </Card>,
    )
    expect(screen.getByTestId('card')).toHaveAttribute('data-rendra', 'CAL-001')
  })
})
