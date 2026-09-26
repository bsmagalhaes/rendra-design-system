import { GripVertical } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import {
  ResponsiveGridLayout,
  useContainerWidth,
  type Layout,
  type LayoutItem,
  type ResponsiveLayouts,
} from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import { cn } from '@/lib/cn'

/*
 * Grade de widgets do painel (react-grid-layout, código aberto). Fixa por padrão; com
 * editable, cada widget ganha a alça de arrastar (no topo) e o canto de redimensionar, e os
 * outros se reorganizam sozinhos. A arrumação fica salva no navegador (storageKey).
 * Colunas: 12 no desktop, 6 no tablet, 1 no celular (empilhado, sem edição).
 */

export interface Widget {
  id: string
  /** Largura em colunas de 12 e altura em linhas (cada linha tem 40px). */
  w: number
  h: number
  minW?: number
  minH?: number
  content: ReactNode
}

export interface WidgetGridProps {
  widgets: Widget[]
  /** Libera arrastar e redimensionar. */
  editable?: boolean
  /** Chave no navegador para lembrar a arrumação de cada pessoa. */
  storageKey?: string
  className?: string
}

type Bp = 'lg' | 'md' | 'sm'
const breakpoints = { lg: 1024, md: 640, sm: 0 } as const
const cols = { lg: 12, md: 6, sm: 1 } as const
const ROW = 40

/** Arrumação padrão: os widgets em sequência, quebrando a linha quando não cabem. */
function flow(widgets: Widget[], columns: number): LayoutItem[] {
  let x = 0
  let y = 0
  let rowH = 0
  return widgets.map((wd) => {
    const w = Math.min(
      columns,
      columns === 12 ? wd.w : Math.max(1, Math.round((wd.w / 12) * columns)),
    )
    if (x + w > columns) {
      x = 0
      y += rowH
      rowH = 0
    }
    const item: LayoutItem = {
      i: wd.id,
      x,
      y,
      w,
      h: wd.h,
      minW: Math.min(w, wd.minW ?? Math.min(3, columns)),
      minH: wd.minH ?? 3,
    }
    x += w
    rowH = Math.max(rowH, wd.h)
    return item
  })
}

const read = (key?: string): ResponsiveLayouts<Bp> | null => {
  if (!key) return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as ResponsiveLayouts<Bp>) : null
  } catch {
    return null
  }
}

export function WidgetGrid({ widgets, editable = false, storageKey, className }: WidgetGridProps) {
  // Mede antes de desenhar: sem isso, a grade nasce com a largura padrão de 1280px e os
  // widgets deslizam até o lugar certo, passando da borda da tela durante a transição.
  const { width, containerRef, mounted } = useContainerWidth({ measureBeforeMount: true })
  const defaults = useMemo<ResponsiveLayouts<Bp>>(
    () => ({ lg: flow(widgets, 12), md: flow(widgets, 6), sm: flow(widgets, 1) }),
    [widgets],
  )
  const [layouts, setLayouts] = useState<ResponsiveLayouts<Bp>>(() => read(storageKey) ?? defaults)
  const mobile = width < breakpoints.md

  const save = (_: Layout, all: ResponsiveLayouts<Bp>) => {
    setLayouts(all)
    if (!storageKey || !editable) return
    try {
      localStorage.setItem(storageKey, JSON.stringify(all))
    } catch {
      // segue só em memória
    }
  }

  return (
    <div
      ref={containerRef}
      data-rendra="WDG-001"
      className={cn('widget-grid min-w-0', editable && !mobile && 'is-editing', className)}
    >
      {mounted && (
        <ResponsiveGridLayout
          width={width}
          breakpoints={breakpoints}
          cols={cols}
          layouts={layouts}
          rowHeight={ROW}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          dragConfig={{
            enabled: editable && !mobile,
            handle: '.widget-handle',
            bounded: false,
            threshold: 3,
          }}
          resizeConfig={{ enabled: editable && !mobile, handles: ['se'] }}
          onLayoutChange={save}
        >
          {widgets.map((wd) => (
            <div key={wd.id} className="relative flex min-w-0 flex-col [&>*]:min-h-0 [&>*]:flex-1">
              {editable && !mobile && (
                <span
                  className="widget-handle absolute top-2 left-1/2 z-10 flex h-6 -translate-x-1/2 cursor-grab items-center rounded-full border bg-card px-2 text-muted-foreground shadow-sm active:cursor-grabbing"
                  aria-label="Arrastar widget"
                  role="img"
                >
                  <GripVertical className="size-icon-sm rotate-90" aria-hidden />
                </span>
              )}
              {wd.content}
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
    </div>
  )
}

/** Apaga a arrumação salva (volta ao padrão na próxima renderização). */
export function resetWidgetLayout(storageKey: string) {
  try {
    localStorage.removeItem(storageKey)
  } catch {
    // nada a fazer
  }
}
