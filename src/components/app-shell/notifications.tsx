import { Bell } from 'lucide-react'
import { useState } from 'react'
import type { FeedbackType } from '@/brand'
import { BrandFeedbackIcon } from '@/components/ui/brand-feedback-icon'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/cn'

interface Notification {
  id: string
  type: FeedbackType
  title: string
  time: string
  read: boolean
}

const initial: Notification[] = [
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

export function Notifications() {
  const [items, setItems] = useState(initial)
  const unread = items.filter((n) => !n.read).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          iconOnly
          aria-label={unread ? `Notificações, ${unread} não lidas` : 'Notificações'}
          className="relative"
        >
          <Bell aria-hidden />
          {unread > 0 && (
            <span
              aria-hidden
              className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-xs leading-none font-medium text-destructive-foreground tabular-nums"
            >
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex flex-col">
        <div className="flex items-center justify-between gap-2 border-b py-2 pr-2 pl-4">
          <span className="text-sm font-semibold">Notificações</span>
          <Button
            variant="ghost"
            size="sm"
            disabled={!unread}
            onClick={() => setItems((all) => all.map((n) => ({ ...n, read: true })))}
          >
            Marcar como lidas
          </Button>
        </div>
        <ul className="flex flex-col p-2">
          {items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() =>
                  setItems((all) => all.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
                }
                className="flex w-full items-start gap-3 rounded-item p-2 text-left transition-colors hover:bg-accent"
              >
                <BrandFeedbackIcon type={n.type} size="md" className="mt-px" />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className={cn('text-sm', !n.read && 'font-medium')}>{n.title}</span>
                  <span className="text-xs text-muted-foreground">{n.time}</span>
                </span>
                {!n.read && (
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-primary">
                    <span className="sr-only">Não lida</span>
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
