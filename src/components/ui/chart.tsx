import { BarChart3, List as ListIcon } from 'lucide-react'
import { useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { cn } from '@/lib/cn'

export interface ChartSeries {
  /** Chave no objeto de dados. */
  key: string
  label: string
  /** Índice da cor do template (1 a 5). Padrão: na ordem das séries. */
  color?: 1 | 2 | 3 | 4 | 5
}

export interface ChartProps {
  type: 'line' | 'bar' | 'area' | 'pie'
  data: Record<string, string | number>[]
  /** Chave da categoria (eixo X ou fatias da pizza). */
  xKey: string
  series: ChartSeries[]
  valueFormatter?: (n: number) => string
  /** Altura: sm (12rem) ou md (16rem). */
  height?: 'sm' | 'md'
  /** Acima deste número de pontos, o mobile oferece ver como lista. */
  listThreshold?: number
  'aria-label': string
  className?: string
}

// Lê as variáveis do tema direto (as --color-* do Tailwind são inline e não existem no CSS).
const palette = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5', '--ring']
const colorVar = (i: number) => `var(${palette[(i - 1) % palette.length]})`
const fmtDefault = (n: number) => n.toLocaleString('pt-BR')

/**
 * Gráfico único (linha, barra, área, pizza) com as cores do template.
 * Mobile: legenda abaixo, eixos simplificados e alternância para lista de valores.
 */
export function Chart({
  type,
  data,
  xKey,
  series,
  valueFormatter = fmtDefault,
  height = 'md',
  listThreshold = 8,
  className,
  ...aria
}: ChartProps) {
  const { isMobile } = useBreakpoint()
  const [asList, setAsList] = useState(false)
  const canList = isMobile && data.length > listThreshold
  const showList = canList && asList
  const colors = series.map((s, i) => colorVar(s.color ?? i + 1))

  const axis = {
    stroke: 'var(--muted-foreground)',
    fontSize: 12,
    tickLine: false,
    axisLine: false,
  }
  const tooltip = (
    <Tooltip
      cursor={{ fill: 'var(--muted)', stroke: 'var(--border)' }}
      formatter={(v) => valueFormatter(Number(v))}
      contentStyle={{
        background: 'var(--popover)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--shape-control)',
        color: 'var(--popover-foreground)',
        fontSize: 12,
      }}
    />
  )
  const legend = (
    <Legend
      verticalAlign="bottom"
      iconType="circle"
      iconSize={8}
      wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
    />
  )
  const common = { data, margin: { top: 8, right: 8, left: isMobile ? -16 : 0, bottom: 0 } }
  const xAxis = (
    <XAxis dataKey={xKey} {...axis} interval="preserveStartEnd" minTickGap={isMobile ? 24 : 12} />
  )
  const yAxis = (
    <YAxis
      {...axis}
      width={isMobile ? 72 : 80}
      tickCount={isMobile ? 3 : 5}
      tickFormatter={(v) => valueFormatter(Number(v))}
    />
  )
  const grid = <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />

  let chart
  if (type === 'pie') {
    const s = series[0]
    chart = (
      <PieChart>
        <Pie
          data={data}
          dataKey={s?.key ?? ''}
          nameKey={xKey}
          innerRadius="55%"
          outerRadius="85%"
          paddingAngle={2}
          stroke="var(--card)"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colorVar(i + 1)} />
          ))}
        </Pie>
        {tooltip}
        {legend}
      </PieChart>
    )
  } else if (type === 'bar') {
    chart = (
      <BarChart {...common}>
        {grid}
        {xAxis}
        {yAxis}
        {tooltip}
        {series.length > 1 && legend}
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            fill={colors[i]}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        ))}
      </BarChart>
    )
  } else if (type === 'area') {
    chart = (
      <AreaChart {...common}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key} id={`area-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors[i]} stopOpacity={0.3} />
              <stop offset="100%" stopColor={colors[i]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {grid}
        {xAxis}
        {yAxis}
        {tooltip}
        {series.length > 1 && legend}
        {series.map((s, i) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={colors[i]}
            strokeWidth={2}
            fill={`url(#area-${s.key})`}
          />
        ))}
      </AreaChart>
    )
  } else {
    chart = (
      <LineChart {...common}>
        {grid}
        {xAxis}
        {yAxis}
        {tooltip}
        {series.length > 1 && legend}
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={colors[i]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    )
  }

  return (
    <figure
      className={cn('flex min-w-0 flex-col gap-3', className)}
      aria-label={aria['aria-label']}
    >
      {canList && (
        <Button
          variant="ghost"
          size="sm"
          className="self-end"
          icon={asList ? <BarChart3 /> : <ListIcon />}
          onClick={() => setAsList((v) => !v)}
        >
          {asList ? 'Ver gráfico' : 'Ver como lista'}
        </Button>
      )}
      {showList ? (
        <ul className="flex flex-col divide-y">
          {data.map((d) => (
            <li
              key={String(d[xKey])}
              className="flex items-center justify-between gap-3 py-2 text-sm"
            >
              <span className="text-muted-foreground">{String(d[xKey])}</span>
              <span className="flex gap-3 font-medium tabular-nums">
                {series.map((s) => (
                  <span key={s.key}>{valueFormatter(Number(d[s.key]))}</span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className={cn('w-full', height === 'sm' ? 'h-chart-sm' : 'h-chart-md')}>
          <ResponsiveContainer width="100%" height="100%">
            {chart}
          </ResponsiveContainer>
        </div>
      )}
      <figcaption className="sr-only">{aria['aria-label']}</figcaption>
    </figure>
  )
}
