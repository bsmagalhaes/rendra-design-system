import { afterEach, describe, expect, it, vi } from 'vitest'
import { lookupCep, lookupCnpj } from './lookup'

const respond = (status: number, body: unknown) =>
  vi.fn().mockResolvedValue({ ok: status < 400, status, json: async () => body })

afterEach(() => vi.unstubAllGlobals())

describe('lookupCep', () => {
  it('traduz a resposta do ViaCEP', async () => {
    vi.stubGlobal(
      'fetch',
      respond(200, {
        cep: '01001-000',
        logradouro: 'Praça da Sé',
        complemento: 'lado ímpar',
        bairro: 'Sé',
        localidade: 'São Paulo',
        uf: 'SP',
      }),
    )
    expect(await lookupCep('01001-000')).toEqual({
      cep: '01001-000',
      logradouro: 'Praça da Sé',
      complemento: 'lado ímpar',
      bairro: 'Sé',
      cidade: 'São Paulo',
      uf: 'SP',
    })
  })
  it('CEP incompleto não busca; inexistente devolve null', async () => {
    const f = respond(200, { erro: true })
    vi.stubGlobal('fetch', f)
    expect(await lookupCep('0100')).toBeNull()
    expect(f).not.toHaveBeenCalled()
    expect(await lookupCep('99999-999')).toBeNull()
  })
})

describe('lookupCnpj', () => {
  it('traduz a resposta da BrasilAPI', async () => {
    vi.stubGlobal(
      'fetch',
      respond(200, {
        razao_social: 'EMPRESA EXEMPLO LTDA',
        nome_fantasia: 'EXEMPLO',
        email: 'CONTATO@EXEMPLO.COM.BR',
        ddd_telefone_1: '1133334444',
        descricao_situacao_cadastral: 'ATIVA',
        cep: '01001000',
        descricao_tipo_de_logradouro: 'PRACA',
        logradouro: 'DA SE',
        numero: '100',
        complemento: null,
        bairro: 'SE',
        municipio: 'SAO PAULO',
        uf: 'SP',
      }),
    )
    const c = await lookupCnpj('11.222.333/0001-81')
    expect(c?.razaoSocial).toBe('EMPRESA EXEMPLO LTDA')
    expect(c?.email).toBe('contato@exemplo.com.br')
    expect(c?.telefone).toBe('(11) 3333-4444')
    expect(c?.endereco.logradouro).toBe('PRACA DA SE')
    expect(c?.endereco.complemento).toBe('')
  })
  it('CNPJ inexistente devolve null', async () => {
    vi.stubGlobal('fetch', respond(404, {}))
    expect(await lookupCnpj('11.222.333/0001-81')).toBeNull()
  })
})
