import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { ImageViewer } from '@/components/ui/image-viewer'
import { Kanban, moveKanbanCard, type KanbanCard } from '@/components/ui/kanban'
import { toast } from '@/components/ui/toast'
import { demoCards, demoEvents, pipelineColumns } from '@/mocks/planning'
import { Demo } from './demo'

/* Vitrine: calendário, kanban e visualizador de imagens. */
export function PlanningSection() {
  const events = useMemo(() => demoEvents(), [])
  const [cards, setCards] = useState<KanbanCard[]>(() => demoCards())
  const [image, setImage] = useState<number | null>(null)
  const images = useMemo(() => {
    const files = import.meta.glob<string>('../../../docs/images/safira-*.png', {
      eager: true,
      query: '?url',
      import: 'default',
    })
    return Object.entries(files)
      .slice(0, 4)
      .map(([path, src]) => {
        const name = path.split('/').pop()?.replace('.png', '') ?? ''
        return { src, alt: `Captura ${name.replace('-', ': ')}` }
      })
  }, [])

  return (
    <>
      <Demo
        id="calendario"
        title="Calendar"
        description="Um componente para calendário e agenda: mês, semana, dia e lista são a prop view. No celular, o mês vira compacto com a lista do dia e a semana vira o dia com a faixa dos 7 dias."
        props="events, view (month, week, day, agenda), views, date, onDateChange, onEventClick, onDateClick, hours"
        code="CAL-001"
        bare
      >
        <Calendar
          aria-label="Exemplo de calendário"
          events={events}
          onEventClick={(e) => toast.info(e.title)}
        />
      </Demo>
      <Demo
        id="kanban"
        title="Kanban"
        description="Colunas com cards. Arraste no computador; no toque e no teclado, o menu do card move para outra coluna. No celular, uma coluna por vez. Limite por coluna (limit) deixa o contador em alerta."
        props="columns (id, title, tone, limit), cards (title, description, tags, assignee, dueDate, meta), onCardMove, onCardClick, onAddCard, renderCard"
        code="KANB-001"
        bare
      >
        <Kanban
          aria-label="Exemplo de kanban"
          columns={pipelineColumns}
          cards={cards}
          onCardMove={(id, to, index) => setCards((l) => moveKanbanCard(l, id, to, index))}
          onAddCard={() => toast.info('Novo card')}
        />
      </Demo>
      <Demo
        id="visualizador"
        title="ImageViewer"
        description="Abre imagens por cima da tela, sem sair da página. Setas e Esc no teclado, arrastar para o lado e pinça no celular."
        props="images (src, alt, caption), index, onIndexChange"
        code="IMG-001"
      >
        <Button variant="outline" onClick={() => setImage(0)} disabled={!images.length}>
          Abrir galeria de exemplo
        </Button>
        <ImageViewer images={images} index={image} onIndexChange={setImage} />
      </Demo>
    </>
  )
}
