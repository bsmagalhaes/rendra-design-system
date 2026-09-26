import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { UseSortableResult } from '@/lib/sortable'

export interface SortableHandleProps {
  id: string
  /** Nome acessível da alça (ex.: "Reordenar Cliente A"). */
  label: string
  /** O resultado de useSortable (motor de src/lib/sortable.ts). */
  sortable: Pick<UseSortableResult, 'handleProps'>
  className?: string
}

/**
 * Alça de arraste única, reaproveitada pela List e pelo Upload (o Kanban tem alça própria,
 * por ser posicionada dentro do card e não ter movimento por seta): pointer down inicia o
 * arraste (mouse e toque) e as setas ↑/↓ movem uma posição pelo teclado, tudo vindo do
 * motor (useSortable), sem duplicar aqui a lógica de mover.
 */
export function SortableHandle({ id, label, sortable, className }: SortableHandleProps) {
  const handle = sortable.handleProps(id)
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'flex size-touch shrink-0 cursor-grab items-center justify-center rounded-item text-muted-foreground active:cursor-grabbing',
        handle.className,
        className,
      )}
      onPointerDown={handle.onPointerDown}
      onKeyDown={handle.onKeyDown}
    >
      <GripVertical className="size-icon-sm" aria-hidden />
    </button>
  )
}
