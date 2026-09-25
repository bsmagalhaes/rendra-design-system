import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ButtonGroupProps {
  /** Botões encostados, com borda compartilhada. */
  children?: ReactNode
  /**
   * Modo seleção (segmentado): passe options, value e onChange.
   * Se as opções não couberem, o grupo quebra linha em vez de rolar.
   */
  options?: { value: string; label: ReactNode; icon?: ReactNode; disabled?: boolean }[]
  value?: string
  onChange?: (value: string) => void
  size?: 'sm' | 'md'
  fullWidth?: boolean
  'aria-label'?: string
  className?: string
}

/**
 * ButtonGroup único: agrupa botões de ação (children) ou funciona como controle
 * segmentado de escolha única (options + value).
 */
export function ButtonGroup({
  children,
  options,
  value,
  onChange,
  size = 'md',
  fullWidth,
  className,
  ...aria
}: ButtonGroupProps) {
  if (options) {
    return (
      <div
        role="radiogroup"
        aria-label={aria['aria-label']}
        data-rendra="BTNG-001"
        className={cn(
          'inline-flex max-w-full flex-wrap gap-1 rounded-control border bg-muted p-1',
          fullWidth && 'flex w-full',
          className,
        )}
      >
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={o.disabled}
              onClick={() => onChange?.(o.value)}
              className={cn(
                'inline-flex min-h-touch flex-1 cursor-pointer items-center justify-center gap-2 rounded-item px-3 text-sm font-medium whitespace-nowrap transition-colors md:min-h-0 [&_svg]:size-icon-sm',
                size === 'sm' ? 'md:h-8' : 'md:h-8',
                active
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-card/60 hover:text-foreground',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              {o.icon}
              {o.label}
            </button>
          )
        })}
      </div>
    )
  }
  return (
    <div
      role="group"
      aria-label={aria['aria-label']}
      data-rendra="BTNG-001"
      className={cn(
        'inline-flex max-w-full',
        '[&>*]:rounded-none [&>*]:shadow-none [&>*:first-child]:rounded-l-control [&>*:focus-visible]:z-10 [&>*:last-child]:rounded-r-control [&>*:not(:first-child)]:-ml-px',
        fullWidth && 'flex w-full [&>*]:flex-1',
        className,
      )}
    >
      {children}
    </div>
  )
}
