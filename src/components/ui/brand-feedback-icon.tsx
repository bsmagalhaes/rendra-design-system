import { cva, type VariantProps } from 'class-variance-authority'
import type { SVGProps } from 'react'
import { useBrand, type FeedbackType } from '@/brand'
import { cn } from '@/lib/cn'

const iconVariants = cva('relative inline-flex shrink-0', {
  variants: {
    type: {
      success: 'text-success',
      error: 'text-destructive',
      warning: 'text-warning',
      info: 'text-info',
    },
    size: {
      sm: 'size-icon-sm',
      md: 'size-icon-md',
      lg: 'size-icon-lg',
      xl: 'size-12',
      '2xl': 'size-16',
    },
  },
  defaultVariants: { type: 'info', size: 'md' },
})

const badgeTone: Record<FeedbackType, string> = {
  success: 'bg-success text-success-foreground',
  error: 'bg-destructive text-destructive-foreground',
  warning: 'bg-warning text-warning-foreground',
  info: 'bg-info text-info-foreground',
}

export const feedbackLabels: Record<FeedbackType, string> = {
  success: 'Sucesso',
  error: 'Erro',
  warning: 'Atenção',
  info: 'Informação',
}

/** Glifos universais de status desenhados em traço, herdando currentColor. */
function StatusGlyph({
  type,
  animated,
  ...props
}: { type: FeedbackType; animated?: boolean } & SVGProps<SVGSVGElement>) {
  // pathLength=1 normaliza o traço: o desenho anima de 1 a 0 em qualquer glifo.
  const draw = animated
    ? ({ pathLength: 1, strokeDasharray: 1, className: 'animate-draw' } as const)
    : {}
  const common = {
    viewBox: '0 0 12 12',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...props,
  }
  switch (type) {
    case 'success':
      return (
        <svg {...common}>
          <path d="M3 6.2 5.1 8.2 9 4" {...draw} />
        </svg>
      )
    case 'error':
      return (
        <svg {...common}>
          <path d="M4 4l4 4M8 4 4 8" {...draw} />
        </svg>
      )
    case 'warning':
      return (
        <svg {...common}>
          <path d="M6 3.2v3.3M6 8.8v0" {...draw} />
        </svg>
      )
    case 'info':
      return (
        <svg {...common}>
          <path d="M6 3.2v0M6 5.5v3.3" {...draw} />
        </svg>
      )
  }
}

export interface BrandFeedbackIconProps extends Omit<VariantProps<typeof iconVariants>, 'type'> {
  type: FeedbackType
  /** Texto para leitores de tela. Sem ele o ícone é decorativo (o texto ao lado informa). */
  label?: string
  /**
   * Anima a entrada: o símbolo entra com mola e o glifo se desenha (check se formando,
   * X se riscando). O erro treme ao final. Respeita reduzir movimento.
   * Troque a key do componente para repetir a animação.
   */
  animated?: boolean
  className?: string
}

/**
 * Ícone de feedback da marca: o símbolo da marca em currentColor, tingido pela cor
 * semântica, com um selo de status para que o significado não dependa só da cor.
 * Cada tipo pode ser substituído por um SVG próprio em brand.config.ts (feedbackIcons).
 */
export function BrandFeedbackIcon({
  type,
  size,
  label,
  animated = false,
  className,
}: BrandFeedbackIconProps) {
  const { brand } = useBrand()
  const Custom = brand.feedbackIcons?.[type]
  const Symbol = brand.symbol
  const a11y = label
    ? ({ role: 'img', 'aria-label': label } as const)
    : ({ 'aria-hidden': true } as const)

  return (
    <span
      data-slot="feedback-icon"
      className={cn(
        iconVariants({ type, size }),
        animated && type === 'error' && 'animate-shake',
        className,
      )}
      {...a11y}
    >
      {Custom ? (
        <Custom className={cn('size-full', animated && 'animate-pop')} />
      ) : (
        <>
          <Symbol className={cn('size-full mask-status-cutout', animated && 'animate-pop')} />
          <span
            className={cn(
              'absolute right-0 bottom-0 flex size-1/2 items-center justify-center rounded-full',
              badgeTone[type],
              animated && 'animate-pop anim-delay-1',
            )}
          >
            <StatusGlyph type={type} animated={animated} className="size-full" />
          </span>
        </>
      )}
    </span>
  )
}
