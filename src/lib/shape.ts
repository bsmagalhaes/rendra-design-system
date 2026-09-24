/**
 * Formato visual do template. Cada template tem o seu, fixo, definido em brand.config.ts:
 *   Safira: square (pedra lapidada)   Equilíbrio: rounded (meio-termo)   Aurora: pill (100% arredondado)
 * Os componentes não recebem formato por prop: usam rounded-control, rounded-surface,
 * rounded-item e rounded-avatar, que obedecem ao formato do template ativo.
 */
export type Shape = 'square' | 'rounded' | 'pill'

export const shapeLabels: Record<Shape, string> = {
  square: 'Quadrado',
  rounded: 'Meio-termo',
  pill: '100% arredondado',
}
