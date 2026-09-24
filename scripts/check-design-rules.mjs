#!/usr/bin/env node
/*
 * Verificador das regras do DESIGN_RULES.md que o Tailwind não consegue barrar sozinho.
 * Roda em CI e no pré-commit: `npm run check:rules`.
 *
 * Proíbe, fora de src/brand e src/styles:
 *  - cor fixa (hexadecimal, rgb(), hsl(), oklch())
 *  - valor arbitrário do Tailwind (p-[13px], text-[#fff], w-[37rem])
 *  - estilo inline (style={{ ... }}), exceto variáveis CSS dinâmicas (--x)
 *  - nome de fonte fixo
 *  - importação de SVG de marca fora de src/brand
 *  - arquivo de variante mobile ou paralela de componente (TableMobile, SelectSimples...)
 *  - 100vh (usar 100dvh / h-dvh)
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

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
    test: /font-family|fontFamily|\b(Poppins|Inter|Roboto|Arial|Helvetica)\b/g,
    message: 'Nome de fonte fixo. A fonte vem de --brand-font em theme.css.',
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
      'Variáveis --color-*, --radius-* etc. do Tailwind são inline e não existem no CSS. Em JS use as do tema: var(--primary), var(--chart-1), var(--shape-control).',
  },
  {
    id: 'svg-marca',
    test: /from\s+['"][^'"]*brand\/assets[^'"]*['"]/g,
    message:
      'SVG de marca importado fora de src/brand. Leia o logotipo e o símbolo via useBrand().',
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
  if (ALLOWED_DIRS.some((d) => file.startsWith(d))) continue
  if (file.endsWith('.css')) continue
  const lines = readFileSync(file, 'utf8').split('\n')
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
