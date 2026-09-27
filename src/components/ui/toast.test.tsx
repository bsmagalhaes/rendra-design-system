// @vitest-environment jsdom
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import { toast, Toaster } from './toast'

/*
 * O toast só existe no DOM quando o Sonner o desenha, de forma assíncrona, dentro do portal
 * do <Toaster />. Por isso os testes esperam o texto aparecer (findByText) antes de afirmar
 * qualquer efeito.
 */
describe('toast', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('mostrar um toast exibe o texto na tela, com o código do catálogo', async () => {
    renderApp(<Toaster />)
    toast.success('Cliente salvo')
    const message = await screen.findByText('Cliente salvo')
    expect(message.closest('[data-rendra="TST-001"]')).toBeInTheDocument()
  })

  it('clicar no botão de ação fecha o toast e ele some da tela', async () => {
    const user = userEvent.setup()
    renderApp(<Toaster />)
    toast.info('Arquivado', { action: { label: 'Desfazer', onClick: () => {} } })
    await screen.findByText('Arquivado')
    await user.click(screen.getByRole('button', { name: 'Desfazer' }))
    await waitFor(() => expect(screen.queryByText('Arquivado')).not.toBeInTheDocument())
  })

  it('passado o tempo de auto-dismiss, o toast some sozinho', async () => {
    // Só o relógio dos timers é falso: o Sonner usa requestAnimationFrame para montar o
    // portal, e isso precisa continuar real para o toast aparecer.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    renderApp(<Toaster />)
    toast.success('Some sozinho', { duration: 100 })
    // O Sonner desenha o toast num setTimeout(0) próprio, para não perder a atualização
    // numa mesma leva de render; sem avançar isso, o texto nunca chega a aparecer.
    act(() => {
      vi.advanceTimersByTime(0)
    })
    expect(screen.getByText('Some sozinho')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(screen.queryByText('Some sozinho')).not.toBeInTheDocument()
  })

  it('a variante muda o ícone mostrado, não só a classe', async () => {
    renderApp(<Toaster />)
    toast.success('Deu certo')
    toast.error('Deu errado')
    const sucesso = (await screen.findByText('Deu certo')).closest('[role="status"]')
    const erro = (await screen.findByText('Deu errado')).closest('[role="alert"]')
    expect(sucesso).toBeInTheDocument()
    expect(erro).toBeInTheDocument()
    const dSucesso = sucesso!.querySelector('.bg-success path')?.getAttribute('d')
    const dErro = erro!.querySelector('.bg-destructive path')?.getAttribute('d')
    expect(dSucesso).toBe('M3 6.2 5.1 8.2 9 4')
    expect(dErro).toBe('M4 4l4 4M8 4 4 8')
  })
})
