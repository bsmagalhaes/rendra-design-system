import { forwardRef, useState, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export interface TextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'onChange'
> {
  invalid?: boolean
  /** Mostra contador "12/200". Usa maxLength quando definido. */
  counter?: boolean
  value?: string
  onChange?: (value: string) => void
}

/** Textarea único, com contador opcional. Cresce com o conteúdo até a altura máxima e depois rola por dentro. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, counter, value, defaultValue, onChange, maxLength, rows = 4, className, ...props },
  ref,
) {
  const [inner, setInner] = useState(String(value ?? defaultValue ?? ''))
  const current = value ?? inner
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <textarea
        ref={ref}
        rows={rows}
        maxLength={maxLength}
        value={current}
        aria-invalid={invalid || undefined}
        onChange={(e) => {
          setInner(e.target.value)
          onChange?.(e.target.value)
        }}
        className={cn(
          'field-sizing-content max-h-chart-md min-h-24 w-full resize-y rounded-control border border-input bg-field px-3 py-2 text-base transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground hover:border-foreground/40 focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-60 md:text-sm',
          invalid && 'border-destructive focus:border-destructive focus:ring-destructive/25',
        )}
        {...props}
      />
      {counter && (
        <span
          aria-live="polite"
          className={cn(
            'self-end text-xs text-muted-foreground tabular-nums',
            maxLength && current.length >= maxLength && 'font-medium text-destructive',
          )}
        >
          {current.length}
          {maxLength ? `/${maxLength}` : ''}
        </span>
      )}
    </div>
  )
})
