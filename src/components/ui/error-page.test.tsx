// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { activeBrand, availableBrands, availablePalettes, BrandProvider } from '@/brand'
import { RendraProvider, type RendraLinkProps } from '@/components/rendra-provider'
import { renderApp } from '@/test/render'
import { ErrorPage } from './error-page'

/** Link falso, sem react-router: prova que o ErrorPage só depende do RendraProvider. */
function FakeLink({ to, children }: RendraLinkProps) {
  return <a href={`fake:${to}`}>{children}</a>
}

describe('ErrorPage', () => {
  it('404 usa o código do catálogo', () => {
    const { container } = renderApp(<ErrorPage code={404} />)
    expect(screen.getByText('Página não encontrada')).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="ERRO-001"]')).toBeInTheDocument()
  })

  it('sem react-router: Voltar chama goBack e o link usa o linkComponent', async () => {
    const goBack = vi.fn()
    render(
      <BrandProvider
        brands={availableBrands}
        palettes={availablePalettes}
        defaultBrand={activeBrand}
        forcedMode="light"
      >
        <RendraProvider
          linkComponent={FakeLink}
          useCurrentPath={() => '/pagina-inexistente'}
          navigate={() => {}}
          goBack={goBack}
        >
          <ErrorPage code={404} />
        </RendraProvider>
      </BrandProvider>,
    )
    expect(screen.getByRole('link', { name: /painel/i })).toHaveAttribute('href', 'fake:/')
    await userEvent.click(screen.getByRole('button', { name: 'Voltar' }))
    expect(goBack).toHaveBeenCalledTimes(1)
  })
})
