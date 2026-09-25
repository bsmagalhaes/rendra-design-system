import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useBrand, type FeedbackType } from '@/brand'
import { BrandFeedbackIcon } from '@/components/ui/brand-feedback-icon'
import { cn } from '@/lib/cn'

/**
 * Alert único do sistema: ícone da marca à esquerda, título em destaque e descrição.
 * O tipo é prop; o formato vem do template ativo (quadrado, meio-termo ou arredondado).
 */
const alertVariants = cva('flex w-full min-w-0 items-start gap-3 rounded-control border', {
  variants: {
    type: {
      success: 'border-success/25 bg-success-soft text-success-soft-foreground',
      error: 'border-destructive/25 bg-destructive-soft text-destructive-soft-foreground',
      warning: 'border-warning/25 bg-warning-soft text-warning-soft-foreground',
      info: 'border-info/25 bg-info-soft text-info-soft-foreground',
    },
  },
  defaultVariants: { type: 'info' },
})

export interface AlertProps extends VariantProps<typeof alertVariants> {
  type: FeedbackType
  /** Título curto, em negrito. */
  title: ReactNode
  /** Texto de apoio abaixo do título. */
  description?: ReactNode
  /** Ação opcional à direita (ex.: botão "Desfazer"). */
  action?: ReactNode
  /** Mostra botão de fechar. */
  onDismiss?: () => void
  /** Anima o ícone na entrada (check se formando, X se riscando). */
  animated?: boolean
  className?: string
}

export function Alert({
  type,
  title,
  description,
  action,
  onDismiss,
  animated = false,
  className,
}: AlertProps) {
  const { shape } = useBrand()
  const pill = shape === 'pill'
  return (
    <div
      role={type === 'error' || type === 'warning' ? 'alert' : 'status'}
      data-rendra="ALRT-001"
      className={cn(
        alertVariants({ type }),
        pill ? 'items-center py-3 pr-4 pl-4 md:pr-6' : 'p-4',
        className,
      )}
    >
      <BrandFeedbackIcon
        type={type}
        size="lg"
        animated={animated}
        className={cn(!pill && 'mt-px')}
      />
      <div className={cn('flex min-w-0 flex-1 flex-col', !pill && 'gap-1')}>
        <p className="text-sm font-semibold">{title}</p>
        {description && <p className="text-sm opacity-90">{description}</p>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fechar aviso"
          className={cn(
            'flex size-touch shrink-0 items-center justify-center rounded-full transition-colors hover:bg-card/60 md:size-8',
            pill ? '-my-2' : '-mt-2 -mr-2',
          )}
        >
          <X className="size-icon-sm" aria-hidden />
        </button>
      )}
    </div>
  )
}
