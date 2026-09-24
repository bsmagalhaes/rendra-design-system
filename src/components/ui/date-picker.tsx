import { format } from 'date-fns'
import { CalendarDays, X } from 'lucide-react'
import { forwardRef, useState } from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import { ptBR } from 'react-day-picker/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/field'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { cn } from '@/lib/cn'
import { controlAdornmentButton, controlFrame, type ControlSize } from '@/lib/control'
import { PickerPanel } from './picker-panel'

export type { DateRange }

interface BaseProps {
  placeholder?: string
  /** Título do painel no mobile. */
  label?: string
  size?: ControlSize
  invalid?: boolean
  disabled?: boolean
  /** Com horário (campo HH:MM no painel). */
  time?: boolean
  minDate?: Date
  maxDate?: Date
  clearable?: boolean
  id?: string
  className?: string
  'aria-describedby'?: string
}
interface SingleProps extends BaseProps {
  range?: false
  value?: Date | null
  onChange?: (value: Date | null) => void
}
interface RangeProps extends BaseProps {
  /** Seleção de período (início e fim). */
  range: true
  value?: DateRange | null
  onChange?: (value: DateRange | null) => void
}
export type DatePickerProps = SingleProps | RangeProps

const fmtDate = (d: Date) => format(d, 'dd/MM/yyyy')
const fmtTime = (d: Date) => format(d, 'HH:mm')

function withTime(d: Date | undefined, hhmm: string) {
  if (!d) return d
  const [h, m] = hhmm.split(':').map(Number)
  const n = new Date(d)
  n.setHours(Number.isFinite(h) ? (h ?? 0) : 0, Number.isFinite(m) ? (m ?? 0) : 0, 0, 0)
  return n
}

/**
 * DatePicker único em pt-BR: data, período (range) e horário (time) são props.
 * Desktop: calendário em popover (dois meses no período). Mobile: bottom sheet.
 */
export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  function DatePicker(props, ref) {
    const {
      placeholder = props.range ? 'Selecione o período' : 'Selecione a data',
      label,
      size,
      invalid,
      disabled,
      time,
      minDate,
      maxDate,
      clearable,
      id,
      className,
    } = props
    const { isMobile } = useBreakpoint()
    const [open, setOpen] = useState(false)
    const [inner, setInner] = useState<Date | DateRange | null>(null)
    const committed = (props.value !== undefined ? props.value : inner) ?? null
    const [draft, setDraft] = useState<Date | DateRange | undefined>(undefined)
    const [t1, setT1] = useState('09:00')
    const [t2, setT2] = useState('18:00')

    const commit = (v: Date | DateRange | null) => {
      setInner(v)
      if (props.range) props.onChange?.(v as DateRange | null)
      else props.onChange?.(v as Date | null)
    }

    const onOpenChange = (o: boolean) => {
      setOpen(o)
      if (o) {
        setDraft(committed ?? undefined)
        if (committed instanceof Date) setT1(fmtTime(committed))
        else if (committed && 'from' in committed) {
          if (committed.from) setT1(fmtTime(committed.from))
          if (committed.to) setT2(fmtTime(committed.to))
        }
      }
    }

    const apply = () => {
      if (props.range) {
        const r = draft as DateRange | undefined
        commit(
          r?.from
            ? {
                from: time ? withTime(r.from, t1) : r.from,
                to: time ? withTime(r.to, t2) : r.to,
              }
            : null,
        )
      } else {
        const d = draft as Date | undefined
        commit(d ? (time ? (withTime(d, t1) ?? null) : d) : null)
      }
      setOpen(false)
    }

    // Texto do campo
    let text: string | null = null
    if (committed instanceof Date) {
      text = fmtDate(committed) + (time ? ` ${fmtTime(committed)}` : '')
    } else if (committed?.from) {
      const a = fmtDate(committed.from) + (time ? ` ${fmtTime(committed.from)}` : '')
      const b = committed.to
        ? fmtDate(committed.to) + (time ? ` ${fmtTime(committed.to)}` : '')
        : '...'
      text = `${a} a ${b}`
    }

    const disabledDays = [
      ...(minDate ? [{ before: minDate }] : []),
      ...(maxDate ? [{ after: maxDate }] : []),
    ]
    const immediate = !props.range && !time && !isMobile

    const classNames = {
      root: 'relative p-2',
      months: 'flex flex-col gap-6 md:flex-row',
      month: 'flex flex-col gap-3',
      month_caption:
        'flex h-control-sm items-center justify-center text-sm font-semibold capitalize',
      nav: 'absolute inset-x-2 top-2 flex justify-between',
      button_previous:
        'flex size-control-sm cursor-pointer items-center justify-center rounded-item text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40',
      button_next:
        'flex size-control-sm cursor-pointer items-center justify-center rounded-item text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40',
      chevron: 'size-icon-sm fill-current',
      month_grid: 'border-collapse',
      weekdays: 'flex',
      weekday:
        'w-touch py-1 text-center text-xs font-medium text-muted-foreground capitalize md:w-control-md',
      week: 'mt-1 flex',
      day: 'p-0 text-center',
      day_button:
        'size-touch cursor-pointer rounded-item text-sm tabular-nums transition-colors hover:bg-accent disabled:cursor-not-allowed md:size-control-md',
      selected:
        '[&>button]:bg-primary [&>button]:font-medium [&>button]:text-primary-foreground [&>button]:hover:bg-primary-hover [&>button]:hover:text-primary-hover-foreground',
      range_start: '[&>button]:bg-primary [&>button]:text-primary-foreground',
      range_end: '[&>button]:bg-primary [&>button]:text-primary-foreground',
      range_middle:
        '[&>button]:rounded-none [&>button]:bg-primary-soft [&>button]:text-primary-soft-foreground [&>button]:hover:bg-primary-soft',
      today: '[&>button]:font-semibold [&>button]:text-primary',
      outside: 'opacity-40',
      disabled: 'opacity-30',
    }

    const calendar = props.range ? (
      <DayPicker
        mode="range"
        locale={ptBR}
        selected={draft as DateRange | undefined}
        onSelect={(r) => setDraft(r)}
        numberOfMonths={isMobile ? 1 : 2}
        defaultMonth={(draft as DateRange | undefined)?.from}
        disabled={disabledDays}
        showOutsideDays
        classNames={classNames}
      />
    ) : (
      <DayPicker
        mode="single"
        locale={ptBR}
        selected={draft as Date | undefined}
        onSelect={(d) => {
          setDraft(d)
          if (immediate) {
            commit(d ?? null)
            setOpen(false)
          }
        }}
        defaultMonth={draft as Date | undefined}
        disabled={disabledDays}
        showOutsideDays
        classNames={classNames}
      />
    )

    const trigger = (
      <button
        ref={ref}
        id={id}
        type="button"
        disabled={disabled}
        data-invalid={invalid || undefined}
        aria-describedby={props['aria-describedby']}
        aria-haspopup="dialog"
        className={cn(
          controlFrame({ size, invalid }),
          'cursor-pointer text-left disabled:cursor-not-allowed disabled:opacity-60',
          className,
        )}
      >
        <CalendarDays className="size-icon-sm shrink-0 text-muted-foreground" aria-hidden />
        <span
          className={cn('min-w-0 flex-1 truncate tabular-nums', !text && 'text-muted-foreground')}
        >
          {text ?? placeholder}
        </span>
        {clearable && text && !disabled && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Limpar data"
            className={controlAdornmentButton}
            onPointerDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
              commit(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                e.stopPropagation()
                commit(null)
              }
            }}
          >
            <X aria-hidden />
          </span>
        )}
      </button>
    )

    const footer = immediate ? undefined : (
      <div className="flex flex-col gap-3">
        {time && (
          <div className={cn('grid gap-3', props.range ? 'grid-cols-2' : 'grid-cols-1')}>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${id ?? 'data'}-hora-1`}>
                {props.range ? 'Hora inicial' : 'Horário'}
              </Label>
              <Input
                id={`${id ?? 'data'}-hora-1`}
                mask="time"
                value={t1}
                onChange={setT1}
                size="sm"
              />
            </div>
            {props.range && (
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${id ?? 'data'}-hora-2`}>Hora final</Label>
                <Input
                  id={`${id ?? 'data'}-hora-2`}
                  mask="time"
                  value={t2}
                  onChange={setT2}
                  size="sm"
                />
              </div>
            )}
          </div>
        )}
        <div className="grid grid-actions-2 gap-3">
          <Button variant="outline" onClick={() => setDraft(undefined)}>
            Limpar
          </Button>
          <Button onClick={apply}>Aplicar</Button>
        </div>
      </div>
    )

    return (
      <PickerPanel
        open={open}
        onOpenChange={onOpenChange}
        trigger={trigger}
        title={label ?? placeholder}
        footer={footer}
        width="auto"
      >
        <div className="flex justify-center">{calendar}</div>
      </PickerPanel>
    )
  },
)
