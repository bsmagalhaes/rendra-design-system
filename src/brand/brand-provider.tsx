import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { BrandContext, type BrandContextValue, type ColorMode } from './brand-context'
import type { Shape } from '@/lib/shape'
import type { BrandConfig, PaletteConfig } from './types'

const MODE_KEY = 'ui-mode'
const BRAND_KEY = 'ui-brand'
const PALETTE_KEY = 'ui-palette'

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Armazenamento indisponível (aba anônima, bloqueio): segue só em memória.
  }
}

const darkQuery = '(prefers-color-scheme: dark)'
function subscribeSystem(cb: () => void) {
  const mq = matchMedia(darkQuery)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const getSystemDark = () => matchMedia(darkQuery).matches

interface BrandProviderProps {
  brands: BrandConfig[]
  /** Paletas disponíveis. Padrão: uma por modelo. */
  palettes?: PaletteConfig[]
  defaultBrand: BrandConfig
  children: ReactNode
  /** Força um modo (útil no Storybook e nos testes). */
  forcedMode?: 'light' | 'dark'
  /** Força uma marca pelo id (útil no Storybook e nos testes). */
  forcedBrandId?: string
  /** Força uma paleta pelo id (útil no Storybook). */
  forcedPaletteId?: string
}

export function BrandProvider({
  brands,
  palettes: palettesProp,
  defaultBrand,
  children,
  forcedMode,
  forcedBrandId,
  forcedPaletteId,
}: BrandProviderProps) {
  const [brandId, setBrandIdState] = useState(() => readStorage(BRAND_KEY) ?? defaultBrand.id)
  const [mode, setModeState] = useState<ColorMode>(
    () => (readStorage(MODE_KEY) as ColorMode | null) ?? 'system',
  )
  const [paletteId, setPaletteIdState] = useState<string | null>(() => readStorage(PALETTE_KEY))
  const systemDark = useSyncExternalStore(subscribeSystem, getSystemDark)

  const effectiveBrandId = forcedBrandId ?? brandId
  const brand = brands.find((b) => b.id === effectiveBrandId) ?? defaultBrand
  const shape: Shape = brand.shape
  const palettes = useMemo<PaletteConfig[]>(
    () =>
      palettesProp ??
      brands.map((b) => ({ id: b.id, name: b.productName, sidebarLogo: b.sidebarLogo })),
    [palettesProp, brands],
  )
  const palette = useMemo<PaletteConfig>(
    () =>
      palettes.find((p) => p.id === (forcedPaletteId ?? paletteId)) ??
      palettes.find((p) => p.id === brand.id) ?? {
        id: brand.id,
        name: brand.productName,
        sidebarLogo: brand.sidebarLogo,
      },
    [palettes, forcedPaletteId, paletteId, brand],
  )
  const resolvedMode = forcedMode ?? (mode === 'system' ? (systemDark ? 'dark' : 'light') : mode)

  useEffect(() => {
    const root = document.documentElement
    root.dataset.brand = brand.id
    root.dataset.shape = shape
    root.dataset.label = brand.labelStyle ?? 'discreto'
    root.dataset.palette = palette.id
    root.classList.toggle('dark', resolvedMode === 'dark')
    // O título da aba vem de useRouteMeta (tela | produto).
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = brand.favicon
  }, [brand, palette, resolvedMode, shape])

  const value = useMemo<BrandContextValue>(
    () => ({
      brand,
      brands,
      resolvedMode,
      mode,
      shape,
      palette,
      palettes,
      sidebarLogoVariant:
        palette.sidebarLogo === 'auto'
          ? resolvedMode === 'dark'
            ? 'dark'
            : 'light'
          : palette.sidebarLogo,
      setPaletteId: (id) => {
        setPaletteIdState(id)
        try {
          if (id) localStorage.setItem(PALETTE_KEY, id)
          else localStorage.removeItem(PALETTE_KEY)
        } catch {
          // segue só em memória
        }
      },
      setMode: (next) => {
        setModeState(next)
        writeStorage(MODE_KEY, next)
      },
      // Trocar de modelo volta às cores do próprio modelo.
      setBrandId: (id) => {
        setBrandIdState(id)
        writeStorage(BRAND_KEY, id)
        setPaletteIdState(null)
        try {
          localStorage.removeItem(PALETTE_KEY)
        } catch {
          // segue só em memória
        }
      },
    }),
    [brand, brands, palette, palettes, mode, resolvedMode, shape],
  )

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
}
