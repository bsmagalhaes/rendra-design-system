/*
 * Gera o CSS pré-compilado do pacote.
 *
 * `npm run build:lib` chama este script por último, depois de `vite build` (o JS) e do
 * `tsc` (os .d.ts): ver a cadeia completa no `package.json` (script `build:lib`).
 *
 * Estratégia A (CSS pré-compilado, escolhida em vez de exigir o Tailwind instalado no host):
 * roda o Tailwind (a mesma
 * engine de `src/styles/globals.css`, via @tailwindcss/node, já usada por @tailwindcss/vite)
 * com o @theme zerado e as @utility do projeto, escaneando só os arquivos que o pacote
 * publica (nunca src/app, src/pages, src/mocks ou src/stories, que são do boilerplate).
 * O host recebe só variáveis --rendra-* e as camadas rendra.base/rendra.components: nenhuma
 * classe do Tailwind do host é sobrescrita (o comentário de ordem de camadas em globals.css
 * explica por quê) e o host não precisa ter o Tailwind instalado.
 *
 * Saída em dist/:
 *   tokens.css      o tema padrão (sistema) e a paleta padrão (a primeira de
 *                   src/brand/palettes.ts), claro e escuro, sem a fonte da marca (correção do
 *                   Opus, item 2 da validação do plano: sem @font-face; --rendra-brand-font
 *                   cai na pilha de fontes do sistema). Nenhuma variável fora de --rendra- e
 *                   --tw- sai daqui (correção do risco residual apontado depois da entrega do
 *                   Lote A: o namespace inteiro do Tailwind, --color-*, --radius-*, --shadow-*,
 *                   --font-sans/mono, --text-label/help, e também --spacing-*, --text-* da
 *                   escala, --font-weight-*, --tracking-*, --container-*, --ease-*, --animate-*
 *                   e --default-* do preset embutido, colidiria com o @theme de um host que
 *                   também use Tailwind v4, e alguns mudam o padrão dele, como
 *                   --default-font-family e --ease-out/--ease-in-out). Duas saídas para essas
 *                   variáveis, decididas por renameResponsiveThemeVars/collectInlineMap:
 *                     - as dez que mudam de valor a partir de md (spacing-control-sm/md/lg,
 *                       spacing-header, text-xl/2xl/3xl e suas --line-height) continuam
 *                       variável em tempo de execução, só que renomeada para --rendra-*;
 *                     - todo o resto (nunca muda em tempo de execução) é inlineado: o valor
 *                       literal entra direto na declaração de cada utility compilada
 *                       (components.css/base.css), a variável nunca chega a existir no host.
 *                   A exceção já conhecida (--font-sans, que rendra.base referencia direto,
 *                   escrito à mão em `html { font-family: var(--font-sans) }` fora de
 *                   qualquer utility gerada) continua reescrita à parte para
 *                   `var(--rendra-brand-font)`, porque --font-sans é `@theme inline` e nunca
 *                   chega a ser declarada (nada a inlinear: o Tailwind já resolve sozinho todo
 *                   uso dentro de uma utility gerada).
 *   base.css        preflight do Tailwind + @layer rendra.base (reset do Rendra).
 *   components.css  @layer properties (fallback das --tw-* para navegador sem @property,
 *                   correção do Fable, item 3: mantido aqui, nunca descartado), @utility do
 *                   projeto e @layer rendra.components, já compilados para CSS real (o host
 *                   não escaneia os componentes do pacote para gerar classe).
 *
 * Cada arquivo sai com o banner de scripts/lib/pkg-banner.ts, com a versão de package.json.
 */
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, posix } from 'node:path'
import { compile } from '@tailwindcss/node'
import { Scanner } from '@tailwindcss/oxide'
import { format, resolveConfig } from 'prettier'
import { createPalette, paletteCss } from '../src/brand/palette.ts'
import { paletteSeeds } from '../src/brand/palettes.ts'
import { packageBanner } from './lib/pkg-banner.ts'

const ROOT = process.cwd()
const OUT_DIR = join(ROOT, 'dist')
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const BANNER = packageBanner(pkg.version)

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

/**
 * Extrai o miolo da primeira regra `seletor { ... }` de dentro de `text` (chaves
 * balanceadas), devolvendo o miolo e o texto ao redor (antes e depois), para reescrever só
 * o miolo sem arriscar as chaves.
 */
function extractFirstRule(text) {
  const braceStart = text.indexOf('{')
  if (braceStart === -1) return null
  let depth = 1
  let j = braceStart + 1
  while (depth > 0 && j < text.length) {
    if (text[j] === '{') depth++
    else if (text[j] === '}') depth--
    j++
  }
  return {
    before: text.slice(0, braceStart + 1),
    inner: text.slice(braceStart + 1, j - 1),
    after: text.slice(j - 1),
  }
}

/**
 * Variáveis do namespace padrão do Tailwind (tipografia e controles) que mudam de valor a
 * partir de md (48rem, o `@media` de globals.css fora do `@theme`, preservado em "rest"):
 * essas dez precisam continuar sendo variável em tempo de execução (não dá para inlinear um
 * valor único), mas sob o prefixo `--rendra-`, para nunca colidir com o `@theme` de um host
 * que também use Tailwind v4. A troca é só textual (declaração e toda referência var(...)),
 * feita de uma vez no CSS inteiro compilado, antes de qualquer outra coisa: o `@media` de
 * "rest" referencia os mesmos nomes originais, então sai renomeado junto.
 */
const RESPONSIVE_THEME_VARS = [
  '--spacing-control-sm',
  '--spacing-control-md',
  '--spacing-control-lg',
  '--spacing-header',
  '--text-xl',
  '--text-xl--line-height',
  '--text-2xl',
  '--text-2xl--line-height',
  '--text-3xl',
  '--text-3xl--line-height',
]

function renameResponsiveThemeVars(css) {
  let out = css
  for (const name of RESPONSIVE_THEME_VARS) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const renamed = `--rendra-${name.slice(2)}`
    out = out.replace(new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`, 'g'), renamed)
  }
  return out
}

/** Declarações (nome -> valor) do miolo de `:root, :host { ... }` da camada "theme". */
function collectThemeDeclarations(themeLayerText) {
  const rule = extractFirstRule(themeLayerText)
  const map = new Map()
  if (!rule) return map
  for (const decl of rule.inner.split(';')) {
    const trimmed = decl.trim()
    if (!trimmed) continue
    const idx = trimmed.indexOf(':')
    if (idx === -1) continue
    map.set(trimmed.slice(0, idx).trim(), trimmed.slice(idx + 1).trim())
  }
  return map
}

/**
 * Troca cada `var(--nome)` (ou `var(--nome, alternativa)`, inclusive aninhado) por um valor
 * literal, quando `resolve(nome)` devolve algo; sem resolução, mantém `var(...)` como estava
 * (variável do próprio componente, como --progress ou --delay, nunca entra no mapa). Parênteses
 * balanceados: valores como cubic-bezier(...) ou calc(...) não confundem o fim da expressão.
 */
function replaceVarReferences(text, resolve) {
  let out = ''
  let i = 0
  while (i < text.length) {
    if (text.startsWith('var(', i)) {
      let depth = 1
      let j = i + 4
      while (depth > 0 && j < text.length) {
        if (text[j] === '(') depth++
        else if (text[j] === ')') depth--
        j++
      }
      const inner = replaceVarReferences(text.slice(i + 4, j - 1), resolve)
      let parenDepth = 0
      let commaIdx = -1
      for (let k = 0; k < inner.length; k++) {
        if (inner[k] === '(') parenDepth++
        else if (inner[k] === ')') parenDepth--
        else if (inner[k] === ',' && parenDepth === 0) {
          commaIdx = k
          break
        }
      }
      const name = (commaIdx === -1 ? inner : inner.slice(0, commaIdx)).trim()
      const resolved = resolve(name)
      out += resolved !== undefined ? resolved : `var(${inner})`
      i = j
      continue
    }
    out += text[i]
    i++
  }
  return out
}

/**
 * Mapa (nome -> valor literal) de tudo que a camada "theme" declara fora de --rendra-* e
 * --tw-*: o namespace padrão do Tailwind inteiro (spacing, text, font-weight, tracking,
 * container, ease, animate, default-*, leading), nenhum deles lido por nenhuma variável
 * própria do Rendra (as dez de RESPONSIVE_THEME_VARS já saíram renomeadas antes disso rodar,
 * então nunca entram aqui). Correção do risco residual: o dist/tokens.css não pode gravar
 * nada desse namespace no host, e as utilities compiladas usam o valor direto.
 */
function collectInlineMap(themeLayerText) {
  const map = collectThemeDeclarations(themeLayerText)
  for (const name of [...map.keys()]) {
    if (name.startsWith('--rendra-') || name.startsWith('--tw-')) map.delete(name)
  }
  return map
}

/**
 * Do miolo de `:root, :host { ... }` da camada "theme", mantém só o que começa com --rendra-
 * (as dez variáveis renomeadas) ou --tw- (não deveria aparecer aqui, mantido por segurança);
 * tudo o mais já foi inlineado no CSS inteiro por collectInlineMap/replaceVarReferences.
 * Sem nada para manter, devolve string vazia: o `@layer theme { ... }` some do tokens.css.
 */
function keepOnlyRendraDeclarations(themeLayerText) {
  const rule = extractFirstRule(themeLayerText)
  if (!rule) return ''
  const kept = rule.inner
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .filter((decl) => {
      const name = decl.split(':')[0]?.trim() ?? ''
      return name.startsWith('--rendra-') || name.startsWith('--tw-')
    })
  if (kept.length === 0) return ''
  return `${rule.before}\n${kept.map((d) => `    ${d};`).join('\n')}\n  ${rule.after}`
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
  const builtRaw = result.build(candidates).replace(/^\/\*![^*]*\*\/\s*/, '')

  // 5a) As dez variáveis responsivas (mudam a partir de md) saem renomeadas para --rendra-*
  //     antes de qualquer outra coisa, para nunca entrarem na lista de inlineamento a seguir.
  const builtRenamed = renameResponsiveThemeVars(builtRaw)

  // 5b) Todo o resto do namespace padrão do Tailwind (spacing, text, font-weight, tracking,
  //     container, ease, animate, default-*, leading) nunca muda em tempo de execução: em vez
  //     de ficar declarado (o que colidiria com o @theme de um host Tailwind v4), o valor
  //     entra direto na utility compilada. Várias passadas: um valor pode citar outro (ex.:
  //     --animate-draw cita var(--ease-out)), então uma passada só deixaria a referência solta.
  const inlineMap = collectInlineMap(extractLayers(builtRenamed).layers.theme ?? '')
  const resolve = (name) => inlineMap.get(name)
  let builtInlined = builtRenamed
  for (let pass = 0; pass < 5; pass++) {
    const next = replaceVarReferences(builtInlined, resolve)
    if (next === builtInlined) break
    builtInlined = next
  }

  const { layers, rest } = extractLayers(builtInlined)

  // rendra.base referencia var(--font-sans) direto (html { font-family: var(--font-sans) },
  // escrito à mão em globals.css); --font-sans só espelhava --rendra-brand-font (@theme
  // inline), então a referência vira --rendra-brand-font antes de --font-sans sumir do
  // tokens.css (correção do Fable, item 2).
  const rendraBaseFixed = (layers['rendra.base'] ?? '').replaceAll(
    'var(--font-sans)',
    'var(--rendra-brand-font)',
  )

  // A ordem de camada vazia (`@layer properties;`, sem miolo) só reserva o nome: o miolo de
  // verdade (o fallback das --tw-*) vai para components.css a seguir, então a reserva vazia
  // não tem função no tokens.css e sai (correção do Fable, item 3).
  const tokensRest = rest.replace(/@layer properties;\s*/, '').trim()

  const themeKept = layers.theme ? keepOnlyRendraDeclarations(layers.theme) : ''

  const tokensCss = [BANNER, tokensRest, themeKept ? `@layer theme {\n${themeKept}}` : '']
    .filter(Boolean)
    .join('\n\n')

  const baseCss = [
    BANNER,
    layers.base ? `@layer base {\n${layers.base}}` : '',
    rendraBaseFixed ? `@layer rendra.base {\n${rendraBaseFixed}}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')

  const componentsCss = [
    BANNER,
    // Fallback das --tw-* para navegador sem @property (correção do Fable, item 3): mantido,
    // nunca descartado.
    layers.properties ? `@layer properties {\n${layers.properties}}` : '',
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
