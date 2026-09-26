/*
 * CONFIGURAÇÃO DA MARCA (arquivo 2 de 2 da marca)
 * -----------------------------------------------
 * Nome, logotipos, símbolo e ícones de feedback. Nenhum componente importa SVG de marca
 * diretamente: todos leem daqui, via useBrand().
 */
import favicon from './assets/favicon.svg'
import LogoDark from './assets/logo-dark.svg?react'
import LogoLight from './assets/logo-light.svg?react'
import Symbol from './assets/symbol.svg?react'
import type { BrandConfig } from './types'

export const brandConfig: BrandConfig = {
  id: 'safira',
  productName: 'Rendra Safira',
  companyName: 'Rendra',
  tagline: 'Precisão lapidada em cada tela.',
  logo: { light: LogoLight, dark: LogoDark },
  symbol: Symbol,
  favicon,
  shape: 'square',
  // Rótulo dos campos: 'discreto' (maiúsculo, cinza) ou 'normal' (tamanho e cor do texto).
  labelStyle: 'discreto',
  sidebarLogo: 'dark',
  feedbackIcons: {},
}
