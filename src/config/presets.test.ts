import { describe, expect, it } from 'vitest'
import { defaultShellLayout } from './layout'
import { currentModelCode, formatModelCode, parseModelCode } from './presets'

describe('códigos de modelo', () => {
  it('lê o código completo e partes soltas', () => {
    const c = parseModelCode('T1-C4-M5')
    expect([c.theme?.brand, c.color?.palette, c.menu?.layout.navigation]).toEqual([
      'safira',
      'ardosia',
      'topbar',
    ])
    expect(parseModelCode('c3').color?.palette).toBe('aurora')
    expect(parseModelCode('t2 m6').menu?.layout.topbarSubmenu).toBe('mega')
  })
  it('ignora partes que não existem', () => {
    expect(parseModelCode('T9-X1')).toEqual({})
  })
  it('monta o código na ordem tema, cores, menu', () => {
    expect(formatModelCode(parseModelCode('M2 C1 T3'))).toBe('T3-C1-M2')
  })
  it('o padrão do projeto é T1-C1-M1', () => {
    expect(currentModelCode('safira', 'safira', defaultShellLayout)).toBe('T1-C1-M1')
  })
})
