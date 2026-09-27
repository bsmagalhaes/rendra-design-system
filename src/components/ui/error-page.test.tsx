// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { activeBrand, availableBrands, availablePalettes, BrandProvider } from '@/brand'
import { RendraRouterBridge } from '@/components/rendra-router-bridge'
import { renderApp } from '@/test/render'
import { ErrorPage } from './error-page'

/** Roteador de memória de verdade (react-router), para provar a navegação real. */
function buildRouter(entries: string[], initialIndex = entries.length - 1) {
  return createMemoryRouter(
    [
      {
        element: (
          <RendraRouterBridge>
            <BrandProvider
              brands={availableBrands}
              palettes={availablePalettes}
              defaultBrand={activeBrand}
              forcedMode="light"
            >
              <Outlet />
            </BrandProvider>
          </RendraRouterBridge>
        ),
        children: [
          { path: '/', element: <span>Painel</span> },
          { path: '/pagina-inexistente', element: <ErrorPage code={404} /> },
        ],
      },
    ],
    { initialEntries: entries, initialIndex },
  )
}

describe('ErrorPage', () => {
  it('404 mostra o título e usa o código do catálogo', () => {
    const { container } = renderApp(<ErrorPage code={404} />)
    expect(screen.getByText('Página não encontrada')).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="ERRO-001"]')).toBeInTheDocument()
  })

  it('Voltar navega de fato para a entrada anterior do histórico', async () => {
    const router = buildRouter(['/', '/pagina-inexistente'])
    render(<RouterProvider router={router} />)
    expect(screen.getByText('Página não encontrada')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Voltar' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(await screen.findByText('Painel')).toBeInTheDocument()
  })

  it('o link "Ir para o painel" navega de fato para a rota raiz', async () => {
    const router = buildRouter(['/pagina-inexistente'])
    render(<RouterProvider router={router} />)

    await userEvent.click(screen.getByRole('link', { name: /painel/i }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(await screen.findByText('Painel')).toBeInTheDocument()
  })

  it('500: Tentar de novo mostra o título; o recarregamento entra só como espião complementar', async () => {
    const reload = vi.fn()
    const originalLocation = window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, reload },
    })
    try {
      renderApp(<ErrorPage code={500} />)
      expect(screen.getByText('Algo deu errado do nosso lado')).toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))

      expect(reload).toHaveBeenCalledTimes(1)
    } finally {
      Object.defineProperty(window, 'location', { configurable: true, value: originalLocation })
    }
  })
})
