import { Bell } from 'lucide-react'
import { useState } from 'react'
import { BrandFeedbackIcon } from '@/components/ui/brand-feedback-icon'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/cn'
import { useShell } from './shell-context'

/**
 * Sino de notificações. Renderizado só quando o AppShell recebe a prop `notifications`;
 * os itens e os dois retornos de chamada (marcar todas como lidas, marcar uma como lida)
 * vêm dessa prop, nunca de um mock interno.
 */
export function Notifications() {
  const { notifications } = useShell()
  const [items, setItems] = useState(() => notifications?.items ?? [])
  const unread = items.filter((n) => !n.read).length

  if (!notifications) return null

  const markAllRead = () => {
    setItems((all) => all.map((n) => ({ ...n, read: true })))
    notifications.onMarkAllRead?.()
  }
  const markRead = (id: string) => {
    setItems((all) => all.map((n) => (n.id === id ? { ...n, read: true } : n)))
    notifications.onItemClick?.(id)
  }

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
          <Button variant="ghost" size="sm" disabled={!unread} onClick={markAllRead}>
            Marcar como lidas
          </Button>
        </div>
        <ul className="flex flex-col p-2">
          {items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => markRead(n.id)}
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
