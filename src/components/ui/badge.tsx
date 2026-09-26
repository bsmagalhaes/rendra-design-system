import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

const badgeVariants = cva(
  'inline-flex max-w-full shrink-0 items-center gap-1 rounded-item border px-2 py-1 text-xs leading-none font-medium whitespace-nowrap [&_svg]:size-3',
  {
    variants: {
      tone: {
        neutral: 'border-transparent bg-muted text-foreground',
        primary: 'border-transparent bg-primary-soft text-primary-soft-foreground',
        success: 'border-transparent bg-success-soft text-success-soft-foreground',
        warning: 'border-transparent bg-warning-soft text-warning-soft-foreground',
        error: 'border-transparent bg-destructive-soft text-destructive-soft-foreground',
        info: 'border-transparent bg-info-soft text-info-soft-foreground',
        outline: 'border-border bg-card text-foreground',
      },
      solid: { true: '', false: '' },
    },
    compoundVariants: [
      { tone: 'primary', solid: true, className: 'bg-primary text-primary-foreground' },
      { tone: 'success', solid: true, className: 'bg-success text-success-foreground' },
      { tone: 'warning', solid: true, className: 'bg-warning text-warning-foreground' },
      { tone: 'error', solid: true, className: 'bg-destructive text-destructive-foreground' },
      { tone: 'info', solid: true, className: 'bg-info text-info-foreground' },
    ],
    defaultVariants: { tone: 'neutral', solid: false },
  },
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  /** Ícone antes do texto (fica fora do corte com reticências). */
  icon?: ReactNode
  /** Bolinha de status à esquerda. */
  dot?: boolean
}

/** Badge único: tom semântico, suave ou sólido, com bolinha opcional. */
export function Badge({ tone, solid, dot, icon, className, children, ...props }: BadgeProps) {
  return (
    <span
      data-rendra="BDG-001"
      className={cn(badgeVariants({ tone, solid }), className)}
      {...props}
    >
      {dot && <span aria-hidden className="size-2 shrink-0 rounded-full bg-current" />}
      {icon && (
        <span aria-hidden className="flex shrink-0">
          {icon}
        </span>
      )}
      <span className="truncate">{children}</span>
    </span>
  )
}
