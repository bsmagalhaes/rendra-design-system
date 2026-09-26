import { Star } from 'lucide-react'
import { useRef, useState, type KeyboardEvent } from 'react'
import { resolveCatalogCode } from '@/catalog/components'
import { cn } from '@/lib/cn'

/*
 * Avaliação: estrelas (1 a max, padrão 5) ou escala numérica (min a max, padrão 1 a 10).
 * value null é "sem resposta ainda", nunca 0: clicar de novo na opção marcada desmarca e
 * devolve null. Semântica de radiogroup, com as setas trocando (e marcando) a opção.
 */

export interface RatingProps {
  variant?: 'stars' | 'scale'
  value: number | null
  onChange?: (value: number | null) => void
  /** stars: total de estrelas (padrão 5). scale: valor máximo (padrão 10, até 10). */
  max?: number
  /** Só a escala: valor mínimo (padrão 1). */
  min?: number
  /** Só a escala: rótulo da ponta de baixo. */
  lowLabel?: string
  /** Só a escala: rótulo da ponta de cima. */
  highLabel?: string
  disabled?: boolean
  invalid?: boolean
  id?: string
  'aria-label'?: string
  'aria-describedby'?: string
}

function toneClass(ratio: number): string {
  if (ratio <= 1 / 3)
    return 'data-[state=checked]:border-destructive data-[state=checked]:bg-destructive-soft data-[state=checked]:text-destructive-soft-foreground'
  if (ratio <= 2 / 3)
    return 'data-[state=checked]:border-warning data-[state=checked]:bg-warning-soft data-[state=checked]:text-warning-soft-foreground'
  return 'data-[state=checked]:border-success data-[state=checked]:bg-success-soft data-[state=checked]:text-success-soft-foreground'
}

export function Rating({
  variant = 'stars',
  value,
  onChange,
  max,
  min = 1,
  lowLabel,
  highLabel,
  disabled,
  invalid,
  id,
  ...aria
}: RatingProps) {
  const groupRef = useRef<HTMLDivElement>(null)
  const [focusIndex, setFocusIndex] = useState(0)
  const effectiveMax = max ?? (variant === 'stars' ? 5 : 10)
  const options =
    variant === 'stars'
      ? Array.from({ length: effectiveMax }, (_, i) => i + 1)
      : Array.from({ length: Math.max(0, effectiveMax - min + 1) }, (_, i) => i + min)

  const selectedIndex = value !== null ? options.indexOf(value) : -1
  const activeIndex = selectedIndex >= 0 ? selectedIndex : focusIndex

  const select = (n: number) => {
    if (disabled) return
    onChange?.(value === n ? null : n)
  }

  const focusOption = (index: number) => {
    setFocusIndex(index)
    const el = groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[index]
    el?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const map: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: options.length - 1,
    }
    if (!(event.key in map)) return
    event.preventDefault()
    const next = Math.min(options.length - 1, Math.max(0, map[event.key] as number))
    focusOption(next)
    select(options[next] as number)
  }

  const code = resolveCatalogCode('Rating', { variant })

  if (variant === 'stars') {
    return (
      <div
        ref={groupRef}
        id={id}
        role="radiogroup"
        aria-label={aria['aria-label']}
        aria-describedby={aria['aria-describedby']}
        aria-invalid={invalid || undefined}
        data-rendra={code}
        className="inline-flex gap-1"
      >
        {options.map((n, index) => {
          const filled = value !== null && n <= value
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={n === value}
              aria-label={`${n} ${n === 1 ? 'estrela' : 'estrelas'}`}
              tabIndex={index === activeIndex ? 0 : -1}
              disabled={disabled}
              onClick={() => select(n)}
              onKeyDown={(e) => onKeyDown(e, index)}
              onFocus={() => setFocusIndex(index)}
              className={cn(
                'flex min-h-touch min-w-touch items-center justify-center rounded-control text-muted-foreground transition-colors focus-visible:focus-ring md:size-control-sm md:min-h-0 md:min-w-0',
                filled && 'text-warning',
                disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              <Star className={cn('size-icon-lg', filled && 'fill-current')} aria-hidden />
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={groupRef}
        id={id}
        role="radiogroup"
        aria-label={aria['aria-label']}
        aria-describedby={aria['aria-describedby']}
        aria-invalid={invalid || undefined}
        data-rendra={code}
        className="grid grid-cols-5 gap-2 sm:flex sm:flex-wrap"
      >
        {options.map((n, index) => {
          const ratio = options.length > 1 ? (n - min) / (effectiveMax - min) : 1
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={n === value}
              aria-label={`Nota ${n}`}
              tabIndex={index === activeIndex ? 0 : -1}
              disabled={disabled}
              data-state={n === value ? 'checked' : undefined}
              onClick={() => select(n)}
              onKeyDown={(e) => onKeyDown(e, index)}
              onFocus={() => setFocusIndex(index)}
              className={cn(
                'flex aspect-square min-h-touch items-center justify-center rounded-control border border-input bg-card text-sm font-medium tabular-nums transition-colors focus-visible:focus-ring sm:flex-1',
                'hover:border-primary',
                toneClass(ratio),
                invalid && 'border-destructive',
                disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              {n}
            </button>
          )
        })}
      </div>
      {(lowLabel || highLabel) && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      )}
    </div>
  )
}
