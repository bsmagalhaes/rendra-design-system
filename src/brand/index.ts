import type { BrandConfig, PaletteConfig } from './types'
import { brandConfig } from './brand.config'
// Templates alternativos, carregados juntos só para demonstrar a troca. Em um projeto
// derivado, remova a pasta examples e os @import correspondentes em src/styles/globals.css.
import { brandConfig as auroraBrand } from './examples/aurora/brand.config'
import { brandConfig as equilibrioBrand } from './examples/equilibrio/brand.config'

export const activeBrand: BrandConfig = brandConfig
export const availableBrands: BrandConfig[] = [brandConfig, equilibrioBrand, auroraBrand]

/**
 * Paletas: a de cada modelo e as avulsas (só cores, em src/brand/palettes).
 * Paleta avulsa nova: crie o CSS em src/brand/palettes, importe em globals.css e liste aqui.
 */
export const availablePalettes: PaletteConfig[] = [
  ...availableBrands.map((b) => ({
    id: b.id,
    name: b.productName.replace('Rendra ', ''),
    sidebarLogo: b.sidebarLogo,
  })),
  { id: 'ardosia', name: 'Ardósia', sidebarLogo: 'dark' },
]

export type { BrandConfig, FeedbackType, PaletteConfig, SvgComponent } from './types'
export { BrandProvider } from './brand-provider'
export { useBrand } from './use-brand'
