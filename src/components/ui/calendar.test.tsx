// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Calendar } from './calendar'

const setViewportWidth = (w: number) =>
  (globalThis as unknown as { setViewportWidth: (w: number) => void }).setViewportWidth(w)
afterEach(() => setViewportWidth(1280))

describe('Calendar', () => {
  it('usa o código do catálogo, sobrepondo o do Card em que se apoia', () => {
    renderApp(<Calendar aria-label="Agenda" events={[]} />)
    expect(screen.getByRole('region', { name: 'Agenda' })).toHaveAttribute('data-rendra', 'CAL-001')
  })

  it('navegar de mês troca o mês exibido no cabeçalho', async () => {
    renderApp(<Calendar aria-label="Agenda" events={[]} defaultDate={new Date(2026, 8, 15)} />)
    expect(screen.getByText('Setembro de 2026')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Próximo' }))
    expect(screen.queryByText('Setembro de 2026')).not.toBeInTheDocument()
    expect(screen.getByText('Outubro de 2026')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Anterior' }))
    expect(screen.getByText('Setembro de 2026')).toBeInTheDocument()
  })

  it('selecionar um dia marca ele como selecionado e o valor volta na interface', async () => {
    setViewportWidth(360)
    renderApp(<Calendar aria-label="Agenda" events={[]} defaultDate={new Date(2026, 8, 15)} />)
    const dia20 = screen.getByRole('button', { name: /^20 de setembro/ })
    expect(dia20).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(dia20)
    expect(dia20).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Domingo, 20 de setembro')).toBeInTheDocument()
  })
})
