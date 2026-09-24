import {
  FileText,
  History,
  Mail,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Phone,
  Trash2,
  User,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Container, Grid, PageHeader, Stack } from '@/components/layout'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorPage } from '@/components/ui/error-page'
import { Modal } from '@/components/ui/modal'
import { Separator } from '@/components/ui/separator'
import { Table } from '@/components/ui/table'
import { Tabs } from '@/components/ui/tabs'
import { Timeline } from '@/components/ui/timeline'
import { toast } from '@/components/ui/toast'
import { Upload } from '@/components/ui/upload'
import { formatCurrency } from '@/lib/masks'
import { clients, statusTone } from '@/mocks/clients'
import { fakeUpload } from '@/pages/showcase/demo'
import { ClientDrawer } from './client-drawer'

interface Contract {
  id: string
  plano: string
  inicio: string
  valor: number
  situacao: 'Vigente' | 'Encerrado'
}

const contracts: Contract[] = [
  { id: 'C-1042', plano: 'Profissional', inicio: '2026-01-10', valor: 1250, situacao: 'Vigente' },
  { id: 'C-0981', plano: 'Essencial', inicio: '2025-03-02', valor: 490, situacao: 'Encerrado' },
  { id: 'C-0870', plano: 'Essencial', inicio: '2024-06-15', valor: 390, situacao: 'Encerrado' },
]

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm font-medium">{value}</dd>
    </div>
  )
}

/** Detalhe com abas: resumo, contratos, histórico e documentos. */
export function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const client = clients.find((c) => c.id === id) ?? clients[0]
  const [edit, setEdit] = useState(false)
  const [del, setDel] = useState(false)
  if (!client) return <ErrorPage code={404} />

  return (
    <Container padded>
      <Stack gap="section">
        <PageHeader
          showTitle
          title={
            <span className="flex min-w-0 items-center gap-3">
              <Avatar name={client.name} size="lg" />
              <span className="min-w-0 truncate">{client.name}</span>
            </span>
          }
          description={
            <span className="flex flex-wrap items-center gap-2">
              <Badge tone={statusTone[client.status]} dot>
                {client.status}
              </Badge>
              {client.segment} · {client.city}
            </span>
          }
          actions={
            <>
              <Button variant="outline" icon={<Pencil />} onClick={() => setEdit(true)}>
                Editar
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" iconOnly aria-label="Mais ações" className="flex-none">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => toast.success('E-mail enviado')}>
                    <Mail aria-hidden />
                    Enviar e-mail
                  </DropdownMenuItem>
                  <DropdownMenuItem destructive onSelect={() => setDel(true)}>
                    <Trash2 aria-hidden />
                    Excluir cliente
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          }
        />

        <Tabs
          aria-label="Seções do cliente"
          items={[
            {
              value: 'resumo',
              label: 'Resumo',
              icon: <User />,
              content: (
                <Grid cols={{ base: 1, lg: 3 }}>
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Dados do cliente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Stack gap="6">
                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Info label="CPF ou CNPJ" value={client.document} />
                          <Info label="Responsável" value={client.owner} />
                          <Info label="E-mail" value={client.email} />
                          <Info label="Telefone" value={client.phone} />
                        </dl>
                        <Separator />
                        <Stack gap="2">
                          <p className="text-sm font-semibold">Observações</p>
                          <p className="text-sm text-muted-foreground">{client.notes}</p>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-soft">
                    <CardHeader
                      actions={
                        <Button variant="outline" icon={<Phone />}>
                          Ligar
                        </Button>
                      }
                    >
                      <CardTitle>Receita mensal</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-semibold tracking-tight tabular-nums">
                        {formatCurrency(client.revenue)}
                      </p>
                    </CardContent>
                  </Card>
                </Grid>
              ),
            },
            {
              value: 'contratos',
              label: 'Contratos',
              icon: <FileText />,
              count: contracts.length,
              content: (
                <Table<Contract>
                  aria-label="Contratos do cliente"
                  data={contracts}
                  getRowId={(c) => c.id}
                  columns={[
                    { id: 'id', header: 'Contrato', accessor: (c) => c.id, mobile: 'primary' },
                    { id: 'plano', header: 'Plano', accessor: (c) => c.plano, mobile: 'primary' },
                    {
                      id: 'situacao',
                      header: 'Situação',
                      accessor: (c) => c.situacao,
                      kind: 'badge',
                      badgeTone: (c) => (c.situacao === 'Vigente' ? 'success' : 'neutral'),
                      mobile: 'primary',
                    },
                    {
                      id: 'inicio',
                      header: 'Início',
                      accessor: (c) => c.inicio,
                      kind: 'date',
                      mobile: 'secondary',
                    },
                    {
                      id: 'valor',
                      header: 'Valor mensal',
                      accessor: (c) => c.valor,
                      kind: 'currency',
                      mobile: 'secondary',
                    },
                  ]}
                  rowActions={[
                    {
                      label: 'Abrir contrato',
                      icon: <FileText />,
                      onClick: (c) => toast.info(`Abrindo ${c.id}`),
                    },
                  ]}
                />
              ),
            },
            {
              value: 'historico',
              label: 'Histórico',
              icon: <History />,
              content: (
                <Card>
                  <CardContent>
                    <Timeline
                      events={[
                        {
                          id: '1',
                          title: 'Contrato C-1042 assinado',
                          description: 'Plano Profissional, 12 meses.',
                          date: '10/01/2026',
                          tone: 'success',
                        },
                        {
                          id: '2',
                          title: 'Pagamento em atraso',
                          description: 'Fatura de dezembro, regularizada em 3 dias.',
                          date: '05/01/2026',
                          tone: 'warning',
                        },
                        { id: '3', title: 'Contrato C-0981 encerrado', date: '02/03/2025' },
                        { id: '4', title: 'Cliente cadastrado', date: '15/06/2024', tone: 'info' },
                      ]}
                    />
                  </CardContent>
                </Card>
              ),
            },
            {
              value: 'documentos',
              label: 'Documentos',
              icon: <Paperclip />,
              content: (
                <Grid cols={{ base: 1, lg: 2 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Enviar documentos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Upload accept="image/*,.pdf" maxSizeMb={10} onUpload={fakeUpload} />
                    </CardContent>
                  </Card>
                  <Card>
                    <EmptyState
                      size="compact"
                      title="Nenhum documento ainda"
                      description="Os arquivos enviados aparecem aqui."
                    />
                  </Card>
                </Grid>
              ),
            },
          ]}
        />
      </Stack>
      <ClientDrawer open={edit} onOpenChange={setEdit} mode="edit" />
      <Modal
        open={del}
        onOpenChange={setDel}
        type="destructive"
        title={`Excluir ${client.name}?`}
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir cliente"
        onConfirm={async () => {
          await new Promise((r) => window.setTimeout(r, 800))
          toast.error('Cliente excluído')
          navigate('/clientes')
        }}
      />
    </Container>
  )
}
