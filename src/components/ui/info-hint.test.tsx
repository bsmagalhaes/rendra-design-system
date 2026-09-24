// @vitest-environment jsdom
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { InfoHint } from './info-hint'

describe('InfoHint', () => {
  it('o ícone abre o texto orientativo num modal, e Entendi fecha', async () => {
    renderApp(<InfoHint title="Receita do mês">Soma dos contratos faturados no mês.</InfoHint>)
    expect(screen.queryByText('Soma dos contratos faturados no mês.')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Sobre: Receita do mês' }))
    const dialog = await screen.findByRole('dialog', { name: 'Receita do mês' })
    expect(dialog).toHaveTextContent('Soma dos contratos faturados no mês.')
    await userEvent.click(screen.getByRole('button', { name: 'Entendi' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
