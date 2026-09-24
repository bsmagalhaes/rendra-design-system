import { createBrowserRouter, RouterProvider } from 'react-router'
import { activeBrand, availableBrands, availablePalettes, BrandProvider } from '@/brand'
import { Toaster } from '@/components/ui/toast'
import { routes } from '@/routes'

// basename acompanha o base do Vite: "/" no desenvolvimento, "/rendra-design-system/" no demo.
const router = createBrowserRouter(routes, {
  basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/',
})

export function App() {
  return (
    <BrandProvider brands={availableBrands} palettes={availablePalettes} defaultBrand={activeBrand}>
      <RouterProvider router={router} />
      <Toaster />
    </BrandProvider>
  )
}
