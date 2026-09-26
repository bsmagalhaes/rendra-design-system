import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { contrast, createPalette } from '@/brand/palette'
import { paletteSeeds } from '@/brand/palettes'

/*
 * Contraste do rótulo e da orientação do campo (etapa 1.2.0-alpha.5): os valores são lidos do
 * CSS de verdade (theme.css e globals.css) e medidos com a mesma contrast() da página /tokens.
 * Texto pede 4,5:1 (WCAG AA) sobre o card e sobre o fundo, no claro (neutros fixos) e no
 * escuro de cada paleta de src/brand/palettes.ts.
 */

const STYLES = dirname(fileURLToPath(import.meta.url))
const theme = readFileSync(join(STYLES, 'theme.css'), 'utf8')
const globals = readFileSync(join(STYLES, 'globals.css'), 'utf8')

/** Corpo do bloco que começa numa linha com exatamente `selector {`. */
function block(css: string, selector: string): string {
  const start = css.split('\n').findIndex((l) => l.trim() === `${selector} {`)
  if (start === -1) throw new Error(`Bloco ${selector} não encontrado`)
  const lines = css.split('\n').slice(start + 1)
  return lines
    .slice(
      0,
      lines.findIndex((l) => l.startsWith('}')),
    )
    .join('\n')
}

function declared(body: string, name: string): string {
  const m = new RegExp(`--rendra-${name}:\\s*([^;]+);`).exec(body)
  if (!m) throw new Error(`--rendra-${name} não declarada`)
  return m[1]!.trim()
}

const lightRoot = block(theme, ':root')
const darkRoot = block(theme, '.dark')
const light = {
  label: declared(lightRoot, 'label-color'),
  muted: declared(lightRoot, 'muted-foreground'),
  foreground: declared(lightRoot, 'foreground'),
  surfaces: {
    card: declared(lightRoot, 'card'),
    fundo: declared(lightRoot, 'background'),
    campo: declared(lightRoot, 'field'),
  },
}
const darkLabel = declared(darkRoot, 'label-color')
const AA = 4.5

describe('tokens do rótulo e da orientação', () => {
  it('rótulo discreto no claro é o cinza delicado; normal usa a cor do texto', () => {
    expect(light.label).toBe('#5f6f82')
    expect(declared(block(globals, ":root[data-label='normal']"), 'label-color')).toBe(
      'var(--rendra-foreground)',
    )
  })

  it('a orientação usa a cor de texto secundário e o degrau text-xs (12px)', () => {
    const root = block(globals, ':root')
    expect(declared(root, 'help-color')).toBe('var(--rendra-muted-foreground)')
    expect(declared(root, 'help-size')).toBe('var(--text-xs)')
    expect(declared(root, 'label-size')).toBe('0.6875rem')
  })

  it('a referência do usuário (#6B7A8D) falha AA sobre o branco, e por isso não foi usada', () => {
    expect(contrast('#6b7a8d', '#ffffff')).toBeLessThan(AA)
  })
})

describe('contraste AA no claro (neutros fixos)', () => {
  it.each(Object.entries(light.surfaces))('sobre %s (%s)', (_nome, fundo) => {
    expect(contrast(light.label, fundo)).toBeGreaterThanOrEqual(AA)
    expect(contrast(light.muted, fundo)).toBeGreaterThanOrEqual(AA)
    expect(contrast(light.foreground, fundo)).toBeGreaterThanOrEqual(AA)
  })
})

describe('contraste AA no escuro de cada paleta', () => {
  it.each(paletteSeeds.map((s) => [s.id, s] as const))('paleta %s', (_id, seeds) => {
    const dark = createPalette(seeds).dark
    for (const surface of ['--rendra-card', '--rendra-background', '--rendra-popover'] as const) {
      const fundo = dark[surface]!
      // rótulo discreto, orientação (texto secundário da paleta) e rótulo normal (texto)
      expect(contrast(darkLabel, fundo)).toBeGreaterThanOrEqual(AA)
      expect(contrast(dark['--rendra-muted-foreground']!, fundo)).toBeGreaterThanOrEqual(AA)
      expect(contrast(dark['--rendra-foreground']!, fundo)).toBeGreaterThanOrEqual(AA)
    }
  })
})
