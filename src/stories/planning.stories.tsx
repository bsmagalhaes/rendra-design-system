import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { ChatComposer, ChatThread } from '@/components/ui/chat'
import { Kanban, moveKanbanCard, type KanbanCard } from '@/components/ui/kanban'
import { demoTickets } from '@/mocks/chat'
import { demoCards, demoEvents, pipelineColumns } from '@/mocks/planning'

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
