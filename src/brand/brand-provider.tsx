import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { applyTheme } from './apply-theme'
import { BrandContext, type BrandContextValue, type ColorMode } from './brand-context'
import type { ThemeResult } from './theme'
import type { Shape } from '@/lib/shape'
import type { BrandConfig, PaletteConfig } from './types'

const MODE_KEY = 'ui-mode'
const BRAND_KEY = 'ui-brand'
const PALETTE_KEY = 'ui-palette'

/**
 * Armazenamento plugável (C5, docs/specs/v2-plano.md seção 2.6/4.2): get/set simples, para
 * trocar o localStorage padrão por outra fonte (cookie, backend...), ou desligar com `false`.
 */
export interface BrandStorage {
  get(key: string): string | null
  set(key: string, value: string): void
}

const localStorageAdapter: BrandStorage = {
  get(key) {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value)
    } catch {
      // Armazenamento indisponível (aba anônima, bloqueio): segue só em memória.
    }
  },
}

const noopStorage: BrandStorage = { get: () => null, set: () => {} }

function resolveStorage(storage: BrandStorage | false | undefined): BrandStorage {
  if (storage === false) return noopStorage
  return storage ?? localStorageAdapter
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
  /**
   * Tema aplicado em tempo de execução (resultado de createTheme, C5). Aplica sem exigir um id
   * cadastrado em palettes.ts: o data-palette (ou data-rendra-root, com `target`) recebe o id
   * do próprio tema.
   */
  theme?: ThemeResult
  /** Força um modo (útil no Storybook e nos testes). */
  forcedMode?: 'light' | 'dark'
  /** Força uma marca pelo id (útil no Storybook e nos testes). */
  forcedBrandId?: string
  /** Força uma paleta pelo id (útil no Storybook). */
  forcedPaletteId?: string
  /** Modo controlado; sem esta prop, o provider guarda o próprio estado (comportamento de hoje). */
  mode?: ColorMode
  onModeChange?(mode: ColorMode): void
  /** Marca controlada; sem esta prop, o provider guarda o próprio estado. */
  brandId?: string
  onBrandIdChange?(id: string): void
  /** Paleta controlada (null volta às cores do próprio modelo); sem esta prop, estado próprio. */
  paletteId?: string | null
  onPaletteIdChange?(id: string | null): void
  /** Armazenamento da preferência; false desliga a persistência. Padrão: localStorage. */
  storage?: BrandStorage | false
  /** Contêiner onde a marca é aplicada (data-*, tema). Padrão: document.documentElement. */
  target?: HTMLElement
}

export function BrandProvider({
  brands,
  palettes: palettesProp,
  defaultBrand,
  children,
  theme,
  forcedMode,
  forcedBrandId,
  forcedPaletteId,
  mode: modeProp,
  onModeChange,
  brandId: brandIdProp,
  onBrandIdChange,
  paletteId: paletteIdProp,
  onPaletteIdChange,
  storage: storageProp,
  target,
}: BrandProviderProps) {
  const storage = useMemo(() => resolveStorage(storageProp), [storageProp])
  const brandControlled = brandIdProp !== undefined
  const modeControlled = modeProp !== undefined
  const paletteControlled = paletteIdProp !== undefined

  const [brandIdState, setBrandIdState] = useState(
    () => brandIdProp ?? storage.get(BRAND_KEY) ?? defaultBrand.id,
  )
  const [modeState, setModeState] = useState<ColorMode>(
    () => modeProp ?? (storage.get(MODE_KEY) as ColorMode | null) ?? 'system',
  )
  const [paletteIdState, setPaletteIdState] = useState<string | null>(
    () => paletteIdProp ?? storage.get(PALETTE_KEY) ?? null,
  )
  const systemDark = useSyncExternalStore(subscribeSystem, getSystemDark)

  const brandId = brandControlled ? brandIdProp! : brandIdState
  const mode = modeControlled ? modeProp! : modeState
  const paletteId = paletteControlled ? (paletteIdProp ?? null) : paletteIdState

  const effectiveBrandId = forcedBrandId ?? brandId
  const brand = brands.find((b) => b.id === effectiveBrandId) ?? defaultBrand
  const shape: Shape = brand.shape
  const palettes = useMemo<PaletteConfig[]>(
    () =>
      palettesProp ??
      brands.map((b) => ({ id: b.id, name: b.productName, sidebarLogo: b.sidebarLogo })),
    [palettesProp, brands],
  )
  // Tema em tempo de execução (C5): quando informado, dita a paleta ativa, sem precisar estar
  // cadastrado em palettes.ts (fallback documentado para paletteId desconhecido, abaixo).
  const themePalette = useMemo<PaletteConfig | null>(
    () => (theme ? { id: theme.id, name: theme.name, sidebarLogo: theme.sidebarLogo } : null),
    [theme],
  )
  const palette = useMemo<PaletteConfig>(() => {
    if (themePalette) return themePalette
    return (
      palettes.find((p) => p.id === (forcedPaletteId ?? paletteId)) ??
      palettes.find((p) => p.id === brand.id) ?? {
        id: brand.id,
        name: brand.productName,
        sidebarLogo: brand.sidebarLogo,
      }
    )
  }, [themePalette, palettes, forcedPaletteId, paletteId, brand])
  const resolvedMode = forcedMode ?? (mode === 'system' ? (systemDark ? 'dark' : 'light') : mode)

  useEffect(() => {
    const root = target ?? document.documentElement
    root.dataset.brand = brand.id
    root.dataset.shape = shape
    root.dataset.label = brand.labelStyle ?? 'discreto'
    root.dataset.palette = palette.id
    root.classList.toggle('dark', resolvedMode === 'dark')
    // O favicon é do documento inteiro: só faz sentido quando aplicado à raiz de verdade.
    if (root === document.documentElement) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = brand.favicon
      // O título da aba vem de useRouteMeta (tela | produto).
    }
  }, [brand, palette, resolvedMode, shape, target])

  // Tema em tempo de execução (C5): injeta/atualiza o <style> do tema sempre que ele mudar.
  useEffect(() => {
    if (!theme) return
    applyTheme(theme, { target })
  }, [theme, target])

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
        if (!paletteControlled) setPaletteIdState(id)
        storage.set(PALETTE_KEY, id ?? '')
        onPaletteIdChange?.(id)
      },
      setMode: (next) => {
        if (!modeControlled) setModeState(next)
        storage.set(MODE_KEY, next)
        onModeChange?.(next)
      },
      // Trocar de modelo volta às cores do próprio modelo. No modo controlado (paletteId
      // informado), quem decide se a paleta some é o dono do estado: aqui só se notifica via
      // onPaletteIdChange, nunca se zera o estado por conta própria.
      setBrandId: (id) => {
        if (!brandControlled) setBrandIdState(id)
        storage.set(BRAND_KEY, id)
        onBrandIdChange?.(id)
        if (!paletteControlled) setPaletteIdState(null)
        storage.set(PALETTE_KEY, '')
        onPaletteIdChange?.(null)
      },
    }),
    [
      brand,
      brands,
      palette,
      palettes,
      mode,
      resolvedMode,
      shape,
      storage,
      brandControlled,
      modeControlled,
      paletteControlled,
      onModeChange,
      onBrandIdChange,
      onPaletteIdChange,
    ],
  )

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
}
