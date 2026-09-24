import { createContext } from 'react'
import type { Shape } from '@/lib/shape'
import type { BrandConfig, PaletteConfig } from './types'

export type ColorMode = 'light' | 'dark' | 'system'

export interface BrandContextValue {
  brand: BrandConfig
  brands: BrandConfig[]
  setBrandId: (id: string) => void
  mode: ColorMode
  resolvedMode: 'light' | 'dark'
  setMode: (mode: ColorMode) => void
  /** Formato do template ativo (fixo por template). */
  shape: Shape
  /** Paleta de cores em uso (por padrão, a do próprio modelo). */
  palette: PaletteConfig
  palettes: PaletteConfig[]
  /** Usa a paleta de outro template; null volta às cores do próprio modelo. */
  setPaletteId: (id: string | null) => void
  /** Logotipo adequado para a sidebar com a paleta atual. */
  sidebarLogoVariant: 'light' | 'dark'
}

export const BrandContext = createContext<BrandContextValue | null>(null)
