// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import { PageHeader } from './page-header'

describe('PageHeader', () => {
  it('mostra o título da página e a trilha própria (breadcrumb), usado fora do AppShell', () => {
    renderApp(
      <PageHeader
        title="Detalhe do cliente"
        breadcrumb={[{ label: 'Clientes', to: '/clientes' }, { label: 'Detalhe do cliente' }]}
      />,
    )
    expect(screen.getByRole('heading', { name: 'Detalhe do cliente' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Trilha de navegação' })).toBeInTheDocument()
    expect(screen.getAllByText('Clientes').length).toBeGreaterThan(0)
  })

  it('sem a prop breadcrumb, não mostra a trilha', () => {
    renderApp(<PageHeader title="Painel" />)
    expect(
      screen.queryByRole('navigation', { name: 'Trilha de navegação' }),
    ).not.toBeInTheDocument()
  })

  it('showTitle mostra o título também no corpo da página (fora do sr-only)', () => {
    renderApp(<PageHeader title="Cliente Acme" showTitle />)
    expect(screen.getByRole('heading', { name: 'Cliente Acme' })).not.toHaveClass('sr-only')
  })

  it('sem showTitle (padrão), o título fica só para leitor de tela', () => {
    renderApp(<PageHeader title="Relatório mensal" />)
    expect(screen.getByRole('heading', { name: 'Relatório mensal' })).toHaveClass('sr-only')
  })

  it('fora do AppShell, o ícone de ajuda abre o modal com o conteúdo visível', async () => {
    renderApp(
      <PageHeader title="Relatórios" showTitle help="Estes números já incluem os impostos.">
        Conteúdo abaixo
      </PageHeader>,
    )
    expect(screen.queryByText('Estes números já incluem os impostos.')).not.toBeInTheDocument()
    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Sobre: Relatórios'))
    expect(await screen.findByText('Estes números já incluem os impostos.')).toBeInTheDocument()
  })
})
