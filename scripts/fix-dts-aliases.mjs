/*
 * Resolve o alias @/ nos .d.ts emitidos por tsconfig.build.json (dist/types).
 *
 * Casca de E/S só: lê e grava os arquivos de dist/types. A reescrita em si (a função pura,
 * com teste próprio) está em scripts/lib/rewrite-dts-alias.ts, sem dependência nova, nem
 * vite-plugin-dts nem nenhum pacote de reescrita de AST, só node:fs e node:path.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { rewriteAliasSpecifiers } from './lib/rewrite-dts-alias.ts'

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

let filesChanged = 0
let specifiersRewritten = 0
for (const file of listDtsFiles(TYPES_DIR)) {
  const fileRelPath = relative(TYPES_DIR, file).split('\\').join('/')
  const source = readFileSync(file, 'utf8')
  const { code, count } = rewriteAliasSpecifiers(source, fileRelPath)
  if (count > 0) {
    writeFileSync(file, code)
    filesChanged++
    specifiersRewritten += count
  }
}

console.log(
  `Alias @/ resolvido em ${specifiersRewritten} import(s), em ${filesChanged} arquivo(s) .d.ts.`,
)
