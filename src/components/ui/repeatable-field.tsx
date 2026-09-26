import { Star, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'

/*
 * Campo repetível: uma lista de itens do mesmo formulário (telefones, e-mails, endereços...),
 * cada um desenhado por renderField. Marcar um como principal desmarca os outros; remover o
 * principal passa o papel para o primeiro item restante. Tudo dentro do próprio componente,
 * sem botão solto na tela.
 */

export interface RepeatableItem {
  id: string
  isPrimary?: boolean
}

export interface RepeatableFieldProps<T extends RepeatableItem> {
  items: T[]
  onChange: (items: T[]) => void
  /** Cria um item novo (com id próprio) quando a pessoa clica em "Adicionar". */
  createItem: () => T
  /** Desenha os campos de um item; update aplica um patch parcial nesse item. */
  renderField: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode
  /** Mostra o controle de "marcar como principal" em cada item. */
  showPrimary?: boolean
  maxItems?: number
  addLabel?: string
  emptyLabel?: string
  disabled?: boolean
  className?: string
}

/** Uma lista repetível por finalidade: telefones, e-mails, endereços e afins usam este componente. */
export function RepeatableField<T extends RepeatableItem>({
  items,
  onChange,
  createItem,
  renderField,
  showPrimary = false,
  maxItems,
  addLabel = 'Adicionar',
  emptyLabel = 'Nenhum item adicionado ainda.',
  disabled = false,
  className,
}: RepeatableFieldProps<T>) {
  const update = (id: string, patch: Partial<T>) =>
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)))

  const setPrimary = (id: string) =>
    onChange(items.map((item) => ({ ...item, isPrimary: item.id === id })))

  const remove = (id: string) => {
    const removedWasPrimary = items.find((item) => item.id === id)?.isPrimary
    const rest = items.filter((item) => item.id !== id)
    if (
      removedWasPrimary &&
      showPrimary &&
      rest.length > 0 &&
      !rest.some((item) => item.isPrimary)
    ) {
      rest[0] = { ...(rest[0] as T), isPrimary: true }
    }
    onChange(rest)
  }

  const add = () => onChange([...items, createItem()])

  const reachedMax = maxItems !== undefined && items.length >= maxItems

  return (
    <div data-rendra="REP-001" className={cn('flex flex-col gap-4', className)}>
      {items.length === 0 && <p className="text-sm text-muted-foreground">{emptyLabel}</p>}
      {items.map((item, index) => (
        <div key={item.id} className="flex flex-col gap-3 rounded-control border bg-card p-4">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              {renderField(item, (patch) => update(item.id, patch), index)}
            </div>
            <div className="flex shrink-0 items-center gap-1 pt-1">
              {showPrimary && (
                <Button
                  type="button"
                  variant={item.isPrimary ? 'secondary' : 'ghost'}
                  size="sm"
                  icon={<Star className={item.isPrimary ? 'fill-current' : undefined} />}
                  aria-pressed={item.isPrimary}
                  disabled={disabled}
                  onClick={() => setPrimary(item.id)}
                >
                  {item.isPrimary ? 'Principal' : 'Tornar principal'}
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                iconOnly
                icon={<Trash2 />}
                aria-label={`Remover item ${index + 1}`}
                disabled={disabled}
                onClick={() => remove(item.id)}
              />
            </div>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" disabled={disabled || reachedMax} onClick={add}>
        {addLabel}
      </Button>
    </div>
  )
}
