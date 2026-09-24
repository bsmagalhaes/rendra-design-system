/**
 * Mapas de classes das primitivas de layout. Classes completas e estáticas,
 * para o Tailwind encontrá-las. Só os degraus da escala permitida.
 */
export type Space =
  '0' | '1' | '2' | '3' | '4' | '6' | '8' | '12' | '16' | '24' | 'section' | 'fields'

export const gapClass: Record<Space, string> = {
  '0': 'gap-0',
  '1': 'gap-1',
  '2': 'gap-2',
  '3': 'gap-3',
  '4': 'gap-4',
  '6': 'gap-6',
  '8': 'gap-8',
  '12': 'gap-12',
  '16': 'gap-16',
  '24': 'gap-24',
  // Espaço entre seções de página: menor no mobile, cheio no desktop.
  section: 'gap-8 md:gap-12',
  // Entre campos de formulário (Field): 16px do fim de um campo ao rótulo do próximo.
  fields: 'gap-x-4 gap-y-4 md:gap-x-6',
}

/**
 * Grade de formulário, pela largura do próprio bloco (container query), não da tela:
 * 1 coluna estreito, 6 colunas a partir de 28rem, 12 colunas a partir de 48rem.
 * No largo, o padrão é 3 campos por linha (md = 4/12). Nunca 2 por linha por padrão.
 */
export const fieldGridClass = 'grid grid-cols-1 @md:grid-cols-6 @3xl:grid-cols-12'

/** Largura do Field na grade de formulário (no largo, em 12 colunas). */
export const fieldSpanClass = {
  /** 2/12, cerca de 17%: UF, número, DDD. */
  xs: '@md:col-span-2 @3xl:col-span-2',
  /** 3/12 = 25%: CEP, CNPJ, CPF, datas curtas. */
  sm: '@md:col-span-2 @3xl:col-span-3',
  /** 4/12 = 33%: o padrão, 3 campos por linha. */
  md: '@md:col-span-3 @3xl:col-span-4',
  /** 6/12 = 50%. */
  lg: '@md:col-span-3 @3xl:col-span-6',
  /** 8/12 = 67%: nome, logradouro longo. */
  xl: '@md:col-span-6 @3xl:col-span-8',
  /** Linha inteira. */
  full: '@md:col-span-6 @3xl:col-span-12',
} as const

export type FieldSpan = keyof typeof fieldSpanClass

export const alignClass = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
} as const

export const justifyClass = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
} as const

export type Align = keyof typeof alignClass
export type Justify = keyof typeof justifyClass
