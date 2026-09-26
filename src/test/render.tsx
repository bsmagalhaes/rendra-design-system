import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { activeBrand, availableBrands, availablePalettes, BrandProvider } from '@/brand'
import { RendraRouterBridge } from '@/components/rendra-router-bridge'
import { TooltipProvider } from '@/components/ui/tooltip'

/** Os mesmos provedores que o app monta: rotas, o RendraProvider ligado a elas, marca e tooltip. */
function Providers({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
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
    </MemoryRouter>
  )
}

/** render do Testing Library com os provedores do app. */
export function renderApp(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: Providers, ...options })
}
