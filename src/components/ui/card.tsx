import type { HTMLAttributes, ReactNode } from 'react'
import { InfoHint } from '@/components/ui/info-hint'
import { cn } from '@/lib/cn'

/**
 * Card: agrupa conteúdo de página. Borda de 1px, sem sombra pesada.
 * Nunca aninhe Card dentro de Card: para hierarquia interna use Separator ou título de seção.
 * Nunca coloque rolagem dentro de Card.
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Uso interno: quando outro componente catalogado (Calendar, FormSection, StatCard,
   * Table) usa o Card como o próprio elemento raiz, ele passa o seu código aqui para que
   * o data-rendra mostre a variante certa, não CARD-001. Sem essa prop, o Card se
   * identifica como CARD-001, o próprio código dele no catálogo.
   */
  'data-rendra'?: string
}

export function Card({ className, 'data-rendra': dataRendra, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      data-rendra={dataRendra ?? 'CARD-001'}
      className={cn(
        'flex min-w-0 flex-col rounded-surface border bg-card text-card-foreground',
        className,
      )}
      {...props}
    />
  )
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Ações do card, no canto do cabeçalho (ex.: Ligar, Restaurar padrão). É o lugar das ações
   * de um card: nunca um botão solto no meio do conteúdo.
   */
  actions?: ReactNode
}

export function CardHeader({ className, actions, children, ...props }: CardHeaderProps) {
  if (!actions)
    return (
      <div
        data-slot="card-header"
        className={cn('flex flex-col gap-1 p-4 md:p-6', className)}
        {...props}
      >
        {children}
      </div>
    )
  return (
    <div
      data-slot="card-header"
      className={cn(
        'flex flex-wrap items-start justify-between gap-x-4 gap-y-3 p-4 md:p-6',
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">{children}</div>
      <div className="flex shrink-0 items-center gap-2">{actions}</div>
    </div>
  )
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Texto orientativo da seção: ícone de informação ao lado do título, que abre um modal. */
  help?: ReactNode
}

export function CardTitle({ className, children, help, ...props }: CardTitleProps) {
  const heading = (
    <h3 data-slot="card-title" className={cn('text-lg font-semibold', className)} {...props}>
      {children}
    </h3>
  )
  if (!help) return heading
  return (
    <div className="flex min-w-0 items-center gap-1">
      {heading}
      <InfoHint title={typeof children === 'string' ? children : 'Sobre esta seção'}>
        {help}
      </InfoHint>
    </div>
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
