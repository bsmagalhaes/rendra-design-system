import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

/**
 * Motor de reordenação por pointer events (etapa A6 do plano da v2), reaproveitado pela
 * List (arraste da alça) e pelo Kanban (arraste do card no toque, que o HTML5 drag and
 * drop nativo não cobre). Pointer events funcionam iguais para mouse, caneta e toque, com
 * setPointerCapture mantendo os eventos de mover e soltar no mesmo elemento que começou o
 * arraste, mesmo que o ponteiro saia dele no meio do gesto.
 */

/** Item de uma lista reordenável: id estável e o dado original associado. */
export interface SortableItem<T = unknown> {
  id: string
  data: T
}

export interface UseSortableOptions<T> {
  items: SortableItem<T>[]
  /** Chamado com a lista já reordenada. Sem ela, o motor não reordena nada. */
  onReorder?: (items: SortableItem<T>[]) => void
}

export interface UseSortableResult {
  /** Id do item sendo arrastado no momento, ou null fora de um arraste. */
  draggingId: string | null
  /** Espalhe no elemento (um <button>) que serve de alça do arraste. */
  handleProps: (id: string) => {
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void
    className: string
  }
  /** Espalhe no elemento da linha, para o motor localizar o alvo do arraste sob o ponteiro. */
  itemProps: (id: string) => Record<string, string>
  /** Move o item uma posição para cima (-1) ou para baixo (1); usado pelo teclado (setas). */
  moveBy: (id: string, delta: -1 | 1) => void
}

const DEFAULT_ATTR = 'data-sortable-id'

/**
 * Acha, sob o ponto x,y da tela, o elemento mais próximo com o atributo dado (o motor da
 * List usa "data-sortable-id"; o Kanban passa o atributo dele, por coluna ou por card) e
 * se o ponto está antes ou depois do meio dele. Sem elemento sob o ponto, devolve null.
 */
export function findDragTarget(
  x: number,
  y: number,
  attr: string = DEFAULT_ATTR,
): { id: string; before: boolean } | null {
  const el = document.elementFromPoint(x, y)
  const target = el?.closest(`[${attr}]`)
  const id = target?.getAttribute(attr)
  if (!target || !id) return null
  const rect = target.getBoundingClientRect()
  const before = y < rect.top + rect.height / 2
  return { id, before }
}

/**
 * Inicia um arraste por pointer events num nó já capturado (setPointerCapture): entrega a
 * posição do ponteiro a cada movimento e avisa quando solta, sem depender de um item
 * específico. Usado tanto pelo useSortable quanto diretamente pelo Kanban.
 */
export function bindPointerDrag(
  node: HTMLElement,
  e: ReactPointerEvent<HTMLElement> | PointerEvent,
  handlers: { onMove: (x: number, y: number) => void; onEnd: () => void },
): void {
  const pointerId = e.pointerId
  try {
    node.setPointerCapture(pointerId)
  } catch {
    // Ambiente sem suporte (jsdom em alguns testes): segue sem captura, ainda funcional.
  }
  const onMove = (ev: PointerEvent) => handlers.onMove(ev.clientX, ev.clientY)
  const onUp = (ev: PointerEvent) => {
    if (ev.pointerId !== pointerId) return
    try {
      node.releasePointerCapture(pointerId)
    } catch {
      // Idem: sem captura, nada para liberar.
    }
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onUp)
    handlers.onEnd()
  }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)
}

/**
 * Motor de reordenação de uma lista única por alça: arraste (pointer events, mouse e
 * toque) e teclado (setas, uma posição por vez). Sem onReorder, a lista é só leitura e o
 * motor não inicia arraste nenhum (quem decide se a alça aparece é o componente que usa o
 * hook, como a List).
 */
export function useSortable<T>({ items, onReorder }: UseSortableOptions<T>): UseSortableResult {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const itemsRef = useRef(items)
  itemsRef.current = items

  const reorderTo = useCallback(
    (id: string, targetId: string, before: boolean) => {
      if (id === targetId) return
      const list = [...itemsRef.current]
      const from = list.findIndex((i) => i.id === id)
      if (from === -1) return
      const [moved] = list.splice(from, 1)
      if (!moved) return
      let to = list.findIndex((i) => i.id === targetId)
      if (to === -1) to = list.length
      if (!before) to += 1
      list.splice(to, 0, moved)
      onReorder?.(list)
    },
    [onReorder],
  )

  const moveBy = useCallback(
    (id: string, delta: -1 | 1) => {
      const list = [...itemsRef.current]
      const from = list.findIndex((i) => i.id === id)
      if (from === -1) return
      const to = from + delta
      if (to < 0 || to >= list.length) return
      const [moved] = list.splice(from, 1)
      if (!moved) return
      list.splice(to, 0, moved)
      onReorder?.(list)
    },
    [onReorder],
  )

  const handleProps = useCallback(
    (id: string) => ({
      className: 'touch-none',
      onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
        if (!onReorder) return
        const node = e.currentTarget
        setDraggingId(id)
        bindPointerDrag(node, e, {
          onMove: (x, y) => {
            const found = findDragTarget(x, y)
            if (found) reorderTo(id, found.id, found.before)
          },
          onEnd: () => setDraggingId(null),
        })
      },
    }),
    [onReorder, reorderTo],
  )

  const itemProps = useCallback((id: string) => ({ [DEFAULT_ATTR]: id }), [])

  return { draggingId, handleProps, itemProps, moveBy }
}
