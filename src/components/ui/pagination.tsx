import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/cn'

export interface PaginationProps {
  /** Página atual, começando em 1. */
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizes?: number[]
  /**
   * Mobile: 'pages' mostra anterior e próxima com "Página 2 de 25";
   * 'loadMore' troca por um botão "Carregar mais".
   */
  mobileMode?: 'pages' | 'loadMore'
  loading?: boolean
  className?: string
}

function range(page: number, pages: number): (number | '...')[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)
  if (page <= 4) return [1, 2, 3, 4, 5, '...', pages]
  if (page >= pages - 3) return [1, '...', pages - 4, pages - 3, pages - 2, pages - 1, pages]
  return [1, '...', page - 1, page, page + 1, '...', pages]
}

/** Paginação única: completa no desktop, compacta ou "carregar mais" no mobile. */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizes = [15, 30, 50],
  mobileMode = 'pages',
  loading,
  className,
}: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)
  const fmt = (n: number) => n.toLocaleString('pt-BR')

  return (
    <nav
      aria-label="Paginação"
      data-rendra="PAG-001"
      className={cn('flex min-w-0 flex-col gap-3', className)}
    >
      {/* Mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        {mobileMode === 'loadMore' ? (
          page < pages && (
            <Button
              variant="outline"
              fullWidth
              loading={loading}
              onClick={() => onPageChange(page + 1)}
            >
              Carregar mais
            </Button>
          )
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              icon={<ChevronLeft />}
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              iconRight={<ChevronRight />}
              disabled={page >= pages}
              onClick={() => onPageChange(page + 1)}
            >
              Próxima
            </Button>
          </div>
        )}
        <p className="text-center text-xs text-muted-foreground tabular-nums">
          {mobileMode === 'loadMore'
            ? `${fmt(to)} de ${fmt(total)}`
            : `Página ${fmt(page)} de ${fmt(pages)}`}
        </p>
      </div>

      {/* Desktop */}
      <div className="hidden items-center justify-between gap-4 md:flex">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="tabular-nums">
            {fmt(from)} a {fmt(to)} de {fmt(total)}
          </span>
          {onPageSizeChange && (
            <div className="w-3xs">
              <Select
                size="sm"
                label="Itens por página"
                value={String(pageSize)}
                onChange={(v) => v && onPageSizeChange(Number(v))}
                options={pageSizes.map((s) => ({ value: String(s), label: `${s} por página` }))}
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="Página anterior"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft />
          </Button>
          {range(page, pages).map((p, i) =>
            p === '...' ? (
              <span key={`e${i}`} className="px-2 text-sm text-muted-foreground" aria-hidden>
                ...
              </span>
            ) : (
              <Button
                key={p}
                size="sm"
                variant={p === page ? 'secondary' : 'ghost'}
                aria-current={p === page ? 'page' : undefined}
                aria-label={`Página ${p}`}
                onClick={() => onPageChange(p)}
                className="min-w-8 px-2 tabular-nums"
              >
                {p}
              </Button>
            ),
          )}
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="Próxima página"
            disabled={page >= pages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </nav>
  )
}
