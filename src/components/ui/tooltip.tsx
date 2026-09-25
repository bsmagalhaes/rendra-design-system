import { Tooltip as T } from 'radix-ui'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Tooltip: só para informação complementar, nunca essencial (não existe hover no toque).
 * Informação essencial vai em texto de ajuda visível ou em Popover acionado por toque.
 */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <T.Provider delayDuration={300} skipDelayDuration={150}>
      {children}
    </T.Provider>
  )
}

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** Desliga o tooltip sem mudar a árvore (ex.: sidebar expandida já mostra o rótulo). */
  disabled?: boolean
}

export function Tooltip({ content, children, side = 'top', disabled }: TooltipProps) {
  if (disabled) return <>{children}</>
  return (
    <T.Root>
      <T.Trigger asChild>{children}</T.Trigger>
      <T.Portal>
        <T.Content
          side={side}
          sideOffset={8}
          collisionPadding={16}
          data-rendra="TIP-001"
          className={cn(
            'z-50 max-w-xs rounded-control bg-foreground px-3 py-2 text-xs font-medium text-background',
            'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          )}
        >
          {content}
        </T.Content>
      </T.Portal>
    </T.Root>
  )
}
