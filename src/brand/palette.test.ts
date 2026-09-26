import { describe, expect, it } from 'vitest'
import { TAILWIND_NAMESPACE } from '../../scripts/lib/var-prefix'
import { contrast, createPalette, mix, paletteCss, type PaletteSeeds } from './palette'
import { paletteSeeds } from './palettes'

const LIGHT_BG = '#f5f6f7'
const hex = (v: string | undefined) => {
  expect(v).toMatch(/^#[0-9a-f]{6}$/)
  return v as string
}
/** Pares texto e fundo que precisam de 4,5:1 (WCAG AA). */
const textPairs = [
  ['--rendra-primary-foreground', '--rendra-primary'],
  ['--rendra-primary-hover-foreground', '--rendra-primary-hover'],
  ['--rendra-secondary-foreground', '--rendra-secondary'],
  ['--rendra-secondary-hover-foreground', '--rendra-secondary-hover'],
  ['--rendra-primary-soft-foreground', '--rendra-primary-soft'],
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
    expect(contrast(hex(p.light['--rendra-primary-text']), LIGHT_BG)).toBeGreaterThanOrEqual(4.5)
    expect(
      contrast(hex(p.dark['--rendra-primary-text']), hex(p.dark['--rendra-card'])),
    ).toBeGreaterThanOrEqual(4.5)
    // Superfícies e texto do escuro.
    expect(
      contrast(hex(p.dark['--rendra-foreground']), hex(p.dark['--rendra-card'])),
    ).toBeGreaterThanOrEqual(4.5)
    expect(
      contrast(hex(p.dark['--rendra-muted-foreground']), hex(p.dark['--rendra-muted'])),
    ).toBeGreaterThanOrEqual(4.5)
    // Texto da sidebar sobre o ponto mais claro do degradê (o gerador tenta 7:1; o mínimo é AA).
    const light = seeds.gradient[0]
    expect(contrast(hex(p.light['--rendra-sidebar-foreground']), light)).toBeGreaterThanOrEqual(4.5)
    expect(
      contrast(hex(p.light['--rendra-sidebar-muted-foreground']), light),
    ).toBeGreaterThanOrEqual(4.5)
  })

  it('mantém as sementes que já passam', () => {
    const p = createPalette(paletteSeeds[0]!)
    expect(p.light['--rendra-primary']).toBe('#0b6fe0')
    expect(p.light['--rendra-secondary']).toBe('#98d10a')
    expect(p.adjustments).toEqual([])
  })

  it('escurece a cor quando o texto branco é forçado e registra o ajuste', () => {
    const ardosia = paletteSeeds.find((s) => s.id === 'ardosia')!
    const p = createPalette(ardosia)
    expect(p.light['--rendra-secondary']).not.toBe('#ea600d')
    expect(p.light['--rendra-secondary-foreground']).toBe('#ffffff')
    expect(p.adjustments.join()).toMatch(/Secundária: #EA600D ajustada/)
  })

  it('emite só chaves --rendra-*, nunca o nome antigo sem prefixo', () => {
    // Todo namespace --rendra- existe para nunca colidir com o vocabulário do próprio
    // Tailwind (--color-*, --spacing-*, --text-*, --font-*, --radius-*, --shadow-*,
    // --container-*): createPalette não pode devolver nenhuma chave fora desse prefixo, e a
    // única exceção aceitável seria justamente colidir com esse namespace do Tailwind, o que
    // nunca acontece aqui, pois createPalette só emite variáveis semânticas próprias do
    // Rendra. Mesma exceção usada por scripts/check-design-rules.mjs e
    // src/styles/tokens-prefix.test.ts, para nunca divergir.
    for (const seeds of [...paletteSeeds, client]) {
      const p = createPalette(seeds)
      for (const vars of [p.light, p.dark]) {
        for (const key of Object.keys(vars)) {
          if (TAILWIND_NAMESPACE.test(key.slice(2))) continue
          expect(key, `chave sem prefixo --rendra-: ${key}`).toMatch(/^--rendra-/)
        }
      }
    }
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
