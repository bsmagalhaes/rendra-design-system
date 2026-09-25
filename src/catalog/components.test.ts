import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { colorCodes, menuCodes, themeCodes } from '@/config/presets'
import {
  CATALOG,
  CATALOG_DATA_RENDRA_EXCEPTIONS,
  CATALOG_EXCLUDED_FILES,
  COMPONENT_CODE_PATTERN,
  assertCatalogIntegrity,
  catalogByComponent,
  findDuplicateCodes,
  findInvalidFormatCodes,
  findPresetCollisions,
  filesMissingCatalogEntry,
  getCatalogEntry,
  resolveCatalogCode,
  type ComponentCatalogEntry,
} from './components'

const UI_DIR = join(process.cwd(), 'src/components/ui')

/** Arquivos reais de src/components/ui, como o catálogo os referencia (relativo a src/). */
function realUiFiles(): string[] {
  return readdirSync(UI_DIR)
    .filter((name) => name.endsWith('.tsx') && !name.endsWith('.test.tsx'))
    .map((name) => `components/ui/${name}`)
    .filter((file) => !CATALOG_EXCLUDED_FILES.includes(file))
}

describe('catálogo de componentes: varredura de src/components/ui', () => {
  it('todo arquivo de src/components/ui (menos teste, overlay-shell e picker-panel) tem ao menos um código', () => {
    const files = realUiFiles()
    expect(files.length).toBeGreaterThan(0)
    const missing = filesMissingCatalogEntry(files, CATALOG)
    expect(missing).toEqual([])
  })

  it('falha (a regra existe de verdade) quando um arquivo real fica sem código no catálogo', () => {
    // Fabrica um catálogo que "esqueceu" um componente real: a regra precisa acusar.
    const semUltimoArquivo = CATALOG.filter((entry) => entry.file !== 'components/ui/button.tsx')
    const missing = filesMissingCatalogEntry(realUiFiles(), semUltimoArquivo)
    expect(missing).toEqual(['components/ui/button.tsx'])
  })

  it('não sobra nenhum código do catálogo para um arquivo que não existe mais em src/components/ui', () => {
    const files = new Set(realUiFiles())
    const orphans = CATALOG.filter((entry) => !files.has(entry.file))
    expect(orphans).toEqual([])
  })
})

describe('catálogo de componentes: formato e duplicidade', () => {
  it('todo código do catálogo segue ^[A-Z]{3,4}-\\d{3}$', () => {
    expect(findInvalidFormatCodes(CATALOG)).toEqual([])
    for (const entry of CATALOG) {
      expect(entry.code).toMatch(COMPONENT_CODE_PATTERN)
    }
  })

  it('acusa código fora do formato numa lista fabricada', () => {
    const fixture: ComponentCatalogEntry[] = [
      {
        code: 'ab-001',
        name: 'x',
        component: 'X',
        file: 'components/ui/x.tsx',
        variantProps: {},
        whenToUse: '',
      },
      {
        code: 'ABCDE-001',
        name: 'y',
        component: 'Y',
        file: 'components/ui/y.tsx',
        variantProps: {},
        whenToUse: '',
      },
    ]
    expect(findInvalidFormatCodes(fixture)).toEqual(['ab-001', 'ABCDE-001'])
  })

  it('não há código duplicado no catálogo real', () => {
    expect(findDuplicateCodes(CATALOG)).toEqual([])
  })

  it('acusa código duplicado numa lista fabricada (dois ABA-001)', () => {
    const fixture: ComponentCatalogEntry[] = [
      {
        code: 'ABA-001',
        name: 'Abas em linha',
        component: 'Tabs',
        file: 'components/ui/tabs.tsx',
        variantProps: { variant: 'line' },
        whenToUse: '',
      },
      {
        code: 'ABA-001',
        name: 'Abas em pílula, com código errado',
        component: 'Tabs',
        file: 'components/ui/tabs.tsx',
        variantProps: { variant: 'pill' },
        whenToUse: '',
      },
    ]
    expect(findDuplicateCodes(fixture)).toEqual(['ABA-001'])
  })

  it('abas (Tabs) têm só os dois códigos do plano: ABA-001 (linha) e ABA-002 (pílula)', () => {
    const abas = catalogByComponent('Tabs')
    expect(abas.map((e) => e.code).sort()).toEqual(['ABA-001', 'ABA-002'])
  })
})

describe('catálogo de componentes: sem colisão com os códigos de modelo (T/C/M)', () => {
  it('nenhum código do catálogo casa /[TCM]\\d+/ (o padrão dos códigos de modelo de presets.ts)', () => {
    expect(findPresetCollisions(CATALOG)).toEqual([])
  })

  it('acusa colisão com T/C/M numa lista fabricada', () => {
    const fixture: ComponentCatalogEntry[] = [
      {
        code: 'TC1-001',
        name: 'x',
        component: 'X',
        file: 'components/ui/x.tsx',
        variantProps: {},
        whenToUse: '',
      },
    ]
    expect(findPresetCollisions(fixture)).toEqual(['TC1-001'])
  })

  it('nenhum código de modelo (T/C/M) de presets.ts casa o padrão do catálogo (^[A-Z]{3,4}-\\d{3}$)', () => {
    const modelCodes = [...themeCodes, ...colorCodes, ...menuCodes].map((c) => c.code)
    expect(modelCodes.length).toBeGreaterThan(0)
    for (const code of modelCodes) {
      expect(COMPONENT_CODE_PATTERN.test(code)).toBe(false)
    }
  })

  it('assertCatalogIntegrity() passa com o catálogo real', () => {
    expect(() => assertCatalogIntegrity()).not.toThrow()
  })
})

describe('catálogo de componentes: variantProps existem de verdade no componente', () => {
  it('todo valor de variantProps aparece como literal no arquivo do componente (checagem viável, não uma AST)', () => {
    for (const entry of CATALOG) {
      if (Object.keys(entry.variantProps).length === 0) continue
      const source = readFileSync(join(process.cwd(), 'src', entry.file), 'utf8')
      for (const value of Object.values(entry.variantProps)) {
        if (typeof value === 'string') {
          // Aceita tanto o valor como literal de tipo/união ('line' | 'pill') quanto como
          // chave de objeto sem aspas (variants: { primary: '...' } do cva).
          const found = new RegExp(`['"]?\\b${value}\\b['"]?`).test(source)
          expect(found, `${entry.code}: "${value}" não aparece em ${entry.file}`).toBe(true)
        }
      }
    }
  })
})

describe('helpers do catálogo', () => {
  it('getCatalogEntry encontra pelo código e devolve undefined para código inexistente', () => {
    expect(getCatalogEntry('BTN-001')?.component).toBe('Button')
    expect(getCatalogEntry('ZZZ-999')).toBeUndefined()
  })

  it('catalogByComponent devolve todas as variantes de um componente, na ordem cadastrada', () => {
    const codes = catalogByComponent('Button').map((e) => e.code)
    expect(codes).toEqual(['BTN-001', 'BTN-002', 'BTN-003', 'BTN-004', 'BTN-005', 'BTN-006'])
  })

  it('resolveCatalogCode escolhe a variante certa a partir das props', () => {
    expect(resolveCatalogCode('Tabs', { variant: 'line' })).toBe('ABA-001')
    expect(resolveCatalogCode('Tabs', { variant: 'pill' })).toBe('ABA-002')
  })

  it('resolveCatalogCode cai no primeiro código do componente quando a prop não bate com nenhuma variante', () => {
    expect(resolveCatalogCode('Button', { variant: 'inexistente' })).toBe('BTN-001')
  })

  it('resolveCatalogCode cai no único código de um componente sem variantes, mesmo sem props', () => {
    expect(resolveCatalogCode('Card')).toBe('CARD-001')
  })

  it('resolveCatalogCode lança para um componente sem nenhum código cadastrado', () => {
    expect(() => resolveCatalogCode('ComponenteQueNaoExiste')).toThrow()
  })
})

describe('exceções documentadas de data-rendra', () => {
  it('toda exceção aponta para um código que existe de verdade no catálogo', () => {
    for (const code of Object.keys(CATALOG_DATA_RENDRA_EXCEPTIONS)) {
      expect(getCatalogEntry(code)).toBeDefined()
    }
  })
})

describe('registry.json: meta.codes (etapa 1.2.0-alpha.3)', () => {
  // Confere o arquivo versionado. Rode `npm run registry:build` antes, se o catálogo mudou.
  const registry = JSON.parse(readFileSync(join(process.cwd(), 'registry.json'), 'utf8')) as {
    items: { name: string; files: { path: string }[]; meta?: { codes: string[] } }[]
  }
  // Só os itens de componente de src/components/ui (build-registry.mjs só dá meta a esses,
  // nunca aos itens de teste "<nome>-test", que apontam para o .test.tsx).
  const uiItems = registry.items.filter((i) => i.meta !== undefined)

  it('todo item de src/components/ui (menos os excluídos do catálogo) tem meta.codes preenchido', () => {
    expect(uiItems.length).toBeGreaterThan(0)
    for (const item of uiItems) {
      const file = item.files[0]!.path.replace(/^src\//, '')
      if (CATALOG_EXCLUDED_FILES.includes(file)) {
        expect(item.meta?.codes ?? []).toEqual([])
        continue
      }
      expect(item.meta?.codes?.length, `${item.name}: meta.codes vazio`).toBeGreaterThan(0)
    }
  })

  it('meta.codes de cada item bate exatamente com o catálogo daquele arquivo', () => {
    for (const item of uiItems) {
      const file = item.files[0]!.path.replace(/^src\//, '')
      const expected = CATALOG.filter((entry) => entry.file === file).map((entry) => entry.code)
      expect(item.meta?.codes ?? []).toEqual(expected)
    }
  })
})
