import type { ComponentType, SVGProps } from 'react'
import type { Shape } from '@/lib/shape'

export type SvgComponent = ComponentType<SVGProps<SVGSVGElement>>

export type FeedbackType = 'success' | 'error' | 'warning' | 'info'

/** Estilo do rótulo dos campos. */
export type LabelStyle = 'discreto' | 'normal'

/** Paleta de cores combinável com qualquer modelo (atributo data-palette no <html>). */
export interface PaletteConfig {
  id: string
  /** Nome curto exibido nos seletores (ex.: "Safira", "Ardósia"). */
  name: string
  /** Logotipo adequado sobre a sidebar desta paleta. */
  sidebarLogo: 'light' | 'dark' | 'auto'
}

export interface BrandConfig {
  /** Identificador usado no atributo data-brand do <html>. */
  id: string
  /** Nome do produto exibido na interface e no título da aba. */
  productName: string
  /** Nome da empresa, usado em rodapés e textos legais. */
  companyName: string
  /** Frase curta usada na tela de login. */
  tagline: string
  logo: {
    /** Logotipo para fundos claros. */
    light: SvgComponent
    /** Logotipo para fundos escuros (sidebar navy, modo escuro). */
    dark: SvgComponent
  }
  /** Símbolo da marca. Precisa usar fill="currentColor" para ser tingido. */
  symbol: SvgComponent
  /** URL do favicon. */
  favicon: string
  /**
   * Ícones de feedback. Por padrão o BrandFeedbackIcon usa o símbolo com um selo de status.
   * Informe um SVG (em currentColor) para substituir o ícone de um tipo específico.
   */
  feedbackIcons?: Partial<Record<FeedbackType, SvgComponent>>
  /** Formato padrão de todos os componentes: square, rounded ou pill. */
  shape: Shape
  /**
   * Estilo do rótulo dos campos (atributo data-label no <html>): discreto (padrão; 11px,
   * maiúsculo, cinza delicado) ou normal (14px, cor do texto).
   */
  labelStyle?: LabelStyle
  /**
   * themed (padrão): o logotipo é montado com o símbolo e as cores da paleta ativa,
   * e acompanha o tema. image: usa os SVGs de logo como estão (arte oficial que não
   * pode ser recolorida).
   */
  logoMode?: 'themed' | 'image'
  /** Qual logotipo usar sobre a sidebar. Sidebar escura pede o logo 'dark'. */
  sidebarLogo: 'light' | 'dark' | 'auto'
}
