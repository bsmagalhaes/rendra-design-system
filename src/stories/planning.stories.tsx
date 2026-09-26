import type { Meta, StoryObj } from '@storybook/react-vite'
import { Handshake, ThumbsDown } from 'lucide-react'
import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { ChatComposer, ChatThread } from '@/components/ui/chat'
import { DocumentViewer } from '@/components/ui/document-viewer'
import {
  Kanban,
  moveKanbanCard,
  type KanbanCard,
  type KanbanDropTarget,
} from '@/components/ui/kanban'
import { demoTickets } from '@/mocks/chat'
import { demoCards, demoEvents, pipelineColumns } from '@/mocks/planning'

const dropTargets: KanbanDropTarget[] = [
  { id: 'ganho', label: 'Marcar como ganho', icon: <Handshake />, tone: 'success' },
  {
    id: 'perdido',
    label: 'Marcar como perdido',
    hint: 'Encerra o negócio',
    icon: <ThumbsDown />,
    tone: 'error',
  },
  {
    id: 'arquivar',
    label: 'Arquivar',
    tone: 'neutral',
    disabled: true,
    disabledReason: 'Só depois de ganho ou perdido',
  },
]

/* Calendar (calendário e agenda) e Kanban. */

const meta = {
  title: 'Planejamento/Calendar, Kanban e Chat',
  component: Calendar,
  args: { events: demoEvents(), 'aria-label': 'Calendário' },
  argTypes: {
    view: { control: 'inline-radio', options: ['month', 'week', 'day', 'agenda'] },
    events: { control: false },
  },
} satisfies Meta<typeof Calendar>
export default meta
type Story = StoryObj<typeof meta>

export const Mes: Story = { args: { view: 'month' } }
export const Semana: Story = { args: { view: 'week' } }
export const Dia: Story = { args: { view: 'day' } }
export const AgendaEmLista: Story = { args: { view: 'agenda' } }

function KanbanDemo() {
  const [cards, setCards] = useState<KanbanCard[]>(() => demoCards())
  return (
    <Kanban
      aria-label="Funil de vendas"
      columns={pipelineColumns}
      cards={cards}
      onCardMove={(id, to, index) => setCards((l) => moveKanbanCard(l, id, to, index))}
      onAddCard={() => undefined}
    />
  )
}

export const QuadroKanban: Story = { render: () => <KanbanDemo /> }

function KanbanDropTargetsDemo() {
  const [cards] = useState<KanbanCard[]>(() => demoCards())
  return (
    <Kanban
      aria-label="Funil com destinos de arraste"
      columns={pipelineColumns}
      cards={cards}
      dropTargets={dropTargets}
      onDropTarget={() => undefined}
    />
  )
}

export const KanbanComDestinosDeArraste: Story = {
  name: 'Kanban: dropTargets',
  render: () => <KanbanDropTargetsDemo />,
}

function ChatDemo() {
  const [messages, setMessages] = useState(() => demoTickets()[6]?.messages ?? [])
  return (
    <div className="flex h-chart-md min-h-0 flex-col overflow-hidden rounded-surface border">
      <ChatThread messages={messages} />
      <ChatComposer
        onSend={({ text }) =>
          setMessages((m) => [
            ...m,
            { id: String(Date.now()), from: 'agent', text, time: new Date(), status: 'sent' },
          ])
        }
      />
    </div>
  )
}

export const Chat: Story = { render: () => <ChatDemo /> }

// PDF mínimo válido, embutido como data: URL, para a story funcionar sem depender de rede.
const SAMPLE_PDF =
  'data:application/pdf;base64,JVBERi0xLjEKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgMjAwIDIwMF0+PmVuZG9iagp0cmFpbGVyPDwvU2l6ZSA0L1Jvb3QgMSAwIFI+PgolJUVPRg=='

export const VisualizadorDeDocumentos: Story = {
  name: 'DocumentViewer',
  render: () => <DocumentViewer url={SAMPLE_PDF} title="Contrato de exemplo" />,
}
export const VisualizadorVazio: Story = {
  name: 'DocumentViewer: vazio',
  render: () => <DocumentViewer url={null} title="Contrato de exemplo" />,
}
export const VisualizadorComFalha: Story = {
  name: 'DocumentViewer: falha declarada',
  render: () => (
    <DocumentViewer url="https://exemplo.invalido/nao-existe.pdf" title="Contrato de exemplo" />
  ),
}
