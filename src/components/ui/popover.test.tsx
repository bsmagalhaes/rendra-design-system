// @vitest-environment jsdom
import { screen } from '@testing-library/react'
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
})
