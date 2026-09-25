import { describe, expect, it } from 'vitest'
import {
  checkFieldHelp,
  checkGuidance,
  checkInstruction,
  checkPageDescription,
  checkSectionHelp,
  HELP_LIMITS,
  helpLimit,
  readAttr,
  textLength,
  type HelpSpan,
} from './help-length'

/*
 * Teste da regra texto-orientativo (etapa 1.2.0-alpha.4, regra C7): orientação curta abaixo do
 * campo, com limite por span; no máximo metade dos campos de uma seção com orientação;
 * descrição do PageHeader até 150 caracteres e sem instrução.
 */

const texto = (n: number) => 'a'.repeat(n)

describe('helpLimit', () => {
  it('usa os limites por span e md quando não há span', () => {
    expect(helpLimit('full')).toBe(150)
    expect(helpLimit('xl')).toBe(100)
    expect(helpLimit('lg')).toBe(70)
    expect(helpLimit('md')).toBe(40)
    expect(helpLimit('half')).toBe(40)
    expect(helpLimit('sm')).toBe(30)
    expect(helpLimit('xs')).toBe(20)
    expect(helpLimit()).toBe(40)
    expect(helpLimit('desconhecido')).toBe(40)
  })

  it('conta acento como um caractere e ignora espaço nas pontas', () => {
    expect(textLength('  ação  ')).toBe(4)
  })
})

describe('checkFieldHelp', () => {
  for (const span of Object.keys(HELP_LIMITS) as HelpSpan[]) {
    const limit = HELP_LIMITS[span]
    it(`span="${span}": ${limit} caracteres passam, ${limit + 1} falham`, () => {
      expect(checkFieldHelp(`<Field label="X" span="${span}" help="${texto(limit)}" />`)).toEqual(
        [],
      )
      const [falha] = checkFieldHelp(
        `<Field label="X" span="${span}" help="${texto(limit + 1)}" />`,
      )
      expect(falha?.message).toContain(`limite para span="${span}" é ${limit}`)
    })
  }

  it('sem span vale md (40)', () => {
    expect(checkFieldHelp(`<Field label="X" help="${texto(40)}" />`)).toEqual([])
    expect(checkFieldHelp(`<Field label="X" help="${texto(41)}" />`)).toHaveLength(1)
  })

  it('mede o FormField com genérico e render com JSX, e help entre chaves com aspas', () => {
    const src = `
      <FormField<Values>
        name="obs"
        span="xs"
        render={(f) => <Input {...f} help="${texto(200)}" />}
        help={'${texto(21)}'}
      />`
    const [falha] = checkFieldHelp(src)
    expect(falha?.line).toBe(2)
    expect(falha?.message).toContain('21 caracteres')
  })

  it('ignora texto dinâmico, span dinâmico e template com interpolação', () => {
    expect(checkFieldHelp('<Field label="X" span="xs" help={mensagem} />')).toEqual([])
    expect(checkFieldHelp(`<Field label="X" span={largura} help="${texto(200)}" />`)).toEqual([])
    expect(
      checkFieldHelp('<Field span="xs" help={`Olá, ${nome}, bem-vindo ao sistema`} />'),
    ).toEqual([])
  })

  it('não confunde <FieldGroup> com <Field> nem helpText com help', () => {
    expect(checkFieldHelp(`<FieldGroup help="${texto(200)}" />`)).toEqual([])
    expect(checkFieldHelp(`<Field helpText="${texto(200)}" />`)).toEqual([])
  })
})

describe('checkSectionHelp', () => {
  const campo = (help?: string) =>
    help
      ? `<Field label="X" help="${help}"><Input /></Field>`
      : '<Field label="X"><Input /></Field>'

  it('metade dos campos com orientação passa', () => {
    const src = `<FormSection title="S">${campo('Curta.')}${campo()}</FormSection>`
    expect(checkSectionHelp(src)).toEqual([])
  })

  it('mais da metade dos campos com orientação falha', () => {
    const src = `<FormSection title="S">\n${campo('Um.')}${campo('Dois.')}${campo()}</FormSection>`
    const [falha] = checkSectionHelp(src)
    expect(falha?.message).toContain('2 de 3 campos')
    expect(falha?.line).toBe(1)
  })

  it('não conta help dinâmico e mede cada seção separadamente', () => {
    const src = [
      `<FormSection title="A">${campo('Um.')}${campo()}</FormSection>`,
      '<FormSection title="B"><Field label="X" help={dica}><Input /></Field></FormSection>',
    ].join('\n')
    expect(checkSectionHelp(src)).toEqual([])
  })
})

describe('checkPageDescription', () => {
  it('150 caracteres passam, 151 falham, dinâmico não é medido', () => {
    expect(checkPageDescription(`<PageHeader title="T" description="${texto(150)}" />`)).toEqual([])
    expect(
      checkPageDescription(`<PageHeader title="T" description="${texto(151)}" />`),
    ).toHaveLength(1)
    expect(checkPageDescription('<PageHeader title="T" description={resumo} />')).toEqual([])
    expect(checkPageDescription('<PageHeader title="T" />')).toEqual([])
  })
})

describe('checkInstruction', () => {
  it('barra subtítulo que começa com verbo de instrução, no PageHeader e no CardDescription', () => {
    expect(checkInstruction('<PageHeader description="Preencha os dados." />')).toHaveLength(1)
    expect(checkInstruction('<CardDescription>Clique para abrir</CardDescription>')).toHaveLength(1)
    expect(checkInstruction('<PageHeader description="Clientes ativos e inativos." />')).toEqual([])
  })
})

describe('checkGuidance', () => {
  it('reúne as violações em ordem de linha', () => {
    const src = [
      '<PageHeader description="Use o menu." />',
      `<Field span="xs" help="${texto(21)}" />`,
    ].join('\n')
    expect(checkGuidance(src).map((v) => v.line)).toEqual([1, 2])
  })
})

describe('readAttr', () => {
  it('lê só o atributo de topo e distingue literal de dinâmico', () => {
    expect(readAttr('<Field help="a" />', 'help')).toEqual({ literal: 'a' })
    expect(readAttr('<Field help={x} />', 'help')).toEqual({ dynamic: true })
    expect(readAttr('<Field help=x />', 'help')).toEqual({ dynamic: true })
    expect(readAttr('<Field render={() => <A help="a" />} />', 'help')).toBeUndefined()
  })
})
