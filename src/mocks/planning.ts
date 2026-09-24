import { addDays, setHours, setMinutes, startOfDay, startOfWeek } from 'date-fns'
import type { CalendarEvent } from '@/components/ui/calendar'
import type { KanbanCard, KanbanColumn } from '@/components/ui/kanban'

/* Dados fictícios de demonstração da agenda e do kanban, sempre em torno de hoje. */

const at = (base: Date, day: number, h: number, m = 0) =>
  setMinutes(setHours(addDays(base, day), h), m)

export function demoEvents(today = new Date()): CalendarEvent[] {
  const week = startOfWeek(startOfDay(today), { weekStartsOn: 0 })
  const list: Omit<CalendarEvent, 'id'>[] = [
    {
      title: 'Reunião de equipe',
      start: at(week, 1, 9),
      end: at(week, 1, 10),
      tone: 'primary',
      location: 'Sala 2',
    },
    {
      title: 'Visita: Padaria Bom Grão',
      start: at(week, 1, 14),
      end: at(week, 1, 15, 30),
      tone: 'success',
      location: 'Goiânia, GO',
    },
    { title: 'Revisar contratos', start: at(week, 2, 10), end: at(week, 2, 12), tone: 'info' },
    { title: 'Feriado municipal', start: at(week, 3, 0), allDay: true, tone: 'neutral' },
    {
      title: 'Apresentação de proposta',
      start: at(week, 3, 15),
      end: at(week, 3, 16),
      tone: 'warning',
      location: 'Online',
    },
    {
      title: 'Cobrança: Oficina Rota Sul',
      start: at(week, 4, 11),
      end: at(week, 4, 11, 30),
      tone: 'error',
    },
    {
      title: 'Treinamento da plataforma',
      start: at(week, 4, 14),
      end: at(week, 4, 17),
      tone: 'primary',
      location: 'Auditório',
    },
    {
      title: 'Almoço com parceiro',
      start: at(week, 5, 12),
      end: at(week, 5, 13, 30),
      tone: 'success',
    },
    { title: 'Fechamento do mês', start: at(week, 5, 16), end: at(week, 5, 18), tone: 'info' },
    {
      title: 'Planejamento da semana',
      start: at(week, 8, 9),
      end: at(week, 8, 10),
      tone: 'primary',
    },
    {
      title: 'Visita: Clínica Vida Plena',
      start: at(week, 9, 10),
      end: at(week, 9, 11),
      tone: 'success',
      location: 'Florianópolis, SC',
    },
    {
      title: 'Renovação de plano',
      start: at(week, 10, 15),
      end: at(week, 10, 16),
      tone: 'warning',
    },
    { title: 'Retrospectiva', start: at(week, 12, 16), end: at(week, 12, 17), tone: 'info' },
    { title: 'Workshop de vendas', start: at(week, -3, 9), end: at(week, -3, 12), tone: 'primary' },
    {
      title: 'Entrega do relatório',
      start: at(week, -5, 17),
      end: at(week, -5, 18),
      tone: 'error',
    },
  ]
  return list.map((e, i) => ({ ...e, id: `ev-${i + 1}` }))
}

export const pipelineColumns: KanbanColumn[] = [
  { id: 'lead', title: 'Novo contato', tone: 'neutral' },
  { id: 'qualificado', title: 'Qualificado', tone: 'info' },
  { id: 'proposta', title: 'Proposta', tone: 'warning', limit: 4 },
  { id: 'fechado', title: 'Fechado', tone: 'success' },
]

export function demoCards(today = new Date()): KanbanCard[] {
  const d = (n: number) => addDays(startOfDay(today), n)
  return [
    {
      id: 'k1',
      columnId: 'lead',
      title: 'Mercado Central',
      description: 'Pediu contato pelo site.',
      tags: [{ label: 'Varejo' }],
      assignee: 'Ana Ribeiro',
      dueDate: d(2),
      meta: 'R$ 4.800,00',
    },
    {
      id: 'k2',
      columnId: 'lead',
      title: 'Farmácia Bem Estar',
      tags: [{ label: 'Saúde', tone: 'info' }],
      assignee: 'Bruno Costa',
      dueDate: d(4),
      meta: 'R$ 2.300,00',
    },
    {
      id: 'k3',
      columnId: 'lead',
      title: 'Café da Praça',
      description: 'Indicação de cliente.',
      assignee: 'Carla Mendes',
      meta: 'R$ 1.200,00',
    },
    {
      id: 'k4',
      columnId: 'qualificado',
      title: 'Oficina Rota Sul',
      description: 'Quer integrar com o ERP atual.',
      tags: [{ label: 'Serviços' }, { label: 'Urgente', tone: 'error' }],
      assignee: 'Ana Ribeiro',
      dueDate: d(1),
      meta: 'R$ 9.600,00',
    },
    {
      id: 'k5',
      columnId: 'qualificado',
      title: 'Escola Saber',
      tags: [{ label: 'Educação', tone: 'primary' }],
      assignee: 'Bruno Costa',
      dueDate: d(6),
      meta: 'R$ 7.100,00',
    },
    {
      id: 'k6',
      columnId: 'proposta',
      title: 'Clínica Vida Plena',
      description: 'Proposta enviada, aguardando retorno.',
      tags: [{ label: 'Saúde', tone: 'info' }],
      assignee: 'Carla Mendes',
      dueDate: d(3),
      meta: 'R$ 12.500,00',
    },
    {
      id: 'k7',
      columnId: 'proposta',
      title: 'Padaria Bom Grão',
      tags: [{ label: 'Alimentação' }],
      assignee: 'Ana Ribeiro',
      dueDate: d(-1),
      meta: 'R$ 3.900,00',
    },
    {
      id: 'k8',
      columnId: 'fechado',
      title: 'Indústria Aço Forte',
      description: 'Contrato de 12 meses assinado.',
      tags: [{ label: 'Indústria', tone: 'success' }],
      assignee: 'Bruno Costa',
      meta: 'R$ 28.000,00',
    },
  ]
}
