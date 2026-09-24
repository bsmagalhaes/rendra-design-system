import {
  addDays,
  addMonths,
  addWeeks,
  differenceInMinutes,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react'
import { useMemo, useState, type CSSProperties } from 'react'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { cn } from '@/lib/cn'

/*
 * Calendário único do sistema: mês, semana, dia e agenda (lista) são a prop view,
 * nunca componentes separados. Os eventos vêm por props; criar e editar ficam com a tela
 * (onDateClick e onEventClick abrem um Drawer, por exemplo).
 *
 * Mobile (< 768px), sem rolagem lateral:
 *   month  vira um mês compacto com pontos nos dias e a lista do dia tocado embaixo;
 *   week   vira o dia, com uma faixa dos 7 dias para trocar;
 *   day e agenda seguem iguais, na largura da tela.
 */

export type CalendarView = 'month' | 'week' | 'day' | 'agenda'
export type CalendarTone = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  /** Fim. Sem valor, o evento dura 1 hora. */
  end?: Date
  /** Dia inteiro: aparece no topo do dia, sem horário. */
  allDay?: boolean
  tone?: CalendarTone
  description?: string
  location?: string
}

export interface CalendarProps {
  events: CalendarEvent[]
  view?: CalendarView
  defaultView?: CalendarView
  onViewChange?: (view: CalendarView) => void
  /** Visões oferecidas no seletor. Padrão: todas. */
  views?: CalendarView[]
  /** Data em foco (mês, semana ou dia mostrado). */
  date?: Date
  defaultDate?: Date
  onDateChange?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
  /** Clique em um dia ou horário vazio (ex.: abrir o cadastro de evento já com a data). */
  onDateClick?: (date: Date) => void
  /** Faixa de horas da semana e do dia. Padrão: 7h às 21h. */
  hours?: [number, number]
  'aria-label'?: string
  className?: string
}

const viewLabels: Record<CalendarView, string> = {
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
}

const toneChip: Record<CalendarTone, string> = {
  primary: 'bg-primary-soft text-primary-soft-foreground',
  success: 'bg-success-soft text-success-soft-foreground',
  warning: 'bg-warning-soft text-warning-soft-foreground',
  error: 'bg-destructive-soft text-destructive-soft-foreground',
  info: 'bg-info-soft text-info-soft-foreground',
  neutral: 'bg-muted text-foreground',
}
const toneDot: Record<CalendarTone, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-destructive',
  info: 'bg-info',
  neutral: 'bg-muted-foreground',
}

const WEEK = { weekStartsOn: 0 as const, locale: ptBR }
const endOf = (e: CalendarEvent) => e.end ?? new Date(e.start.getTime() + 60 * 60 * 1000)
const hhmm = (d: Date) => format(d, 'HH:mm')
const timeRange = (e: CalendarEvent) =>
  e.allDay ? 'Dia inteiro' : `${hhmm(e.start)} às ${hhmm(endOf(e))}`
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function sortByStart(list: CalendarEvent[]) {
  return [...list].sort(
    (a, b) => Number(Boolean(b.allDay)) - Number(Boolean(a.allDay)) || +a.start - +b.start,
  )
}

/** Botão de evento em formato de chip (mês, lista do dia, topo "dia inteiro"). */
function EventChip({
  event,
  onClick,
  compact,
}: {
  event: CalendarEvent
  onClick?: (e: CalendarEvent) => void
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(event)}
      className={cn(
        'flex w-full min-w-0 cursor-pointer items-center gap-1 rounded-item px-2 text-left text-xs font-medium transition-[filter] outline-none hover:brightness-95 focus-visible:ring-2 focus-visible:ring-ring',
        compact ? 'py-1' : 'min-h-touch py-2 md:min-h-0 md:py-1',
        toneChip[event.tone ?? 'primary'],
      )}
    >
      {!event.allDay && (
        <span className="shrink-0 tabular-nums font-normal">{hhmm(event.start)}</span>
      )}
      <span className="truncate">{event.title}</span>
    </button>
  )
}

/** Lista de eventos de um dia (mobile do mês e visão agenda). */
function DayList({
  events,
  onEventClick,
}: {
  events: CalendarEvent[]
  onEventClick?: (e: CalendarEvent) => void
}) {
  return (
    <ul className="flex flex-col gap-2">
      {events.map((e) => (
        <li key={e.id}>
          <button
            type="button"
            onClick={() => onEventClick?.(e)}
            className="flex w-full cursor-pointer items-stretch gap-3 rounded-item border bg-card p-3 text-left transition-colors outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span
              aria-hidden
              className={cn('w-1 shrink-0 rounded-full', toneDot[e.tone ?? 'primary'])}
            />
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-sm font-medium">{e.title}</span>
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3" aria-hidden />
                  {timeRange(e)}
                </span>
                {e.location && (
                  <span className="inline-flex min-w-0 items-center gap-1">
                    <MapPin className="size-3 shrink-0" aria-hidden />
                    <span className="truncate">{e.location}</span>
                  </span>
                )}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export function Calendar({
  events,
  view: viewProp,
  defaultView = 'month',
  onViewChange,
  views = ['month', 'week', 'day', 'agenda'],
  date: dateProp,
  defaultDate,
  onDateChange,
  onEventClick,
  onDateClick,
  hours = [7, 21],
  className,
  ...aria
}: CalendarProps) {
  const { isMobile } = useBreakpoint()
  const [innerView, setInnerView] = useState<CalendarView>(defaultView)
  const [innerDate, setInnerDate] = useState<Date>(() => startOfDay(defaultDate ?? new Date()))
  const view = viewProp ?? innerView
  const date = dateProp ?? innerDate
  // No celular a semana vira o dia (com a faixa dos 7 dias para trocar).
  const shown: CalendarView = isMobile && view === 'week' ? 'day' : view
  const mobileViews = views.filter((v) => v !== 'week')

  const setView = (v: CalendarView) => {
    setInnerView(v)
    onViewChange?.(v)
  }
  const setDate = (d: Date) => {
    setInnerDate(startOfDay(d))
    onDateChange?.(startOfDay(d))
  }

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const e of sortByStart(events)) {
      const key = format(e.start, 'yyyy-MM-dd')
      map.set(key, [...(map.get(key) ?? []), e])
    }
    return map
  }, [events])
  const eventsOn = (d: Date) => byDay.get(format(d, 'yyyy-MM-dd')) ?? []

  const step = (dir: 1 | -1) => {
    if (shown === 'month' || shown === 'agenda') setDate(addMonths(date, dir))
    else if (shown === 'week') setDate(addWeeks(date, dir))
    else setDate(addDays(date, dir))
  }

  const title =
    shown === 'day'
      ? capital(format(date, "EEEE, d 'de' MMMM", { locale: ptBR }))
      : shown === 'week'
        ? `${format(startOfWeek(date, WEEK), 'd MMM', { locale: ptBR })} a ${format(endOfWeek(date, WEEK), "d MMM 'de' yyyy", { locale: ptBR })}`
        : capital(format(date, "MMMM 'de' yyyy", { locale: ptBR }))

  /* ---------------------------------------------------------------- barra */
  const toolbar = (
    <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <h2
          className="order-first w-full min-w-0 truncate text-base font-semibold md:order-last md:w-auto"
          aria-live="polite"
        >
          {title}
        </h2>
        <Button variant="outline" size="sm" onClick={() => setDate(new Date())}>
          Hoje
        </Button>
        <Button variant="ghost" size="sm" iconOnly aria-label="Anterior" onClick={() => step(-1)}>
          <ChevronLeft />
        </Button>
        <Button variant="ghost" size="sm" iconOnly aria-label="Próximo" onClick={() => step(1)}>
          <ChevronRight />
        </Button>
      </div>
      {(isMobile ? mobileViews : views).length > 1 && (
        <ButtonGroup
          size="sm"
          fullWidth={isMobile}
          aria-label="Visão do calendário"
          className="md:ml-auto"
          value={shown}
          onChange={(v) => setView(v as CalendarView)}
          options={(isMobile ? mobileViews : views).map((v) => ({
            value: v,
            label: viewLabels[v],
          }))}
        />
      )}
    </div>
  )

  /* ---------------------------------------------------------------- mês */
  const monthDays = () => {
    const start = startOfWeek(startOfMonth(date), WEEK)
    const end = endOfWeek(endOfMonth(date), WEEK)
    const days: Date[] = []
    for (let d = start; d <= end; d = addDays(d, 1)) days.push(d)
    return days
  }
  const weekdayNames = Array.from({ length: 7 }, (_, i) =>
    format(addDays(startOfWeek(date, WEEK), i), isMobile ? 'EEEEE' : 'EEE', { locale: ptBR }),
  )

  const month = () => {
    const days = monthDays()
    if (isMobile) {
      const list = eventsOn(date)
      return (
        <div className="flex flex-col">
          <div className="grid grid-cols-week px-2 pt-2 text-center text-xs font-medium text-muted-foreground uppercase">
            {weekdayNames.map((n, i) => (
              <span key={i} className="py-2">
                {n}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-week px-2 pb-2">
            {days.map((d) => {
              const evs = eventsOn(d)
              const selected = isSameDay(d, date)
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => setDate(d)}
                  aria-pressed={selected}
                  aria-label={`${format(d, "d 'de' MMMM", { locale: ptBR })}${evs.length ? `, ${evs.length} ${evs.length === 1 ? 'evento' : 'eventos'}` : ''}`}
                  className={cn(
                    'flex min-h-touch cursor-pointer flex-col items-center justify-center gap-1 rounded-item text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    !isSameMonth(d, date) && 'text-muted-foreground',
                    selected && 'bg-primary font-semibold text-primary-foreground',
                    !selected && isToday(d) && 'font-semibold text-primary-text',
                  )}
                >
                  {format(d, 'd')}
                  <span className="flex h-1 gap-1" aria-hidden>
                    {evs.slice(0, 3).map((e) => (
                      <span
                        key={e.id}
                        className={cn(
                          'size-1 rounded-full',
                          selected ? 'bg-primary-foreground' : toneDot[e.tone ?? 'primary'],
                        )}
                      />
                    ))}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="flex flex-col gap-3 border-t p-4">
            <p className="text-sm font-semibold">
              {capital(format(date, "EEEE, d 'de' MMMM", { locale: ptBR }))}
            </p>
            {list.length ? (
              <DayList events={list} onEventClick={onEventClick} />
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum evento neste dia.</p>
            )}
            {onDateClick && (
              <Button variant="outline" fullWidth onClick={() => onDateClick(date)}>
                Novo evento neste dia
              </Button>
            )}
          </div>
        </div>
      )
    }
    return (
      <div className="flex flex-col">
        <div className="grid grid-cols-week border-b bg-muted/50 text-xs font-medium text-muted-foreground">
          {weekdayNames.map((n, i) => (
            <span key={i} className="px-2 py-2 capitalize">
              {n.replace('.', '')}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-week">
          {days.map((d) => {
            const evs = eventsOn(d)
            const extra = evs.length - 3
            return (
              <div
                key={d.toISOString()}
                className={cn(
                  'flex min-h-24 min-w-0 flex-col gap-1 border-r border-b p-1 nth-[7n]:border-r-0',
                  !isSameMonth(d, date) && 'bg-muted/30',
                )}
              >
                <button
                  type="button"
                  onClick={() => (onDateClick ? onDateClick(d) : (setDate(d), setView('day')))}
                  aria-label={
                    onDateClick
                      ? `Novo evento em ${format(d, "d 'de' MMMM", { locale: ptBR })}`
                      : `Ver ${format(d, "d 'de' MMMM", { locale: ptBR })}`
                  }
                  className={cn(
                    'flex size-8 cursor-pointer items-center justify-center self-start rounded-item text-sm tabular-nums transition-colors outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
                    !isSameMonth(d, date) && 'text-muted-foreground',
                    isToday(d) &&
                      'bg-primary font-semibold text-primary-foreground hover:bg-primary-hover hover:text-primary-hover-foreground',
                  )}
                >
                  {format(d, 'd')}
                </button>
                {evs.slice(0, 3).map((e) => (
                  <EventChip key={e.id} event={e} onClick={onEventClick} compact />
                ))}
                {extra > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setDate(d)
                      setView('day')
                    }}
                    className="cursor-pointer self-start rounded-item px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    +{extra} {extra === 1 ? 'evento' : 'eventos'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  /* ---------------------------------------------------------------- semana e dia */
  const [h0, h1] = hours
  const hourList = Array.from({ length: h1 - h0 }, (_, i) => h0 + i)
  const now = new Date()

  const timeGrid = (days: Date[]) => (
    <div className="flex flex-col">
      {/* Faixa dos 7 dias no celular: troca o dia mostrado. */}
      {isMobile && (
        <div className="grid grid-cols-week gap-1 border-b p-2">
          {Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(date, WEEK), i)).map((d) => {
            const selected = isSameDay(d, date)
            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => setDate(d)}
                aria-pressed={selected}
                aria-label={format(d, "EEEE, d 'de' MMMM", { locale: ptBR })}
                className={cn(
                  'flex min-h-touch cursor-pointer flex-col items-center justify-center rounded-item text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  selected ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
                )}
              >
                <span className="uppercase">{format(d, 'EEEEE', { locale: ptBR })}</span>
                <span className="text-sm font-semibold tabular-nums">{format(d, 'd')}</span>
              </button>
            )
          })}
        </div>
      )}
      {/* Cabeçalho dos dias e eventos de dia inteiro. */}
      <div
        className="grid grid-cols-week-time border-b"
        style={{ '--days': days.length } as CSSProperties}
      >
        <span className="border-r" />
        {days.map((d) => {
          const allDay = eventsOn(d).filter((e) => e.allDay)
          return (
            <div
              key={d.toISOString()}
              className="flex min-w-0 flex-col gap-1 border-r p-2 last:border-r-0"
            >
              {!isMobile && (
                <span
                  className={cn(
                    'text-xs text-muted-foreground capitalize',
                    isToday(d) && 'font-semibold text-primary-text',
                  )}
                >
                  {format(d, 'EEE d', { locale: ptBR }).replace('.', '')}
                </span>
              )}
              {allDay.map((e) => (
                <EventChip key={e.id} event={e} onClick={onEventClick} compact />
              ))}
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-week-time" style={{ '--days': days.length } as CSSProperties}>
        <div className="border-r">
          {hourList.map((h) => (
            <div
              key={h}
              className="h-12 pr-2 text-right text-xs text-muted-foreground tabular-nums"
            >
              <span className="relative -top-2">{String(h).padStart(2, '0')}:00</span>
            </div>
          ))}
        </div>
        {days.map((d) => {
          const timed = eventsOn(d).filter((e) => !e.allDay)
          const showNow = isToday(d) && now.getHours() >= h0 && now.getHours() < h1
          return (
            <div key={d.toISOString()} className="relative min-w-0 border-r last:border-r-0">
              {hourList.map((h) => (
                <button
                  key={h}
                  type="button"
                  tabIndex={onDateClick ? 0 : -1}
                  aria-label={`Novo evento em ${format(d, "d 'de' MMMM", { locale: ptBR })} às ${String(h).padStart(2, '0')}:00`}
                  onClick={() =>
                    onDateClick?.(new Date(d.getFullYear(), d.getMonth(), d.getDate(), h))
                  }
                  className={cn(
                    'block h-12 w-full border-b border-dashed outline-none focus-visible:bg-accent',
                    onDateClick ? 'cursor-pointer hover:bg-accent/60' : 'cursor-default',
                  )}
                />
              ))}
              {showNow && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 calendar-now z-10 h-0 border-t-2 border-destructive"
                  style={
                    {
                      '--from': (now.getHours() - h0 + now.getMinutes() / 60).toFixed(3),
                    } as CSSProperties
                  }
                />
              )}
              {timed.map((e) => {
                const from = Math.max(0, e.start.getHours() - h0 + e.start.getMinutes() / 60)
                const span = Math.max(0.5, differenceInMinutes(endOf(e), e.start) / 60)
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => onEventClick?.(e)}
                    style={
                      {
                        '--from': from.toFixed(3),
                        '--span': Math.min(span, h1 - h0 - from).toFixed(3),
                      } as CSSProperties
                    }
                    className={cn(
                      'absolute inset-x-1 calendar-event z-20 flex cursor-pointer flex-col overflow-hidden rounded-item px-2 text-left text-xs outline-none hover:brightness-95 focus-visible:ring-2 focus-visible:ring-ring',
                      span < 0.75 ? 'justify-center' : 'py-1',
                      toneChip[e.tone ?? 'primary'],
                    )}
                  >
                    {span < 0.75 ? (
                      <span className="truncate font-medium">
                        <span className="tabular-nums font-normal">{hhmm(e.start)}</span> {e.title}
                      </span>
                    ) : (
                      <>
                        <span className="truncate font-medium">{e.title}</span>
                        <span className="truncate tabular-nums font-normal">{timeRange(e)}</span>
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )

  /* ---------------------------------------------------------------- agenda */
  const agenda = () => {
    const days: Date[] = []
    for (let d = startOfMonth(date); d <= endOfMonth(date); d = addDays(d, 1)) days.push(d)
    const withEvents = days.filter((d) => eventsOn(d).length)
    if (!withEvents.length)
      return (
        <EmptyState
          size="compact"
          title="Nenhum evento neste mês"
          description="Use as setas para ver outros meses."
        />
      )
    return (
      <ol className="flex flex-col divide-y">
        {withEvents.map((d) => (
          <li key={d.toISOString()} className="flex flex-col gap-3 p-4 md:flex-row md:gap-6">
            <div className="flex shrink-0 items-baseline gap-2 md:w-24 md:flex-col md:gap-0">
              <span
                className={cn(
                  'text-2xl font-semibold tabular-nums',
                  isToday(d) && 'text-primary-text',
                )}
              >
                {format(d, 'd')}
              </span>
              <span className="text-sm text-muted-foreground capitalize">
                {format(d, 'EEEE', { locale: ptBR })}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <DayList events={eventsOn(d)} onEventClick={onEventClick} />
            </div>
          </li>
        ))}
      </ol>
    )
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(date, WEEK), i))

  return (
    <Card
      className={cn('overflow-hidden', className)}
      aria-label={aria['aria-label'] ?? 'Calendário'}
      role="region"
    >
      {toolbar}
      {shown === 'month' && month()}
      {shown === 'week' && timeGrid(weekDays)}
      {shown === 'day' && timeGrid([date])}
      {shown === 'agenda' && agenda()}
    </Card>
  )
}
