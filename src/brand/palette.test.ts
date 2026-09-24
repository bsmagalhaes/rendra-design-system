import { describe, expect, it } from 'vitest'
import { contrast, createPalette, mix, paletteCss, type PaletteSeeds } from './palette'
import { paletteSeeds } from './palettes'

const LIGHT_BG = '#f5f6f7'
const hex = (v: string | undefined) => {
  expect(v).toMatch(/^#[0-9a-f]{6}$/)
  return v as string
}
/** Pares texto e fundo que precisam de 4,5:1 (WCAG AA). */
const textPairs = [
  ['--primary-foreground', '--primary'],
  ['--primary-hover-foreground', '--primary-hover'],
  ['--secondary-foreground', '--secondary'],
  ['--secondary-hover-foreground', '--secondary-hover'],
  ['--primary-soft-foreground', '--primary-soft'],
] as const

const client: PaletteSeeds = {
  id: 'cliente',
  name: 'Cliente',
  primary: '#ffcc00',
  primaryHover: '#e6b800',
  secondary: '#ff6699',
  secondaryHover: '#e0507f',
  gradient: ['#ffe680', '#ffcc00', '#b38f00'],
}

describe('createPalette', () => {
  it.each([...paletteSeeds, client])('garante AA em todos os pares de texto: $name', (seeds) => {
    const p = createPalette(seeds)
    for (const vars of [p.light, p.dark])
      for (const [fg, bg] of textPairs)
        expect(contrast(hex(vars[fg]), hex(vars[bg])), `${fg} sobre ${bg}`).toBeGreaterThanOrEqual(
          4.5,
        )
    // Primária como texto, sobre o fundo e o card do claro e sobre o card do escuro.
    expect(contrast(hex(p.light['--primary-text']), LIGHT_BG)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(hex(p.dark['--primary-text']), hex(p.dark['--card']))).toBeGreaterThanOrEqual(
      4.5,
    )
    // Superfícies e texto do escuro.
    expect(contrast(hex(p.dark['--foreground']), hex(p.dark['--card']))).toBeGreaterThanOrEqual(4.5)
    expect(
      contrast(hex(p.dark['--muted-foreground']), hex(p.dark['--muted'])),
    ).toBeGreaterThanOrEqual(4.5)
    // Texto da sidebar sobre o ponto mais claro do degradê (o gerador tenta 7:1; o mínimo é AA).
    const light = seeds.gradient[0]
    expect(contrast(hex(p.light['--sidebar-foreground']), light)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(hex(p.light['--sidebar-muted-foreground']), light)).toBeGreaterThanOrEqual(4.5)
  })

  it('mantém as sementes que já passam', () => {
    const p = createPalette(paletteSeeds[0]!)
    expect(p.light['--primary']).toBe('#0b6fe0')
    expect(p.light['--secondary']).toBe('#98d10a')
    expect(p.adjustments).toEqual([])
  })

  it('escurece a cor quando o texto branco é forçado e registra o ajuste', () => {
    const ardosia = paletteSeeds.find((s) => s.id === 'ardosia')!
    const p = createPalette(ardosia)
    expect(p.light['--secondary']).not.toBe('#ea600d')
    expect(p.light['--secondary-foreground']).toBe('#ffffff')
    expect(p.adjustments.join()).toMatch(/Secundária: #EA600D ajustada/)
  })

  it('escolhe a sidebar clara e o logotipo escuro para degradê claro', () => {
    expect(createPalette(client).sidebarLogo).toBe('light')
    expect(createPalette(paletteSeeds[0]!).sidebarLogo).toBe('dark')
  })

  it('recusa cor fora do formato #RRGGBB', () => {
    expect(() => createPalette({ ...client, primary: 'azul' })).toThrow(/Cor inválida/)
  })
})

describe('paletteCss', () => {
  it('gera o claro e o escuro com o seletor da paleta', () => {
    const css = paletteCss(createPalette(client))
    expect(css).toContain(":root[data-palette='cliente'] {")
    expect(css).toContain(":root[data-palette='cliente'].dark {")
  })
  it('a padrão também vale antes de o app definir data-palette', () => {
    expect(paletteCss(createPalette(client), true)).toContain(':root:not([data-palette])')
  })
})

describe('mix e contrast', () => {
  it('mistura em sRGB e mede o contraste WCAG', () => {
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080')
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 0)
    expect(contrast('#777777', '#777777')).toBe(1)
  })
})
