import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from '@/lib/cn'

export interface BreadcrumbItem {
  label: string
  to?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  /**
   * responsive: trilha no desktop e botão voltar no mobile (padrão, dentro das páginas).
   * trail: sempre a trilha, em texto pequeno (usado no header, abaixo do título).
   */
  variant?: 'responsive' | 'trail'
  className?: string
}

/**
 * Breadcrumb único. No desktop mostra a trilha completa. No mobile vira botão
 * voltar para o nível anterior com o nome da tela atual (mesmo componente, mesma API).
 */
export function Breadcrumb({ items, variant = 'responsive', className }: BreadcrumbProps) {
  if (items.length === 0) return null
  if (variant === 'trail') {
    return (
      <nav aria-label="Trilha de navegação" className={cn('min-w-0', className)}>
        <ol className="flex min-w-0 items-center gap-1 overflow-hidden text-xs text-muted-foreground">
          {items.map((item, i) => {
            const last = i === items.length - 1
            return (
              <li
                key={`${item.label}-${i}`}
                className={cn(
                  'flex min-w-0 items-center gap-1',
                  !last && 'shrink-0 max-sm:max-w-24',
                )}
              >
                {item.to && !last ? (
                  <>
                    {/* Links só a partir de md; no celular a trilha é informativa (toque de 44px) */}
                    <Link
                      to={item.to}
                      className="hidden truncate rounded-item transition-colors hover:text-primary-text md:inline"
                    >
                      {item.label}
                    </Link>
                    <span className="truncate md:hidden">{item.label}</span>
                  </>
                ) : (
                  <span aria-current={last ? 'page' : undefined} className="truncate">
                    {item.label}
                  </span>
                )}
                {!last && <ChevronRight className="size-3 shrink-0" aria-hidden />}
              </li>
            )
          })}
        </ol>
      </nav>
    )
  }
  const current = items[items.length - 1]
  const parent = [...items.slice(0, -1)].reverse().find((i) => i.to)

  return (
    <nav aria-label="Trilha de navegação" className={cn('min-w-0', className)}>
      {/* Mobile: voltar + tela atual */}
      <div className="flex min-w-0 items-center gap-1 md:hidden">
        {parent?.to ? (
          <Link
            to={parent.to}
            aria-label={`Voltar para ${parent.label}`}
            className="-ml-2 flex min-h-touch min-w-0 items-center gap-1 rounded-item pr-2 text-base font-medium text-foreground active:bg-accent"
          >
            <ChevronLeft className="size-icon-md shrink-0 text-muted-foreground" aria-hidden />
            <span className="truncate">{current?.label}</span>
          </Link>
        ) : (
          <span className="truncate text-base font-medium">{current?.label}</span>
        )}
      </div>

      {/* Desktop: trilha completa */}
      <ol className="hidden min-w-0 items-center gap-1 text-sm md:flex">
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={`${item.label}-${i}`} className="flex min-w-0 items-center gap-1">
              {last || !item.to ? (
                <span
                  aria-current={last ? 'page' : undefined}
                  className={cn(
                    'truncate',
                    last ? 'font-medium text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="truncate rounded-item text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              )}
              {!last && (
                <ChevronRight className="size-icon-sm shrink-0 text-muted-foreground" aria-hidden />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
