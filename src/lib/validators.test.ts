import { describe, expect, it } from 'vitest'
import { isValidCnpj, isValidCpf, isValidDateBR, zBR } from './validators'

describe('isValidCpf', () => {
  it('aceita CPF válido com e sem máscara', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true)
    expect(isValidCpf('52998224725')).toBe(true)
  })
  it('recusa dígito verificador errado, tamanho errado e dígitos repetidos', () => {
    expect(isValidCpf('529.982.247-24')).toBe(false)
    expect(isValidCpf('5299822472')).toBe(false)
    expect(isValidCpf('111.111.111-11')).toBe(false)
    expect(isValidCpf('')).toBe(false)
  })
})

describe('isValidCnpj', () => {
  it('aceita CNPJ válido com e sem máscara', () => {
    expect(isValidCnpj('11.222.333/0001-81')).toBe(true)
    expect(isValidCnpj('11222333000181')).toBe(true)
  })
  it('recusa dígito verificador errado e dígitos repetidos', () => {
    expect(isValidCnpj('11.222.333/0001-80')).toBe(false)
    expect(isValidCnpj('00.000.000/0000-00')).toBe(false)
  })
})

describe('isValidDateBR', () => {
  it('aceita datas reais em DD/MM/AAAA', () => {
    expect(isValidDateBR('23/09/2026')).toBe(true)
    expect(isValidDateBR('29/02/2024')).toBe(true)
  })
  it('recusa datas inexistentes e formato errado', () => {
    expect(isValidDateBR('29/02/2026')).toBe(false)
    expect(isValidDateBR('31/04/2026')).toBe(false)
    expect(isValidDateBR('2026-09-23')).toBe(false)
  })
})

describe('zBR', () => {
  it('traz mensagens em português', () => {
    expect(zBR.required('Nome').safeParse('  ').error?.issues[0]?.message).toBe(
      'Nome é obrigatório.',
    )
    expect(zBR.email().safeParse('ana@').error?.issues[0]?.message).toBe('E-mail inválido.')
  })
  it('cpfCnpj escolhe a regra pelo número de dígitos', () => {
    expect(zBR.cpfCnpj().safeParse('529.982.247-25').success).toBe(true)
    expect(zBR.cpfCnpj().safeParse('11.222.333/0001-81').success).toBe(true)
    expect(zBR.cpfCnpj().safeParse('11.222.333/0001-80').success).toBe(false)
  })
  it('telefone aceita fixo e celular', () => {
    expect(zBR.phone().safeParse('(11) 3333-4444').success).toBe(true)
    expect(zBR.phone().safeParse('(11) 93333-4444').success).toBe(true)
    expect(zBR.phone().safeParse('(11) 3333-444').success).toBe(false)
  })
})
