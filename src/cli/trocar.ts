/*
 * `rendra trocar <DE> <PARA> [--dry-run]`: troca todo elemento JSX que usa a variante do
 * código DE (catálogo de src/catalog/components.ts) pela variante PARA, reescrevendo só a
 * prop literal que os distingue, por fatia de texto (preserva formatação, comentário,
 * indentação). Prop dinâmica (variant={x}) nunca é reescrita, só listada para revisão manual;
 * troca entre códigos de componentes diferentes também nunca edita, só lista.
 *
 * O parser é o TypeScript (`ts.createSourceFile`/`ts.forEachChild`), mas este módulo nunca o
 * importa em tempo de execução: recebe a instância já carregada como `options.ts` (só o TIPO
 * vem de "typescript", apagado na compilação). Quem resolve a instância de verdade, a partir
 * do projeto do usuário, é src/cli/typescript-loader.ts; sem ela, este módulo nunca é chamado.
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import type * as TSNamespace from 'typescript'
import type { ComponentCatalogEntry } from '../catalog/components'
import { getCatalogEntry } from '../catalog/components'

export type TypeScriptModule = typeof TSNamespace

export interface TrocarReescrito {
  file: string
  line: number
}

export interface TrocarParaRevisao {
  file: string
  line: number
  motivo: 'prop-dinamica' | 'componentes-diferentes'
  source: string
}

export interface TrocarResultado {
  reescritos: TrocarReescrito[]
  paraRevisao: TrocarParaRevisao[]
}

export interface TrocarOptions {
  ts: TypeScriptModule
  cwd: string
  de: string
  para: string
  dryRun?: boolean
}

const SKIP_DIR_NAMES = new Set(['node_modules', 'dist', 'build', '.git', '.storybook-static'])

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    if (SKIP_DIR_NAMES.has(name)) return []
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

/** Arquivos onde JSX pode aparecer (.tsx/.jsx), fora de teste e story. */
function listProjectFiles(cwd: string): string[] {
  const root = existsSync(join(cwd, 'src')) ? join(cwd, 'src') : cwd
  if (!existsSync(root)) return []
  return walk(root).filter(
    (f) => /\.(tsx|jsx)$/.test(f) && !f.includes('.test.') && !f.includes('.stories.'),
  )
}

function lineOf(sourceFile: TSNamespace.SourceFile, pos: number): number {
  return sourceFile.getLineAndCharacterOfPosition(pos).line + 1
}

function firstLine(text: string): string {
  return text.split('\n')[0]!.trim()
}

type OpeningLike = TSNamespace.JsxOpeningElement | TSNamespace.JsxSelfClosingElement

/** Todo elemento JSX cuja tag é exatamente `componentName` (nunca um prefixo, ex.: FieldGroup por Field). */
function findElements(
  ts: TypeScriptModule,
  sourceFile: TSNamespace.SourceFile,
  componentName: string,
): OpeningLike[] {
  const found: OpeningLike[] = []
  const visit = (node: TSNamespace.Node) => {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      node.tagName.getText(sourceFile) === componentName
    ) {
      found.push(node)
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return found
}

type AttrLiteral =
  | { kind: 'absent' }
  | { kind: 'shorthand'; attrNode: TSNamespace.JsxAttribute }
  | {
      kind: 'literal'
      value: string | number | boolean
      node: TSNamespace.Node
      attrNode: TSNamespace.JsxAttribute
    }
  | { kind: 'dynamic' }

/**
 * Valor de um atributo JSX (`name`) do elemento: ausente, presente sem valor (shorthand,
 * `true` implícito), literal (`attr="x"` ou `attr={"x"}`/`attr={true}`/`attr={7}`) ou dinâmico
 * (qualquer outra expressão dentro de `{...}`, ex.: identificador, chamada, condicional).
 * `attrNode` (o atributo inteiro, não só o valor) vai junto sempre que a prop existe de
 * verdade no elemento: é o que uma troca para a variante padrão remove por completo.
 */
function readAttrLiteral(
  ts: TypeScriptModule,
  attributes: TSNamespace.JsxAttributes,
  name: string,
): AttrLiteral {
  const attr = attributes.properties.find(
    (p): p is TSNamespace.JsxAttribute => ts.isJsxAttribute(p) && p.name.getText() === name,
  )
  if (!attr) return { kind: 'absent' }
  if (!attr.initializer) return { kind: 'shorthand', attrNode: attr }
  if (ts.isStringLiteral(attr.initializer)) {
    return { kind: 'literal', value: attr.initializer.text, node: attr.initializer, attrNode: attr }
  }
  if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
    const expr = attr.initializer.expression
    if (ts.isStringLiteralLike(expr)) {
      return { kind: 'literal', value: expr.text, node: expr, attrNode: attr }
    }
    if (expr.kind === ts.SyntaxKind.TrueKeyword) {
      return { kind: 'literal', value: true, node: expr, attrNode: attr }
    }
    if (expr.kind === ts.SyntaxKind.FalseKeyword) {
      return { kind: 'literal', value: false, node: expr, attrNode: attr }
    }
    if (ts.isNumericLiteral(expr)) {
      return { kind: 'literal', value: Number(expr.text), node: expr, attrNode: attr }
    }
    return { kind: 'dynamic' }
  }
  return { kind: 'dynamic' }
}

/**
 * Uma prop a tratar depois de confirmado que o elemento usa a variante DE: `attrNode`
 * ausente quer dizer que a prop nem existia no elemento (só possível quando DE é a variante
 * padrão do componente, `isDefault`). Trocar para uma PARA que não é padrão precisa inserir
 * a prop; trocar para uma PARA que também é padrão não precisa fazer nada.
 */
interface PropEdit {
  key: string
  node?: TSNamespace.Node
  attrNode?: TSNamespace.JsxAttribute
}

type Classification =
  { status: 'dynamic' } | { status: 'no-match' } | { status: 'match'; edits: PropEdit[] }

/**
 * O elemento usa a variante DE? Todo `variantProps` bate (ou, se `deEntry.isDefault`, a prop
 * pode estar simplesmente ausente: o elemento sem a prop já é a variante padrão), e nenhum é
 * dinâmico.
 */
function classifyElement(
  ts: TypeScriptModule,
  opening: OpeningLike,
  deEntry: ComponentCatalogEntry,
): Classification {
  const edits: PropEdit[] = []
  for (const [key, expected] of Object.entries(deEntry.variantProps)) {
    const found = readAttrLiteral(ts, opening.attributes, key)
    if (found.kind === 'dynamic') return { status: 'dynamic' }
    if (found.kind === 'absent') {
      if (!deEntry.isDefault) return { status: 'no-match' }
      edits.push({ key }) // Sem attrNode: a prop precisa ser inserida (ou nada, se PARA também for padrão).
      continue
    }
    if (found.kind === 'shorthand') {
      if (expected !== true) return { status: 'no-match' }
      continue // Shorthand (true implícito) já é o valor esperado: nada a reescrever nesta prop.
    }
    if (found.value !== expected) return { status: 'no-match' }
    edits.push({ key, node: found.node, attrNode: found.attrNode })
  }
  return { status: 'match', edits }
}

/**
 * O trecho a remover para apagar `attrNode` por completo, inclusive o espaço (ou quebra de
 * linha) logo antes dele: sem isso, remover só o atributo deixaria um espaço a mais entre a
 * tag anterior e a próxima prop (ou o `>`/`/>` de fechamento).
 */
function attributeRemovalSpan(
  sourceFile: TSNamespace.SourceFile,
  attrNode: TSNamespace.JsxAttribute,
): { start: number; end: number } {
  let start = attrNode.getStart(sourceFile)
  while (start > 0 && /\s/.test(sourceFile.text[start - 1]!)) start--
  return { start, end: attrNode.getEnd() }
}

interface TextEdit {
  start: number
  end: number
  replacement: string
}

/** Aplica os cortes de trás para frente, para os índices anteriores continuarem válidos. */
function applyEdits(text: string, edits: TextEdit[]): string {
  const sorted = [...edits].sort((a, b) => b.start - a.start)
  let out = text
  for (const edit of sorted) out = out.slice(0, edit.start) + edit.replacement + out.slice(edit.end)
  return out
}

/**
 * Troca a variante DE pela PARA em todo o projeto (`cwd`, ou `cwd/src` quando existir).
 * `dryRun` calcula os mesmos `reescritos` sem gravar nada em disco (usado para conferir o
 * resultado antes de aplicar de verdade).
 */
export function trocar(options: TrocarOptions): TrocarResultado {
  const { ts, cwd, de, para, dryRun = false } = options
  const deEntry = getCatalogEntry(de)
  const paraEntry = getCatalogEntry(para)
  if (!deEntry) throw new Error(`Código "${de}" não existe no catálogo de componentes.`)
  if (!paraEntry) throw new Error(`Código "${para}" não existe no catálogo de componentes.`)

  const sameComponent = deEntry.component === paraEntry.component
  const variantKeys = Object.keys(deEntry.variantProps)
  if (sameComponent && variantKeys.length === 0) {
    throw new Error(
      `"${de}" e "${para}" são o mesmo componente (${deEntry.component}) sem prop que os ` +
        'distinga; não dá para saber qual elemento reescrever.',
    )
  }

  const reescritos: TrocarReescrito[] = []
  const paraRevisao: TrocarParaRevisao[] = []

  for (const file of listProjectFiles(cwd)) {
    const text = readFileSync(file, 'utf8')
    if (!text.includes(deEntry.component)) continue
    const rel = relative(cwd, file).split(sep).join('/')
    const scriptKind = file.endsWith('.jsx') ? ts.ScriptKind.JSX : ts.ScriptKind.TSX
    const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, scriptKind)
    const elements = findElements(ts, sourceFile, deEntry.component)
    if (elements.length === 0) continue

    const fileEdits: TextEdit[] = []
    for (const opening of elements) {
      const line = lineOf(sourceFile, opening.getStart(sourceFile))
      const source = firstLine(opening.getText(sourceFile))

      if (!sameComponent) {
        paraRevisao.push({ file: rel, line, motivo: 'componentes-diferentes', source })
        continue
      }

      const classification = classifyElement(ts, opening, deEntry)
      if (classification.status === 'dynamic') {
        paraRevisao.push({ file: rel, line, motivo: 'prop-dinamica', source })
        continue
      }
      if (classification.status === 'no-match') continue

      let editedAny = false
      for (const edit of classification.edits) {
        // PARA é a variante padrão do componente: a prop sai por completo (decisão do
        // Lote B, documentada no CHANGELOG e no README), nunca grava o valor padrão por
        // extenso. Sem attrNode (a prop já não existia, DE também era padrão), não há nada a
        // remover: o elemento já está no formato de PARA.
        if (paraEntry.isDefault) {
          if (edit.attrNode) {
            const span = attributeRemovalSpan(sourceFile, edit.attrNode)
            fileEdits.push({ start: span.start, end: span.end, replacement: '' })
            editedAny = true
          }
          continue
        }

        const novo = paraEntry.variantProps[edit.key]
        // Só reescreve prop de valor string (variant, type...): as únicas usadas para
        // distinguir variante no catálogo hoje. Boolean/número ficam fora deste lote.
        if (typeof novo !== 'string') continue

        if (!edit.node) {
          // DE era a variante padrão (a prop não existia): insere a prop de PARA logo depois
          // do nome da tag, antes de qualquer outro atributo existente.
          const insertPos = opening.tagName.getEnd()
          fileEdits.push({
            start: insertPos,
            end: insertPos,
            replacement: ` ${edit.key}="${novo}"`,
          })
        } else {
          const start = edit.node.getStart(sourceFile)
          const end = edit.node.getEnd()
          const original = sourceFile.text.slice(start, end)
          const quote = original[0] === '"' || original[0] === "'" ? original[0] : '"'
          fileEdits.push({ start, end, replacement: `${quote}${novo}${quote}` })
        }
        editedAny = true
      }
      if (editedAny) reescritos.push({ file: rel, line })
    }

    if (fileEdits.length > 0 && !dryRun) {
      writeFileSync(file, applyEdits(text, fileEdits))
    }
  }

  return { reescritos, paraRevisao }
}
