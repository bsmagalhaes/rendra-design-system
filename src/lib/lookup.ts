/*
 * Buscas que preenchem o formulário, direto do navegador (APIs públicas e gratuitas, com
 * CORS liberado, sem backend):
 *   CEP   ViaCEP     https://viacep.com.br
 *   CNPJ  BrasilAPI  https://brasilapi.com.br
 * Regra de tela: o campo que faz a busca vem primeiro (25% da linha) e os campos que ele
 * preenche ficam abaixo, para a pessoa saber da busca antes de digitar o resto.
 */

const digits = (v: string) => v.replace(/\D/g, '')

export interface Address {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  cidade: string
  uf: string
}

/** Endereço do CEP (8 dígitos). null se não existir; lança erro se a busca falhar. */
export async function lookupCep(cep: string, signal?: AbortSignal): Promise<Address | null> {
  const d = digits(cep)
  if (d.length !== 8) return null
  const res = await fetch(`https://viacep.com.br/ws/${d}/json/`, { signal })
  if (!res.ok) throw new Error('Não foi possível buscar o CEP agora.')
  const data = (await res.json()) as Record<string, string | boolean>
  if (data.erro) return null
  return {
    cep: String(data.cep ?? ''),
    logradouro: String(data.logradouro ?? ''),
    complemento: String(data.complemento ?? ''),
    bairro: String(data.bairro ?? ''),
    cidade: String(data.localidade ?? ''),
    uf: String(data.uf ?? ''),
  }
}

export interface Company {
  razaoSocial: string
  nomeFantasia: string
  email: string
  telefone: string
  situacao: string
  endereco: Address & { numero: string }
}

/** Dados públicos do CNPJ (14 dígitos). null se não existir; lança erro se a busca falhar. */
export async function lookupCnpj(cnpj: string, signal?: AbortSignal): Promise<Company | null> {
  const d = digits(cnpj)
  if (d.length !== 14) return null
  const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${d}`, { signal })
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Não foi possível buscar o CNPJ agora.')
  const data = (await res.json()) as Record<string, string | number | null>
  const s = (k: string) => (data[k] == null ? '' : String(data[k]))
  const fone = digits(s('ddd_telefone_1'))
  return {
    razaoSocial: s('razao_social'),
    nomeFantasia: s('nome_fantasia'),
    email: s('email').toLowerCase(),
    telefone:
      fone.length >= 10 ? `(${fone.slice(0, 2)}) ${fone.slice(2, -4)}-${fone.slice(-4)}` : '',
    situacao: s('descricao_situacao_cadastral'),
    endereco: {
      cep: s('cep'),
      logradouro: [s('descricao_tipo_de_logradouro'), s('logradouro')].filter(Boolean).join(' '),
      numero: s('numero'),
      complemento: s('complemento'),
      bairro: s('bairro'),
      cidade: s('municipio'),
      uf: s('uf'),
    },
  }
}
