import { format } from 'date-fns'
import { ArrowRightLeft, CalendarDays, Mail, MoreHorizontal, Phone, Plus, User } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
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
import { useFillHeight } from '@/hooks/use-fill-height'
import { cn } from '@/lib/cn'

/*
 * Kanban único: colunas e cards por props; a tela guarda o estado e recebe onCardMove.
 * Desktop: colunas lado a lado; arraste o card para outra coluna ou outra posição.
 * Toque e teclado: o menu do card tem "Mover para" (arrastar nunca é o único caminho).
 * Mobile (< 768px): uma coluna por vez, escolhida pelas abas com contador, sem rolagem
 * lateral; os cards mudam de coluna pelo mesmo menu.
 * Altura: o quadro ocupa o que sobra da tela abaixo dele e nunca passa disso; cada etapa rola
 * por dentro e vai mostrando mais cards ao chegar no fim (rolagem infinita).
 */

/** Marca o fim da lista: ao aparecer na rolagem da etapa, pede mais cards. */
function LoadMore({ onVisible }: { onVisible: () => void }) {
  const ref = useRef<HTMLLIElement>(null)
  const cb = useRef(onVisible)
  cb.current = onVisible
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => entries.some((e) => e.isIntersecting) && cb.current(),
      { root: el.closest('[data-kanban-scroll]'), rootMargin: '120px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <li ref={ref} className="py-2 text-center text-xs text-muted-foreground">
      Carregando mais cards...
    </li>
  )
}

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
  /** Empresa ou pessoa. */
  title: string
  /** Linha abaixo do título: CNPJ da empresa ou CPF da pessoa. */
  subtitle?: string
  description?: string
  /** Pessoa de contato: nome, telefone e e-mail. */
  contact?: { name?: string; phone?: string; email?: string }
  tags?: { label: string; tone?: BadgeProps['tone'] }[]
  /** Nome do responsável (vira avatar com iniciais). */
  assignee?: string
  dueDate?: Date
  /** Valor ou informação curta à direita do rodapé (ex.: "R$ 12.500,00"). */
  meta?: string
  /** Valores numéricos do card, pelas chaves de valueFields (ex.: { ps: 4800, mrr: 590 }). */
  values?: Record<string, number>
}

/** Valor somado no cabeçalho da coluna e mostrado no card (ex.: P&S e MRR). */
export interface KanbanValueField {
  key: string
  label: string
}

export interface KanbanProps {
  columns: KanbanColumn[]
  cards: KanbanCard[]
  /** Card movido: coluna de destino e posição dentro dela (0 = topo). */
  onCardMove?: (cardId: string, toColumnId: string, toIndex: number) => void
  onCardClick?: (card: KanbanCard) => void
  /** Botão (+) no título de cada etapa. */
  onAddCard?: (columnId: string) => void
  /** Cards mostrados por vez em cada etapa; ao rolar até o fim, mostra mais. Padrão: 20. */
  pageSize?: number
  /**
   * Busca mais cards no servidor quando a etapa chega ao fim do que já foi carregado.
   * Sem ela, a rolagem infinita só vai revelando os cards recebidos em cards.
   */
  onLoadMore?: (columnId: string) => void
  /** A etapa ainda tem cards no servidor (usado com onLoadMore). */
  hasMore?: (columnId: string) => boolean
  /** Etapas visíveis por vez no desktop; as demais pela rolagem lateral. Padrão: 5. */
  visibleColumns?: number
  /** Conteúdo próprio do card, no lugar do padrão. */
  renderCard?: (card: KanbanCard) => ReactNode
  /**
   * Valores do card (até 2, lado a lado com divisória) e o total de cada um na coluna.
   * Ex.: [{ key: 'ps', label: 'P&S' }, { key: 'mrr', label: 'MRR' }].
   */
  valueFields?: KanbanValueField[]
  /** Formato dos valores. Padrão: moeda (R$ 1.250,00). */
  formatValue?: (n: number) => string
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

function CardBody({
  card,
  valueFields = [],
  formatValue,
}: {
  card: KanbanCard
  valueFields?: KanbanValueField[]
  formatValue: (n: number) => string
}) {
  const shown = valueFields.slice(0, 2)
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
      {/* Só o título reserva o espaço do botão de ações; o resto usa a largura toda. */}
      <span className="flex flex-col pr-8">
        <span className="line-clamp-2 text-sm font-medium">{card.title}</span>
        {card.subtitle && (
          <span className="text-xs text-muted-foreground tabular-nums">{card.subtitle}</span>
        )}
      </span>
      {card.description && (
        <span className="line-clamp-2 text-xs text-muted-foreground">{card.description}</span>
      )}
      {card.contact && (
        <span className="flex flex-col gap-1 text-xs text-muted-foreground">
          {card.contact.name && (
            <span className="flex min-w-0 items-center gap-1 text-foreground">
              <User className="size-3 shrink-0" aria-hidden />
              <span className="truncate">{card.contact.name}</span>
            </span>
          )}
          {card.contact.phone && (
            <span className="flex min-w-0 items-center gap-1 tabular-nums">
              <Phone className="size-3 shrink-0" aria-hidden />
              <span className="truncate">{card.contact.phone}</span>
            </span>
          )}
          {card.contact.email && (
            <span className="flex min-w-0 items-center gap-1">
              <Mail className="size-3 shrink-0" aria-hidden />
              <span className="truncate">{card.contact.email}</span>
            </span>
          )}
        </span>
      )}
      {shown.length > 0 && (
        <span className="grid grid-cols-2 divide-x rounded-block bg-muted text-xs">
          {shown.map((f) => (
            <span key={f.key} className="flex min-w-0 flex-col px-2 py-1">
              <span className="text-muted-foreground">{f.label}:</span>
              <span className="truncate font-semibold text-foreground tabular-nums">
                {formatValue(card.values?.[f.key] ?? 0)}
              </span>
            </span>
          ))}
        </span>
      )}
      {(card.assignee || card.dueDate || card.meta) && (
        <span className="flex items-center gap-2 border-t pt-2 text-xs text-muted-foreground">
          {card.dueDate && (
            <span className="inline-flex items-center gap-1 tabular-nums">
              <CalendarDays className="size-3" aria-hidden />
              {format(card.dueDate, 'dd/MM/yyyy')}
            </span>
          )}
          {card.meta && (
            <span className="font-medium text-foreground tabular-nums">{card.meta}</span>
          )}
          {card.assignee && (
            <span className="ml-auto" title={card.assignee}>
              <Avatar name={card.assignee} size="sm" />
            </span>
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
  valueFields,
  formatValue = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
  pageSize = 20,
  visibleColumns = 5,
  onLoadMore,
  hasMore,
  className,
  ...aria
}: KanbanProps) {
  const { isMobile } = useBreakpoint()
  const boardRef = useFillHeight()
  // Touchpad: o gesto lateral leva o quadro para o mesmo lado dos dedos (esquerda move o
  // quadro para a esquerda). A rolagem vertical segue normal dentro de cada etapa.
  useEffect(() => {
    const el = boardRef.current
    if (!el || isMobile) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      e.preventDefault()
      el.scrollLeft -= e.deltaX
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [boardRef, isMobile])
  const [shown, setShown] = useState<Record<string, number>>({})
  const limitOf = (id: string) => shown[id] ?? pageSize
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
            className="shrink-0"
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
        'relative flex rounded-block border bg-card p-3 shadow-sm transition-[box-shadow,opacity]',
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
          className="flex min-w-0 flex-1 cursor-pointer flex-col gap-2 rounded-block text-left outline-none after:absolute after:inset-0 focus-visible:ring-2 focus-visible:ring-ring"
        >
          {renderCard ? (
            renderCard(card)
          ) : (
            <CardBody card={card} valueFields={valueFields} formatValue={formatValue} />
          )}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {renderCard ? (
            renderCard(card)
          ) : (
            <CardBody card={card} valueFields={valueFields} formatValue={formatValue} />
          )}
        </div>
      )}
      <span className="absolute top-2 right-2 z-10">{moveMenu(card)}</span>
    </li>
  )

  const totals = (col: KanbanColumn) =>
    (valueFields ?? []).slice(0, 2).map((f) => ({
      ...f,
      total: inColumn(col.id).reduce((sum, c) => sum + (c.values?.[f.key] ?? 0), 0),
    }))

  const columnHeader = (col: KanbanColumn, count: number) => (
    <div className="flex flex-col gap-2 px-1">
      <div className="flex items-center gap-2">
        <span aria-hidden className={cn('size-2 rounded-full', dotTone[col.tone ?? 'neutral'])} />
        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold">{col.title}</h3>
        <Badge tone={col.limit && count > col.limit ? 'warning' : 'neutral'}>
          {col.limit ? `${count}/${col.limit}` : count}
        </Badge>
        {onAddCard && (
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={`Adicionar card em ${col.title}`}
            onClick={() => onAddCard(col.id)}
            className="-my-1 -mr-1 rounded-full"
          >
            <Plus />
          </Button>
        )}
      </div>
      {valueFields && valueFields.length > 0 && (
        <div className="grid grid-cols-2 divide-x rounded-block bg-card text-xs">
          {totals(col).map((t) => (
            <span key={t.key} className="flex min-w-0 flex-col px-2 py-1">
              <span className="text-muted-foreground">Total {t.label}</span>
              <span className="truncate font-semibold tabular-nums">{formatValue(t.total)}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )

  const columnList = (col: KanbanColumn) => {
    const all = inColumn(col.id)
    const list = all.slice(0, limitOf(col.id))
    const more = all.length > list.length || Boolean(hasMore?.(col.id))
    return (
      <div
        data-kanban-scroll
        className="min-h-0 flex-1 scrollbar-subtle overflow-y-auto overscroll-y-contain"
      >
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
          {more && (
            <LoadMore
              onVisible={() => {
                if (all.length > list.length)
                  setShown((s) => ({ ...s, [col.id]: limitOf(col.id) + pageSize }))
                else onLoadMore?.(col.id)
              }}
            />
          )}
        </ol>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div
        ref={boardRef}
        className={cn('flex h-board min-w-0 flex-col gap-3', className)}
        aria-label={aria['aria-label']}
      >
        <Tabs
          variant="pill"
          aria-label="Colunas"
          value={active}
          onChange={setActive}
          items={columns.map((col) => ({
            value: col.id,
            label: col.title,
            count: inColumn(col.id).length,
            content: null,
          }))}
        />
        {columns
          .filter((col) => col.id === active)
          .map((col) => (
            <div
              key={col.id}
              className="flex min-h-0 flex-1 flex-col gap-2 rounded-surface bg-muted p-2"
            >
              {columnHeader(col, inColumn(col.id).length)}
              {columnList(col)}
            </div>
          ))}
      </div>
    )
  }

  return (
    <section
      ref={boardRef}
      aria-label={aria['aria-label'] ?? 'Quadro kanban'}
      data-allow-overflow
      style={{ '--kanban-cols': Math.min(visibleColumns, columns.length) } as CSSProperties}
      className={cn('flex h-board min-w-0 scrollbar-subtle gap-4 overflow-x-auto', className)}
    >
      {columns.map((col) => (
        <div
          key={col.id}
          className="flex min-h-0 w-kanban-col flex-col gap-2 rounded-surface bg-muted p-2"
        >
          <div className="pt-1">{columnHeader(col, inColumn(col.id).length)}</div>
          {columnList(col)}
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
