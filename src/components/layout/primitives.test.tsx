// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Container, Grid, Inline, Section, Stack } from './primitives'

/*
 * Primitivas de layout: a prop de espaçamento (gap) precisa cair sempre num token nomeado
 * da escala (gap-0, gap-1, gap-2...), nunca num valor arbitrário. O teste confere a classe
 * exata aplicada ao elemento renderizado, não só a ausência de erro.
 */
describe('Primitivas de layout', () => {
  it('Stack aplica a classe do token de espaço (gap), não um valor arbitrário', () => {
    render(
      <Stack gap="8" data-testid="stack">
        <span>Um</span>
      </Stack>,
    )
    expect(screen.getByTestId('stack')).toHaveClass('gap-8')
  })

  it('Inline aplica o token de espaço e o alinhamento pedidos', () => {
    render(
      <Inline gap="2" justify="between" data-testid="inline">
        <span>A</span>
        <span>B</span>
      </Inline>,
    )
    expect(screen.getByTestId('inline')).toHaveClass('gap-2', 'justify-between')
  })

  it('Grid aplica as colunas e o espaço da escala pedidos', () => {
    render(
      <Grid cols={{ base: 2 }} gap="4" data-testid="grid">
        <span>A</span>
      </Grid>,
    )
    expect(screen.getByTestId('grid')).toHaveClass('grid-cols-2', 'gap-4')
  })

  it('Container com padded aplica o respiro de página (16px no celular, 24px a partir do tablet)', () => {
    render(<Container padded data-testid="container" />)
    expect(screen.getByTestId('container')).toHaveClass('py-4', 'md:py-6')
  })

  it('Container sem padded não aplica o respiro vertical', () => {
    render(<Container data-testid="container" />)
    expect(screen.getByTestId('container')).not.toHaveClass('py-4')
  })

  it('Section mostra o título (h2 por padrão) e a descrição', () => {
    render(<Section title="Dados gerais" description="Resumo do cliente" />)
    expect(screen.getByRole('heading', { level: 2, name: 'Dados gerais' })).toBeInTheDocument()
    expect(screen.getByText('Resumo do cliente')).toBeInTheDocument()
  })

  it('Section com level={3} usa h3', () => {
    render(<Section title="Endereço" level={3} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Endereço' })).toBeInTheDocument()
  })
})
