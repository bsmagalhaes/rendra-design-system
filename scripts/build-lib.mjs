/*
 * Gera o CSS pré-compilado do pacote (2.1.0-alpha.1, Lote A, docs/specs/fase3-plano.md).
 *
 *   npm run build:lib   (chamado por dentro de scripts/build-lib.mjs após `vite build --config vite.lib.config.ts`)
 *
 * Estratégia A (CSS pré-compilado, seção 2.2 do v2-plano.md): roda o Tailwind (a mesma
 * engine de `src/styles/globals.css`, via @tailwindcss/node, já usada por @tailwindcss/vite)
 * com o @theme zerado e as @utility do projeto, escaneando só os arquivos que o pacote
 * publica (nunca src/app, src/pages, src/mocks ou src/stories, que são do boilerplate).
 * O host recebe só variáveis --rendra-* e as camadas rendra.base/rendra.components: nenhuma
 * classe do Tailwind do host é sobrescrita (o comentário de ordem de camadas em globals.css
 * explica por quê) e o host não precisa ter o Tailwind instalado.
 *
 * Saída em dist/:
 *   tokens.css      @theme (escala) + @theme inline (ponte --color-* -> --rendra-*) + a
 *                   camada "theme" do Tailwind + o tema padrão (sistema) e a paleta padrão
 *                   (a primeira de src/brand/palettes.ts), claro e escuro, sem a fonte da
 *                   marca (correção do Opus, item 2 da validação do plano: sem @font-face;
 *                   --rendra-brand-font cai na pilha de fontes do sistema).
 *   base.css        preflight do Tailwind + @layer rendra.base (reset do Rendra).
 *   components.css  @utility do projeto e @layer rendra.components, já compilados para CSS
 *                   real (o host não escaneia os componentes do pacote para gerar classe).
 *
 * Cada arquivo sai com o banner `Rendra Design System vX.Y.Z`, com a versão de package.json.
 */
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, posix } from 'node:path'
import { compile } from '@tailwindcss/node'
import { Scanner } from '@tailwindcss/oxide'
import { format, resolveConfig } from 'prettier'
import { createPalette, paletteCss } from '../src/brand/palette.ts'
import { paletteSeeds } from '../src/brand/palettes.ts'

const ROOT = process.cwd()
const OUT_DIR = join(ROOT, 'dist')
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const BANNER = `/*! Rendra Design System v${pkg.version} | MIT */`

/** Lista arquivos de um diretório (recursivo), com a extensão pedida, sem teste e sem story. */
function listSourceFiles(dir, extensions) {
  const out = []
  const walk = (current) => {
    for (const entry of readdirSync(current)) {
      const full = join(current, entry)
      const info = statSync(full)
      if (info.isDirectory()) {
        walk(full)
        continue
      }
      if (entry.includes('.test.') || entry.includes('.stories.')) continue
      if (!extensions.some((ext) => entry.endsWith(ext))) continue
      out.push(full)
    }
  }
  walk(dir)
  return out
}

/**
 * Arquivos que o pacote publica (mesma superfície de src/index.ts, dos quatro subcaminhos
 * pesados e da ponte de rotas): só eles entram no escaneamento de classes usadas, nunca o
 * boilerplate (src/app, src/pages, src/mocks, src/stories, src/config).
 */
const PACKAGE_SOURCE_DIRS = [
  'src/components/ui',
  'src/components/layout',
  'src/components/app-shell',
]
const PACKAGE_SOURCE_FILES = [
  'src/components/rendra-provider.tsx',
  'src/components/rendra-router-bridge.tsx',
  'src/lib/control.ts',
]
const sourceFiles = [
  ...PACKAGE_SOURCE_DIRS.flatMap((dir) => listSourceFiles(join(ROOT, dir), ['.ts', '.tsx'])),
  ...PACKAGE_SOURCE_FILES.map((f) => join(ROOT, f)),
]

/**
 * Nomes das @utility do projeto (globals.css): vocabulário público de classes do design
 * system, que o projeto que consome o pacote também escreve nas próprias telas (não só o
 * que os componentes do pacote usam por dentro). Por isso entram sempre nos candidatos,
 * mesmo sem aparecer em nenhum arquivo escaneado.
 */
function extractUtilityNames(css) {
  const names = new Set()
  const re = /@utility\s+([a-zA-Z0-9_-]+)/g
  let m
  while ((m = re.exec(css))) names.add(m[1])
  return [...names]
}

/**
 * Camadas de nível superior (@layer nome { ... }), com chaves balanceadas. Só reconhece
 * `@layer` quando ele está no nível zero do documento (nunca dentro de outro @media ou
 * @supports): um @layer aninhado dentro de um bloco não reconhecido aqui fica dentro do
 * texto desse bloco (em `rest`), preservando a condição em vez de arriscar corromper as
 * chaves ao arrancar só o miolo.
 */
function extractLayers(css) {
  const layers = {}
  let rest = ''
  let i = 0
  const n = css.length
  const layerRe = /^@layer\s+([a-zA-Z0-9_.-]+)\s*\{/
  while (i < n) {
    if (css[i] === '@') {
      const m = layerRe.exec(css.slice(i))
      if (m) {
        const name = m[1]
        const braceStart = i + m[0].length - 1
        let depth = 1
        let j = braceStart + 1
        while (depth > 0 && j < n) {
          if (css[j] === '{') depth++
          else if (css[j] === '}') depth--
          j++
        }
        layers[name] = (layers[name] ?? '') + css.slice(braceStart + 1, j - 1) + '\n'
        i = j
        continue
      }
    }
    rest += css[i]
    i++
  }
  return { layers, rest }
}

async function formatCss(source, filepath) {
  const config = (await resolveConfig(filepath)) ?? {}
  return format(source, { ...config, filepath })
}

async function main() {
  // 1) Tema padrão (sistema), sem as três @font-face da marca e sem o nome da fonte na
  //    pilha (correção do Opus, item 2): --rendra-brand-font cai direto na pilha do sistema.
  const themeCssRaw = readFileSync(join(ROOT, 'src/styles/theme.css'), 'utf8')
  const themeCssNoBrandFont = themeCssRaw
    .replace(/@font-face\s*\{[^}]*\}\s*\n?/g, '')
    .replace(/--rendra-brand-font:\s*'Brand Sans',\s*/, '--rendra-brand-font: ')

  // 2) Paleta padrão: a primeira de src/brand/palettes.ts (Safira), claro e escuro.
  const defaultPaletteCss = paletteCss(createPalette(paletteSeeds[0]), true)

  // 3) globals.css com o import da marca do projeto (themes.css) trocado pelos padrões
  //    genéricos do pacote (nunca a marca de demonstração deste repositório).
  const globalsCss = readFileSync(join(ROOT, 'src/styles/globals.css'), 'utf8')
  const THEMES_IMPORT = `@import './themes.css';`
  if (!globalsCss.includes(THEMES_IMPORT)) {
    throw new Error(`build-lib: linha "${THEMES_IMPORT}" não encontrada em globals.css`)
  }
  const packageEntryCss = globalsCss.replace(
    THEMES_IMPORT,
    [
      '/* Tema e paleta padrão do pacote (Safira, claro e escuro), sem as fontes da marca. */',
      themeCssNoBrandFont,
      defaultPaletteCss,
    ].join('\n'),
  )

  // 4) Candidatos: classes usadas pelos arquivos do pacote, mais o nome de cada @utility
  //    do projeto (vocabulário público, independente de uso interno).
  const scanner = new Scanner({})
  const scanned = scanner.scanFiles(
    sourceFiles.map((file) => ({ content: readFileSync(file, 'utf8'), extension: 'tsx' })),
  )
  const candidates = [...new Set([...scanned, ...extractUtilityNames(globalsCss)])]

  // 5) Compila. onDependency é ignorado: não gravamos observador de arquivo, é um build único.
  const result = await compile(packageEntryCss, { base: ROOT, onDependency: () => {} })
  const built = result.build(candidates).replace(/^\/\*![^*]*\*\/\s*/, '')

  const { layers, rest } = extractLayers(built)

  const tokensCss = [BANNER, rest.trim(), layers.theme ? `@layer theme {\n${layers.theme}}` : '']
    .filter(Boolean)
    .join('\n\n')

  const baseCss = [
    BANNER,
    layers.base ? `@layer base {\n${layers.base}}` : '',
    layers['rendra.base'] ? `@layer rendra.base {\n${layers['rendra.base']}}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')

  const componentsCss = [
    BANNER,
    layers.utilities ? `@layer utilities {\n${layers.utilities}}` : '',
    layers['rendra.components']
      ? `@layer rendra.components {\n${layers['rendra.components']}}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n')

  mkdirSync(OUT_DIR, { recursive: true })
  const files = {
    'tokens.css': tokensCss,
    'base.css': baseCss,
    'components.css': componentsCss,
  }
  for (const [name, content] of Object.entries(files)) {
    const outPath = join(OUT_DIR, name)
    const formatted = await formatCss(content, outPath)
    writeFileSync(outPath, formatted)
    console.log(`Gerado ${posix.join('dist', name)} (${formatted.length} bytes).`)
  }
}

await main()
