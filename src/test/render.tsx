import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { activeBrand, availableBrands, availablePalettes, BrandProvider } from '@/brand'
import { RendraRouterBridge } from '@/components/rendra-router-bridge'
import { TooltipProvider } from '@/components/ui/tooltip'

/**
 * Os mesmos provedores que o app monta: rotas (data router, porque o header lê a trilha
 * com `useMatches`, que exige um data router), o RendraProvider ligado a elas, marca e
 * tooltip.
 */
function Providers({ children }: { children: ReactNode }) {
  const router = createMemoryRouter([
    {
      path: '*',
      element: (
        <RendraRouterBridge>
          <BrandProvider
            brands={availableBrands}
            palettes={availablePalettes}
            defaultBrand={activeBrand}
            forcedMode="light"
          >
            <TooltipProvider>{children}</TooltipProvider>
          </BrandProvider>
        </RendraRouterBridge>
      ),
    },
  ])
  return <RouterProvider router={router} />
}

/** render do Testing Library com os provedores do app. */
export function renderApp(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: Providers, ...options })
}
