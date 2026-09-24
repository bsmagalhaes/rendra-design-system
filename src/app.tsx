import { createBrowserRouter, RouterProvider } from 'react-router'
import { activeBrand, availableBrands, availablePalettes, BrandProvider } from '@/brand'
import { Toaster } from '@/components/ui/toast'
import { routes } from '@/routes'

const router = createBrowserRouter(routes)

export function App() {
  return (
    <BrandProvider brands={availableBrands} palettes={availablePalettes} defaultBrand={activeBrand}>
      <RouterProvider router={router} />
      <Toaster />
    </BrandProvider>
  )
}
