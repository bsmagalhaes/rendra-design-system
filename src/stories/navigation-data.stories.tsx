import type { Meta, StoryObj } from '@storybook/react-vite'
import { Eye, Pencil, Trash2, Users, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Accordion } from '@/components/ui/accordion'
import { Avatar, AvatarGroup } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Chart } from '@/components/ui/chart'
import { List } from '@/components/ui/list'
import { Pagination } from '@/components/ui/pagination'
import { StatCard } from '@/components/ui/stat-card'
import { Table } from '@/components/ui/table'
import { Tabs } from '@/components/ui/tabs'
import { Timeline } from '@/components/ui/timeline'
import { Stepper } from '@/components/ui/wizard'
import { formatCurrency } from '@/lib/masks'
import { bySegment, clients, monthly, statusTone, type Client } from '@/mocks/clients'
import { clientColumns } from '@/pages/app/client-columns'

/* ------------------------------------------------ Table (componente central) */

const meta = {
  title: 'Dados/Table, navegação e dados',
  component: Table<Client>,
  args: {
    'aria-label': 'Clientes',
    data: clients,
    columns: clientColumns,
    getRowId: (c: Client) => c.id,
    selectable: true,
    columnVisibility: true,
    density: 'default',
    loading: false,
    pageSize: 8,
  },
  argTypes: {
    density: { control: 'inline-radio', options: ['compact', 'default', 'comfortable'] },
    mobilePagination: { control: 'inline-radio', options: ['pages', 'loadMore'] },
    data: { control: false },
    columns: { control: false },
  },
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="p-4">
      <Table<Client>
        {...args}
        rowActions={[
          { label: 'Ver', icon: <Eye />, onClick: () => {} },
          { label: 'Editar', icon: <Pencil />, onClick: () => {} },
          { label: 'Excluir', icon: <Trash2 />, destructive: true, onClick: () => {} },
        ]}
        bulkMenu={[{ label: 'Arquivar', onClick: () => {} }]}
      />
    </div>
  ),
} satisfies Meta<typeof Table<Client>>
export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = {}
export const Carregando: Story = { args: { loading: true } }
export const Vazia: Story = {
  args: { data: [], empty: { title: 'Nenhum cliente ainda', description: 'Cadastre o primeiro.' } },
}
export const ComErro: Story = {
  args: { error: 'O servidor não respondeu a tempo.', onRetry: () => {} },
}
export const Compacta: Story = { args: { density: 'compact' } }
export const Expansivel: Story = {
  args: { expandable: (c: Client) => <p className="text-sm">{c.notes}</p> },
}
export const CarregarMaisNoMobile: Story = { args: { mobilePagination: 'loadMore' } }

/* ------------------------------------------------ Navegação */

export const Abas: Story = {
  name: 'Tabs (linha e pílula)',
  render: () => (
    <div className="flex flex-col gap-8">
      <Tabs
        aria-label="Seções"
        items={['Resumo', 'Contratos', 'Histórico'].map((l) => ({
          value: l,
          label: l,
          content: <p className="text-sm">{l}</p>,
        }))}
      />
      <Tabs
        variant="pill"
        aria-label="Período"
        items={['Hoje', 'Semana', 'Mês'].map((l) => ({
          value: l,
          label: l,
          content: <p className="text-sm">{l}</p>,
        }))}
      />
      <Tabs
        aria-label="Muitas abas"
        items={[
          'Dados gerais',
          'Endereços',
          'Contatos',
          'Contratos',
          'Faturas',
          'Documentos',
          'Histórico',
        ].map((l) => ({ value: l, label: l, content: <p className="text-sm">{l}</p> }))}
      />
    </div>
  ),
}
export const Trilha: Story = {
  name: 'Breadcrumb',
  render: () => (
    <Breadcrumb
      items={[
        { label: 'Painel', to: '/' },
        { label: 'Clientes', to: '/clientes' },
        { label: 'Detalhe' },
      ]}
    />
  ),
}

function PaginationDemo() {
  const [p, setP] = useState(3)
  return (
    <Pagination
      page={p}
      pageSize={10}
      total={243}
      onPageChange={setP}
      onPageSizeChange={() => {}}
    />
  )
}
export const Paginacao: Story = { name: 'Pagination', render: () => <PaginationDemo /> }
export const Etapas: Story = {
  name: 'Stepper (concluída, com erro, atual, pendente)',
  render: () => (
    <Stepper
      current={2}
      errors={[1]}
      steps={[
        { id: '1', title: 'Dados' },
        { id: '2', title: 'Endereço' },
        { id: '3', title: 'Contrato' },
        { id: '4', title: 'Revisão' },
      ]}
    />
  ),
}

/* ------------------------------------------------ Dados */

export const Indicadores: Story = {
  name: 'StatCard',
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2">
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
        change={-2.1}
        changeLabel="vs. agosto"
        icon={<Users />}
      />
    </div>
  ),
}
export const Cartao: Story = {
  name: 'Card',
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Contrato 1042</CardTitle>
        <CardDescription>Vigente até 31/12/2026</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Plano mensal.</p>
      </CardContent>
    </Card>
  ),
}
export const Etiquetas: Story = {
  name: 'Badge',
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Neutro</Badge>
      <Badge tone="success" dot>
        Ativo
      </Badge>
      <Badge tone="warning" dot>
        Em análise
      </Badge>
      <Badge tone="error" solid>
        Atrasado
      </Badge>
      <Badge tone="info">Novo</Badge>
    </div>
  ),
}
export const Avatares: Story = {
  name: 'Avatar e grupo',
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar name="Ana Ribeiro" size="lg" />
      <AvatarGroup
        people={['Ana Ribeiro', 'Bruno Costa', 'Carla Mendes', 'Diego Lima', 'Elisa Souza'].map(
          (name) => ({ name }),
        )}
        max={3}
      />
    </div>
  ),
}
export const Lista: Story = {
  render: () => (
    <List
      items={clients.slice(0, 4).map((c) => ({
        id: c.id,
        title: c.name,
        description: c.city,
        leading: <Avatar name={c.name} />,
        trailing: (
          <Badge tone={statusTone[c.status]} dot>
            {c.status}
          </Badge>
        ),
        to: `/clientes/${c.id}`,
      }))}
    />
  ),
}
export const LinhaDoTempo: Story = {
  name: 'Timeline',
  render: () => (
    <Timeline
      events={[
        { id: '1', title: 'Contrato assinado', date: '22/09/2026', tone: 'success' },
        { id: '2', title: 'Proposta enviada', date: '18/09/2026', tone: 'info' },
        { id: '3', title: 'Cadastro', date: '02/09/2026' },
      ]}
    />
  ),
}
export const Acordeao: Story = {
  name: 'Accordion',
  render: () => (
    <Accordion
      items={[
        { value: '1', title: 'Pergunta um', content: 'Resposta um.' },
        { value: '2', title: 'Pergunta dois', content: 'Resposta dois.' },
      ]}
    />
  ),
}
export const GraficoArea: Story = {
  name: 'Chart: área',
  render: () => (
    <Chart
      aria-label="Receita"
      type="area"
      data={monthly}
      xKey="mes"
      series={[
        { key: 'receita', label: 'Receita' },
        { key: 'meta', label: 'Meta', color: 3 },
      ]}
    />
  ),
}
export const GraficoBarra: Story = {
  name: 'Chart: barra',
  render: () => (
    <Chart
      aria-label="Receita"
      type="bar"
      data={monthly}
      xKey="mes"
      series={[{ key: 'receita', label: 'Receita' }]}
    />
  ),
}
export const GraficoLinha: Story = {
  name: 'Chart: linha',
  render: () => (
    <Chart
      aria-label="Receita"
      type="line"
      data={monthly}
      xKey="mes"
      series={[
        { key: 'receita', label: 'Receita' },
        { key: 'meta', label: 'Meta', color: 3 },
      ]}
    />
  ),
}
export const GraficoPizza: Story = {
  name: 'Chart: pizza',
  render: () => (
    <Chart
      aria-label="Segmentos"
      type="pie"
      data={bySegment}
      xKey="segmento"
      series={[{ key: 'clientes', label: 'Clientes' }]}
    />
  ),
}
