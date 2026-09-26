import { describe, expect, it } from 'vitest'
import { createPalette } from './palette'
import { paletteSeeds } from './palettes'
import { createTheme, tryParseColorToHex, type ThemeInput } from './theme'

/*
 * createTheme (Parte B, C5, docs/specs/v2-plano.md seções 2.6, 4.2 e as correções da 6.4):
 * três modos (gerado, explícito, misto), função pura, já emitindo --rendra-*.
 */

const safira = paletteSeeds.find((s) => s.id === 'safira')!
const ardosia = paletteSeeds.find((s) => s.id === 'ardosia')!

describe('createTheme, modo gerado', () => {
  it('tem paridade com createPalette para a mesma semente (mesmas variáveis --rendra-*)', () => {
    const palette = createPalette(safira)
    const theme = createTheme({
      id: safira.id,
      name: safira.name,
      mode: 'gerado',
      seed: {
        primary: safira.primary,
        primaryHover: safira.primaryHover,
        secondary: safira.secondary,
        secondaryHover: safira.secondaryHover,
        gradient: safira.gradient,
      },
    })
    expect(theme.vars.light).toEqual(palette.light)
    expect(theme.vars.dark).toEqual(palette.dark)
    expect(theme.sidebarLogo).toBe(palette.sidebarLogo)
    expect(theme.id).toBe('safira')
    expect(theme.name).toBe('Safira')
  })

  it('relata os pares de contraste conferidos, todos aprovados (createPalette já garante AA)', () => {
    const theme = createTheme({
      id: safira.id,
      name: safira.name,
      mode: 'gerado',
      seed: {
        primary: safira.primary,
        primaryHover: safira.primaryHover,
        secondary: safira.secondary,
        secondaryHover: safira.secondaryHover,
        gradient: safira.gradient,
      },
    })
    expect(theme.report.length).toBeGreaterThan(0)
    for (const check of theme.report) {
      expect(check.passesAA).toBe(true)
      expect(check.ratio).toBeGreaterThanOrEqual(4.5)
      expect(check.token).toMatch(/^--rendra-/)
    }
  })

  it('inclui os ajustes feitos na semente, no claro e no escuro (hoje descartados no escuro)', () => {
    const theme = createTheme({
      id: ardosia.id,
      name: ardosia.name,
      mode: 'gerado',
      seed: {
        primary: ardosia.primary,
        primaryHover: ardosia.primaryHover,
        secondary: ardosia.secondary,
        secondaryHover: ardosia.secondaryHover,
        gradient: ardosia.gradient,
        onSecondary: ardosia.onSecondary,
      },
    })
    const modes = new Set(theme.adjustments.map((a) => a.mode))
    expect(theme.adjustments.length).toBeGreaterThan(0)
    expect(modes.has('light')).toBe(true)
    expect(modes.has('dark')).toBe(true)
    for (const adj of theme.adjustments) {
      expect(adj.requested).toMatch(/^#[0-9a-f]{6}$/)
      expect(adj.applied).toMatch(/^#[0-9a-f]{6}$/)
      expect(adj.requested).not.toBe(adj.applied)
    }
  })

  it('exige seed no modo gerado', () => {
    expect(() => createTheme({ id: 'x', name: 'X', mode: 'gerado' })).toThrow(/seed/)
  })

  it('semente inválida lança "Cor inválida", com o rótulo do campo e o valor recebido', () => {
    expect(() =>
      createTheme({
        id: 'x',
        name: 'X',
        mode: 'gerado',
        seed: {
          primary: 'azul-marinho', // não é hex, rgb(), hsl() nem tripleta HSL
          secondary: safira.secondary,
          gradient: safira.gradient,
        },
      }),
    ).toThrow('Cor inválida em seed.primary: azul-marinho (use hex, rgb(), hsl() ou "H S% L%")')
  })
})

describe('createTheme, modo explícito', () => {
  const input: ThemeInput = {
    id: 'cliente',
    name: 'Cliente',
    mode: 'explicito',
    explicit: {
      light: {
        primary: '#7a1fa2',
        primaryForeground: '#ffffff',
        primaryHover: '#5e1780',
        primaryHoverForeground: '#ffffff',
        secondary: '#f2994a',
        secondaryForeground: '#2a1702',
        sidebar: '#2e0b40',
        sidebarForeground: '#ffffff',
      },
    },
  }

  it('não recalcula nenhum valor informado (traduz para --rendra-*, sem alterar a cor)', () => {
    const theme = createTheme(input)
    expect(theme.vars.light['--rendra-primary']).toBe('#7a1fa2')
    expect(theme.vars.light['--rendra-primary-foreground']).toBe('#ffffff')
    expect(theme.vars.light['--rendra-secondary']).toBe('#f2994a')
    expect(theme.vars.light['--rendra-sidebar']).toBe('#2e0b40')
  })

  it('relata contraste sem ajustar por padrão (enforceContrast false)', () => {
    // secondary #f2994a com texto #2a1702 (escuro) passa AA; um par que falhe é o teste seguinte.
    const theme = createTheme(input)
    const secondaryCheck = theme.report.find((r) => r.token === '--rendra-secondary')
    expect(secondaryCheck?.passesAA).toBe(true)
  })

  it('acusa um par que falha AA e aprova outro que passa, sem enforceContrast', () => {
    const theme = createTheme({
      id: 'falha',
      name: 'Falha',
      mode: 'explicito',
      explicit: {
        light: {
          // Amarelo claro com texto branco: falha AA de propósito.
          primary: '#f5e642',
          primaryForeground: '#ffffff',
          // Azul escuro com texto branco: passa AA.
          secondary: '#0b1d37',
          secondaryForeground: '#ffffff',
        },
      },
    })
    const primaryCheck = theme.report.find((r) => r.token === '--rendra-primary')
    const secondaryCheck = theme.report.find((r) => r.token === '--rendra-secondary')
    expect(primaryCheck?.passesAA).toBe(false)
    expect(secondaryCheck?.passesAA).toBe(true)
    expect(theme.vars.light['--rendra-primary-foreground']).toBe('#ffffff') // não ajustado
    expect(theme.adjustments).toEqual([])
  })

  it('enforceContrast true ajusta o par que falha e registra o ajuste', () => {
    const theme = createTheme({
      id: 'falha-forcada',
      name: 'Falha forçada',
      mode: 'explicito',
      explicit: {
        light: {
          primary: '#f5e642',
          primaryForeground: '#ffffff',
        },
        enforceContrast: true,
      },
    })
    const check = theme.report.find((r) => r.token === '--rendra-primary')
    expect(check?.passesAA).toBe(false) // o relatório mostra o valor pedido, não o ajustado
    expect(theme.vars.light['--rendra-primary-foreground']).not.toBe('#ffffff')
    expect(theme.adjustments).toHaveLength(1)
    expect(theme.adjustments[0]?.token).toBe('--rendra-primary-foreground')
    expect(theme.adjustments[0]?.ratio).toBeGreaterThanOrEqual(4.5)
  })

  it('dark ausente é derivado do claro; dark presente é respeitado como está', () => {
    const semEscuro = createTheme(input)
    expect(semEscuro.vars.dark['--rendra-primary']).toBeDefined()
    expect(semEscuro.vars.dark['--rendra-primary']).not.toBe(
      semEscuro.vars.light['--rendra-primary'],
    )

    const comEscuro = createTheme({
      ...input,
      explicit: { ...input.explicit, dark: { primary: '#123456', primaryForeground: '#fedcba' } },
    })
    expect(comEscuro.vars.dark['--rendra-primary']).toBe('#123456')
    expect(comEscuro.vars.dark['--rendra-primary-foreground']).toBe('#fedcba')
  })

  it('exige explicit.light no modo explícito', () => {
    expect(() => createTheme({ id: 'x', name: 'X', mode: 'explicito' })).toThrow(/explicit/)
  })
})

describe('createTheme, modo misto', () => {
  it('sementes geram a base; a sobrescrita pontual sempre vence', () => {
    const theme = createTheme({
      id: safira.id,
      name: safira.name,
      mode: 'misto',
      seed: {
        primary: safira.primary,
        primaryHover: safira.primaryHover,
        secondary: safira.secondary,
        secondaryHover: safira.secondaryHover,
        gradient: safira.gradient,
      },
      explicit: { light: { secondary: '#111111', secondaryForeground: '#ffffff' } },
    })
    const palette = createPalette(safira)
    expect(theme.vars.light['--rendra-primary']).toBe(palette.light['--rendra-primary'])
    expect(theme.vars.light['--rendra-secondary']).toBe('#111111')
    expect(theme.vars.light['--rendra-secondary-foreground']).toBe('#ffffff')
  })

  it('exige seed no modo misto', () => {
    expect(() => createTheme({ id: 'x', name: 'X', mode: 'misto' })).toThrow(/seed/)
  })
})

describe('normalização de cor: hex, rgb() e tripleta HSL dão a mesma cor', () => {
  it('reconhece os quatro formatos como #0b6fe0', () => {
    expect(tryParseColorToHex('#0b6fe0')).toBe('#0b6fe0')
    expect(tryParseColorToHex('#0B6FE0')).toBe('#0b6fe0')
    expect(tryParseColorToHex('rgb(11, 111, 224)')).toBe('#0b6fe0')
    expect(tryParseColorToHex('rgb(11 111 224)')).toBe('#0b6fe0')
    expect(tryParseColorToHex('hsl(211.831, 90.638%, 46.078%)')).toBe('#0b6fe0')
    expect(tryParseColorToHex('211.831 90.638% 46.078%')).toBe('#0b6fe0')
  })

  it('devolve null para o que não é cor reconhecida (gradiente, palavra-chave)', () => {
    expect(tryParseColorToHex('linear-gradient(90deg, red, blue)')).toBeNull()
    expect(tryParseColorToHex('none')).toBeNull()
  })

  it('aceita os quatro formatos como semente e gera o mesmo tema', () => {
    const base = {
      id: 'x',
      name: 'X',
      mode: 'gerado' as const,
      secondary: safira.secondary,
      secondaryHover: safira.secondaryHover,
      gradient: safira.gradient,
    }
    const hex = createTheme({
      ...base,
      seed: { ...base, primary: '#0b6fe0', primaryHover: safira.primaryHover },
    })
    const rgb = createTheme({
      ...base,
      seed: { ...base, primary: 'rgb(11, 111, 224)', primaryHover: safira.primaryHover },
    })
    const hsl = createTheme({
      ...base,
      seed: {
        ...base,
        primary: 'hsl(211.831, 90.638%, 46.078%)',
        primaryHover: safira.primaryHover,
      },
    })
    const triplet = createTheme({
      ...base,
      seed: { ...base, primary: '211.831 90.638% 46.078%', primaryHover: safira.primaryHover },
    })
    expect(rgb.vars.light['--rendra-primary']).toBe(hex.vars.light['--rendra-primary'])
    expect(hsl.vars.light['--rendra-primary']).toBe(hex.vars.light['--rendra-primary'])
    expect(triplet.vars.light['--rendra-primary']).toBe(hex.vars.light['--rendra-primary'])
  })
})

describe('--rendra-shadow-color continua tripleta RGB, mesmo com as demais em cor completa', () => {
  it('modo gerado: tripleta, não hex', () => {
    const theme = createTheme({
      id: safira.id,
      name: safira.name,
      mode: 'gerado',
      seed: {
        primary: safira.primary,
        primaryHover: safira.primaryHover,
        secondary: safira.secondary,
        secondaryHover: safira.secondaryHover,
        gradient: safira.gradient,
      },
    })
    expect(theme.vars.light['--rendra-shadow-color']).toMatch(/^\d+ \d+ \d+$/)
  })

  it('modo explícito: hex informado também sai como tripleta', () => {
    const theme = createTheme({
      id: 'x',
      name: 'X',
      mode: 'explicito',
      explicit: { light: { shadowColor: '#07142a' } },
    })
    expect(theme.vars.light['--rendra-shadow-color']).toBe('7 20 42')
  })
})
