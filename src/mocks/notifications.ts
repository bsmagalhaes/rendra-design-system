/* Dados fictícios de demonstração. Troque pela API real. */
import type { ShellNotificationItem } from '@/components/app-shell/types'

export const notificationItems: ShellNotificationItem[] = [
  {
    id: '1',
    type: 'success',
    title: 'Contrato 1042 assinado pelo cliente',
    time: 'há 5 min',
    read: false,
  },
  { id: '2', type: 'warning', title: '3 tarefas vencem hoje', time: 'há 1 h', read: false },
  { id: '3', type: 'info', title: 'Relatório mensal disponível', time: 'ontem', read: false },
  {
    id: '4',
    type: 'error',
    title: 'Falha na importação de clientes',
    time: '20/09/2026',
    read: true,
  },
]
