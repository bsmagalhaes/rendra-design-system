/*
 * MÓDULO PÚBLICO DE MARCA (pacote)
 * --------------------------------
 * Reexporta só a API de marca reutilizável fora deste boilerplate: o provider, o hook,
 * o gerador de paleta (4 cores e degradê -> paleta completa com AA) e o gerador de tema.
 * Não reexporta `activeBrand`, `availableBrands`, `availablePalettes`, `paletteSeeds`, nem
 * nada de `brand.config.ts` ou `src/brand/examples`: isso é a marca de demonstração deste
 * repositório (Rendra Safira, Equilíbrio e Aurora), nunca o contrato do pacote. Quem
 * consome o pacote monta a própria marca a partir de `BrandConfig` e aplica com
 * `<BrandProvider>`, `applyPalette()` ou `applyTheme()`.
 *
 * Este módulo entra na entrada principal do pacote (src/index.ts); não tem subcaminho
 * próprio.
 */
export type { BrandConfig, FeedbackType, PaletteConfig, SvgComponent } from './types'
export { applyPalette, contrast, createPalette, type PaletteSeeds } from './palette'
export { BrandProvider, type BrandStorage } from './brand-provider'
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
