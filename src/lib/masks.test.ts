import { describe, expect, it } from 'vitest'
import { formatCents, formatCurrency, parseLocaleNumber, toCents, toE164 } from './masks'

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

describe('toCents e formatCents', () => {
  it('converte moeda em centavos inteiros, sem arredondamento de ponto flutuante', () => {
    expect(toCents('R$ 1.250,50')).toBe(125050)
    expect(toCents('R$ 0,10')).toBe(10)
    expect(toCents('R$ 0,1')).toBe(10)
    expect(toCents('R$ 19,99')).toBe(1999)
    expect(toCents('R$ 1.000')).toBe(100000)
    // 0,1 + 0,2 em ponto flutuante dá 0,30000000000000004; em centavos, 30.
    expect((toCents('R$ 0,10') ?? 0) + (toCents('R$ 0,20') ?? 0)).toBe(30)
  })
  it('devolve null quando vazio', () => {
    expect(toCents('')).toBeNull()
    expect(toCents('R$ ')).toBeNull()
  })
  it('volta de centavos para o texto do campo', () => {
    expect(formatCents(125050).replace(/\s/g, ' ')).toBe('R$ 1.250,50')
  })
})
