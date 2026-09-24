import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/**
 * Card: agrupa conteúdo de página. Borda de 1px, sem sombra pesada.
 * Nunca aninhe Card dentro de Card: para hierarquia interna use Separator ou título de seção.
 * Nunca coloque rolagem dentro de Card.
 */
export type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        'flex min-w-0 flex-col rounded-surface border bg-card text-card-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-header"
      className={cn('flex flex-col gap-1 p-4 md:p-6', className)}
      {...props}
    />
  )
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 data-slot="card-title" className={cn('text-lg font-semibold', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="card-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-content"
      className={cn('p-4 md:p-6 [[data-slot=card-header]+&]:pt-0', className)}
      {...props}
    />
  )
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center gap-3 border-t px-4 py-3 md:px-6', className)}
      {...props}
    />
  )
}
