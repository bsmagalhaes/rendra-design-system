import { useContext } from 'react'
import { BrandContext } from './brand-context'

export function useBrand() {
  const ctx = useContext(BrandContext)
  if (!ctx) throw new Error('useBrand precisa estar dentro de <BrandProvider>.')
  return ctx
}
