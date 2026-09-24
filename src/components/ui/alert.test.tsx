// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { Alert } from './alert'

describe('Alert', () => {
  it('mostra título e descrição', () => {
    renderApp(<Alert type="success" title="Cadastro salvo" description="Já aparece na lista." />)
    expect(screen.getByText('Cadastro salvo')).toBeInTheDocument()
    expect(screen.getByText('Já aparece na lista.')).toBeInTheDocument()
  })

  it('com onDismiss, tem botão de fechar', async () => {
    const onDismiss = vi.fn()
    renderApp(<Alert type="info" title="Novidade" onDismiss={onDismiss} />)
    await userEvent.click(screen.getByRole('button', { name: 'Fechar aviso' }))
    expect(onDismiss).toHaveBeenCalled()
  })

  it('erro é anunciado como alerta', () => {
    renderApp(<Alert type="error" title="Falha ao salvar" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Falha ao salvar')
  })
})
