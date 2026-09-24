/*
 * TEMPLATE: Rendra Equilíbrio
 * Formato rounded: nem quadrado, nem 100% arredondado. O símbolo traduz isso:
 * uma forma com dois cantos retos e dois arredondados.
 * Para adotá-lo como template ativo, copie este arquivo sobre src/brand/brand.config.ts,
 * theme.css sobre src/styles/theme.css (trocando o seletor por :root / .dark)
 * e a pasta assets sobre src/brand/assets.
 */
import type { BrandConfig } from '../../types'
import favicon from './assets/favicon.svg'
import LogoDark from './assets/logo-dark.svg?react'
import LogoLight from './assets/logo-light.svg?react'
import Symbol from './assets/symbol.svg?react'

export const brandConfig: BrandConfig = {
  id: 'equilibrio',
  productName: 'Rendra Equilíbrio',
  companyName: 'Rendra',
  tagline: 'O ponto certo entre firmeza e leveza.',
  logo: { light: LogoLight, dark: LogoDark },
  symbol: Symbol,
  favicon,
  shape: 'rounded',
  sidebarLogo: 'dark',
  feedbackIcons: {},
}
