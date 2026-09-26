import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { checkVarPrefix, findUnprefixedDeclarations, isRendraOwnVar } from './var-prefix'

/*
 * Teste da regra variavel-sem-prefixo-rendra (etapa 2.0.0-alpha.2), exigido pela validação do
 * Fable (bloqueador 3: a regra não tinha teste próprio). Cobre o bug relatado: --radius e
 * --shadow-color são variável própria do Rendra, mas o nome bate na regex de namespace do
 * Tailwind (--radius-*, --shadow-*); a ordem certa é perguntar primeiro se é variável própria
 * (RENDRA_VAR_EXACT/RENDRA_VAR_PREFIXES), e só depois a exceção de namespace.
 */

describe('isRendraOwnVar', () => {
  it('reconhece --radius e --shadow-color como variável própria, mesmo parecendo namespace do Tailwind', () => {
    expect(isRendraOwnVar('radius')).toBe(true)
    expect(isRendraOwnVar('shadow-color')).toBe(true)
  })

  it('reconhece as famílias por prefixo (sidebar-, gradient-, chart-, elevation-, shape-, meter-, label-, help-)', () => {
    expect(isRendraOwnVar('sidebar-foreground')).toBe(true)
    expect(isRendraOwnVar('gradient-brand')).toBe(true)
    expect(isRendraOwnVar('chart-3')).toBe(true)
    expect(isRendraOwnVar('elevation-md')).toBe(true)
    expect(isRendraOwnVar('shape-control')).toBe(true)
    expect(isRendraOwnVar('meter-low')).toBe(true)
    expect(isRendraOwnVar('label-color')).toBe(true)
    expect(isRendraOwnVar('help-size')).toBe(true)
  })

  it('não reconhece namespace do Tailwind nem variável de instância por elemento', () => {
    expect(isRendraOwnVar('spacing-4')).toBe(false)
    expect(isRendraOwnVar('color-primary')).toBe(false)
    expect(isRendraOwnVar('radius-sm')).toBe(false)
    expect(isRendraOwnVar('shadow-sm')).toBe(false)
    expect(isRendraOwnVar('progress')).toBe(false)
    expect(isRendraOwnVar('kanban-cols')).toBe(false)
  })
})

describe('checkVarPrefix (var(--x) usado em .ts/.tsx/.css)', () => {
  it('falha para --primary solto', () => {
    const violations = checkVarPrefix("const c = 'var(--primary)'\n")
    expect(violations).toHaveLength(1)
    expect(violations[0]?.name).toBe('primary')
  })

  it('passa para --rendra-primary', () => {
    expect(checkVarPrefix("const c = 'var(--rendra-primary)'\n")).toEqual([])
  })

  it('falha para --radius e --shadow-color, mesmo fora de @theme (bloqueador 3)', () => {
    const text = [
      '.card {',
      '  border-radius: var(--radius);',
      '  box-shadow: rgb(var(--shadow-color) / 0.1);',
      '}',
    ].join('\n')
    const names = checkVarPrefix(text).map((v) => v.name)
    expect(names).toEqual(['radius', 'shadow-color'])
  })

  it('libera var(--rendra-radius) dentro da ponte do @theme inline de globals.css', () => {
    const path = join(import.meta.dirname, '..', '..', 'src', 'styles', 'globals.css')
    const text = readFileSync(path, 'utf8')
    expect(text).toContain('--radius-lg: var(--rendra-radius);')
    expect(checkVarPrefix(text)).toEqual([])
  })

  it('não acusa variável de instância por elemento (--progress, --otp...)', () => {
    expect(checkVarPrefix("style={{ '--progress': 'var(--progress, 0%)' }}")).toEqual([])
  })
})

describe('findUnprefixedDeclarations (declaração --nome: valor;)', () => {
  it('falha para --primary, --radius e --shadow-color soltos, passa para --rendra-primary', () => {
    const text = [
      ':root {',
      '  --primary: #0b6fe0;',
      '  --radius: 0.625rem;',
      '  --shadow-color: 11 29 55;',
      '  --rendra-primary: #0b6fe0;',
      '}',
    ].join('\n')
    const names = findUnprefixedDeclarations(text).map((v) => v.name)
    expect(names).toEqual(['primary', 'radius', 'shadow-color'])
  })

  it('não acusa uma declaração do namespace do Tailwind', () => {
    expect(findUnprefixedDeclarations('--spacing-4: 1rem;\n--tracking-tight: -0.02em;\n')).toEqual(
      [],
    )
  })

  it('acusa token novo inventado sem prefixo, mesmo fora do catálogo de RENDRA_VAR_EXACT', () => {
    // Bloqueador 3, item 9: um arquivo de tema só declara variável própria do Rendra ou
    // variável do namespace do Tailwind; "--hint-size" não é nenhum dos dois, então também
    // precisa de --rendra- mesmo sem constar em RENDRA_VAR_EXACT/RENDRA_VAR_PREFIXES.
    expect(isRendraOwnVar('hint-size')).toBe(false)
    const names = findUnprefixedDeclarations('--hint-size: 11px;\n').map((v) => v.name)
    expect(names).toEqual(['hint-size'])
  })
})
