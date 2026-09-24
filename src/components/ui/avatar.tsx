import { cva, type VariantProps } from 'class-variance-authority'
import { Avatar as A } from 'radix-ui'
import { cn } from '@/lib/cn'

const avatarVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-avatar bg-primary-soft font-medium text-primary-soft-foreground select-none',
  {
    variants: {
      size: {
        sm: 'size-6 text-xs',
        md: 'size-8 text-xs',
        lg: 'size-12 text-base',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.charAt(0) ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : ''
  return (first + last).toUpperCase()
}

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  name: string
  src?: string
  className?: string
}

export function Avatar({ name, src, size, className }: AvatarProps) {
  return (
    <A.Root className={cn(avatarVariants({ size }), className)}>
      {src && <A.Image src={src} alt={name} className="size-full object-cover" />}
      <A.Fallback delayMs={src ? 400 : 0} aria-label={name}>
        {initials(name)}
      </A.Fallback>
    </A.Root>
  )
}

export interface AvatarGroupProps {
  people: { name: string; src?: string }[]
  /** Máximo visível antes de "+N". */
  max?: number
  size?: AvatarProps['size']
  className?: string
}

/** Avatares sobrepostos, com contador do excedente. */
export function AvatarGroup({ people, max = 4, size = 'md', className }: AvatarGroupProps) {
  const visible = people.slice(0, max)
  const rest = people.length - visible.length
  return (
    <div
      className={cn('flex items-center -space-x-2', className)}
      aria-label={people.map((p) => p.name).join(', ')}
      role="group"
    >
      {visible.map((p) => (
        <Avatar key={p.name} name={p.name} src={p.src} size={size} className="ring-2 ring-card" />
      ))}
      {rest > 0 && (
        <span
          className={cn(
            avatarVariants({ size }),
            'bg-muted text-muted-foreground tabular-nums ring-2 ring-card',
          )}
        >
          +{rest}
        </span>
      )}
    </div>
  )
}
