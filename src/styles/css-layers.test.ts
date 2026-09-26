import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/*
 * CSS em camadas: a ordem das camadas é declarada uma única vez, no topo de globals.css,
 * para que as utilities do host (ou as do próprio Tailwind, geradas a partir das classes do
 * JSX) sempre vençam qualquer camada do Rendra, e rendra.base/rendra.components sempre
 * percam para components/utilities.
 */

const STYLES_DIR = dirname(fileURLToPath(import.meta.url))
const CSS = readFileSync(join(STYLES_DIR, 'globals.css'), 'utf8')

const LAYER_ORDER = ['theme', 'base', 'rendra.base', 'components', 'rendra.components', 'utilities']

describe('ordem de camadas do CSS (C4)', () => {
  it('declara a ordem das seis camadas antes de qualquer @import', () => {
    const importIndex = CSS.indexOf("@import 'tailwindcss'")
    const layerIndex = CSS.indexOf(
      '@layer theme, base, rendra.base, components, rendra.components, utilities;',
    )
    expect(layerIndex).toBeGreaterThanOrEqual(0)
    expect(importIndex).toBeGreaterThan(layerIndex)
  })

  it('lista as camadas na ordem exata theme, base, rendra.base, components, rendra.components, utilities', () => {
    const match = /@layer\s+([a-z0-9_.,\s-]+);/i.exec(CSS)
    expect(match).not.toBeNull()
    const names = match![1]!.split(',').map((n) => n.trim())
    expect(names).toEqual(LAYER_ORDER)
  })

  it('utilities vem por último, depois de rendra.components', () => {
    const names = /@layer\s+([a-z0-9_.,\s-]+);/i
      .exec(CSS)![1]!
      .split(',')
      .map((n) => n.trim())
    expect(names.at(-1)).toBe('utilities')
    expect(names.indexOf('utilities')).toBeGreaterThan(names.indexOf('rendra.components'))
    expect(names.indexOf('rendra.components')).toBeGreaterThan(names.indexOf('components'))
    expect(names.indexOf('rendra.base')).toBeGreaterThan(names.indexOf('base'))
    expect(names.indexOf('components')).toBeGreaterThan(names.indexOf('rendra.base'))
  })

  it('só usa @layer rendra.base e @layer rendra.components como blocos do Rendra, nunca @layer base/components soltos', () => {
    // A declaração de ordem em si (statement, sem bloco) é a única linha com "base," / "components,".
    const blockDeclarations = CSS.match(/@layer\s+(base|components)\s*\{/g) ?? []
    expect(blockDeclarations).toEqual([])
    expect(CSS.match(/@layer\s+rendra\.base\s*\{/g)?.length).toBeGreaterThan(0)
    expect(CSS.match(/@layer\s+rendra\.components\s*\{/g)?.length).toBeGreaterThan(0)
  })

  it('variáveis de token (declarações --rendra-*) ficam fora de qualquer bloco @layer', () => {
    // Verificação estrutural: dentro dos blocos @layer rendra.base / rendra.components não há
    // declaração de variável de tema no nível mais externo do bloco (só regras html/body/seletor
    // com propriedades normais, ou estilo de componente).
    const shapeBlockIndex = CSS.indexOf('--rendra-shape-control')
    const rendraBaseIndex = CSS.indexOf('@layer rendra.base {')
    expect(shapeBlockIndex).toBeGreaterThanOrEqual(0)
    expect(rendraBaseIndex).toBeGreaterThan(0)
    expect(shapeBlockIndex).toBeLessThan(rendraBaseIndex)
  })

  it('escopo [data-rendra-root] cobre os tokens de rótulo, forma e medidor, além do :root', () => {
    expect(CSS).toMatch(/:root,\s*\n\[data-rendra-root\]\s*\{\s*\n\s*--rendra-label-size/)
    expect(CSS).toMatch(/:root,\s*\n\[data-rendra-root\],\s*\n\[data-shape='rounded'\]/)
    expect(CSS).toMatch(/:root,\s*\n\[data-rendra-root\]\s*\{\s*\n\s*--rendra-meter-low/)
  })
})
