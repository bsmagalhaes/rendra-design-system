import { describe, expect, it } from 'vitest'
import { formatCurrency, parseLocaleNumber } from './masks'

describe('parseLocaleNumber', () => {
  it('converte valores mascarados em número', () => {
    expect(parseLocaleNumber('R$ 1.250,00')).toBe(1250)
    expect(parseLocaleNumber('12,5 %')).toBe(12.5)
    expect(parseLocaleNumber('R$ 0,99')).toBe(0.99)
  })
  it('devolve null quando não há número', () => {
    expect(parseLocaleNumber('')).toBeNull()
    expect(parseLocaleNumber('R$ ')).toBeNull()
  })
})

describe('formatCurrency', () => {
  it('formata no padrão brasileiro', () => {
    // O Intl usa espaço não separável entre "R$" e o valor.
    expect(formatCurrency(1250).replace(/\s/g, ' ')).toBe('R$ 1.250,00')
  })
})
