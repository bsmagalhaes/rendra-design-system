import { Popover as P } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

export const Popover = P.Root
export const PopoverTrigger = P.Trigger
export const PopoverClose = P.Close
export const PopoverAnchor = P.Anchor

interface PopoverContentProps extends ComponentProps<typeof P.Content> {
  /** Largura: sm (16rem) ou md (22rem). Sempre limitada à tela menos 32px. */
  width?: 'sm' | 'md'
}

export function PopoverContent({
  className,
  align = 'center',
  sideOffset = 8,
  width = 'md',
  ...props
}: PopoverContentProps) {
  return (
    <P.Portal>
      <P.Content
        align={align}
        sideOffset={sideOffset}
        collisionPadding={16}
        className={cn(
          'z-50 rounded-surface border bg-popover text-popover-foreground shadow-md outline-none',
          width === 'sm' ? 'w-popover-sm' : 'w-popover',
          'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          className,
        )}
        {...props}
      />
    </P.Portal>
  )
}
