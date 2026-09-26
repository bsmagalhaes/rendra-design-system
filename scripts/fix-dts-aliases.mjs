/*
 * Resolve o alias @/ nos .d.ts emitidos por tsconfig.build.json (dist/types).
 *
 * O `tsc` não reescreve o especificador de import na emissão dos `.d.ts`: o mapeamento de
 * `paths` no tsconfig só ajuda o próprio `tsc` a RESOLVER o módulo durante a checagem, nunca
 * muda o texto do import gerado (limitação conhecida da ferramenta). Sem esta reescrita, os
 * `.d.ts` publicados teriam `import ... from '@/lib/shape'`, que não existe fora deste
 * repositório (docs/specs/fase3-levantamento.md e fase3-plano.md, Lote A).
 *
 * Reescreve só o texto do especificador (`from '@/...'` -> `from '<relativo>'`), calculado
 * pela posição de cada arquivo dentro de dist/types (raiz = src/). Sem dependência nova: nem
 * vite-plugin-dts nem nenhum pacote de reescrita de AST, só node:fs e node:path. Se esta
 * reescrita própria não bastar para algum caso, a alternativa com dependência nova fica
 * registrada como decisão pendente do usuário (docs/specs/fase3-plano.md), não adotada sem
 * confirmação.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'

const ROOT = process.cwd()
const TYPES_DIR = join(ROOT, 'dist/types')

function listDtsFiles(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...listDtsFiles(full))
    else if (entry.endsWith('.d.ts')) out.push(full)
  }
  return out
}

/** '@/lib/shape', visto de dist/types/brand/brand-context.d.ts -> '../lib/shape' */
function toRelativeSpecifier(fromFile, aliasPath) {
  const target = join(TYPES_DIR, aliasPath.slice('@/'.length))
  let rel = relative(dirname(fromFile), target).split('\\').join('/')
  if (!rel.startsWith('.')) rel = './' + rel
  return rel
}

const ALIAS_SPECIFIER = /(['"])(@\/[^'"]+)\1/g

let filesChanged = 0
let specifiersRewritten = 0
for (const file of listDtsFiles(TYPES_DIR)) {
  const source = readFileSync(file, 'utf8')
  const rewritten = source.replace(ALIAS_SPECIFIER, (_match, quote, aliasPath) => {
    specifiersRewritten++
    return quote + toRelativeSpecifier(file, aliasPath) + quote
  })
  if (rewritten !== source) {
    writeFileSync(file, rewritten)
    filesChanged++
  }
}

console.log(
  `Alias @/ resolvido em ${specifiersRewritten} import(s), em ${filesChanged} arquivo(s) .d.ts.`,
)
