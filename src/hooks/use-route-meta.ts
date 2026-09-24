import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useBrand } from '@/brand'
import { seoFor } from '@/config/seo'

/**
 * Título da aba e meta description da tela atual, a partir de src/config/seo.ts
 * ("Clientes | Nome do produto"). Usado pelo AppShell e pelo layout de autenticação.
 */
export function useRouteMeta() {
  const { pathname } = useLocation()
  const { brand } = useBrand()
  useEffect(() => {
    const seo = seoFor(pathname)
    document.title = seo ? `${seo.title} | ${brand.productName}` : brand.productName
    if (seo)
      document.querySelector('meta[name="description"]')?.setAttribute('content', seo.description)
  }, [pathname, brand.productName])
}
