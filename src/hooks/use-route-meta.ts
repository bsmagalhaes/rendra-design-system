import { useEffect } from 'react'
import { useBrand } from '@/brand'
import { useCurrentPath } from '@/components/rendra-provider'
import { seoFor } from '@/config/seo'

/**
 * Título da aba e meta description da tela atual, a partir de src/config/seo.ts
 * ("Clientes | Nome do produto"). Usado pelo AppShell e pelo layout de autenticação.
 * Lê o caminho pelo RendraProvider (useCurrentPath), nunca por `react-router` direto.
 */
export function useRouteMeta() {
  const pathname = useCurrentPath()
  const { brand } = useBrand()
  useEffect(() => {
    const seo = seoFor(pathname)
    document.title = seo ? `${seo.title} | ${brand.productName}` : brand.productName
    if (seo)
      document.querySelector('meta[name="description"]')?.setAttribute('content', seo.description)
  }, [pathname, brand.productName])
}
