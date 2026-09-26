import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { auditar, auditLines } from './auditar'

const FIXTURES = join(import.meta.dirname, '../../test/fixtures')

describe('auditLines', () => {
  it('acusa cor fixa', () => {
    const violations = auditLines('const x = <div className="bg-[#123456]" />')
    // valor-arbitrário e cor-fixa podem coincidir na mesma linha; confere que cor-fixa aparece.
    expect(violations.some((v) => v.rule === 'cor-fixa')).toBe(true)
  })

  it('acusa valor arbitrário do Tailwind', () => {
    const violations = auditLines('<div className="p-[13px]" />')
    expect(violations.map((v) => v.rule)).toContain('valor-arbitrario')
  })

  it('não acusa classe dentro da escala permitida', () => {
    const violations = auditLines('<div className="p-4 gap-6" />')
    expect(violations).toHaveLength(0)
  })

  it('acusa degrau fora da escala', () => {
    const violations = auditLines('<div className="p-5" />')
    expect(violations.map((v) => v.rule)).toContain('fora-da-escala')
  })

  it('acusa estilo inline (fora de variável CSS)', () => {
    const violations = auditLines('<div style={{ color: "red" }} />')
    expect(violations.map((v) => v.rule)).toContain('estilo-inline')
  })

  it('não acusa estilo inline quando é só variável CSS', () => {
    const violations = auditLines("<div style={{ '--x': 10 }} />")
    expect(violations.map((v) => v.rule)).not.toContain('estilo-inline')
  })

  it('acusa fonte fixa', () => {
    const violations = auditLines('font-family: Roboto, sans-serif;')
    expect(violations.map((v) => v.rule)).toContain('fonte-fixa')
  })

  it('acusa 100vh', () => {
    const violations = auditLines('.x { height: 100vh; }')
    expect(violations.map((v) => v.rule)).toContain('100vh')
  })

  it('acusa raio fixo', () => {
    const violations = auditLines('.x { border-radius: 6px; }')
    expect(violations.map((v) => v.rule)).toContain('raio-fixo')
  })

  it('não acusa raio quando vem de uma variável', () => {
    const violations = auditLines('.x { border-radius: var(--rendra-shape-item); }')
    expect(violations.map((v) => v.rule)).not.toContain('raio-fixo')
  })

  it('pula linha de comentário', () => {
    const violations = auditLines('// className="p-[13px]"')
    expect(violations).toHaveLength(0)
  })
})

describe('auditar', () => {
  it('reporta a violação esperada na fixture com valor arbitrário', () => {
    const violations = auditar(join(FIXTURES, 'projeto-com-valor-arbitrario'))
    expect(violations.length).toBeGreaterThan(0)
    const violation = violations.find((v) => v.rule === 'valor-arbitrario')
    expect(violation).toBeDefined()
    expect(violation!.file).toBe('src/pagina.tsx')
    expect(violation!.line).toBeGreaterThan(0)
  })

  it('não reporta nada na fixture limpa', () => {
    expect(auditar(join(FIXTURES, 'projeto-limpo'))).toHaveLength(0)
  })

  it('devolve lista vazia quando o diretório não existe', () => {
    expect(auditar(join(FIXTURES, 'nao-existe'))).toHaveLength(0)
  })
})

describe('não duplicação (scripts/check-design-rules.mjs)', () => {
  const scriptSource = readFileSync(
    join(import.meta.dirname, '../../scripts/check-design-rules.mjs'),
    'utf8',
  )

  it('importa as regras genéricas de src/cli/auditar.ts em vez de repeti-las', () => {
    expect(scriptSource).toMatch(/from ['"]\.\.\/src\/cli\/auditar\.ts['"]/)
  })

  it('não mantém uma segunda cópia da regra cor-fixa', () => {
    expect(scriptSource).not.toContain("id: 'cor-fixa'")
  })

  it('não mantém uma segunda cópia da regra fora-da-escala', () => {
    expect(scriptSource).not.toContain("id: 'fora-da-escala'")
  })
})
