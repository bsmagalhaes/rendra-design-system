import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve, sep } from 'node:path'
import { describe, expect, it } from 'vitest'

const raiz = process.cwd()
const guia = readFileSync(join(raiz, 'docs', 'COMO_APLICAR.md'), 'utf8')
const item =
  guia.split('\n').find((l) => l.startsWith('- **Página de apresentação do Rendra**')) ?? ''

/** Expande `scripts/lib/{a,b}.test.ts` em caminhos soltos. */
function expandir(texto: string): string[] {
  const caminhos: string[] = []
  for (const m of texto.matchAll(/`([^`]+\.(?:ts|mjs|html|svg|png))`/g)) {
    const bruto = m[1]!
    const chaves = bruto.match(/^(.*)\{([^}]+)\}(.*)$/)
    if (chaves) for (const p of chaves[2]!.split(',')) caminhos.push(`${chaves[1]}${p}${chaves[3]}`)
    else caminhos.push(bruto)
  }
  return caminhos
}

const paraApagar = new Set(expandir(item.split('Mantenha `scripts/lib/sitemap.ts`')[0] ?? ''))

/** Arquivos `scripts/*.mjs` e `scripts/lib/*.ts` que continuam no clone. */
function importadosPelosQueFicam(): Map<string, string[]> {
  const importados = new Map<string, string[]>()
  for (const pasta of ['scripts', 'scripts/lib']) {
    for (const nome of readdirSync(join(raiz, pasta))) {
      const rel = `${pasta}/${nome}`
      if (!/\.(mjs|ts)$/.test(nome) || nome.endsWith('.test.ts') || paraApagar.has(rel)) continue
      const codigo = readFileSync(join(raiz, rel), 'utf8')
      for (const m of codigo.matchAll(/from\s+'(\.[^']+)'/g)) {
        const alvo = resolve(raiz, pasta, m[1]!)
          .slice(raiz.length + 1)
          .split(sep)
          .join('/')
        importados.set(alvo, [...(importados.get(alvo) ?? []), rel])
      }
    }
  }
  return importados
}

describe('limpeza do clone (docs/COMO_APLICAR.md)', () => {
  it('a lista de arquivos a apagar foi lida do guia', () => {
    expect(paraApagar.size).toBeGreaterThan(10)
    expect(paraApagar.has('scripts/lib/pages-stage.ts')).toBe(true)
  })

  it('todo arquivo da lista existe no repositório', () => {
    for (const arquivo of paraApagar) expect(existsSync(join(raiz, arquivo)), arquivo).toBe(true)
  })

  it('nenhum arquivo apagado é importado por um script que continua no clone', () => {
    const usados = importadosPelosQueFicam()
    for (const arquivo of paraApagar) expect(usados.get(arquivo), arquivo).toBeUndefined()
  })

  it('o sitemap fica: o seo-build da demo do clone o importa', () => {
    expect(paraApagar.has('scripts/lib/sitemap.ts')).toBe(false)
    expect(paraApagar.has('scripts/lib/sitemap.test.ts')).toBe(false)
    expect(readFileSync(join(raiz, 'scripts/seo-build.mjs'), 'utf8')).toContain('./lib/sitemap.ts')
  })
})
