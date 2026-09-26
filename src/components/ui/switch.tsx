import { Switch as S } from 'radix-ui'
import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface SwitchProps {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  label?: ReactNode
  description?: ReactNode
  disabled?: boolean
  id?: string
  name?: string
  className?: string
  'aria-label'?: string
}

/** Switch único, com rótulo e descrição à esquerda e a chave à direita. */
export function Switch({
  checked,
  defaultChecked,
  onCheckedChange,
  label,
  description,
  disabled,
  id,
  name,
  className,
  ...aria
}: SwitchProps) {
  const auto = useId()
  const sid = id ?? `sw${auto}`
  const control = (
    <S.Root
      id={sid}
      name={name}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      aria-label={aria['aria-label']}
      data-touch="expanded"
      data-rendra="SWT-001"
      className="relative inline-flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-input transition-colors disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary max-md:before:absolute max-md:before:-inset-3"
    >
      <S.Thumb className="pointer-events-none block size-icon-md rounded-full bg-card shadow-sm transition-transform duration-200 ease-out data-[state=checked]:translate-x-6" />
    </S.Root>
  )
  if (!label) return control
  return (
    <label
      htmlFor={sid}
      className={cn(
        'flex min-h-touch cursor-pointer items-center justify-between gap-4 py-3 md:min-h-0 md:py-2',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-sm font-medium">{label}</span>
        {description && <span className="text-sm text-muted-foreground">{description}</span>}
      </span>
      {control}
    </label>
  )
}
