import { Check, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Container, PageHeader, Stack } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/table'
import { toast } from '@/components/ui/toast'

interface Task {
  id: string
  titulo: string
  cliente: string
  responsavel: string
  prazo: string
  prioridade: 'Alta' | 'Média' | 'Baixa'
}

const tasks: Task[] = Array.from({ length: 18 }, (_, i) => ({
  id: String(i + 1),
  titulo:
    [
      'Enviar proposta',
      'Revisar contrato',
      'Cobrar fatura em atraso',
      'Agendar visita',
      'Atualizar cadastro',
      'Renovar plano',
    ][i % 6] ?? 'Tarefa',
  cliente:
    ['Padaria Bom Grão', 'Clínica Vida Plena', 'Oficina Rota Sul', 'Mercado Central'][i % 4] ?? '',
  responsavel: ['Ana Ribeiro', 'Bruno Costa', 'Carla Mendes'][i % 3] ?? '',
  prazo: `2026-09-${String(22 + (i % 8)).padStart(2, '0')}`,
  prioridade: (['Alta', 'Média', 'Baixa'] as const)[i % 3] ?? 'Média',
}))

const tone = { Alta: 'error', Média: 'warning', Baixa: 'neutral' } as const

/** Listagem simples de pendências da equipe. */
export function TasksPage() {
  const [search, setSearch] = useState('')
  return (
    <Container padded>
      <Stack gap="section">
        <PageHeader
          title="Tarefas"
          description="Pendências da equipe, por prazo."
          actions={
            <Button icon={<Plus />} onClick={() => toast.info('Nova tarefa')}>
              Nova tarefa
            </Button>
          }
        />
        <Table<Task>
          aria-label="Tarefas"
          data={tasks}
          getRowId={(t) => t.id}
          selectable
          globalFilter={search}
          pageSize={10}
          density="compact"
          columns={[
            {
              id: 'titulo',
              header: 'Tarefa',
              accessor: (t) => t.titulo,
              mobile: 'primary',
              hideable: false,
            },
            {
              id: 'prioridade',
              header: 'Prioridade',
              accessor: (t) => t.prioridade,
              kind: 'badge',
              badgeTone: (t) => tone[t.prioridade],
              mobile: 'primary',
            },
            {
              id: 'prazo',
              header: 'Prazo',
              accessor: (t) => t.prazo,
              kind: 'date',
              mobile: 'primary',
            },
            { id: 'cliente', header: 'Cliente', accessor: (t) => t.cliente, mobile: 'secondary' },
            {
              id: 'responsavel',
              header: 'Responsável',
              accessor: (t) => t.responsavel,
              mobile: 'secondary',
            },
          ]}
          rowActions={[
            {
              label: 'Concluir',
              icon: <Check />,
              onClick: (t) => toast.success(`${t.titulo} concluída`),
            },
            { label: 'Editar', icon: <Pencil />, onClick: () => toast.info('Editar tarefa') },
            {
              label: 'Excluir',
              icon: <Trash2 />,
              destructive: true,
              onClick: () => toast.error('Tarefa excluída'),
            },
          ]}
          bulkActions={(sel, clear) => (
            <Button
              size="sm"
              variant="outline"
              icon={<Check />}
              onClick={() => {
                toast.success(`${sel.length} concluídas`)
                clear()
              }}
            >
              Concluir
            </Button>
          )}
          toolbar={{ search: { value: search, onChange: setSearch, placeholder: 'Buscar tarefa' } }}
        />
      </Stack>
    </Container>
  )
}
