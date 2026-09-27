// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { ActionBar } from './action-bar'

describe('ActionBar', () => {
  it('com uma ação, o botão ocupa 100% da largura (grid-cols-1) e chama onClick', async () => {
    const onClick = vi.fn()
    const { container } = renderApp(<ActionBar primary={{ label: 'Salvar', onClick }} />)
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    const bar = container.querySelector('[data-rendra="ACB-001"]') as HTMLElement
    expect(bar).toBeInTheDocument()
    expect(bar.querySelector('.grid')).toHaveClass('grid-cols-1')
  })

  it('com duas ações, a grade reparte 30% e 70% (grid-actions-2)', () => {
    const { container } = renderApp(
      <ActionBar primary={{ label: 'Salvar' }} cancel={{ label: 'Cancelar' }} />,
    )
    const bar = container.querySelector('[data-rendra="ACB-001"]') as HTMLElement
    expect(bar.querySelector('.grid')).toHaveClass('grid-actions-2')
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
  })

  it('com três ou mais ações, as excedentes só existem depois de abrir o menu', async () => {
    renderApp(
      <ActionBar
        primary={{ label: 'Salvar' }}
        cancel={{ label: 'Cancelar' }}
        secondary={[{ label: 'Duplicar' }, { label: 'Excluir' }]}
      />,
    )
    expect(screen.queryByText('Duplicar')).not.toBeInTheDocument()
    expect(screen.queryByText('Excluir')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Mais ações' }))

    expect(await screen.findByRole('menuitem', { name: 'Duplicar' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Excluir' })).toBeInTheDocument()
  })
})
