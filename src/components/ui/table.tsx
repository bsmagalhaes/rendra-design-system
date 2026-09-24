import {
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import { format } from 'date-fns'
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronsUpDown,
  MoreHorizontal,
  RotateCw,
} from 'lucide-react'
import { Collapsible } from 'radix-ui'
import { Fragment, useMemo, useState, type ReactNode } from 'react'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { DataToolbar, type DataToolbarProps } from '@/components/ui/data-toolbar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { Pagination } from '@/components/ui/pagination'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip } from '@/components/ui/tooltip'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/lib/masks'

/* ================================================================ tipos */

export interface TableColumn<T> {
  id: string
  header: string
  /** Valor da célula (para ordenar, buscar e formatar). */
  accessor: (row: T) => unknown
  /** Renderização própria da célula. */
  cell?: (row: T) => ReactNode
  /**
   * Formato automático: number e currency alinham à direita; date vira DD/MM/AAAA;
   * badge usa badgeTone para escolher a cor.
   */
  kind?: 'text' | 'number' | 'currency' | 'date' | 'badge'
  badgeTone?: (row: T) => BadgeProps['tone']
  align?: 'left' | 'right' | 'center'
  sortable?: boolean
  /** Pode ser ocultada pelo menu Colunas. */
  hideable?: boolean
  /** Começa oculta (o usuário mostra pelo menu Colunas). */
  hidden?: boolean
  /** Linhas máximas do texto antes das reticências (máximo 3). */
  lines?: 1 | 2 | 3
  /**
   * No mobile, a tabela vira cards:
   *   primary   no topo do card (até 3; o primeiro é o título)
   *   secondary recolhido em "Ver detalhes"
   *   hidden    não aparece no card
   */
  mobile?: 'primary' | 'secondary' | 'hidden'
  /** Largura mínima no desktop. */
  width?: 'sm' | 'md' | 'lg'
}

export interface RowAction<T> {
  label: string
  icon?: ReactNode
  onClick: (row: T) => void
  destructive?: boolean
  hidden?: (row: T) => boolean
}

export interface TableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  getRowId: (row: T) => string
  /** Seleção por checkbox (primeira coluna; no mobile, no topo do card). */
  selectable?: boolean
  /** Conteúdo expandido da linha. */
  expandable?: (row: T) => ReactNode
  /** Ordenação por clique no cabeçalho (padrão por coluna: sortable). */
  sortable?: boolean
  /** Busca global: texto aplicado a todas as colunas. */
  globalFilter?: string
  /** Menu Colunas na barra de ferramentas. */
  columnVisibility?: boolean
  /** Ações em massa para os selecionados (botões). No mobile, barra fixa no rodapé da tela. */
  bulkActions?: (selected: T[], clear: () => void) => ReactNode
  /** Mais ações em massa, no menu de três pontinhos ao lado dos botões. */
  bulkMenu?: {
    label: string
    icon?: ReactNode
    destructive?: boolean
    onClick: (selected: T[], clear: () => void) => void
  }[]
  /** Ações por linha. Até 2 visíveis como ícone; acima disso, menu. */
  rowActions?: RowAction<T>[]
  density?: 'compact' | 'default' | 'comfortable'
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  /** Estado vazio. */
  empty?: { title: string; description?: string; action?: ReactNode }
  /** Paginação no cliente (itens por página). */
  pageSize?: number
  /** No mobile: "anterior e próxima" ou "carregar mais". */
  mobilePagination?: 'pages' | 'loadMore'
  /** Barra de ferramentas no mesmo card, acima da tabela. */
  toolbar?: Omit<DataToolbarProps, 'columns' | 'selectionBar' | 'sort'>
  /**
   * Colunas de situação (kind: 'badge') vão para o fim, logo antes das ações.
   * Padrão true; use false para manter a ordem exata de columns.
   */
  statusLast?: boolean
  /** Rótulo da tabela para leitores de tela. */
  'aria-label': string
}

/* ================================================================ utilidades */

const densityRow = { compact: 'py-2', default: 'py-3', comfortable: 'py-4' } as const
const clamp = { 1: 'line-clamp-1', 2: 'line-clamp-2', 3: 'line-clamp-3' } as const
const minWidth = { sm: 'min-w-24', md: 'min-w-3xs', lg: 'min-w-sm' } as const

function formatValue<T>(col: TableColumn<T>, row: T): ReactNode {
  if (col.cell) return col.cell(row)
  const v = col.accessor(row)
  if (v == null || v === '') return <span className="text-muted-foreground">-</span>
  switch (col.kind) {
    case 'number':
      return Number(v).toLocaleString('pt-BR')
    case 'currency':
      return formatCurrency(Number(v))
    case 'date':
      return format(v instanceof Date ? v : new Date(String(v)), 'dd/MM/yyyy')
    case 'badge':
      return <Badge tone={col.badgeTone?.(row) ?? 'neutral'}>{String(v)}</Badge>
    default:
      return String(v)
  }
}

const alignOf = <T,>(c: TableColumn<T>) =>
  c.align ?? (c.kind === 'number' || c.kind === 'currency' ? 'right' : 'left')

function RowActions<T>({
  row,
  actions,
  mobile,
}: {
  row: T
  actions: RowAction<T>[]
  mobile?: boolean
}) {
  const list = actions.filter((a) => !a.hidden?.(row))
  const visible = list.length <= 2 ? list : list.slice(0, 1)
  const rest = list.length <= 2 ? [] : list.slice(1)
  return (
    <div
      className={cn('flex items-center gap-1', mobile ? 'w-full justify-end gap-2' : 'justify-end')}
    >
      {visible.map((a) =>
        mobile ? (
          <Button
            key={a.label}
            variant={a.destructive ? 'ghost' : 'outline'}
            size="sm"
            icon={a.icon}
            onClick={() => a.onClick(row)}
            className={cn('flex-1', a.destructive && 'text-destructive')}
          >
            {a.label}
          </Button>
        ) : (
          <Tooltip key={a.label} content={a.label}>
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={a.label}
              onClick={() => a.onClick(row)}
              className={cn(
                a.destructive &&
                  'text-destructive hover:bg-destructive-soft hover:text-destructive-soft-foreground',
              )}
            >
              {a.icon}
            </Button>
          </Tooltip>
        ),
      )}
      {rest.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" iconOnly aria-label="Mais ações">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {rest.map((a) => (
              <DropdownMenuItem
                key={a.label}
                destructive={a.destructive}
                onSelect={() => a.onClick(row)}
              >
                {a.icon}
                {a.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

/* ================================================================ componente */

/**
 * Table única do sistema (TanStack Table). Tudo é prop: seleção, expansão, ordenação,
 * busca, colunas visíveis, ações em massa e por linha, densidade e estados.
 * Mobile (< 768px): a mesma tabela vira lista de cards, sem rolagem horizontal.
 * Desktop: tabela larga rola na horizontal só dentro do próprio contêiner.
 */
export function Table<T>({
  data,
  columns: columnsProp,
  statusLast = true,
  getRowId,
  selectable,
  expandable,
  sortable = true,
  globalFilter,
  columnVisibility,
  bulkActions,
  bulkMenu,
  rowActions,
  density = 'default',
  loading,
  error,
  onRetry,
  empty,
  pageSize,
  mobilePagination = 'pages',
  toolbar,
  ...aria
}: TableProps<T>) {
  const { isMobile } = useBreakpoint()
  const columns = useMemo(
    () =>
      statusLast
        ? [
            ...columnsProp.filter((c) => c.kind !== 'badge'),
            ...columnsProp.filter((c) => c.kind === 'badge'),
          ]
        : columnsProp,
    [columnsProp, statusLast],
  )
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [visibility, setVisibility] = useState<VisibilityState>(() =>
    Object.fromEntries(columnsProp.filter((c) => c.hidden).map((c) => [c.id, false])),
  )
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: pageSize ?? 10 })
  const [mobilePage, setMobilePage] = useState(1)

  const defs = useMemo<ColumnDef<T>[]>(
    () =>
      columns.map((c) => ({
        id: c.id,
        header: c.header,
        accessorFn: (row: T) => {
          const v = c.accessor(row)
          return v instanceof Date ? v.getTime() : v
        },
        enableSorting: sortable && c.sortable !== false,
        enableHiding: c.hideable !== false,
        sortingFn:
          c.kind === 'number' || c.kind === 'currency' || c.kind === 'date'
            ? 'basic'
            : 'alphanumeric',
      })),
    [columns, sortable],
  )

  const table = useReactTable({
    data,
    columns: defs,
    getRowId: (r) => getRowId(r),
    state: {
      sorting,
      rowSelection,
      columnVisibility: visibility,
      globalFilter,
      expanded,
      pagination,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setVisibility,
    onExpandedChange: (u) =>
      setExpanded((prev) =>
        typeof u === 'function'
          ? (u(prev) as Record<string, boolean>)
          : (u as Record<string, boolean>),
      ),
    onPaginationChange: setPagination,
    enableRowSelection: Boolean(selectable),
    getRowCanExpand: () => Boolean(expandable),
    globalFilterFn: 'includesString',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    ...(pageSize && !isMobile ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    autoResetPageIndex: true,
  })

  const colById = (id: string) => columns.find((c) => c.id === id)!
  const visibleCols = table.getVisibleLeafColumns().map((c) => colById(c.id))
  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original)
  const clearSelection = () => setRowSelection({})
  const bulkMenuButton =
    bulkMenu && bulkMenu.length > 0 ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" iconOnly aria-label="Mais ações para os selecionados">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {bulkMenu.map((a) => (
            <DropdownMenuItem
              key={a.label}
              destructive={a.destructive}
              onSelect={() => a.onClick(selectedRows, clearSelection)}
            >
              {a.icon}
              {a.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ) : null
  const filteredCount = table.getFilteredRowModel().rows.length
  const allRows = table.getRowModel().rows
  const rows =
    !isMobile || !pageSize
      ? allRows
      : mobilePagination === 'loadMore'
        ? allRows.slice(0, mobilePage * pageSize)
        : allRows.slice((mobilePage - 1) * pageSize, mobilePage * pageSize)
  const pad = densityRow[density]

  /* ---------------- barra de ferramentas */
  const hideableCols = columns.filter((c) => c.hideable !== false)
  const sortControl =
    isMobile && sortable ? (
      <Select
        label="Ordenar por"
        placeholder="Ordem padrão"
        clearable
        value={sorting[0] ? `${sorting[0].id}:${sorting[0].desc ? 'desc' : 'asc'}` : null}
        onChange={(v) => {
          if (!v) return setSorting([])
          const [id, dir] = v.split(':')
          setSorting([{ id: id ?? '', desc: dir === 'desc' }])
        }}
        options={columns
          .filter((c) => c.sortable !== false)
          .flatMap((c) => [
            { value: `${c.id}:asc`, label: `${c.header} (crescente)` },
            { value: `${c.id}:desc`, label: `${c.header} (decrescente)` },
          ])}
      />
    ) : undefined

  const selectionBar =
    selectable && selectedRows.length > 0 ? (
      <>
        <span className="text-sm font-medium tabular-nums">
          {selectedRows.length} {selectedRows.length === 1 ? 'selecionado' : 'selecionados'}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {bulkActions?.(selectedRows, clearSelection)}
          {bulkMenuButton}
        </div>
        <Button variant="ghost" size="sm" className="ml-auto" onClick={clearSelection}>
          Limpar seleção
        </Button>
      </>
    ) : undefined

  const showToolbar = toolbar || columnVisibility || (isMobile && sortable)

  /* ---------------- estados */
  const state = (() => {
    if (error)
      return (
        <EmptyState
          type="error"
          size="compact"
          title="Não foi possível carregar"
          description={error}
          actions={
            onRetry && (
              <Button variant="outline" icon={<RotateCw />} onClick={onRetry}>
                Tentar de novo
              </Button>
            )
          }
        />
      )
    if (!loading && filteredCount === 0)
      return (
        <EmptyState
          size="compact"
          title={globalFilter ? 'Nenhum resultado' : (empty?.title ?? 'Nada por aqui ainda')}
          description={
            globalFilter ? 'Tente outros termos ou limpe os filtros.' : empty?.description
          }
          actions={!globalFilter && empty?.action}
        />
      )
    return null
  })()

  /* ---------------- mobile: cards */
  const mobileBody = () => {
    const primary = visibleCols.filter((c) => (c.mobile ?? 'secondary') === 'primary').slice(0, 3)
    const secondary = visibleCols.filter((c) => (c.mobile ?? 'secondary') === 'secondary')
    if (loading)
      return (
        <ul className="flex flex-col divide-y">
          {Array.from({ length: 4 }, (_, i) => (
            <li key={i} className="flex flex-col gap-3 p-4">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </li>
          ))}
        </ul>
      )
    return (
      <ul className="flex flex-col divide-y">
        {rows.map((r) => {
          const row = r.original
          const [title, ...others] = primary
          return (
            <li
              key={r.id}
              className={cn('flex flex-col gap-3 p-4', r.getIsSelected() && 'bg-primary-soft/50')}
            >
              <div className="flex items-start gap-3">
                {selectable && (
                  <Checkbox
                    checked={r.getIsSelected()}
                    onCheckedChange={(v) => r.toggleSelected(v)}
                    aria-label="Selecionar linha"
                  />
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  {title && (
                    <span className="line-clamp-2 text-base font-semibold">
                      {formatValue(title, row)}
                    </span>
                  )}
                  {others.map((c) => (
                    <span
                      key={c.id}
                      className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
                    >
                      <span className="sr-only">{c.header}: </span>
                      {formatValue(c, row)}
                    </span>
                  ))}
                </div>
              </div>
              {(secondary.length > 0 || expandable) && (
                <Collapsible.Root>
                  <Collapsible.Trigger className="group flex min-h-touch cursor-pointer items-center gap-1 text-sm font-medium text-primary">
                    <span className="group-data-[state=open]:hidden">Ver detalhes</span>
                    <span className="hidden group-data-[state=open]:inline">Ocultar detalhes</span>
                    <ChevronDown
                      className="size-icon-sm transition-transform duration-200 group-data-[state=open]:rotate-180"
                      aria-hidden
                    />
                  </Collapsible.Trigger>
                  <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <dl className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                      {secondary.map((c) => (
                        <div key={c.id} className="flex flex-col gap-1">
                          <dt className="text-xs text-muted-foreground">{c.header}</dt>
                          <dd className="text-sm">{formatValue(c, row)}</dd>
                        </div>
                      ))}
                    </dl>
                    {expandable && <div className="pt-3">{expandable(row)}</div>}
                  </Collapsible.Content>
                </Collapsible.Root>
              )}
              {rowActions && rowActions.length > 0 && (
                <div className="border-t pt-3">
                  <RowActions row={row} actions={rowActions} mobile />
                </div>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  /* ---------------- desktop: tabela */
  const desktopBody = () => (
    <div className="overflow-x-auto" data-allow-overflow>
      <table className="w-full border-collapse text-sm" aria-label={aria['aria-label']}>
        <thead className="border-b bg-muted/50">
          <tr>
            {selectable && (
              <th scope="col" className="w-12 pr-2 pl-4">
                <Checkbox
                  aria-label="Selecionar todas as linhas da página"
                  checked={
                    table.getIsAllPageRowsSelected()
                      ? true
                      : table.getIsSomePageRowsSelected()
                        ? 'indeterminate'
                        : false
                  }
                  onCheckedChange={(v) => table.toggleAllPageRowsSelected(v)}
                />
              </th>
            )}
            {expandable && <th scope="col" className="w-12" aria-label="Expandir" />}
            {table.getVisibleLeafColumns().map((tc) => {
              const c = colById(tc.id)
              const sorted = tc.getIsSorted()
              const align = alignOf(c)
              return (
                <th
                  key={tc.id}
                  scope="col"
                  aria-sort={
                    sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined
                  }
                  className={cn(
                    'px-4 py-3 text-xs font-medium whitespace-nowrap text-muted-foreground',
                    align === 'right'
                      ? 'text-right'
                      : align === 'center'
                        ? 'text-center'
                        : 'text-left',
                    c.width && minWidth[c.width],
                  )}
                >
                  {tc.getCanSort() ? (
                    <button
                      type="button"
                      onClick={tc.getToggleSortingHandler()}
                      className={cn(
                        'inline-flex cursor-pointer items-center gap-1 rounded-item hover:text-foreground',
                        align === 'right' && 'flex-row-reverse',
                        sorted && 'text-foreground',
                      )}
                    >
                      {c.header}
                      {sorted === 'asc' ? (
                        <ArrowUp className="size-3" aria-hidden />
                      ) : sorted === 'desc' ? (
                        <ArrowDown className="size-3" aria-hidden />
                      ) : (
                        <ChevronsUpDown className="size-3 opacity-50" aria-hidden />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              )
            })}
            {rowActions && (
              <th
                scope="col"
                className="sticky right-0 w-24 bg-muted px-4 text-right text-xs font-medium text-muted-foreground"
              >
                <span className="sr-only">Ações</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y">
          {loading
            ? Array.from({ length: 5 }, (_, i) => (
                <tr key={i}>
                  {selectable && (
                    <td className="pr-2 pl-4">
                      <Skeleton className="size-icon-md" />
                    </td>
                  )}
                  {expandable && <td />}
                  {visibleCols.map((c) => (
                    <td key={c.id} className={cn('px-4', pad)}>
                      <Skeleton
                        className={cn('h-3', alignOf(c) === 'right' ? 'ml-auto w-16' : 'w-3/4')}
                      />
                    </td>
                  ))}
                  {rowActions && (
                    <td className="px-4">
                      <Skeleton className="ml-auto h-6 w-16" />
                    </td>
                  )}
                </tr>
              ))
            : rows.map((r) => {
                const row = r.original
                return (
                  <Fragment key={r.id}>
                    <tr
                      data-state={r.getIsSelected() ? 'selected' : undefined}
                      className="group/row transition-colors hover:bg-muted/40 data-[state=selected]:bg-primary-soft/60"
                    >
                      {selectable && (
                        <td className="pr-2 pl-4">
                          <Checkbox
                            aria-label="Selecionar linha"
                            checked={r.getIsSelected()}
                            onCheckedChange={(v) => r.toggleSelected(v)}
                          />
                        </td>
                      )}
                      {expandable && (
                        <td className="px-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            iconOnly
                            aria-label={r.getIsExpanded() ? 'Recolher linha' : 'Expandir linha'}
                            aria-expanded={r.getIsExpanded()}
                            onClick={() => r.toggleExpanded()}
                          >
                            <ChevronDown
                              className={cn(
                                'transition-transform',
                                r.getIsExpanded() && 'rotate-180',
                              )}
                            />
                          </Button>
                        </td>
                      )}
                      {visibleCols.map((c) => {
                        const align = alignOf(c)
                        return (
                          <td
                            key={c.id}
                            className={cn(
                              'px-4 align-middle',
                              pad,
                              align === 'right'
                                ? 'text-right tabular-nums'
                                : align === 'center'
                                  ? 'text-center'
                                  : 'text-left',
                              c.width && minWidth[c.width],
                            )}
                          >
                            <div
                              className={cn(clamp[c.lines ?? 2], align === 'right' && 'ml-auto')}
                            >
                              {formatValue(c, row)}
                            </div>
                          </td>
                        )
                      })}
                      {rowActions && (
                        <td className="sticky right-0 w-24 bg-card px-4 group-hover/row:bg-muted group-data-[state=selected]/row:bg-primary-soft">
                          <RowActions row={row} actions={rowActions} />
                        </td>
                      )}
                    </tr>
                    {expandable && r.getIsExpanded() && (
                      <tr className="bg-muted/30">
                        <td
                          colSpan={
                            visibleCols.length + (selectable ? 1 : 0) + 1 + (rowActions ? 1 : 0)
                          }
                          className="px-4 py-4"
                        >
                          {expandable(row)}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
        </tbody>
      </table>
    </div>
  )

  const total = filteredCount
  return (
    <Card className="overflow-hidden">
      {showToolbar && (
        <DataToolbar
          {...toolbar}
          sort={sortControl}
          selectionBar={selectionBar}
          columns={
            columnVisibility
              ? hideableCols.map((c) => ({
                  id: c.id,
                  label: c.header,
                  visible: table.getColumn(c.id)?.getIsVisible() ?? true,
                  onToggle: (v) => table.getColumn(c.id)?.toggleVisibility(v),
                }))
              : undefined
          }
        />
      )}

      {state ?? (isMobile ? mobileBody() : desktopBody())}

      {pageSize && !state && !loading && total > 0 && (
        <div className="flex justify-end border-t p-4">
          <Pagination
            className="w-full"
            page={isMobile ? mobilePage : pagination.pageIndex + 1}
            pageSize={isMobile ? pageSize : pagination.pageSize}
            total={total}
            mobileMode={mobilePagination}
            onPageChange={(p) =>
              isMobile ? setMobilePage(p) : setPagination((s) => ({ ...s, pageIndex: p - 1 }))
            }
            onPageSizeChange={(s) => setPagination({ pageIndex: 0, pageSize: s })}
          />
        </div>
      )}

      {/* Mobile: ações em massa em barra fixa no rodapé da tela */}
      {isMobile && selectable && selectedRows.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex flex-col gap-3 border-t bg-card px-4 pt-3 pb-safe shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium tabular-nums">
              {selectedRows.length} {selectedRows.length === 1 ? 'selecionado' : 'selecionados'}
            </span>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Limpar
            </Button>
          </div>
          <div className={cn('grid gap-3', bulkMenuButton ? 'grid-actions-3' : 'grid-cols-2')}>
            {bulkMenuButton}
            {bulkActions?.(selectedRows, clearSelection)}
          </div>
        </div>
      )}
    </Card>
  )
}
