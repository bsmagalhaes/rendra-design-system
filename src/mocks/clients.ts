/* Dados fictícios de demonstração. Troque pela API real. */

export type ClientStatus = 'Ativo' | 'Em análise' | 'Inadimplente' | 'Inativo'

export interface Client {
  id: string
  /** Nome (pessoa) ou nome fantasia (empresa). */
  name: string
  /** Razão social, só para empresas. */
  legalName?: string
  document: string
  email: string
  phone: string
  city: string
  segment: string
  status: ClientStatus
  revenue: number
  createdAt: string
  owner: string
  notes: string
}

const first = [
  'Ana',
  'Bruno',
  'Carla',
  'Diego',
  'Elisa',
  'Fábio',
  'Gabriela',
  'Heitor',
  'Isabela',
  'João',
  'Karina',
  'Lucas',
  'Marina',
  'Nicolas',
  'Olívia',
  'Paulo',
  'Renata',
  'Samuel',
  'Tânia',
  'Vitor',
]
const last = [
  'Ribeiro',
  'Costa',
  'Mendes',
  'Almeida',
  'Souza',
  'Lima',
  'Barbosa',
  'Rocha',
  'Teixeira',
  'Carvalho',
]
const companies = [
  'Padaria Bom Grão',
  'Clínica Vida Plena',
  'Oficina Rota Sul',
  'Mercado Central',
  'Escola Novo Saber',
  'Construtora Alicerce',
  'Studio Forma',
  'Farmácia Bem Estar',
  'Transportes Veloz',
  'Café da Praça',
]
const cities = [
  'São Paulo, SP',
  'Belo Horizonte, MG',
  'Curitiba, PR',
  'Recife, PE',
  'Porto Alegre, RS',
  'Salvador, BA',
  'Goiânia, GO',
  'Florianópolis, SC',
]
const segments = ['Varejo', 'Saúde', 'Serviços', 'Educação', 'Indústria', 'Alimentação']
const statuses: ClientStatus[] = [
  'Ativo',
  'Ativo',
  'Ativo',
  'Em análise',
  'Inadimplente',
  'Inativo',
]

// Gerador determinístico: a demonstração mostra sempre os mesmos dados.
let seed = 7
const rand = () => {
  seed = (seed * 9301 + 49297) % 233280
  return seed / 233280
}
const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)] as T

export const clients: Client[] = Array.from({ length: 48 }, (_, i) => {
  const isCompany = i % 3 === 0
  const person = `${pick(first)} ${pick(last)}`
  const name = isCompany ? `${pick(companies)} ${i + 1}` : person
  const day = String(1 + Math.floor(rand() * 27)).padStart(2, '0')
  const month = String(1 + Math.floor(rand() * 9)).padStart(2, '0')
  return {
    id: String(1000 + i),
    name,
    legalName: isCompany ? `${name} Comércio e Serviços Ltda.` : undefined,
    document: isCompany ? '12.345.678/0001-95' : '123.456.789-09',
    email: `${person
      .toLowerCase()
      .normalize('NFD')
      .replace(/[^a-z ]/g, '')
      .replace(' ', '.')}@exemplo.com.br`,
    phone: `(11) 9${Math.floor(1000 + rand() * 8999)}-${Math.floor(1000 + rand() * 8999)}`,
    city: pick(cities),
    segment: pick(segments),
    status: pick(statuses),
    revenue: Math.round(800 + rand() * 24000) + 0.5 * (i % 2),
    createdAt: `2026-${month}-${day}`,
    owner: `${pick(first)} ${pick(last)}`,
    notes:
      'Cliente atendido pela equipe de campo. Prefere contato por e-mail no período da manhã e recebe relatório mensal de acompanhamento.',
  }
})

export const statusTone: Record<ClientStatus, 'success' | 'warning' | 'error' | 'neutral'> = {
  Ativo: 'success',
  'Em análise': 'warning',
  Inadimplente: 'error',
  Inativo: 'neutral',
}

export const monthly = [
  { mes: 'Out', receita: 42100, meta: 40000 },
  { mes: 'Nov', receita: 45800, meta: 42000 },
  { mes: 'Dez', receita: 51200, meta: 45000 },
  { mes: 'Jan', receita: 39800, meta: 43000 },
  { mes: 'Fev', receita: 44300, meta: 44000 },
  { mes: 'Mar', receita: 48900, meta: 46000 },
  { mes: 'Abr', receita: 50100, meta: 47000 },
  { mes: 'Mai', receita: 53600, meta: 49000 },
  { mes: 'Jun', receita: 55200, meta: 51000 },
  { mes: 'Jul', receita: 54100, meta: 52000 },
  { mes: 'Ago', receita: 58700, meta: 54000 },
  { mes: 'Set', receita: 61300, meta: 56000 },
]

export const bySegment = segments.map((s, i) => ({ segmento: s, clientes: 18 - i * 2 }))

/** Contratos novos e renovados por mês, com a meta de contratos (demonstração). */
export const contractsMix = monthly.map((m, i) => ({
  mes: m.mes,
  novos: 18 + ((i * 7) % 11),
  renovacoes: 12 + ((i * 5) % 9),
  meta: 34 + Math.floor(i / 3) * 2,
}))

/** Funil comercial do mês, nas mesmas etapas do kanban (demonstração). */
export const salesFunnel = [
  { label: 'Novo contato', value: 240 },
  { label: 'Qualificado', value: 132 },
  { label: 'Proposta', value: 61 },
  { label: 'Fechado', value: 27 },
]
