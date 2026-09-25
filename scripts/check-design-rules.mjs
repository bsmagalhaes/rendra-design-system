#!/usr/bin/env node
/*
 * Verificador das regras do DESIGN_RULES.md que o Tailwind não consegue barrar sozinho.
 * Roda no CI (.github/workflows/ci.yml) em todo Pull Request e localmente com
 * `npm run check:rules`.
 *
 * Proíbe, fora de src/brand e src/styles:
 *  - cor fixa (hexadecimal, rgb(), hsl(), oklch())
 *  - valor arbitrário do Tailwind (p-[13px], text-[#fff], w-[37rem])
 *  - estilo inline (style={{ ... }}), exceto variáveis CSS dinâmicas (--x)
 *  - nome de fonte fixo
 *  - importação de SVG de marca fora de src/brand
 *  - arquivo de variante mobile ou paralela de componente (TableMobile, SelectSimples...)
 *  - 100vh (usar 100dvh / h-dvh)
 *  - classe montada por template string (p-${n}): o Tailwind não gera a classe
 *  - arquivo .css fora de src/styles e src/brand
 * Em todo arquivo .ts/.tsx/.css, incluindo src/brand e src/styles (DESIGN_RULES.md, "Nome das
 * variáveis CSS"):
 *  - variável própria do Rendra sem o prefixo --rendra- (var(--primary), var(--radius)...)
 * Nas telas do sistema (src/pages/app), também:
 *  - texto orientativo no corpo (description de texto no PageHeader): vai em help, no ícone
 *    de informação que abre um modal
 *  - botão solto no conteúdo de um card: ação de card vai em CardHeader actions
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { checkVarPrefix } from './lib/var-prefix.ts'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')
const ALLOWED_DIRS = [join(SRC, 'brand'), join(SRC, 'styles')]

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

const rules = [
  {
    id: 'cor-fixa',
    test: /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab)\(/g,
    message: 'Cor fixa em componente. Use um token semântico (bg-primary, text-muted-foreground).',
    skipLine: (line) => /^\s*(\/\/|\*|\/\*)/.test(line) || /&#\d+;/.test(line),
  },
  {
    id: 'valor-arbitrario',
    // Valor arbitrário (p-[13px]). Variantes de estado (data-[state=open]:) terminam em ':' e são
    // permitidas; transition-[...] só lista propriedades, também permitido.
    test: /(?<![\w-])(?:[a-z]+:)*-?(?!transition-)[a-z][a-z-]*-\[[^\]\s]+\](?!(?:\/[\w-]+)?:)/g,
    message: 'Valor arbitrário do Tailwind. Use a escala de tokens ou crie um token nomeado.',
    skipLine: (line) => /^\s*(\/\/|\*|\/\*)/.test(line),
  },
  {
    id: 'estilo-inline',
    // Qualquer style= que não seja só variável CSS (--x) é estilo inline.
    test: /style=\{(?![^}]*['"]--)(?!\s*$)/g,
    message: 'Estilo inline. Use classes; para valor dinâmico use variável CSS (--x).',
  },
  {
    id: 'fonte-fixa',
    // Só em contexto de fonte (declaração ou nome entre aspas numa pilha de fontes): a
    // palavra "Inter" num texto da interface não é violação.
    test: /font-family|fontFamily|['"](?:Poppins|Inter|Roboto|Arial|Helvetica)(?:['",]| sans| serif)/g,
    message: 'Nome de fonte fixo. A fonte vem de --rendra-brand-font em theme.css.',
  },
  {
    id: '100vh',
    test: /100vh|\bh-screen\b|\bmin-h-screen\b/g,
    message: 'Use 100dvh (h-dvh / min-h-dvh), nunca 100vh.',
  },
  {
    id: 'var-inline',
    test: /var\(--(?:color|radius|shadow|font|spacing)-/g,
    message:
      'Variáveis --color-*, --radius-* etc. do Tailwind são inline e não existem no CSS. Em JS use as do tema: var(--rendra-primary), var(--rendra-chart-1), var(--rendra-shape-control).',
  },
  {
    id: 'svg-marca',
    test: /from\s+['"][^'"]*brand\/assets[^'"]*['"]/g,
    message:
      'SVG de marca importado fora de src/brand. Leia o logotipo e o símbolo via useBrand().',
  },
  {
    id: 'classe-dinamica',
    // O Tailwind só gera classes escritas por inteiro no código: `p-${n}` não existe no CSS.
    test: /(?<![\w-])(?:[a-z]+:)*-?(?:p[xytrbl]?|m[xytrbl]?|gap(?:-[xy])?|w|h|size|min-[wh]|max-[wh]|inset|top|left|right|bottom|z|text|bg|border(?:-[xytrbl])?|rounded(?:-[a-z]+)?|grid-cols|grid-rows|col-span|row-span|space-[xy]|translate-[xy]|opacity|font|leading|tracking|shadow|ring|fill|stroke|line-clamp|basis|order)-\$\{/g,
    message:
      'Classe montada por template string não é gerada pelo Tailwind. Escreva a classe inteira (mapa de valores) ou use variável CSS.',
    skipLine: (line) => /^\s*(\/\/|\*|\/\*)/.test(line),
  },
  {
    id: 'texto-estreito',
    test: /<p\s[^>]*className=["'{][^>]*max-w-/g,
    message:
      'Texto ocupa 100% da largura disponível. Limite de largura (max-w-*) em parágrafo só quando o layout pedir outra medida.',
  },
  {
    id: 'primaria-como-texto',
    test: /(?<![\w-])(?:[\w-]+:)*text-primary(?![\w-])/g,
    message:
      'Primária como texto usa text-primary-text (tom que passa AA no claro e no escuro). text-primary é só para o preenchimento.',
  },
]

// Degraus fora da escala não geram CSS (o Tailwind ignora em silêncio e o layout quebra).
const ALLOWED_STEPS = new Set(['0', '1', '2', '3', '4', '6', '8', '12', '16', '24'])
const STEP_CLASS =
  /(?<![\w-])-?(?:p[xytrbl]?|m[xytrbl]?|gap(?:-[xy])?|w|h|size|min-[wh]|max-[wh]|inset(?:-[xy])?|top|left|right|bottom|space-[xy]|translate-[xy]|scroll-[mp][xytrbl]?)-(\d+(?:\.\d+)?)(?![\d/.\w-])/g
rules.push({
  id: 'fora-da-escala',
  message:
    'Degrau fora da escala (permitidos: 0, 1, 2, 3, 4, 6, 8, 12, 16, 24). Use a escala ou um token nomeado.',
  skipLine: (line) => /^\s*(\/\/|\*|\/\*)/.test(line),
  test: {
    lastIndex: 0,
    test(line) {
      for (const m of line.matchAll(STEP_CLASS)) if (!ALLOWED_STEPS.has(m[1])) return true
      return false
    },
  },
})

const forbiddenFileNames = /(Mobile|Simples|Simple|ComBusca|Grande|Pequeno|Small|Large)\.(t|j)sx?$/i
const forbiddenFileNamesKebab = /-(mobile|simples|simple|com-busca|grande|pequeno)\.(t|j)sx?$/i

const files = walk(SRC).filter((f) => /\.(tsx?|jsx?|css)$/.test(f))
const problems = []

// Regras que olham o arquivo inteiro (JSX em várias linhas), só nas telas do sistema.
const APP_PAGES = join(SRC, 'pages', 'app')
const fileRules = [
  {
    id: 'texto-orientativo',
    test: /<PageHeader\b(?:(?!\/>)[\s\S])*?\bdescription=\s*(?:["'`]|\{\s*["'`])/g,
    message:
      'Texto orientativo no corpo da tela. Use PageHeader help (ícone de informação ao lado do título, que abre um modal).',
  },
  {
    id: 'texto-orientativo',
    // Subtítulo que dá instrução (começa com verbo no imperativo) também é texto orientativo.
    test: /(?:description=\{?\s*["'`]|<CardDescription>\s*)(?:Comece|Clique|Toque|Arraste|Preencha|Use|Escolha|Selecione|Digite|Informe|Veja|Confira)\b/g,
    message:
      'Instrução no subtítulo. Use help (PageHeader, CardTitle ou FormSection): ícone de informação que abre um modal.',
  },
  {
    id: 'botao-solto',
    test: /<CardContent\b[^>]*>\s*(?:<Stack\b[^>]*>\s*)?<Button\b|<Button\b[^>]*\bself-(?:start|end|center)\b/g,
    message:
      'Botão solto no conteúdo. Ação de card vai em CardHeader actions; da tela, no PageHeader actions ou na ActionBar.',
  },
]

for (const file of files) {
  const rel = relative(ROOT, file).split(sep).join('/')
  if (forbiddenFileNames.test(file) || forbiddenFileNamesKebab.test(file)) {
    problems.push({
      rel,
      line: 0,
      id: 'componente-duplicado',
      message: 'Arquivo de variante paralela ou mobile. Resolva com props no componente único.',
    })
  }
  const text = readFileSync(file, 'utf8')
  // Roda em todo arquivo, inclusive src/brand e src/styles: é lá que o tema declara as
  // variáveis, e a ponte para o Tailwind (@theme inline) precisa continuar citando --rendra-*.
  for (const p of checkVarPrefix(text))
    problems.push({
      rel,
      line: p.line,
      id: 'variavel-sem-prefixo-rendra',
      message: p.message,
      src: p.src,
    })

  if (ALLOWED_DIRS.some((d) => file.startsWith(d))) continue
  if (file.endsWith('.css')) {
    problems.push({
      rel,
      line: 0,
      id: 'css-fora-do-lugar',
      message:
        'CSS fora de src/styles e src/brand. Estilo de componente é classe do Tailwind; token vai em globals.css; marca, em theme.css.',
    })
    continue
  }
  if (file.startsWith(APP_PAGES))
    for (const rule of fileRules)
      for (const m of text.matchAll(rule.test)) {
        const line = text.slice(0, m.index).split('\n').length
        const src = m[0].split('\n')[0].trim()
        problems.push({ rel, line, id: rule.id, message: rule.message, src })
      }
  const lines = text.split('\n')
  lines.forEach((line, i) => {
    for (const rule of rules) {
      if (rule.skipLine?.(line)) continue
      rule.test.lastIndex = 0
      if (rule.test.test(line)) {
        problems.push({ rel, line: i + 1, id: rule.id, message: rule.message, src: line.trim() })
      }
    }
  })
}

if (problems.length) {
  for (const p of problems) {
    console.error(`\n${p.rel}:${p.line}  [${p.id}] ${p.message}`)
    if (p.src) console.error(`    ${p.src.slice(0, 160)}`)
  }
  console.error(`\n${problems.length} violação(ões) das regras de design.`)
  process.exit(1)
}
console.log(`Regras de design: ${files.length} arquivos verificados, nenhuma violação.`)
