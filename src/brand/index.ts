import type { BrandConfig, PaletteConfig } from './types'
import { brandConfig } from './brand.config'
import { createPalette } from './palette'
import { paletteSeeds } from './palettes'
// Templates alternativos, carregados juntos só para demonstrar a troca. Em um projeto
// derivado, remova a pasta examples e os @import correspondentes em src/styles/globals.css.
import { brandConfig as auroraBrand } from './examples/aurora/brand.config'
import { brandConfig as equilibrioBrand } from './examples/equilibrio/brand.config'

export const activeBrand: BrandConfig = brandConfig
export const availableBrands: BrandConfig[] = [brandConfig, equilibrioBrand, auroraBrand]

/**
 * Paletas prontas: geradas das sementes de src/brand/palettes.ts (4 cores e o degradê).
 * Paleta nova: acrescente as sementes lá e rode `npm run palettes:build`.
 * Paleta de cliente em tempo de execução (white label): applyPalette(sementes).
 */
export const availablePalettes: PaletteConfig[] = paletteSeeds.map((s) => ({
  id: s.id,
  name: s.name,
  sidebarLogo: createPalette(s).sidebarLogo,
}))

export type { BrandConfig, FeedbackType, PaletteConfig, SvgComponent } from './types'
export { applyPalette, contrast, createPalette, type PaletteSeeds } from './palette'
export { paletteSeeds } from './palettes'
export { BrandProvider } from './brand-provider'
export { useBrand } from './use-brand'
export {
  createTheme,
  TOKEN_KEYS,
  type ThemeMode,
  type ThemeSeedInput,
  type ThemeSemanticTokens,
  type ThemeExplicitInput,
  type ThemeInput,
  type ThemeContrastCheck,
  type ThemeAdjustment,
  type ThemeResult,
} from './theme'
export { applyTheme, type ApplyThemeOptions } from './apply-theme'
