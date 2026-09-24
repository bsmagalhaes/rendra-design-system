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
