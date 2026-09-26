/*
 * Verifica o pacote publicável (Lote A da Fase 3, docs/specs/fase3-plano.md), depois de
 * `npm run build:lib`. É o teste que falha hoje (não existe `exports`, `main` nem
 * `src/index.ts`) e passa depois que `vite.lib.config.ts`, `src/index.ts` e o `package.json`
 * novo existirem (docs/specs/fase3-plano.md, "Teste que falha antes e passa depois").
 *
 * Empacota o `package.json` REAL do repositório com `npm pack` (o mesmo comando do `npm
 * publish`), nunca um `package.json` sintético: `react-router` e `@hookform/resolvers` são
 * `devDependencies` (usados só pelo boilerplate e pela ponte de rotas opcional), então o
 * pacote publicado nunca lista `react-router` de verdade em `dependencies` nem em
 * `peerDependencies`: a afirmação abaixo confere o `package.json` que realmente foi
 * publicado, não um que este script montasse e apagasse por conta própria (correção do
 * Fable, item 1: aquilo era tautologia).
 *
 * Confere, no tarball de verdade:
 *   1. O componente renderiza HTML sem lançar erro (renderToStaticMarkup), inclusive um
 *      componente com hook (Checkbox, `useId`): prova que o hook funciona com o React do
 *      próprio projeto consumidor, não com o React deste repositório (correção do Fable,
 *      item 5).
 *   2. O package.json do pacote publicado não lista `react-router` em `dependencies` nem
 *      em `peerDependencies`.
 *   3. tokens.css e o arquivo de entrada do JS (dist/index.js) contêm o banner de
 *      scripts/lib/pkg-banner.ts, com a versão exata de package.json; tokens.css também
 *      define `--rendra-primary` e `--rendra-background` (tema e paleta padrão) e NÃO
 *      declara `--color-*` nem `--radius-*` (correção do Fable, item 2: essas variáveis são
 *      a ponte `@theme inline`, que colidiria com o `@theme` de um host que também use
 *      Tailwind v4; nenhuma utility do pacote precisa delas, só de --rendra-*).
 *   4. dist/types não tem brand.config.d.ts nem nada de examples/ (correção do Fable, item
 *      6: os componentes do pacote importam `@/brand/use-brand` e `@/brand/types`, nunca o
 *      barrel `@/brand`, que arrastaria a marca de demonstração deste repositório para os
 *      tipos publicados).
 *
 * Dois caminhos: primeiro tenta instalar o tarball com `npm install --prefer-offline` num
 * projeto novo fora do repositório (prova a resolução de dependências de verdade, com o
 * React desse projeto, nunca o deste repositório); se o ambiente bloquear a rede, cai para
 * a verificação estrutural (descompacta o tarball com `tar` e confere os arquivos direto,
 * renderizando com o React deste repositório, a única opção sem instalar nada). O relatório
 * final diz qual dos dois caminhos rodou.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { packageBanner } from './lib/pkg-banner.ts'

const ROOT = process.cwd()
const DIST = join(ROOT, 'dist')
const WORK = join(DIST, '.verify-pack')
const PACK_OUT_DIR = join(WORK, 'pack-out')
const EXTRACT_DIR = join(WORK, 'extracted')
const RM_RETRY = { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }

function fail(message) {
  console.error(`✗ ${message}`)
  process.exitCode = 1
  throw new Error(message)
}

function assert(condition, message) {
  if (!condition) fail(message)
  console.log(`✓ ${message}`)
}

if (!existsSync(join(DIST, 'index.js'))) {
  fail('dist/index.js não existe. Rode "npm run build:lib" antes de "npm run verify:pack".')
}

const realPkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const BANNER = packageBanner(realPkg.version)

// Roda dentro do projeto instalado (ou do tarball descompactado): renderiza Button (sem
// hook) e Checkbox (usa useId), pelo react/react-dom desse mesmo lugar. Um marcador único
// na saída evita que um aviso do React em stdout atrapalhe o parse do resultado.
const RENDER_MARKER = 'VERIFY_PACK_RESULT:'
function renderRunnerScript(pkgSpecifier) {
  return `import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Button, Checkbox } from ${JSON.stringify(pkgSpecifier)}

try {
  const button = renderToStaticMarkup(createElement(Button, {}, 'Verificar pacote'))
  const checkbox = renderToStaticMarkup(createElement(Checkbox, { label: 'Verificar', defaultChecked: true }))
  console.log('${RENDER_MARKER}' + JSON.stringify({ ok: true, button, checkbox }))
} catch (error) {
  console.log('${RENDER_MARKER}' + JSON.stringify({ ok: false, message: String(error?.stack ?? error) }))
}
`
}

function assertRenderResult(stdout) {
  const line = stdout.split('\n').find((l) => l.startsWith(RENDER_MARKER))
  assert(!!line, 'O runner de render imprimiu o marcador de resultado.')
  const result = JSON.parse(line.slice(RENDER_MARKER.length))
  assert(result.ok, `Render não lançou erro: ${result.ok ? '' : result.message}`)
  assert(
    result.button.includes('<button') && result.button.includes('Verificar pacote'),
    'Button (sem hook) renderiza HTML.',
  )
  assert(
    result.checkbox.includes('Verificar') && /role="checkbox"/.test(result.checkbox),
    'Checkbox (usa useId) renderiza HTML.',
  )
}

rmSync(WORK, RM_RETRY)
mkdirSync(PACK_OUT_DIR, { recursive: true })

// 1) Empacota o package.json REAL (nunca um sintético): npm pack é o mesmo comando do
//    npm publish, e lê o package.json e o "files" do próprio repositório.
const packOutput = execFileSync(
  'npm',
  ['pack', ROOT, '--pack-destination', PACK_OUT_DIR, '--json'],
  { cwd: ROOT, encoding: 'utf8', shell: process.platform === 'win32' },
)
const [packResult] = JSON.parse(packOutput)
const tarballPath = join(PACK_OUT_DIR, packResult.filename)
assert(existsSync(tarballPath), `npm pack gerou o tarball (${packResult.filename}).`)

// 2) Caminho 1: instala o tarball num projeto novo, fora do repositório (fora de qualquer
//    node_modules existente), com --prefer-offline.
let path = 'estrutural'
let packageJsonForAssertions = null
let tokensCssPath = join(EXTRACT_DIR, 'package', 'dist', 'tokens.css')
let baseCssPath = join(EXTRACT_DIR, 'package', 'dist', 'base.css')
let entryJsPath = join(EXTRACT_DIR, 'package', 'dist', 'index.js')
let typesDirForAssertions = join(EXTRACT_DIR, 'package', 'dist', 'types')

const consumerDir = mkdtempSync(join(tmpdir(), 'rendra-verify-pack-'))
try {
  writeFileSync(
    join(consumerDir, 'package.json'),
    JSON.stringify(
      { name: 'rendra-verify-pack-consumer', private: true, version: '0.0.0' },
      null,
      2,
    ),
  )
  execFileSync('npm', ['install', tarballPath, '--prefer-offline', '--no-audit', '--no-fund'], {
    cwd: consumerDir,
    stdio: 'pipe',
    // Instalação de verdade (~200 pacotes na primeira vez): mais lenta que um timeout
    // apertado. Um timeout curto demais mata o npm no meio da escrita e deixa arquivo
    // travado no Windows (EPERM na limpeza a seguir), não prova que a rede falhou.
    timeout: 180_000,
    shell: process.platform === 'win32',
  })
  const installedPkgPath = join(consumerDir, 'node_modules', realPkg.name, 'package.json')
  if (existsSync(installedPkgPath)) {
    path = 'instalação'
    packageJsonForAssertions = JSON.parse(readFileSync(installedPkgPath, 'utf8'))
    const installedDir = join(consumerDir, 'node_modules', realPkg.name, 'dist')
    entryJsPath = join(installedDir, 'index.js')
    tokensCssPath = join(installedDir, 'tokens.css')
    baseCssPath = join(installedDir, 'base.css')
    typesDirForAssertions = join(installedDir, 'types')
  }
} catch {
  // Sem rede (ou sem cache): segue para a verificação estrutural, sem instalar nada.
  rmSync(consumerDir, RM_RETRY)
}
// consumerDir só é removido no fim do arquivo (limpeza final): o runner de render lê o
// React instalado ali quando o caminho usado é "instalação".

// 3) Caminho 2 (estrutural): descompacta o tarball direto, sem instalar.
if (path === 'estrutural') {
  mkdirSync(EXTRACT_DIR, { recursive: true })
  // --force-local: sem isso, o GNU tar lê "C:\..." como host:caminho remoto (dois pontos
  // depois da letra da unidade) e recusa a extração local no Windows. Barra normal (nunca
  // contrabarra) e shell:true no Windows: o tar do Git for Windows (MSYS) mistura escape de
  // argv com a contrabarra crua do child_process, dobrando-a; passando pelo cmd.exe (como
  // já fazem os comandos npm acima) o caminho chega intacto.
  const toTarPath = (p) => p.split('\\').join('/')
  execFileSync(
    'tar',
    ['--force-local', '-xzf', toTarPath(tarballPath), '-C', toTarPath(EXTRACT_DIR)],
    { shell: process.platform === 'win32' },
  )
  const extractedPkgPath = join(EXTRACT_DIR, 'package', 'package.json')
  assert(existsSync(extractedPkgPath), 'O tarball descompactado tem package.json.')
  packageJsonForAssertions = JSON.parse(readFileSync(extractedPkgPath, 'utf8'))
}

console.log(`\nCaminho usado: ${path}.\n`)

// Asserção 2: react-router nunca em dependencies nem em peerDependencies do pacote publicado.
assert(
  !('react-router' in (packageJsonForAssertions.dependencies ?? {})),
  'package.json publicado não lista react-router em dependencies.',
)
assert(
  !('react-router' in (packageJsonForAssertions.peerDependencies ?? {})),
  'package.json publicado não lista react-router em peerDependencies.',
)

// Asserção 3: banner, tema e paleta padrão em tokens.css; ausência da ponte @theme inline.
assert(existsSync(tokensCssPath), 'tokens.css está no pacote publicado.')
const tokensCss = readFileSync(tokensCssPath, 'utf8')
assert(tokensCss.includes(BANNER), `tokens.css contém o banner "${BANNER}".`)
assert(
  /--rendra-primary:\s*#[0-9a-fA-F]{3,8}/.test(tokensCss),
  'tokens.css define --rendra-primary (paleta padrão).',
)
assert(
  /--rendra-background:\s*#[0-9a-fA-F]{3,8}/.test(tokensCss),
  'tokens.css define --rendra-background (tema padrão do sistema).',
)
assert(
  !/--color-[a-z-]+:/.test(tokensCss),
  'tokens.css não declara --color-* (colidiria com o @theme de um host Tailwind v4).',
)
assert(
  !/--radius-[a-z-]+:/.test(tokensCss),
  'tokens.css não declara --radius-* (colidiria com o @theme de um host Tailwind v4).',
)
assert(
  !/--font-sans:/.test(tokensCss),
  'tokens.css não declara --font-sans (colidiria com o @theme de um host Tailwind v4).',
)

// base.css referenciava var(--font-sans) direto (html { font-family: var(--font-sans) }):
// como --font-sans saiu do tokens.css, a referência precisa ter virado --rendra-brand-font
// (a variável que --font-sans só espelhava), senão a fonte da marca quebraria no host.
assert(existsSync(baseCssPath), 'base.css está no pacote publicado.')
const baseCss = readFileSync(baseCssPath, 'utf8')
assert(
  baseCss.includes('var(--rendra-brand-font)'),
  'base.css usa var(--rendra-brand-font) na fonte do html.',
)
assert(!baseCss.includes('var(--font-sans)'), 'base.css não referencia mais var(--font-sans).')

assert(existsSync(entryJsPath), 'dist/index.js está no pacote publicado.')
const entryJs = readFileSync(entryJsPath, 'utf8')
assert(entryJs.includes(BANNER), `dist/index.js contém o banner "${BANNER}".`)

// Asserção 4: dist/types não arrasta a marca de demonstração (brand.config, examples/).
assert(
  !existsSync(join(typesDirForAssertions, 'brand', 'brand.config.d.ts')),
  'dist/types não tem brand/brand.config.d.ts (marca de demonstração fora dos tipos publicados).',
)
assert(
  !existsSync(join(typesDirForAssertions, 'brand', 'examples')),
  'dist/types não tem brand/examples (marca de demonstração fora dos tipos publicados).',
)

// Asserção 1: o componente renderiza HTML sem lançar erro, inclusive um com hook, com o
// react/react-dom de quem consome o pacote (nunca o deste repositório).
if (path === 'instalação') {
  const runnerPath = join(consumerDir, 'render-test.mjs')
  writeFileSync(runnerPath, renderRunnerScript(realPkg.name))
  const stdout = execFileSync('node', [runnerPath], { cwd: consumerDir, encoding: 'utf8' })
  assertRenderResult(stdout)
} else {
  const runnerPath = join(EXTRACT_DIR, 'render-test.mjs')
  const pkgEntry = join(EXTRACT_DIR, 'package', 'dist', 'index.js').split('\\').join('/')
  writeFileSync(runnerPath, renderRunnerScript(`file://${pkgEntry}`))
  const stdout = execFileSync('node', [runnerPath], { cwd: ROOT, encoding: 'utf8' })
  assertRenderResult(stdout)
}

rmSync(WORK, RM_RETRY)
rmSync(consumerDir, RM_RETRY)

console.log('\nverify-pack: tudo passou.')
