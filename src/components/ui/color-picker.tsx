import { Check } from 'lucide-react'
import { forwardRef, useEffect, useState, type CSSProperties } from 'react'
import { COLOR_PICKER_SWATCHES, contrast, INK, WHITE } from '@/brand/palette'
import { Input } from '@/components/ui/input'
import { PickerPanel } from '@/components/ui/picker-panel'
import { cn } from '@/lib/cn'
import { controlFrame } from '@/lib/control'

/*
 * Seletor de cor único do sistema (A1 do plano da v2). Amostras fixas com padrão de marca
 * e uma cor livre por campo hexadecimal, no mesmo painel do Select e do DatePicker
 * (PickerPanel): popover no desktop, bottom sheet no mobile.
 */

const HEX_PATTERN = /^#?[0-9a-f]{6}$/i

/**
 * #rrggbb minúsculo, ou null quando o texto não é um hexadecimal válido de 6 dígitos.
 * Aceita com ou sem o "#" na frente (o campo livre também aceita "0ea5e9").
 */
function normalizeHex(value: string): string | null {
  const v = value.trim()
  if (!HEX_PATTERN.test(v)) return null
  const digits = v.startsWith('#') ? v.slice(1) : v
  return `#${digits.toLowerCase()}`
}

export interface ColorPickerProps {
  /** Cor atual, #rrggbb. */
  value?: string
  /** Só chama com hexadecimal válido, sempre em minúsculas. */
  onChange?: (hex: string) => void
  /** Amostras fixas oferecidas antes da cor livre. */
  swatches?: string[]
  disabled?: boolean
  /** Nome acessível do grupo de amostras e do campo. */
  'aria-label'?: string
  className?: string
}

/**
 * Amostra de cor: quadrado com a cor via variável CSS (a única forma de estilo inline
 * permitida) e, quando selecionada, um anel e um check cuja cor (clara ou escura) segue o
 * contraste da própria amostra, nunca um tom fixo do tema.
 */
function Swatch({
  hex,
  selected,
  disabled,
  onSelect,
}: {
  hex: string
  selected: boolean
  disabled?: boolean
  onSelect: () => void
}) {
  const useLightCheck = contrast(hex, WHITE) >= contrast(hex, INK)
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={hex}
      style={{ '--rendra-swatch': hex } as CSSProperties}
      className={cn(
        'relative size-touch shrink-0 rounded-item border bg-swatch transition-shadow outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover',
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-popover',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      {selected && (
        <Check
          aria-hidden
          className={cn(
            'absolute inset-0 m-auto size-icon-sm',
            useLightCheck ? 'swatch-check-light' : 'swatch-check-dark',
          )}
        />
      )}
    </button>
  )
}

export const ColorPicker = forwardRef<HTMLButtonElement, ColorPickerProps>(function ColorPicker(
  {
    value,
    onChange,
    swatches = COLOR_PICKER_SWATCHES,
    disabled,
    'aria-label': ariaLabel = 'Cor',
    className,
  },
  ref,
) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value ?? '')

  useEffect(() => setDraft(value ?? ''), [value])

  const current = value ? normalizeHex(value) : null

  const pick = (hex: string) => {
    const n = normalizeHex(hex)
    if (!n) return
    onChange?.(n)
    setOpen(false)
  }

  const trigger = (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      data-rendra="COR-001"
      className={cn(
        controlFrame({ size: 'md' }),
        'cursor-pointer justify-start disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
    >
      <span
        aria-hidden
        className="size-icon-md shrink-0 rounded-item border bg-swatch"
        style={current ? ({ '--rendra-swatch': current } as CSSProperties) : undefined}
      />
      <span className="truncate font-mono text-sm">{current ?? 'Selecione uma cor'}</span>
    </button>
  )

  return (
    <PickerPanel
      open={open}
      onOpenChange={(o) => setOpen(o && !disabled)}
      trigger={trigger}
      title={ariaLabel}
    >
      <div className="flex flex-col gap-4 p-2">
        <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
          {swatches.map((hex) => {
            const n = normalizeHex(hex) ?? hex.toLowerCase()
            return (
              <Swatch
                key={n}
                hex={n}
                selected={current === n}
                disabled={disabled}
                onSelect={() => pick(n)}
              />
            )
          })}
        </div>
        <Input
          aria-label={`${ariaLabel}: cor livre (hexadecimal)`}
          placeholder="Hexadecimal (ex.: 0ea5e9)"
          value={draft}
          disabled={disabled}
          onChange={(v) => {
            setDraft(v)
            const n = normalizeHex(v)
            if (n) onChange?.(n)
          }}
        />
      </div>
    </PickerPanel>
  )
})
