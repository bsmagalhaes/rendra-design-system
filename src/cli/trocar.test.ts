import { cpSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { loadTypeScript, TYPESCRIPT_NOT_FOUND_MESSAGE } from './typescript-loader'
import { trocar } from './trocar'

const FIXTURES = join(import.meta.dirname, '../../test/fixtures')

/** Copia uma fixture para um diretório temporário, para o teste poder gravar sem sujar o repo. */
function copyFixture(name: string): string {
  const dir = mkdtempSync(join(tmpdir(), `rendra-trocar-${name}-`))
  cpSync(join(FIXTURES, name), dir, { recursive: true })
  return dir
}

describe('trocar', () => {
  it('reescreve prop literal (ABA-001 -> ABA-002) e grava no arquivo', () => {
    const dir = copyFixture('troca-prop-literal')
    try {
      const antes = readFileSync(join(dir, 'src/pagina.tsx'), 'utf8')
      expect(antes).toContain('variant="line"')

      const resultado = trocar({ ts, cwd: dir, de: 'ABA-001', para: 'ABA-002' })

      expect(resultado.reescritos).toEqual([{ file: 'src/pagina.tsx', line: 5 }])
      expect(resultado.paraRevisao).toHaveLength(0)

      const depois = readFileSync(join(dir, 'src/pagina.tsx'), 'utf8')
      expect(depois).toContain('variant="pill"')
      expect(depois).not.toContain('variant="line"')
      // Só a prop mudou: o resto do arquivo (import, indentação, texto) fica intacto.
      expect(depois).toBe(antes.replace('variant="line"', 'variant="pill"'))
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('--dry-run (dryRun: true) não grava nada, mas devolve os mesmos reescritos', () => {
    const dir = copyFixture('troca-prop-literal')
    try {
      const antes = readFileSync(join(dir, 'src/pagina.tsx'), 'utf8')

      const real = trocar({ ts, cwd: dir, de: 'ABA-001', para: 'ABA-002', dryRun: true })

      const depois = readFileSync(join(dir, 'src/pagina.tsx'), 'utf8')
      expect(depois).toBe(antes)
      expect(real.reescritos).toEqual([{ file: 'src/pagina.tsx', line: 5 }])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('elemento sem a prop (variante padrão implícita): ABA-001 -> ABA-002 insere a prop', () => {
    const dir = copyFixture('troca-prop-ausente')
    try {
      const antes = readFileSync(join(dir, 'src/pagina.tsx'), 'utf8')
      expect(antes).toContain('<Tabs>Conteúdo</Tabs>')

      const resultado = trocar({ ts, cwd: dir, de: 'ABA-001', para: 'ABA-002' })

      expect(resultado.reescritos).toEqual([{ file: 'src/pagina.tsx', line: 6 }])
      expect(resultado.paraRevisao).toHaveLength(0)

      const depois = readFileSync(join(dir, 'src/pagina.tsx'), 'utf8')
      expect(depois).toContain('<Tabs variant="pill">Conteúdo</Tabs>')
      expect(depois).toBe(antes.replace('<Tabs>', '<Tabs variant="pill">'))
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('troca para a variante padrão (ABA-002 -> ABA-001) remove a prop em vez de escrever o valor padrão', () => {
    const dir = copyFixture('troca-para-padrao')
    try {
      const antes = readFileSync(join(dir, 'src/pagina.tsx'), 'utf8')
      expect(antes).toContain('variant="pill"')

      const resultado = trocar({ ts, cwd: dir, de: 'ABA-002', para: 'ABA-001' })

      expect(resultado.reescritos).toEqual([{ file: 'src/pagina.tsx', line: 6 }])
      expect(resultado.paraRevisao).toHaveLength(0)

      const depois = readFileSync(join(dir, 'src/pagina.tsx'), 'utf8')
      expect(depois).toContain('<Tabs>Conteúdo</Tabs>')
      expect(depois).not.toContain('variant=')
      expect(depois).toBe(antes.replace(' variant="pill"', ''))
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('prop dinâmica (variant={x}) nunca é reescrita, só entra em paraRevisao', () => {
    const dir = join(FIXTURES, 'troca-prop-dinamica')
    const antes = readFileSync(join(dir, 'src/pagina.tsx'), 'utf8')

    const resultado = trocar({ ts, cwd: dir, de: 'ABA-001', para: 'ABA-002' })

    const depois = readFileSync(join(dir, 'src/pagina.tsx'), 'utf8')
    expect(depois).toBe(antes)
    expect(resultado.reescritos).toHaveLength(0)
    expect(resultado.paraRevisao).toEqual([
      expect.objectContaining({ file: 'src/pagina.tsx', motivo: 'prop-dinamica' }),
    ])
  })

  it('troca entre componentes diferentes nunca edita, só lista para revisão', () => {
    const dir = join(FIXTURES, 'troca-entre-componentes')
    const antes = readFileSync(join(dir, 'src/pagina.tsx'), 'utf8')

    const resultado = trocar({ ts, cwd: dir, de: 'ABA-001', para: 'BTN-001' })

    const depois = readFileSync(join(dir, 'src/pagina.tsx'), 'utf8')
    expect(depois).toBe(antes)
    expect(resultado.reescritos).toHaveLength(0)
    expect(resultado.paraRevisao).toEqual([
      expect.objectContaining({ file: 'src/pagina.tsx', motivo: 'componentes-diferentes' }),
    ])
  })

  it('não reporta nada na fixture limpa (nenhum elemento do componente DE)', () => {
    const resultado = trocar({
      ts,
      cwd: join(FIXTURES, 'projeto-limpo'),
      de: 'ABA-001',
      para: 'ABA-002',
    })
    expect(resultado.reescritos).toHaveLength(0)
    expect(resultado.paraRevisao).toHaveLength(0)
  })

  it('recusa código inexistente no catálogo', () => {
    expect(() =>
      trocar({ ts, cwd: join(FIXTURES, 'projeto-limpo'), de: 'XXX-999', para: 'ABA-002' }),
    ).toThrow(/XXX-999/)
  })

  it('recusa o mesmo componente sem prop que distinga a variante', () => {
    expect(() =>
      trocar({ ts, cwd: join(FIXTURES, 'projeto-limpo'), de: 'CARD-001', para: 'CARD-001' }),
    ).toThrow(/não dá para saber qual elemento reescrever/)
  })

  it('UPL-001 -> UPL-002: elemento sem layout ganha layout="gallery" (catálogo com o default declarado)', () => {
    const dir = copyFixture('troca-upl-prop-ausente')
    try {
      const antes = readFileSync(join(dir, 'src/pagina.tsx'), 'utf8')
      expect(antes).toContain('<Upload />')

      const resultado = trocar({ ts, cwd: dir, de: 'UPL-001', para: 'UPL-002' })

      expect(resultado.reescritos).toEqual([{ file: 'src/pagina.tsx', line: 6 }])
      expect(resultado.paraRevisao).toHaveLength(0)

      const depois = readFileSync(join(dir, 'src/pagina.tsx'), 'utf8')
      expect(depois).toContain('<Upload layout="gallery" />')
      expect(depois).toBe(antes.replace('<Upload />', '<Upload layout="gallery" />'))
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('KANB-001 -> KANB-002 continua recusando: Kanban não tem prop literal que distinga (documentado no catálogo)', () => {
    expect(() =>
      trocar({ ts, cwd: join(FIXTURES, 'projeto-limpo'), de: 'KANB-001', para: 'KANB-002' }),
    ).toThrow(/não dá para saber qual elemento reescrever/)
  })

  it('LIST-001 -> LIST-002 continua recusando: List não tem prop literal que distinga (documentado no catálogo)', () => {
    expect(() =>
      trocar({ ts, cwd: join(FIXTURES, 'projeto-limpo'), de: 'LIST-001', para: 'LIST-002' }),
    ).toThrow(/não dá para saber qual elemento reescrever/)
  })
})

describe('loadTypeScript', () => {
  it('resolve o typescript deste repositório a partir da raiz (cwd real)', async () => {
    const resolved = await loadTypeScript(join(import.meta.dirname, '../..'))
    expect(resolved).toBeDefined()
    expect(typeof resolved!.createSourceFile).toBe('function')
  })

  it('devolve undefined quando o projeto não tem typescript instalado', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'rendra-sem-typescript-'))
    try {
      const resolved = await loadTypeScript(dir)
      expect(resolved).toBeUndefined()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('a mensagem de erro é clara e em português', () => {
    expect(TYPESCRIPT_NOT_FOUND_MESSAGE).toMatch(/typescript/i)
    expect(TYPESCRIPT_NOT_FOUND_MESSAGE).toMatch(/rendra trocar/)
  })
})
