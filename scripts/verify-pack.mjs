/*
 * Verifica o pacote publicável (2.1.0-alpha.1, Lote A, docs/specs/fase3-plano.md), depois
 * de `npm run build:lib`. É o teste que falha hoje (não existe `exports`, `main` nem
 * `src/index.ts`) e passa depois que `vite.lib.config.ts`, `src/index.ts` e o `package.json`
 * novo existirem (docs/specs/fase3-plano.md, "Teste que falha antes e passa depois").
 *
 * Monta um `package.json` só de publicação (sem devDependencies, sem `react-router` em
 * dependencies: ele só existe na entrada opcional rendra-ui/router-bridge, nunca como
 * dependência do pacote) numa pasta de estágio (dist/.verify-pack/stage), empacota essa
 * pasta com `npm pack` (o mesmo comando do `npm publish`) e confere três coisas observáveis:
 *
 *   1. O componente renderiza HTML sem lançar erro (renderToStaticMarkup).
 *   2. O package.json do pacote publicado não lista `react-router` em `dependencies` nem
 *      em `peerDependencies`.
 *   3. O arquivo de CSS (tokens.css) e o arquivo de entrada do JS (dist/index.js) contêm a
 *      string "Rendra Design System v" seguida da versão exata de package.json; tokens.css
 *      também define `--rendra-primary` e `--rendra-background` (correção do Opus, item 2
 *      da validação do plano: valores padrão da paleta e do tema de sistema, sem a marca).
 *
 * Dois caminhos (correção do Opus, item 4): primeiro tenta instalar o tarball com
 * `npm install --prefer-offline` num projeto novo fora do repositório (prova a resolução de
 * dependências de verdade); se o ambiente bloquear a rede, cai para a verificação
 * estrutural (descompacta o tarball com `tar` e confere os arquivos direto, sem instalar).
 * O relatório final diz qual dos dois caminhos rodou.
 */
import { execFileSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const ROOT = process.cwd()
const DIST = join(ROOT, 'dist')
const WORK = join(DIST, '.verify-pack')
const STAGE_DIR = join(WORK, 'stage')
const PACK_OUT_DIR = join(WORK, 'pack-out')
const EXTRACT_DIR = join(WORK, 'extracted')

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
const BANNER_TEXT = `Rendra Design System v${realPkg.version}`

// 1) package.json só de publicação: sem devDependencies, sem scripts do repositório, sem
//    `private`, e sem `react-router` em dependencies (contrato do pacote: só existe na
//    entrada opcional rendra-ui/router-bridge).
const dependencies = { ...(realPkg.dependencies ?? {}) }
delete dependencies['react-router']
const publishPkg = {
  name: realPkg.name,
  version: realPkg.version,
  type: realPkg.type,
  license: realPkg.license,
  description: realPkg.description,
  main: realPkg.main,
  types: realPkg.types,
  bin: realPkg.bin,
  files: realPkg.files,
  sideEffects: realPkg.sideEffects,
  exports: realPkg.exports,
  peerDependencies: realPkg.peerDependencies,
  dependencies,
}

rmSync(WORK, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 })
mkdirSync(STAGE_DIR, { recursive: true })
mkdirSync(PACK_OUT_DIR, { recursive: true })

// dist/ tem o próprio WORK dentro (dist/.verify-pack): copia só os arquivos publicados
// (o "files": ["dist"] do package.json), nunca a pasta de trabalho deste script.
mkdirSync(join(STAGE_DIR, 'dist'), { recursive: true })
for (const entry of readdirSync(DIST)) {
  if (entry === '.verify-pack') continue
  cpSync(join(DIST, entry), join(STAGE_DIR, 'dist', entry), { recursive: true })
}
writeFileSync(join(STAGE_DIR, 'package.json'), JSON.stringify(publishPkg, null, 2))
const licensePath = join(ROOT, 'LICENSE')
if (existsSync(licensePath)) cpSync(licensePath, join(STAGE_DIR, 'LICENSE'))

// 2) Empacota (o mesmo comando do npm publish).
const packOutput = execFileSync(
  'npm',
  ['pack', STAGE_DIR, '--pack-destination', PACK_OUT_DIR, '--json'],
  { cwd: ROOT, encoding: 'utf8', shell: process.platform === 'win32' },
)
const [packResult] = JSON.parse(packOutput)
const tarballPath = join(PACK_OUT_DIR, packResult.filename)
assert(existsSync(tarballPath), `npm pack gerou o tarball (${packResult.filename}).`)

// 3) Caminho 1: instala o tarball num projeto novo, fora do repositório (fora de qualquer
//    node_modules existente), com --prefer-offline. Só segue por este caminho se o ambiente
//    tiver rede (ou cache local) para os peers (react, react-dom, radix-ui).
let path = 'estrutural'
let packageJsonForAssertions = publishPkg
let renderModuleSpecifier = join(EXTRACT_DIR, 'package', 'dist', 'index.js')
let tokensCssPath = join(EXTRACT_DIR, 'package', 'dist', 'tokens.css')
let entryJsPath = join(EXTRACT_DIR, 'package', 'dist', 'index.js')

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
    // Instalação de verdade (~200 pacotes na primeira vez): mais lenta que os 30s de um
    // timeout apertado. Um timeout curto demais mata o npm no meio da escrita e deixa
    // arquivo travado no Windows (EPERM na limpeza a seguir), não prova que a rede falhou.
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
    renderModuleSpecifier = join(installedDir, 'index.js')
  }
} catch {
  // Sem rede (ou sem cache): segue para a verificação estrutural, sem instalar nada.
  rmSync(consumerDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 })
}
// consumerDir só é removido depois das asserções (limpeza no fim do arquivo): elas leem
// arquivos de dentro dele quando o caminho usado é "instalação".

// 4) Caminho 2 (estrutural): descompacta o tarball direto, sem instalar.
if (path === 'estrutural') {
  mkdirSync(EXTRACT_DIR, { recursive: true })
  execFileSync('tar', ['-xzf', tarballPath, '-C', EXTRACT_DIR])
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

// Asserção 3: banner com a versão exata em tokens.css e no arquivo de entrada do JS.
assert(existsSync(tokensCssPath), 'tokens.css está no pacote publicado.')
const tokensCss = readFileSync(tokensCssPath, 'utf8')
assert(tokensCss.includes(BANNER_TEXT), `tokens.css contém o banner "${BANNER_TEXT}".`)
assert(
  /--rendra-primary:\s*#[0-9a-fA-F]{3,8}/.test(tokensCss),
  'tokens.css define --rendra-primary (paleta padrão).',
)
assert(
  /--rendra-background:\s*#[0-9a-fA-F]{3,8}/.test(tokensCss),
  'tokens.css define --rendra-background (tema padrão do sistema).',
)

assert(existsSync(entryJsPath), 'dist/index.js está no pacote publicado.')
const entryJs = readFileSync(entryJsPath, 'utf8')
assert(entryJs.includes(BANNER_TEXT), `dist/index.js contém o banner "${BANNER_TEXT}".`)

// Asserção 1: o componente renderiza HTML sem lançar erro. `Button` é `forwardRef(...)`:
// no runtime do React isso é um objeto (não uma function), então a prova real é o próprio
// render (regra 4 do CLAUDE.md: o teste confere o resultado, nunca só a chamada).
const mod = await import(`file://${renderModuleSpecifier.split('\\').join('/')}`)
assert(mod.Button != null, 'O módulo publicado exporta Button.')
const html = renderToStaticMarkup(createElement(mod.Button, {}, 'Verificar pacote'))
assert(html.includes('<button') && html.includes('Verificar pacote'), 'Button renderiza HTML.')

rmSync(WORK, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 })
rmSync(consumerDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 })

console.log('\nverify-pack: tudo passou.')
