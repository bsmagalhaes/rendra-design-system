import type { TableColumn } from '@/components/ui/table'
import { statusTone, type Client } from '@/mocks/clients'

/* Colunas da tabela de clientes, compartilhadas pela listagem e pela vitrine. */
export const clientColumns: TableColumn<Client>[] = [
  {
    id: 'name',
    header: 'Cliente',
    accessor: (c) => c.name,
    // Pessoa: nome e CPF. Empresa: nome fantasia, razão social e CNPJ.
    details: (c) => [c.legalName, c.document],
    href: (c) => `/clientes/${c.id}`,
    mobile: 'primary',
    hideable: false,
    width: 'md',
    lines: 2,
  },
  {
    id: 'contact',
    header: 'Contato',
    accessor: (c) => c.phone,
    details: (c) => [c.email],
    mobile: 'secondary',
  },
  {
    id: 'status',
    header: 'Situação',
    accessor: (c) => c.status,
    kind: 'badge',
    badgeTone: (c) => statusTone[c.status],
    mobile: 'primary',
  },
  { id: 'city', header: 'Cidade', accessor: (c) => c.city, mobile: 'primary', lines: 1 },
  { id: 'segment', header: 'Segmento', accessor: (c) => c.segment, mobile: 'secondary' },
  {
    id: 'revenue',
    header: 'Receita mensal',
    accessor: (c) => c.revenue,
    kind: 'currency',
    mobile: 'secondary',
  },
  {
    id: 'createdAt',
    header: 'Cadastro',
    accessor: (c) => c.createdAt,
    kind: 'date',
    mobile: 'secondary',
  },
]
