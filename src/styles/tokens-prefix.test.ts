import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { findUnprefixedDeclarations, TAILWIND_NAMESPACE } from '../../scripts/lib/var-prefix'

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
 *
 * A lógica mora num módulo só (scripts/lib/var-prefix.ts), importado também por
 * scripts/check-design-rules.mjs e por src/brand/palette.test.ts, para nunca divergir.
 */

const STYLES_DIR = dirname(fileURLToPath(import.meta.url))
const ROOT = join(STYLES_DIR, '..', '..')

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

  // Bloqueador 3 (validação do Fable): --radius e --shadow-color batem em TAILWIND_NAMESPACE
  // (--radius-*, --shadow-*) mesmo sendo variável própria do Rendra. Caso negativo: uma
  // declaração solta, fora de qualquer @theme, ainda precisa falhar para --primary, --radius
  // e --shadow-color, e passar para --rendra-primary.
  it('acusa --primary, --radius e --shadow-color soltos fora de @theme, mas não a versão com --rendra-', () => {
    const text = [
      ':root {',
      '  --primary: #0b6fe0;',
      '  --radius: 0.625rem;',
      '  --shadow-color: 11 29 55;',
      '  --rendra-primary: #0b6fe0;',
      '}',
    ].join('\n')
    const names = findUnprefixedDeclarations(text).map((v) => v.name)
    expect(names).toEqual(['primary', 'radius', 'shadow-color'])
  })
})
