// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { Tabs } from './tabs'

const items = [
  { value: 'dados', label: 'Dados', content: <p>Conteúdo dos dados</p> },
  { value: 'contratos', label: 'Contratos', count: 3, content: <p>Lista de contratos</p> },
]

describe('Tabs', () => {
  it('troca o conteúdo ao escolher a aba', async () => {
    const onChange = vi.fn()
    const { container } = renderApp(<Tabs aria-label="Cliente" items={items} onChange={onChange} />)
    expect(screen.getByText('Conteúdo dos dados')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('tab', { name: /Contratos/ }))
    expect(onChange).toHaveBeenCalledWith('contratos')
    expect(screen.getByText('Lista de contratos')).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="ABA-001"]')).toBeInTheDocument()
  })

  it('variant="pill" usa o código de catálogo ABA-002', () => {
    const { container } = renderApp(<Tabs aria-label="Cliente" items={items} variant="pill" />)
    expect(container.querySelector('[data-rendra="ABA-002"]')).toBeInTheDocument()
  })

  it('setas do teclado passam de aba', async () => {
    renderApp(<Tabs aria-label="Cliente" items={items} />)
    await userEvent.click(screen.getByRole('tab', { name: /Dados/ }))
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: /Contratos/ })).toHaveFocus()
  })
})
