import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/cn'

/*
 * Lista de verificação editável: cada item é uma caixa de seleção mais um campo de texto (o
 * próprio nome do item), então criar, renomear, marcar e remover são todos operáveis só de
 * teclado, sem gesto especial.
 */

export interface ChecklistItem {
  id: string
  label: string
  checked: boolean
}

export interface ChecklistProps {
  value: ChecklistItem[]
  onChange: (value: ChecklistItem[]) => void
  addLabel?: string
  disabled?: boolean
  id?: string
  className?: string
  'aria-label'?: string
}

/** Uma lista de verificação por finalidade: itens de um checklist usam este componente. */
export function Checklist({
  value,
  onChange,
  addLabel = 'Adicionar item',
  disabled = false,
  id,
  className,
  ...aria
}: ChecklistProps) {
  // Id de verdade, não crypto.randomUUID(): esse método só existe em contexto seguro
  // (HTTPS ou localhost) e quebra em produção atrás de HTTP puro.
  const baseId = useId()
  const nextIndex = useRef(0)
  const pendingFocusId = useRef<string | null>(null)

  useEffect(() => {
    if (!pendingFocusId.current) return
    const el = document.getElementById(`${pendingFocusId.current}-label`)
    el?.focus()
    pendingFocusId.current = null
  })

  const updateLabel = (itemId: string, label: string) =>
    onChange(value.map((item) => (item.id === itemId ? { ...item, label } : item)))

  const toggle = (itemId: string) =>
    onChange(value.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item)))

  const remove = (itemId: string) => onChange(value.filter((item) => item.id !== itemId))

  const add = () => {
    nextIndex.current += 1
    const newId = `${baseId}item${nextIndex.current}`
    pendingFocusId.current = newId
    onChange([...value, { id: newId, label: '', checked: false }])
  }

  return (
    <div
      id={id}
      data-rendra="CKLT-001"
      role="group"
      aria-label={aria['aria-label']}
      className={cn('flex flex-col gap-2', className)}
    >
      {value.map((item, index) => (
        <div key={item.id} className="flex min-h-touch items-center gap-2 md:min-h-0">
          <Checkbox
            checked={item.checked}
            onCheckedChange={() => toggle(item.id)}
            disabled={disabled}
            aria-label={item.label ? `Marcar ${item.label}` : `Marcar item ${index + 1}`}
          />
          <Input
            id={`${item.id}-label`}
            value={item.label}
            onChange={(v) => updateLabel(item.id, v)}
            placeholder="Descreva o item"
            disabled={disabled}
            aria-label={`Nome do item ${index + 1}`}
            className="flex-1"
            inputClassName={cn(item.checked && 'text-muted-foreground line-through')}
          />
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
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        icon={<Plus />}
        disabled={disabled}
        onClick={add}
      >
        {addLabel}
      </Button>
    </div>
  )
}
