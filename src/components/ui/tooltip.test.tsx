// @vitest-environment jsdom
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Tooltip } from './tooltip'

describe('Tooltip', () => {
  it('mostra o conteúdo ao focar o gatilho e some ao apertar Esc', async () => {
    const user = userEvent.setup()
    renderApp(
      <Tooltip content="Configurações">
        <button type="button">Ícone</button>
      </Tooltip>,
    )
    await user.tab()
    const content = await screen.findByText('Configurações')
    expect(content).toHaveAttribute('data-rendra', 'TIP-001')

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByText('Configurações')).not.toBeInTheDocument())
  })
})
