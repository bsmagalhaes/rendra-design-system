import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/*
 * Prefixo --rendra- (docs/specs/v2-plano.md, seções 1.8 e 2.5; etapa 2.0.0-alpha.1): toda
 * variável CSS própria do Rendra declarada em theme.css, nos exemplos de modelo, em
 * palettes.css (gerado) e em globals.css precisa começar com --rendra-. A exceção é o
 * namespace do próprio Tailwind (--color-*, --spacing-*, --text-*, --font-*, --radius-*,
 * --shadow-*, --container-*, --breakpoint-*, --animate-*, --ease-*, --tw-*): ele nasce dentro
 * do bloco @theme / @theme inline (a ponte documentada entre o nome do Tailwind e o nome do
 * Rendra, ex.: --color-primary: var(--rendra-primary)), mas globals.css também o redeclara
 * fora do @theme, em @layer base, só para sobrescrever o valor em telas maiores (ex.:
 * --spacing-control-sm dentro de @media (width >= 48rem)). Nenhum dos dois casos é variável
 * própria do Rendra, então os dois ficam de fora desta checagem pelo nome, não pelo bloco.
 */

const STYLES_DIR = dirname(fileURLToPath(import.meta.url))
const ROOT = join(STYLES_DIR, '..', '..')

// Mesma exceção do scripts/check-design-rules.mjs: "tracking" é a escala de letter-spacing do
// Tailwind, e o "$" cobre o degrau zerado sem sufixo (--spacing: initial;).
const TAILWIND_NAMESPACE =
  /^(color|spacing|text|font|radius|shadow|container|breakpoint|animate|ease|tw|tracking)(-|$)/

/** Declarações de variável (`--nome: valor;`) fora do prefixo --rendra-, e fora da exceção
 * do namespace do Tailwind. */
function findUnprefixedDeclarations(text: string) {
  const found: { line: number; name: string; src: string }[] = []
  const lines = text.split('\n')
  lines.forEach((line, i) => {
    const m = /^\s*--([a-zA-Z][\w-]*)\s*:/.exec(line)
    if (!m) return
    const name = m[1]!
    if (name.startsWith('rendra-')) return
    if (TAILWIND_NAMESPACE.test(name)) return
    found.push({ line: i + 1, name, src: line.trim() })
  })
  return found
}

const files = [
  ['src/styles/theme.css', join(STYLES_DIR, 'theme.css')],
  ['src/styles/globals.css', join(STYLES_DIR, 'globals.css')],
  ['src/styles/palettes.css', join(STYLES_DIR, 'palettes.css')],
  ['src/brand/examples/aurora/theme.css', join(ROOT, 'src/brand/examples/aurora/theme.css')],
  [
    'src/brand/examples/equilibrio/theme.css',
    join(ROOT, 'src/brand/examples/equilibrio/theme.css'),
  ],
] as const

describe('prefixo --rendra- nas variáveis CSS do tema', () => {
  it.each(files)('%s não declara variável própria sem o prefixo --rendra-', (_label, path) => {
    const text = readFileSync(path, 'utf8')
    const violations = findUnprefixedDeclarations(text)
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([])
  })

  it('dentro de @theme, uma declaração do namespace do Tailwind ainda é permitida sem --rendra-', () => {
    const text = readFileSync(join(STYLES_DIR, 'globals.css'), 'utf8')
    const declared = new Set(
      [...text.matchAll(/^\s*(--[a-zA-Z][\w-]*)\s*:/gm)].map((m) => m[1]!.slice(2)),
    )
    // Confirma que o teste está mesmo olhando o arquivo certo: --spacing-4 é declarado dentro
    // de @theme, é do namespace do Tailwind, e não deveria virar violação.
    expect(declared.has('spacing-4')).toBe(true)
    expect(TAILWIND_NAMESPACE.test('spacing-4')).toBe(true)
    expect(findUnprefixedDeclarations(text).some((v) => v.name === 'spacing-4')).toBe(false)
  })
})
