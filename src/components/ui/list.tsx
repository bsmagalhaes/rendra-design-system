import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { useRendraLink } from '@/components/rendra-provider'
import { cn } from '@/lib/cn'

export interface ListItem {
  id: string
  title: ReactNode
  description?: ReactNode
  /** Avatar, ícone ou imagem à esquerda. */
  leading?: ReactNode
  /** Valor, badge ou ação à direita. */
  trailing?: ReactNode
  /** Torna a linha navegável. */
  to?: string
  onClick?: () => void
}

export interface ListProps {
  items: ListItem[]
  /** Linhas separadas por borda (padrão) ou sem divisória. */
  divided?: boolean
  empty?: ReactNode
  className?: string
}

/** Lista única: linhas com início, título, descrição e fim; navegável por prop. */
export function List({ items, divided = true, empty, className }: ListProps) {
  const Link = useRendraLink()
  if (items.length === 0 && empty) return <>{empty}</>
  return (
    <ul data-rendra="LIST-001" className={cn('flex flex-col', divided && 'divide-y', className)}>
      {items.map((it) => {
        const interactive = Boolean(it.to || it.onClick)
        const body = (
          <>
            {it.leading && <span className="flex shrink-0">{it.leading}</span>}
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-sm font-medium">{it.title}</span>
              {it.description && (
                <span className="line-clamp-2 text-sm text-muted-foreground">{it.description}</span>
              )}
            </span>
            {it.trailing && <span className="flex shrink-0 items-center">{it.trailing}</span>}
            {interactive && (
              <ChevronRight className="size-icon-sm shrink-0 text-muted-foreground" aria-hidden />
            )}
          </>
        )
        const cls = cn(
          'flex min-h-touch w-full items-center gap-3 py-3 text-left',
          interactive && '-mx-2 rounded-item px-2 transition-colors hover:bg-accent',
        )
        return (
          <li key={it.id}>
            {it.to ? (
              <Link to={it.to} className={cls}>
                {body}
              </Link>
            ) : it.onClick ? (
              <button type="button" onClick={it.onClick} className={cls}>
                {body}
              </button>
            ) : (
              <div className={cls}>{body}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
