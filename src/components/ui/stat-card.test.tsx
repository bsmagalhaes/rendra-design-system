// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { StatCard } from './stat-card'

describe('StatCard', () => {
  it('usa o código do catálogo, sobrepondo o do Card em que se apoia', () => {
    renderApp(<StatCard label="Receita" value="R$ 1.250,00" />)
    const card = screen.getByText('Receita').closest('[data-rendra]')
    expect(card).toHaveAttribute('data-rendra', 'STAT-001')
  })
})
