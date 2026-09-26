// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Tooltip } from './tooltip'

describe('Tooltip', () => {
  it('mostra o conteúdo ao focar o gatilho e usa o código do catálogo', async () => {
    renderApp(
      <Tooltip content="Configurações">
        <button type="button">Ícone</button>
      </Tooltip>,
    )
    await userEvent.tab()
    const content = await screen.findByText('Configurações')
    expect(content).toHaveAttribute('data-rendra', 'TIP-001')
  })
})
