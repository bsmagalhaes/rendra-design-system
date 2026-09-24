/*
 * TEMPLATE DE EXEMPLO: Rendra Aurora
 * Prova de que a troca de marca não toca em nenhum componente.
 * Para adotá-la como marca ativa, copie este arquivo sobre src/brand/brand.config.ts,
 * copie theme.css sobre src/styles/theme.css (trocando o seletor por :root / .dark)
 * e copie a pasta assets sobre src/brand/assets.
 */
import favicon from './assets/favicon.svg'
import LogoDark from './assets/logo-dark.svg?react'
import LogoLight from './assets/logo-light.svg?react'
import Symbol from './assets/symbol.svg?react'
import type { BrandConfig } from '../../types'

export const brandConfig: BrandConfig = {
  id: 'aurora',
  productName: 'Rendra Aurora',
  companyName: 'Rendra',
  tagline: 'Um novo dia, claro e leve, em cada tela.',
  logo: { light: LogoLight, dark: LogoDark },
  symbol: Symbol,
  favicon,
  shape: 'pill',
  sidebarLogo: 'dark',
  feedbackIcons: {},
}
