import { format } from 'date-fns'
import { ArrowRightLeft, CalendarDays, MoreHorizontal, Plus } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs } from '@/components/ui/tabs'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { cn } from '@/lib/cn'

/*
 * Kanban único: colunas e cards por props; a tela guarda o estado e recebe onCardMove.
 * Desktop: colunas lado a lado; arraste o card para outra coluna ou outra posição.
 * Toque e teclado: o menu do card tem "Mover para" (arrastar nunca é o único caminho).
 * Mobile (< 768px): uma coluna por vez, escolhida pelas abas com contador, sem rolagem
 * lateral; os cards mudam de coluna pelo mesmo menu.
 */

export interface KanbanColumn {
  id: string
  title: string
  /** Cor do marcador da coluna. */
  tone?: BadgeProps['tone']
  /** Limite de cards (WIP). Passando dele, o contador fica em alerta. */
  limit?: number
}

export interface KanbanCard {
  id: string
  columnId: string
  title: string
  description?: string
  tags?: { label: string; tone?: BadgeProps['tone'] }[]
  /** Nome do responsável (vira avatar com iniciais). */
  assignee?: string
  dueDate?: Date
  /** Valor ou informação curta à direita do rodapé (ex.: "R$ 12.500,00"). */
  meta?: string
}

export interface KanbanProps {
  columns: KanbanColumn[]
  cards: KanbanCard[]
  /** Card movido: coluna de destino e posição dentro dela (0 = topo). */
  onCardMove?: (cardId: string, toColumnId: string, toIndex: number) => void
  onCardClick?: (card: KanbanCard) => void
  /** Botão "Adicionar" no pé de cada coluna. */
  onAddCard?: (columnId: string) => void
  /** Conteúdo próprio do card, no lugar do padrão. */
  renderCard?: (card: KanbanCard) => ReactNode
  'aria-label'?: string
  className?: string
}

const dotTone: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'bg-muted-foreground',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-destructive',
  info: 'bg-info',
  outline: 'bg-border',
}

function CardBody({ card }: { card: KanbanCard }) {
  return (
    <>
      {card.tags && card.tags.length > 0 && (
        <span className="flex flex-wrap gap-1">
          {card.tags.map((t) => (
            <Badge key={t.label} tone={t.tone ?? 'neutral'}>
              {t.label}
            </Badge>
          ))}
        </span>
      )}
      <span className="line-clamp-2 text-sm font-medium">{card.title}</span>
      {card.description && (
        <span className="line-clamp-2 text-xs text-muted-foreground">{card.description}</span>
      )}
      {(card.assignee || card.dueDate || card.meta) && (
        <span className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
          {card.assignee && <Avatar name={card.assignee} size="sm" />}
          {card.dueDate && (
            <span className="inline-flex items-center gap-1 tabular-nums">
              <CalendarDays className="size-3" aria-hidden />
              {format(card.dueDate, 'dd/MM')}
            </span>
          )}
          {card.meta && (
            <span className="ml-auto font-medium text-foreground tabular-nums">{card.meta}</span>
          )}
        </span>
      )}
    </>
  )
}

export function Kanban({
  columns,
  cards,
  onCardMove,
  onCardClick,
  onAddCard,
  renderCard,
  className,
  ...aria
}: KanbanProps) {
  const { isMobile } = useBreakpoint()
  const [active, setActive] = useState(columns[0]?.id ?? '')
  const [dragging, setDragging] = useState<string | null>(null)
  const [over, setOver] = useState<{ column: string; index: number } | null>(null)

  const inColumn = (id: string) => cards.filter((c) => c.columnId === id)

  const drop = (columnId: string, index: number) => {
    if (dragging) onCardMove?.(dragging, columnId, index)
    setDragging(null)
    setOver(null)
  }

  const moveMenu = (card: KanbanCard) =>
    onCardMove ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={`Ações do card ${card.title}`}
            className="-mt-1 -mr-1 shrink-0"
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Mover para</DropdownMenuLabel>
          {columns
            .filter((c) => c.id !== card.columnId)
            .map((c) => (
              <DropdownMenuItem
                key={c.id}
                onSelect={() => onCardMove(card.id, c.id, inColumn(c.id).length)}
              >
                <ArrowRightLeft />
                {c.title}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ) : null

  const cardItem = (card: KanbanCard, index: number) => (
    <li
      key={card.id}
      draggable={!isMobile && Boolean(onCardMove)}
      onDragStart={(e) => {
        setDragging(card.id)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', card.id)
      }}
      onDragEnd={() => {
        setDragging(null)
        setOver(null)
      }}
      onDragOver={(e) => {
        if (!dragging) return
        e.preventDefault()
        e.stopPropagation()
        const r = e.currentTarget.getBoundingClientRect()
        const after = e.clientY > r.top + r.height / 2
        setOver({ column: card.columnId, index: index + (after ? 1 : 0) })
      }}
      onDrop={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (over) drop(over.column, over.index)
      }}
      className={cn(
        'relative flex items-start gap-2 rounded-item border bg-card p-3 shadow-sm transition-[box-shadow,opacity]',
        !isMobile && onCardMove && 'cursor-grab active:cursor-grabbing',
        dragging === card.id && 'opacity-50',
        over?.column === card.columnId &&
          over.index === index &&
          dragging !== card.id &&
          'ring-2 ring-ring ring-offset-2 ring-offset-muted',
      )}
    >
      {onCardClick ? (
        <button
          type="button"
          onClick={() => onCardClick(card)}
          className="flex min-w-0 flex-1 cursor-pointer flex-col gap-2 rounded-item text-left outline-none after:absolute after:inset-0 focus-visible:ring-2 focus-visible:ring-ring"
        >
          {renderCard ? renderCard(card) : <CardBody card={card} />}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {renderCard ? renderCard(card) : <CardBody card={card} />}
        </div>
      )}
      <span className="relative z-10">{moveMenu(card)}</span>
    </li>
  )

  const columnHeader = (col: KanbanColumn, count: number) => (
    <div className="flex items-center gap-2 px-1">
      <span aria-hidden className={cn('size-2 rounded-full', dotTone[col.tone ?? 'neutral'])} />
      <h3 className="min-w-0 flex-1 truncate text-sm font-semibold">{col.title}</h3>
      <Badge tone={col.limit && count > col.limit ? 'warning' : 'neutral'}>
        {col.limit ? `${count}/${col.limit}` : count}
      </Badge>
    </div>
  )

  const columnList = (col: KanbanColumn) => {
    const list = inColumn(col.id)
    return (
      <ol
        aria-label={`Cards em ${col.title}`}
        onDragOver={(e) => {
          if (!dragging) return
          e.preventDefault()
          setOver({ column: col.id, index: list.length })
        }}
        onDrop={(e) => {
          e.preventDefault()
          drop(col.id, over?.column === col.id ? over.index : list.length)
        }}
        className={cn(
          'flex min-h-24 flex-col gap-2 rounded-surface p-2 transition-colors',
          over?.column === col.id && 'bg-primary-soft/60',
        )}
      >
        {list.map((c, i) => cardItem(c, i))}
        {list.length === 0 && (
          <li className="flex min-h-16 items-center justify-center rounded-item border border-dashed text-xs text-muted-foreground">
            Nenhum card
          </li>
        )}
      </ol>
    )
  }

  const addButton = (col: KanbanColumn) =>
    onAddCard ? (
      <Button
        variant="ghost"
        size="sm"
        icon={<Plus />}
        fullWidth
        className="justify-start text-muted-foreground"
        onClick={() => onAddCard(col.id)}
      >
        Adicionar card
      </Button>
    ) : null

  if (isMobile) {
    return (
      <div className={cn('flex min-w-0 flex-col gap-3', className)} aria-label={aria['aria-label']}>
        <Tabs
          variant="pill"
          aria-label="Colunas"
          value={active}
          onChange={setActive}
          items={columns.map((col) => ({
            value: col.id,
            label: col.title,
            count: inColumn(col.id).length,
            content: (
              <div className="flex flex-col gap-2 rounded-surface bg-muted">
                {columnList(col)}
                {onAddCard && <div className="px-2 pb-2">{addButton(col)}</div>}
              </div>
            ),
          }))}
        />
      </div>
    )
  }

  return (
    <section
      aria-label={aria['aria-label'] ?? 'Quadro kanban'}
      data-allow-overflow
      className={cn('flex min-w-0 gap-4 overflow-x-auto pb-2', className)}
    >
      {columns.map((col) => (
        <div
          key={col.id}
          className="flex w-3xs min-w-3xs flex-1 shrink-0 flex-col gap-2 rounded-surface bg-muted p-2"
        >
          <div className="pt-1">{columnHeader(col, inColumn(col.id).length)}</div>
          {columnList(col)}
          {addButton(col)}
        </div>
      ))}
    </section>
  )
}

/** Move um card na lista (para usar no onCardMove): devolve a lista nova. */
export function moveKanbanCard(
  cards: KanbanCard[],
  cardId: string,
  toColumnId: string,
  toIndex: number,
) {
  const card = cards.find((c) => c.id === cardId)
  if (!card) return cards
  const rest = cards.filter((c) => c.id !== cardId)
  const target = rest.filter((c) => c.columnId === toColumnId)
  const before = target[Math.min(toIndex, target.length)]
  const moved = { ...card, columnId: toColumnId }
  if (!before) {
    const lastIndex = rest.map((c) => c.columnId).lastIndexOf(toColumnId)
    const at = lastIndex === -1 ? rest.length : lastIndex + 1
    return [...rest.slice(0, at), moved, ...rest.slice(at)]
  }
  const at = rest.indexOf(before)
  return [...rest.slice(0, at), moved, ...rest.slice(at)]
}
