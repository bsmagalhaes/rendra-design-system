import { Slider as S } from 'radix-ui'
import { cn } from '@/lib/cn'

export interface SliderProps {
  /** Um número, ou dois para faixa (mínimo e máximo). */
  value?: number[]
  defaultValue?: number[]
  onChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  /** Mostra o valor atual acima da trilha. */
  showValue?: boolean
  formatValue?: (n: number) => string
  id?: string
  'aria-label'?: string
  'aria-describedby'?: string
}

/** Slider único: valor simples ou faixa. Alça com área de toque de 44px. */
export function Slider({
  value,
  defaultValue = [50],
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  showValue,
  formatValue = (n) => n.toLocaleString('pt-BR'),
  id,
  ...aria
}: SliderProps) {
  const current = value ?? defaultValue
  return (
    <div className="flex flex-col gap-3">
      {showValue && (
        <div className="flex justify-between text-sm font-medium tabular-nums">
          <span>{formatValue(current[0] ?? min)}</span>
          {current.length > 1 && <span>{formatValue(current[1] ?? max)}</span>}
        </div>
      )}
      <S.Root
        id={id}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={cn(
          'relative flex h-touch w-full touch-none items-center select-none md:h-6',
          disabled && 'opacity-50',
        )}
      >
        <S.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted">
          <S.Range className="absolute h-full bg-primary" />
        </S.Track>
        {current.map((_, i) => (
          <S.Thumb
            key={i}
            aria-label={
              aria['aria-label'] ??
              (current.length > 1 ? (i === 0 ? 'Mínimo' : 'Máximo') : undefined)
            }
            aria-describedby={aria['aria-describedby']}
            data-touch="expanded"
            className="relative block size-icon-md cursor-grab rounded-full border-2 border-primary bg-card shadow-sm transition-transform before:absolute before:-inset-3 hover:scale-110 active:cursor-grabbing"
          />
        ))}
      </S.Root>
    </div>
  )
}
