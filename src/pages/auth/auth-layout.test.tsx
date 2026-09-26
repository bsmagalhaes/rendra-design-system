// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { AuthLayout } from './auth-layout'

/* Etapa 1.3.0-alpha.1 do plano da v2: crédito "Feito com Rendra" no rodapé do login. */
describe('AuthLayout: crédito no rodapé', () => {
  it('com credit omitido, mostra o crédito padrão', () => {
    renderApp(
      <AuthLayout title="Entrar">
        <p>formulário</p>
      </AuthLayout>,
    )
    const link = screen.getByRole('link', { name: /Feito com Rendra/ })
    expect(link).toHaveAttribute('href', 'https://github.com/bsmagalhaes/rendra-design-system')
    expect(link).toHaveAttribute('data-rendra', 'CRED-001')
  })

  it('com credit={false}, não mostra o crédito', () => {
    renderApp(
      <AuthLayout title="Entrar" credit={false}>
        <p>formulário</p>
      </AuthLayout>,
    )
    expect(screen.queryByRole('link', { name: /Feito com Rendra/ })).not.toBeInTheDocument()
    expect(document.querySelector('[data-rendra="CRED-001"]')).toBeNull()
  })

  it('com creditText e creditHref, usa o texto e o link informados, não o padrão', () => {
    renderApp(
      <AuthLayout title="Entrar" creditText="Feito pela Acme" creditHref="https://acme.com.br">
        <p>formulário</p>
      </AuthLayout>,
    )
    expect(screen.getByRole('link', { name: /Feito pela Acme/ })).toHaveAttribute(
      'href',
      'https://acme.com.br',
    )
    expect(screen.queryByText('Feito com Rendra')).not.toBeInTheDocument()
  })

  it('o crédito fica depois do rodapé do formulário, no fim da coluna', () => {
    renderApp(
      <AuthLayout title="Entrar" footer={<span>Não tem conta?</span>}>
        <p>formulário</p>
      </AuthLayout>,
    )
    const footer = screen.getByText('Não tem conta?')
    const credit = screen.getByRole('link', { name: /Feito com Rendra/ })
    expect(footer.compareDocumentPosition(credit) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
