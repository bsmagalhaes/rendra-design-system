/*
 * Gera o registry do Rendra no formato do shadcn/ui.
 *
 *   npm run registry:build
 *
 * Saída:
 *   registry.json             índice (versionado no repositório)
 *   dist/r/<item>.json        cada item com o código, publicado no GitHub Pages
 *
 * Um projeto criado a partir deste boilerplate recebe atualizações assim:
 *   npx shadcn@latest add https://bsmagalhaes.github.io/rendra-design-system/r/select.json
 *
 * Os caminhos são espelhados (src/components/ui/select.tsx cai no mesmo lugar) e as
 * dependências entre itens e pacotes npm são resolvidas a partir dos imports de cada arquivo.
 * Marca (theme.css, themes.css, brand.config.ts, src/brand/index.ts, assets) e configuração
 * (src/config) são do projeto e nunca entram no registry.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join, posix } from 'node:path'
import { format, resolveConfig } from 'prettier'
import { CATALOG } from '../src/catalog/components.ts'

const ROOT = process.cwd()
const BASE = (
  process.env.REGISTRY_URL ?? 'https://bsmagalhaes.github.io/rendra-design-system'
).replace(/\/$/, '')
const OUT = join(ROOT, 'dist', 'r')
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const versions = { ...pkg.dependencies, ...pkg.devDependencies }

// Pacotes que todo projeto React já tem: não entram como dependência.
const IMPLICIT = new Set(['react', 'react-dom'])

const read = (p) => readFileSync(join(ROOT, p), 'utf8')
const ls = (dir, ext) =>
  readdirSync(join(ROOT, dir))
    .filter(
      (f) => ext.some((e) => f.endsWith(e)) && !f.includes('.test.') && !f.includes('.stories.'),
    )
    .map((f) => posix.join(dir, f))

/** Itens: nome, título, descrição e arquivos. Os componentes de interface são um item cada. */
const core = {
  name: 'core',
  title: 'Núcleo',
  description:
    'Funções e hooks usados pelos componentes: cn, moldura dos campos, máscaras, validadores, formato, contraste, useBreakpoint e o provedor de marca (sem a marca em si).',
  files: [
    ...ls('src/lib', ['.ts']),
    ...ls('src/hooks', ['.ts']),
    'src/brand/types.ts',
    'src/brand/brand-context.ts',
    'src/brand/brand-provider.tsx',
    'src/brand/use-brand.ts',
    // Gerador de paleta (4 cores e degradê -> paleta completa com AA). Genérico: a marca
    // em si (src/brand/palettes.ts) é do projeto.
    'src/brand/palette.ts',
  ],
}
const tokens = {
  name: 'tokens',
  title: 'Tokens estruturais',
  description:
    'globals.css: escala de espaço, tipografia, raio por papel, tokens nomeados e utilitários. Não contém marca: as cores vêm de themes.css, que é do projeto.',
  files: ['src/styles/globals.css'],
}
const catalog = {
  name: 'catalog',
  title: 'Catálogo de componentes',
  description:
    'Código de cada componente e variante (ABA-001, BTN-001...), usado no data-rendra, na vitrine (/componentes) e no BRIEFING_MODELO. Os componentes com variante (os que calculam o data-rendra com resolveCatalogCode) dependem dele.',
  files: ['src/catalog/components.ts'],
}
const layout = {
  name: 'layout',
  title: 'Primitivas de layout',
  description: 'Container, Stack, Inline, Grid, Section e PageHeader.',
  files: ls('src/components/layout', ['.ts', '.tsx']),
}
const appShell = {
  name: 'app-shell',
  title: 'AppShell',
  description:
    'Casca da aplicação: sidebar, header, menu superior, mega menu, busca, notificações e barra inferior. Lê o menu e o layout de src/config, que é do projeto.',
  files: ls('src/components/app-shell', ['.ts', '.tsx']),
}
/**
 * Códigos do catálogo (src/catalog/components.ts, etapa 1.2.0-alpha.1) deste arquivo de
 * componente, na ordem cadastrada. O catálogo referencia o arquivo como
 * "components/ui/<nome>.tsx" (relativo a src/); o registry usa o caminho completo.
 */
function catalogCodesFor(file) {
  const relative = file.replace(/^src\//, '')
  return CATALOG.filter((entry) => entry.file === relative).map((entry) => entry.code)
}

const ui = ls('src/components/ui', ['.tsx']).map((file) => {
  const codes = catalogCodesFor(file)
  return {
    name: basename(file, '.tsx'),
    title: basename(file, '.tsx'),
    description: `Componente ${basename(file, '.tsx')} do Rendra Design System.`,
    files: [file],
    // Vazio para os internos sem uso direto em tela (overlay-shell, picker-panel).
    meta: { codes },
  }
})

/*
 * Testes, como itens opcionais: quem tem meta de cobertura instala o teste junto com o
 * componente (npx shadcn add @rendra/table-test); quem não usa Vitest não recebe as
 * dependências de teste. test-utils traz a preparação e o renderApp.
 */
const testUtils = {
  name: 'test-utils',
  title: 'Preparação dos testes',
  description:
    'Preparação do Vitest para testes de componente (matchMedia, ResizeObserver e o que o Radix usa no jsdom) e renderApp com os provedores do app. Aponte setupFiles para src/test/setup.ts.',
  files: ['src/test/setup.ts', 'src/test/render.tsx'],
  dev: ['vitest', 'jsdom', '@testing-library/react', '@testing-library/user-event'],
}
const uiTests = ui
  .filter((i) => existsSync(join(ROOT, i.files[0].replace(/\.tsx$/, '.test.tsx'))))
  .map((i) => ({
    name: `${i.name}-test`,
    title: `${i.name} (teste)`,
    description: `Testes de comportamento do ${i.name}, com Vitest e Testing Library.`,
    files: [i.files[0].replace(/\.tsx$/, '.test.tsx')],
  }))

const items = [core, tokens, catalog, layout, appShell, ...ui, testUtils, ...uiTests]
const isTest = (item) => item === testUtils || item.name.endsWith('-test')

// Descobre a qual item pertence cada arquivo, para transformar import em dependência.
const owner = new Map()
for (const item of items) for (const f of item.files) owner.set(f, item.name)

function resolveLocal(from, spec) {
  let p
  if (spec.startsWith('@/')) p = posix.join('src', spec.slice(2))
  else if (spec.startsWith('.')) p = posix.join(posix.dirname(from), spec)
  else return null
  for (const cand of [p, `${p}.ts`, `${p}.tsx`, `${p}/index.ts`, `${p}/index.tsx`])
    if (owner.has(cand)) return cand
  return p // arquivo do projeto (marca ou config): existe no projeto de destino
}

function packageName(spec) {
  const parts = spec.split('/')
  return spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]
}

const importRe =
  /(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]|@import\s+['"]([^'"]+)['"]/g

function analyze(item) {
  const deps = new Set()
  const reg = new Set()
  for (const file of item.files) {
    const src = read(file)
    for (const m of src.matchAll(importRe)) {
      const spec = m[1] ?? m[2] ?? m[3]
      const local = resolveLocal(file, spec)
      if (local !== null) {
        const o = owner.get(local)
        if (o && o !== item.name) reg.add(o)
        continue
      }
      const name = packageName(spec)
      if (IMPLICIT.has(name) || name.startsWith('node:')) continue
      if (!versions[name]) throw new Error(`${file}: pacote "${name}" não está no package.json`)
      deps.add(`${name}@${versions[name]}`)
    }
  }
  // Todo componente depende dos tokens (as classes só existem com o globals.css).
  if (!['tokens', 'core', 'catalog'].includes(item.name) && !isTest(item)) reg.add('tokens')
  if (isTest(item)) {
    for (const d of item.dev ?? []) deps.add(`${d}@${versions[d]}`)
    return { devDependencies: [...deps].sort(), registryDependencies: [...reg].sort() }
  }
  return { dependencies: [...deps].sort(), registryDependencies: [...reg].sort() }
}

const index = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'rendra',
  homepage: 'https://github.com/bsmagalhaes/rendra-design-system',
  items: [],
}

mkdirSync(OUT, { recursive: true })
for (const item of items) {
  const { dependencies, devDependencies, registryDependencies } = analyze(item)
  const entry = {
    name: item.name,
    type: 'registry:item',
    title: item.title,
    description: item.description,
    ...(devDependencies ? { devDependencies } : { dependencies }),
    registryDependencies: registryDependencies.map((n) => `${BASE}/r/${n}.json`),
    files: item.files.map((f) => ({ path: f, type: 'registry:file', target: f })),
    // Códigos do catálogo de componentes (etapa 1.2.0-alpha.1): só os itens de src/components/ui.
    ...(item.meta ? { meta: item.meta } : {}),
  }
  index.items.push(entry)
  const built = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    ...entry,
    files: item.files.map((f) => ({ path: f, type: 'registry:file', target: f, content: read(f) })),
  }
  writeFileSync(join(OUT, `${item.name}.json`), `${JSON.stringify(built, null, 2)}\n`)
}
// O índice é versionado: sai no formato do Prettier para o CI comparar sem ruído.
writeFileSync(
  join(ROOT, 'registry.json'),
  await format(JSON.stringify(index), {
    ...(await resolveConfig(join(ROOT, 'registry.json'))),
    parser: 'json',
  }),
)
writeFileSync(join(OUT, 'registry.json'), `${JSON.stringify(index, null, 2)}\n`)
console.log(`Registry: ${items.length} itens em dist/r (base ${BASE})`)
