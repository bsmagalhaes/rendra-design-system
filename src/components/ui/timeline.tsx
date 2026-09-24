import type { ReactNode } from 'react'
import type { FeedbackType } from '@/brand'
import { cn } from '@/lib/cn'

export interface TimelineEvent {
  id: string
  title: ReactNode
  description?: ReactNode
  /** Data em formato curto (ex.: "22/09/2026 14:30"). */
  date: string
  tone?: FeedbackType | 'neutral'
  icon?: ReactNode
}

const dot: Record<NonNullable<TimelineEvent['tone']>, string> = {
  neutral: 'bg-muted text-muted-foreground',
  info: 'bg-info-soft text-info-soft-foreground',
  success: 'bg-success-soft text-success-soft-foreground',
  warning: 'bg-warning-soft text-warning-soft-foreground',
  error: 'bg-destructive-soft text-destructive-soft-foreground',
}

/** Linha do tempo única, com eventos em ordem e tom semântico por evento. */
export function Timeline({ events, className }: { events: TimelineEvent[]; className?: string }) {
  return (
    <ol className={cn('@container flex flex-col', className)}>
      {events.map((e, i) => (
        <li key={e.id} className="relative flex gap-3 pb-6 last:pb-0">
          {i < events.length - 1 && (
            <span
              aria-hidden
              className="absolute top-8 bottom-0 left-4 w-px -translate-x-1/2 bg-border"
            />
          )}
          <span
            aria-hidden
            className={cn(
              'relative flex size-8 shrink-0 items-center justify-center rounded-full [&_svg]:size-icon-sm',
              dot[e.tone ?? 'neutral'],
            )}
          >
            {e.icon ?? <span className="size-2 rounded-full bg-current" />}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1 pt-1">
            <div className="flex min-w-0 flex-col gap-1 @sm:flex-row @sm:items-baseline @sm:justify-between @sm:gap-3">
              <span className="text-sm font-medium">{e.title}</span>
              <time className="shrink-0 text-xs text-muted-foreground tabular-nums">{e.date}</time>
            </div>
            {e.description && <p className="text-sm text-muted-foreground">{e.description}</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}
