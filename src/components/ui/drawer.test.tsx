// @vitest-environment jsdom
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { Drawer } from './drawer'

function Harness({ dirty }: { dirty?: boolean }) {
  const [open, setOpen] = useState(true)
  return (
    <>
      <span data-testid="estado">{open ? 'aberto' : 'fechado'}</span>
      <Drawer open={open} onOpenChange={setOpen} title="Novo cliente" dirty={dirty}>
        <p>Campos</p>
      </Drawer>
    </>
  )
}

describe('Drawer', () => {
  it('abre com título e fecha pelo Esc', async () => {
    renderApp(<Harness />)
    expect(screen.getByRole('dialog', { name: 'Novo cliente' })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.getByTestId('estado')).toHaveTextContent('fechado'))
  })

  it('com alterações, pede confirmação antes de descartar', async () => {
    renderApp(<Harness dirty />)
    await userEvent.keyboard('{Escape}')
    expect(await screen.findByRole('dialog', { name: 'Descartar alterações?' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Continuar editando' }))
    expect(screen.getByTestId('estado')).toHaveTextContent('aberto')
    await userEvent.keyboard('{Escape}')
    await userEvent.click(await screen.findByRole('button', { name: 'Descartar' }))
    await waitFor(() => expect(screen.getByTestId('estado')).toHaveTextContent('fechado'))
  })
})
