import {
  CalendarClock,
  Check,
  Download,
  LayoutGrid,
  Plus,
  RotateCcw,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Container, PageHeader, Stack } from '@/components/layout'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Chart } from '@/components/ui/chart'
import { List } from '@/components/ui/list'
import { StatCard } from '@/components/ui/stat-card'
import { Timeline } from '@/components/ui/timeline'
import { toast } from '@/components/ui/toast'
import { resetWidgetLayout, WidgetGrid, type Widget } from '@/components/ui/widget-grid'
import { formatCurrency } from '@/lib/masks'
import { bySegment, clients, contractsMix, monthly, salesFunnel, statusTone } from '@/mocks/clients'
import { ClientDrawer } from './client-drawer'

const mil = (n: number) =>
  `R$ ${(n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} mil`

const LAYOUT_KEY = 'ui-dashboard-layout'

/** Card de widget: ocupa a altura do espaço e o conteúdo cresce junto. */
function Panel({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="md:flex-row md:items-start md:justify-between">
        <Stack gap="1">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </Stack>
        {actions}
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col">{children}</CardContent>
    </Card>
  )
}

/**
 * Painel em widgets. "Ajustar dashboard" libera arrastar (pela alça no topo) e
 * redimensionar (pelo canto) cada widget; os outros se encaixam sozinhos, e a arrumação fica
 * salva no navegador. "Restaurar padrão" volta à arrumação original.
 */
export function DashboardPage() {
  const [period, setPeriod] = useState('12m')
  const [drawer, setDrawer] = useState(false)
  const [editing, setEditing] = useState(false)
  const [version, setVersion] = useState(0)
  const recent = clients.slice(0, 5)
  const data = period === '6m' ? monthly.slice(-6) : monthly

  const widgets = useMemo<Widget[]>(
    () => [
      {
        id: 'receita',
        w: 3,
        h: 3,
        content: (
          <StatCard
            highlight
            className="h-full"
            label="Receita do mês"
            value={formatCurrency(61300)}
            change={4.4}
            changeLabel="vs. agosto"
            icon={<Wallet />}
          />
        ),
      },
      {
        id: 'ativos',
        w: 3,
        h: 3,
        content: (
          <StatCard
            className="h-full"
            label="Clientes ativos"
            value="1.284"
            change={2.1}
            changeLabel="vs. agosto"
            icon={<Users />}
          />
        ),
      },
      {
        id: 'ticket',
        w: 3,
        h: 3,
        content: (
          <StatCard
            className="h-full"
            label="Ticket médio"
            value={formatCurrency(478.4)}
            change={-1.2}
            changeLabel="vs. agosto"
            icon={<TrendingUp />}
          />
        ),
      },
      {
        id: 'vencem',
        w: 3,
        h: 3,
        content: (
          <StatCard
            className="h-full"
            label="Vencem esta semana"
            value="23"
            change={0}
            changeLabel="contratos"
            icon={<CalendarClock />}
          />
        ),
      },
      {
        id: 'evolucao',
        w: 8,
        h: 8,
        minW: 4,
        minH: 6,
        content: (
          <Panel
            title="Receita e meta"
            description="Faturado por mês comparado à meta."
            actions={
              <ButtonGroup
                aria-label="Período"
                size="sm"
                value={period}
                onChange={setPeriod}
                options={[
                  { value: '6m', label: '6 meses' },
                  { value: '12m', label: '12 meses' },
                ]}
              />
            }
          >
            <Chart
              aria-label="Receita e meta por mês"
              type="area"
              height="fill"
              data={data}
              xKey="mes"
              series={[
                { key: 'receita', label: 'Receita' },
                { key: 'meta', label: 'Meta', color: 3 },
              ]}
              valueFormatter={mil}
            />
          </Panel>
        ),
      },
      {
        id: 'segmentos',
        w: 4,
        h: 8,
        minH: 6,
        content: (
          <Panel title="Clientes por segmento" description="Distribuição da carteira.">
            <Chart
              aria-label="Clientes por segmento"
              type="pie"
              height="fill"
              data={bySegment}
              xKey="segmento"
              series={[{ key: 'clientes', label: 'Clientes' }]}
            />
          </Panel>
        ),
      },
      {
        id: 'meta',
        w: 4,
        h: 10,
        minH: 8,
        content: (
          <Panel title="Meta do mês" description="Receita faturada até hoje.">
            <Chart
              aria-label="Receita do mês comparada à meta"
              type="gauge"
              value={61300}
              max={80000}
              target={70000}
              label="Receita de setembro"
              valueFormatter={mil}
            />
          </Panel>
        ),
      },
      {
        id: 'funil',
        w: 8,
        h: 10,
        minW: 4,
        minH: 8,
        content: (
          <Panel
            title="Funil de vendas"
            description="Etapas do kanban e conversão entre elas, neste mês."
          >
            <Chart aria-label="Funil de vendas do mês" type="funnel" stages={salesFunnel} />
          </Panel>
        ),
      },
      {
        id: 'receita-barras',
        w: 4,
        h: 8,
        minH: 6,
        content: (
          <Panel title="Receita e meta" description="Barras com a receita e linha com a meta.">
            <Chart
              aria-label="Receita em barras e meta em linha, por mês"
              type="combo"
              height="fill"
              data={monthly.slice(-6)}
              xKey="mes"
              series={[
                { key: 'receita', label: 'Receita' },
                { key: 'meta', label: 'Meta', kind: 'line', color: 3 },
              ]}
              valueFormatter={mil}
            />
          </Panel>
        ),
      },
      {
        id: 'contratos',
        w: 4,
        h: 8,
        minH: 6,
        content: (
          <Panel title="Contratos" description="Novos e renovados, com a meta de contratos.">
            <Chart
              aria-label="Contratos novos e renovados em barras e meta em linha"
              type="combo"
              height="fill"
              data={contractsMix.slice(-6)}
              xKey="mes"
              series={[
                { key: 'novos', label: 'Novos' },
                { key: 'renovacoes', label: 'Renovações', color: 2 },
                { key: 'meta', label: 'Meta', kind: 'line', color: 3 },
              ]}
            />
          </Panel>
        ),
      },
      {
        id: 'carteira',
        w: 4,
        h: 8,
        minH: 6,
        content: (
          <Panel title="Carteira por segmento" description="Uma cor por segmento.">
            <Chart
              aria-label="Clientes por segmento em barras coloridas"
              type="bar"
              height="fill"
              colorByCategory
              data={bySegment}
              xKey="segmento"
              series={[{ key: 'clientes', label: 'Clientes' }]}
            />
          </Panel>
        ),
      },
      {
        id: 'recentes',
        w: 8,
        h: 9,
        minW: 4,
        minH: 6,
        content: (
          <Panel
            title="Clientes recentes"
            actions={
              <Button asChild variant="ghost" size="sm">
                <Link to="/clientes">Ver todos</Link>
              </Button>
            }
          >
            <div className="min-h-0 flex-1 scrollbar-subtle overflow-y-auto">
              <List
                items={recent.map((c) => ({
                  id: c.id,
                  title: c.name,
                  description: `${c.city} · ${formatCurrency(c.revenue)}/mês`,
                  leading: <Avatar name={c.name} />,
                  trailing: (
                    <Badge tone={statusTone[c.status]} dot>
                      {c.status}
                    </Badge>
                  ),
                  to: `/clientes/${c.id}`,
                }))}
              />
            </div>
          </Panel>
        ),
      },
      {
        id: 'atividade',
        w: 4,
        h: 9,
        minH: 6,
        content: (
          <Panel title="Atividade">
            <div className="min-h-0 flex-1 scrollbar-subtle overflow-y-auto">
              <Timeline
                events={[
                  {
                    id: '1',
                    title: 'Contrato 1042 assinado',
                    date: 'hoje, 14:30',
                    tone: 'success',
                  },
                  {
                    id: '2',
                    title: 'Proposta enviada a Clínica Vida Plena',
                    date: 'hoje, 09:10',
                    tone: 'info',
                  },
                  {
                    id: '3',
                    title: 'Fatura de agosto em atraso',
                    description: 'Oficina Rota Sul 13',
                    date: 'ontem',
                    tone: 'error',
                  },
                  { id: '4', title: '3 clientes cadastrados', date: '20/09/2026' },
                ]}
              />
            </div>
          </Panel>
        ),
      },
    ],
    [data, period, recent],
  )

  return (
    <Container padded>
      <Stack gap="section">
        <PageHeader
          title="Painel"
          help={
            <>
              <p>Indicadores e gráficos do mês, comparados ao mês anterior e à meta.</p>
              <p>
                Em Ajustar dashboard, arraste cada widget pela alça no topo e redimensione pelo
                canto inferior direito. Restaurar padrão volta ao layout original.
              </p>
            </>
          }
          actions={
            editing ? (
              <>
                <Button
                  variant="outline"
                  icon={<RotateCcw />}
                  onClick={() => {
                    resetWidgetLayout(LAYOUT_KEY)
                    setVersion((v) => v + 1)
                  }}
                >
                  Restaurar padrão
                </Button>
                <Button icon={<Check />} onClick={() => setEditing(false)}>
                  Concluir ajustes
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  icon={<LayoutGrid />}
                  className="max-md:hidden"
                  onClick={() => setEditing(true)}
                >
                  Ajustar dashboard
                </Button>
                <Button
                  variant="outline"
                  icon={<Download />}
                  onClick={() => toast.info('Relatório em preparação')}
                >
                  Relatório
                </Button>
                <Button icon={<Plus />} onClick={() => setDrawer(true)}>
                  Novo cliente
                </Button>
              </>
            )
          }
        />
        <WidgetGrid key={version} widgets={widgets} editable={editing} storageKey={LAYOUT_KEY} />
      </Stack>
      <ClientDrawer open={drawer} onOpenChange={setDrawer} />
    </Container>
  )
}
