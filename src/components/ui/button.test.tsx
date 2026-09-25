// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { Button } from './button'

describe('Button', () => {
  it('clica e chama a ação', async () => {
    const onClick = vi.fn()
    renderApp(<Button onClick={onClick}>Salvar</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('carregando: bloqueia o clique e avisa leitores de tela', async () => {
    const onClick = vi.fn()
    renderApp(
      <Button loading onClick={onClick}>
        Salvar
      </Button>,
    )
    const button = screen.getByRole('button', { name: /Salvar/ })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('só ícone tem o nome acessível do aria-label', () => {
    renderApp(<Button iconOnly aria-label="Excluir" icon={<svg />} />)
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument()
  })

  it('data-rendra muda com a variante (catálogo de componentes)', () => {
    const { rerender } = renderApp(<Button>Salvar</Button>)
    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveAttribute('data-rendra', 'BTN-001')
    rerender(<Button variant="destructive">Excluir</Button>)
    expect(screen.getByRole('button', { name: 'Excluir' })).toHaveAttribute(
      'data-rendra',
      'BTN-005',
    )
  })
})
