// @vitest-environment jsdom
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

describe('PopoverContent', () => {
  it('abre e usa o código do catálogo', async () => {
    renderApp(
      <Popover>
        <PopoverTrigger>Filtros</PopoverTrigger>
        <PopoverContent>Conteúdo do filtro</PopoverContent>
      </Popover>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Filtros' }))
    const content = await screen.findByText('Conteúdo do filtro')
    expect(content.closest('[data-rendra="POP-001"]')).toBeInTheDocument()
  })

  it('fecha com Esc e o conteúdo some da tela', async () => {
    const user = userEvent.setup()
    renderApp(
      <Popover>
        <PopoverTrigger>Filtros</PopoverTrigger>
        <PopoverContent>Conteúdo do filtro</PopoverContent>
      </Popover>,
    )
    await user.click(screen.getByRole('button', { name: 'Filtros' }))
    await screen.findByText('Conteúdo do filtro')

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByText('Conteúdo do filtro')).not.toBeInTheDocument())
  })
})
