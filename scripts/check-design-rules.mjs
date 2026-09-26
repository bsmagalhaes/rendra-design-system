#!/usr/bin/env node
/*
 * Verificador das regras do DESIGN_RULES.md que o Tailwind não consegue barrar sozinho.
 * Roda no CI (.github/workflows/ci.yml) em todo Pull Request e localmente com
 * `npm run check:rules`.
 *
 * Proíbe, fora de src/brand e src/styles:
 *  - cor fixa, valor arbitrário do Tailwind, estilo inline, fonte fixa, 100vh e raio fixo:
 *    as seis regras genéricas de DESIGN_RULES.md, compartilhadas com a CLI publicada
 *    (`rendra auditar`, fase 3, Lote B) em src/cli/auditar.ts, para nunca duplicar a lógica
 *  - importação de SVG de marca fora de src/brand
 *  - arquivo de variante mobile ou paralela de componente (TableMobile, SelectSimples...)
 *  - classe montada por template string (p-${n}): o Tailwind não gera a classe
 *  - arquivo .css fora de src/styles e src/brand
 * Em todo arquivo .ts/.tsx/.css, incluindo src/brand e src/styles (DESIGN_RULES.md, "Nome das
 * variáveis CSS"):
 *  - variável própria do Rendra sem o prefixo --rendra- (var(--primary), var(--radius)...)
 * Nas telas do sistema (src/pages/app), também:
 *  - texto orientativo (regra C7, scripts/lib/help-length.ts): help literal de Field e
 *    FormField acima do limite do span, mais da metade dos campos de uma FormSection com
 *    orientação, description do PageHeader acima de 150 caracteres e subtítulo que começa
 *    com verbo de instrução
 *  - botão solto no conteúdo de um card: ação de card vai em CardHeader actions
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { auditLines } from '../src/cli/auditar.ts'
import { checkGuidance } from './lib/help-length.ts'
import { checkVarPrefix } from './lib/var-prefix.ts'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')
// src/cli entra na mesma exceção de src/brand e src/styles: não é tela nem componente, é onde
// as próprias regras genéricas moram (src/cli/auditar.ts), com o nome e o texto de cada uma
// escritos por extenso em regex e comentário (ex.: a palavra "100vh" no id da regra) — sem a
// exceção, o verificador acusaria a si mesmo.
const ALLOWED_DIRS = [join(SRC, 'brand'), join(SRC, 'styles'), join(SRC, 'cli')]

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

// As seis regras genéricas (cor-fixa, valor-arbitrario, estilo-inline, fonte-fixa, 100vh,
// raio-fixo) e a sétima (fora-da-escala) moraram aqui antes da fase 3: agora vivem em
// src/cli/auditar.ts (auditLines), compartilhadas com `rendra auditar`, e rodam mais abaixo,
// no mesmo lugar do laço principal onde rodavam antes (depois do corte de ALLOWED_DIRS e do
// corte de arquivo .css). Aqui ficam só as regras específicas deste repositório, que não fazem
// sentido num projeto de destino qualquer.
const rules = [
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

const forbiddenFileNames = /(Mobile|Simples|Simple|ComBusca|Grande|Pequeno|Small|Large)\.(t|j)sx?$/i
const forbiddenFileNamesKebab = /-(mobile|simples|simple|com-busca|grande|pequeno)\.(t|j)sx?$/i

const files = walk(SRC).filter((f) => /\.(tsx?|jsx?|css)$/.test(f))
const problems = []

// Regras que olham o arquivo inteiro (JSX em várias linhas), só nas telas do sistema.
const APP_PAGES = join(SRC, 'pages', 'app')
const fileRules = [
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
  if (file.startsWith(APP_PAGES)) {
    // Texto orientativo (regra C7): limite por span, metade da seção, descrição e instrução.
    for (const p of checkGuidance(text)) problems.push({ rel, ...p })
    for (const rule of fileRules)
      for (const m of text.matchAll(rule.test)) {
        const line = text.slice(0, m.index).split('\n').length
        const src = m[0].split('\n')[0].trim()
        problems.push({ rel, line, id: rule.id, message: rule.message, src })
      }
  }
  // As seis regras genéricas mais fora-da-escala: src/cli/auditar.ts, compartilhado com
  // `rendra auditar` (teste de não duplicação em src/cli/auditar.test.ts).
  for (const v of auditLines(text))
    problems.push({ rel, line: v.line, id: v.rule, message: v.message, src: v.source })

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
