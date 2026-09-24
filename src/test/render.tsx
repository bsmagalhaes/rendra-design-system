import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { activeBrand, availableBrands, availablePalettes, BrandProvider } from '@/brand'
import { TooltipProvider } from '@/components/ui/tooltip'

/** Os mesmos provedores que o app monta: rotas, marca e tooltip. */
function Providers({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <BrandProvider
        brands={availableBrands}
        palettes={availablePalettes}
        defaultBrand={activeBrand}
        forcedMode="light"
      >
        <TooltipProvider>{children}</TooltipProvider>
      </BrandProvider>
    </MemoryRouter>
  )
}

/** render do Testing Library com os provedores do app. */
export function renderApp(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: Providers, ...options })
}
