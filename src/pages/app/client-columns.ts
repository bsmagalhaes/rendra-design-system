import type { TableColumn } from '@/components/ui/table'
import { statusTone, type Client } from '@/mocks/clients'

/* Colunas da tabela de clientes, compartilhadas pela listagem e pela vitrine. */
export const clientColumns: TableColumn<Client>[] = [
  {
    id: 'name',
    header: 'Cliente',
    accessor: (c) => c.name,
    mobile: 'primary',
    hideable: false,
    width: 'md',
    lines: 2,
  },
  {
    id: 'status',
    header: 'Situação',
    accessor: (c) => c.status,
    kind: 'badge',
    badgeTone: (c) => statusTone[c.status],
    mobile: 'primary',
  },
  { id: 'city', header: 'Cidade', accessor: (c) => c.city, mobile: 'primary' },
  { id: 'segment', header: 'Segmento', accessor: (c) => c.segment, mobile: 'secondary' },
  {
    id: 'email',
    hidden: true,
    header: 'E-mail',
    accessor: (c) => c.email,
    mobile: 'secondary',
    lines: 1,
  },
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
