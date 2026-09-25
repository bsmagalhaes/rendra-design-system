import { cn } from '@/lib/cn'

/** Separador: hierarquia dentro de um card (no lugar de card dentro de card). */
export function Separator({
  orientation = 'horizontal',
  label,
  className,
}: {
  orientation?: 'horizontal' | 'vertical'
  /** Texto no meio da linha (ex.: "ou"). */
  label?: string
  className?: string
}) {
  if (label) {
    return (
      <div
        role="separator"
        data-rendra="SEP-001"
        className={cn('flex items-center gap-3', className)}
      >
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    )
  }
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      data-rendra="SEP-001"
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px self-stretch',
        className,
      )}
    />
  )
}
