import { Check, ChevronRight } from 'lucide-react'
import { DropdownMenu as D } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

export const DropdownMenu = D.Root
export const DropdownMenuTrigger = D.Trigger
export const DropdownMenuGroup = D.Group
export const DropdownMenuSub = D.Sub
export const DropdownMenuRadioGroup = D.RadioGroup

const panel =
  'z-50 w-max min-w-3xs max-w-popover overflow-hidden rounded-surface border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'

// Itens com 44px no mobile (toque) e compactos a partir de md.
const item =
  'relative flex min-h-touch cursor-pointer items-center gap-2 rounded-item px-3 text-sm outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground md:min-h-0 md:py-2 [&_svg]:size-icon-sm [&_svg]:shrink-0 [&_svg]:text-muted-foreground'

export function DropdownMenuContent({
  className,
  sideOffset = 8,
  ...props
}: ComponentProps<typeof D.Content>) {
  return (
    <D.Portal>
      <D.Content
        sideOffset={sideOffset}
        collisionPadding={16}
        className={cn(panel, className)}
        {...props}
      />
    </D.Portal>
  )
}

interface ItemProps extends ComponentProps<typeof D.Item> {
  /** Item destrutivo (excluir, sair): texto na cor destrutiva. */
  destructive?: boolean
}

export function DropdownMenuItem({ className, destructive, ...props }: ItemProps) {
  return (
    <D.Item
      className={cn(
        item,
        destructive &&
          'text-destructive data-highlighted:bg-destructive-soft data-highlighted:text-destructive-soft-foreground [&_svg]:text-current',
        className,
      )}
      {...props}
    />
  )
}

export function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: ComponentProps<typeof D.CheckboxItem>) {
  return (
    <D.CheckboxItem className={cn(item, 'pl-8', className)} {...props}>
      <span className="absolute left-2 flex size-icon-sm items-center justify-center">
        <D.ItemIndicator>
          <Check className="text-primary-text" />
        </D.ItemIndicator>
      </span>
      {children}
    </D.CheckboxItem>
  )
}

export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: ComponentProps<typeof D.RadioItem>) {
  return (
    <D.RadioItem className={cn(item, 'pl-8', className)} {...props}>
      <span className="absolute left-2 flex size-icon-sm items-center justify-center">
        <D.ItemIndicator>
          <Check className="text-primary-text" />
        </D.ItemIndicator>
      </span>
      {children}
    </D.RadioItem>
  )
}

export function DropdownMenuLabel({ className, ...props }: ComponentProps<typeof D.Label>) {
  return (
    <D.Label
      className={cn('px-2 py-2 text-xs font-medium text-muted-foreground', className)}
      {...props}
    />
  )
}

export function DropdownMenuSeparator({ className, ...props }: ComponentProps<typeof D.Separator>) {
  return <D.Separator className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />
}

export function DropdownMenuSubTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof D.SubTrigger>) {
  return (
    <D.SubTrigger className={cn(item, 'data-[state=open]:bg-accent', className)} {...props}>
      {children}
      <ChevronRight className="ml-auto" />
    </D.SubTrigger>
  )
}

export function DropdownMenuSubContent({
  className,
  ...props
}: ComponentProps<typeof D.SubContent>) {
  return (
    <D.Portal>
      <D.SubContent collisionPadding={16} className={cn(panel, className)} {...props} />
    </D.Portal>
  )
}
