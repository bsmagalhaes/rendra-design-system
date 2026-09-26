/*
 * Reescreve o alias @/ nos .d.ts emitidos por tsconfig.build.json (dist/types).
 *
 * O `tsc` não reescreve o especificador de import na emissão dos `.d.ts`: o mapeamento de
 * `paths` no tsconfig só ajuda o próprio `tsc` a RESOLVER o módulo durante a checagem, nunca
 * muda o texto do import gerado (limitação conhecida da ferramenta). Sem esta reescrita, os
 * `.d.ts` publicados teriam `import ... from '@/lib/shape'`, que não existe fora deste
 * repositório (docs/specs/fase3-levantamento.md e fase3-plano.md, Lote A).
 *
 * Pura (só matemática de caminho, `node:path`, sem tocar disco), para dar teste de verdade
 * a esta reescrita (validação do Fable no Lote A): scripts/fix-dts-aliases.mjs é só a casca
 * de E/S, que lê e grava os arquivos de dist/types.
 */
import { dirname, relative } from 'node:path'

const ALIAS_PREFIX = '@/'
const ALIAS_SPECIFIER = /(['"])(@\/[^'"]+)\1/g

/**
 * '@/lib/shape', visto de um arquivo em `fileRelPath` (caminho relativo à raiz onde o
 * alias @/ aponta, ex.: 'components/ui/alert.d.ts') -> caminho relativo até ele
 * (ex.: '../../lib/shape').
 */
export function resolveAliasSpecifier(fileRelPath: string, aliasSpecifier: string): string {
  const target = aliasSpecifier.slice(ALIAS_PREFIX.length)
  let rel = relative(dirname(fileRelPath), target).split('\\').join('/')
  if (!rel.startsWith('.')) rel = `./${rel}`
  return rel
}

/**
 * Reescreve todo especificador `'@/...'` dentro de `source` (o texto de um `.d.ts`),
 * calculado a partir de `fileRelPath` (o caminho desse arquivo relativo à raiz de
 * dist/types). Import sem alias (relativo ou de um pacote) fica intacto; arquivo sem
 * nenhum alias devolve a mesma string, sem alocar troca nenhuma.
 */
export function rewriteAliasSpecifiers(
  source: string,
  fileRelPath: string,
): { code: string; count: number } {
  let count = 0
  const code = source.replace(ALIAS_SPECIFIER, (_match, quote: string, aliasPath: string) => {
    count++
    return quote + resolveAliasSpecifier(fileRelPath, aliasPath) + quote
  })
  return { code, count }
}
