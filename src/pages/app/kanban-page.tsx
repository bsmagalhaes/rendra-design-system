import { useMemo, useState } from 'react'
import { Container, PageHeader, Stack } from '@/components/layout'
import { Kanban, moveKanbanCard, type KanbanCard } from '@/components/ui/kanban'
import { toast } from '@/components/ui/toast'
import { demoCards, pipelineColumns } from '@/mocks/planning'

/**
 * Funil de vendas em kanban. Arraste os cards no computador; no toque ou no teclado,
 * use o menu do card ("Mover para"). No celular, uma coluna por vez, pelas abas.
 */
export function KanbanPage() {
  const initial = useMemo(() => demoCards(), [])
  const [cards, setCards] = useState<KanbanCard[]>(initial)

  return (
    <Container padded>
      <Stack gap="section">
        <PageHeader title="Funil de vendas" />
        <Kanban
          aria-label="Funil de vendas"
          columns={pipelineColumns}
          cards={cards}
          onCardMove={(id, to, index) => {
            setCards((list) => moveKanbanCard(list, id, to, index))
            const col = pipelineColumns.find((c) => c.id === to)
            if (col) toast.success(`Movido para ${col.title}`)
          }}
          onCardClick={(c) => toast.info(c.title, { description: c.description })}
          onAddCard={(col) =>
            toast.info('Novo card', {
              description: `Em ${pipelineColumns.find((c) => c.id === col)?.title}`,
            })
          }
        />
      </Stack>
    </Container>
  )
}
