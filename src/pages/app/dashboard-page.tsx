import { CalendarClock, Download, Plus, TrendingUp, Users, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Container, Grid, PageHeader, Section, Stack } from '@/components/layout'
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
import { formatCurrency } from '@/lib/masks'
import { bySegment, clients, monthly, statusTone } from '@/mocks/clients'
import { ClientDrawer } from './client-drawer'

const mil = (n: number) =>
  `R$ ${(n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} mil`

/** Painel: indicadores, evolução, distribuição e atividade recente. */
export function DashboardPage() {
  const [period, setPeriod] = useState('12m')
  const [drawer, setDrawer] = useState(false)
  const recent = clients.slice(0, 5)
  const data = period === '6m' ? monthly.slice(-6) : monthly

  return (
    <Container padded>
      <Stack gap="section">
        <PageHeader
          title="Painel"
          description="Visão rápida da operação neste mês."
          actions={
            <>
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
          }
        />

        <Grid cols={{ base: 1, sm: 2, xl: 4 }}>
          <StatCard
            highlight
            label="Receita do mês"
            value={formatCurrency(61300)}
            change={4.4}
            changeLabel="vs. agosto"
            icon={<Wallet />}
          />
          <StatCard
            label="Clientes ativos"
            value="1.284"
            change={2.1}
            changeLabel="vs. agosto"
            icon={<Users />}
          />
          <StatCard
            label="Ticket médio"
            value={formatCurrency(478.4)}
            change={-1.2}
            changeLabel="vs. agosto"
            icon={<TrendingUp />}
          />
          <StatCard
            label="Vencem esta semana"
            value="23"
            change={0}
            changeLabel="contratos"
            icon={<CalendarClock />}
          />
        </Grid>

        <Grid cols={{ base: 1, lg: 3 }}>
          <Card className="lg:col-span-2">
            <CardHeader className="md:flex-row md:items-start md:justify-between">
              <Stack gap="1">
                <CardTitle>Receita e meta</CardTitle>
                <CardDescription>Faturado por mês comparado à meta.</CardDescription>
              </Stack>
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
            </CardHeader>
            <CardContent>
              <Chart
                aria-label="Receita e meta por mês"
                type="area"
                data={data}
                xKey="mes"
                series={[
                  { key: 'receita', label: 'Receita' },
                  { key: 'meta', label: 'Meta', color: 3 },
                ]}
                valueFormatter={mil}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Clientes por segmento</CardTitle>
              <CardDescription>Distribuição da carteira.</CardDescription>
            </CardHeader>
            <CardContent>
              <Chart
                aria-label="Clientes por segmento"
                type="pie"
                data={bySegment}
                xKey="segmento"
                series={[{ key: 'clientes', label: 'Clientes' }]}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid cols={{ base: 1, lg: 3 }}>
          <Section
            title="Clientes recentes"
            className="lg:col-span-2"
            actions={
              <Button asChild variant="ghost" size="sm">
                <Link to="/clientes">Ver todos</Link>
              </Button>
            }
          >
            <Card>
              <CardContent>
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
              </CardContent>
            </Card>
          </Section>
          <Section title="Atividade">
            <Card>
              <CardContent>
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
              </CardContent>
            </Card>
          </Section>
        </Grid>
      </Stack>
      <ClientDrawer open={drawer} onOpenChange={setDrawer} />
    </Container>
  )
}
