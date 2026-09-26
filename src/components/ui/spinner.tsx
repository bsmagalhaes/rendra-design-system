import { Loader2 } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/cn'

/*
 * Indicador de carregamento único do sistema (A17 do plano da v2). Substitui qualquer
 * `Loader2 animate-spin` solto em Button, Input e Select. Sem label é decorativo
 * (aria-hidden); com label, anuncia o carregamento a quem usa leitor de tela. Para de girar
 * quando o sistema pede menos movimento.
 */

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  /** Nome do que está carregando. Vazio (padrão): decorativo, sem anúncio de leitor de tela. */
  label?: string
  className?: string
}

const sizeClass: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'size-icon-sm',
  md: 'size-icon-md',
  lg: 'size-icon-lg',
}

export function Spinner({ size = 'md', label, className }: SpinnerProps) {
  const reduced = usePrefersReducedMotion()
  const icon = (
    <Loader2 aria-hidden className={cn(sizeClass[size], reduced ? '' : 'animate-spin')} />
  )

  if (!label) {
    return (
      <span data-rendra="SPIN-001" aria-hidden className={cn('inline-flex', className)}>
        {icon}
      </span>
    )
  }

  return (
    <span
      data-rendra="SPIN-001"
      role="status"
      className={cn('inline-flex items-center gap-2', className)}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </span>
  )
}
