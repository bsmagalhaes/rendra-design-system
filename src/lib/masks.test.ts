import { describe, expect, it } from 'vitest'
import { formatCurrency, parseLocaleNumber, toE164 } from './masks'

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

describe('toE164', () => {
  it('junta DDI e número no padrão internacional', () => {
    expect(toE164('55', '(11) 91234-5678')).toBe('+5511912345678')
    expect(toE164('351', '912 345 678')).toBe('+351912345678')
  })
  it('devolve vazio sem número', () => {
    expect(toE164('55', '')).toBe('')
  })
})
