import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/** Bloco de carregamento. Monte o skeleton com a mesma estrutura do conteúdo final. */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      data-slot="skeleton"
      className={cn('animate-pulse rounded-item bg-muted', className)}
      {...props}
    />
  )
}
