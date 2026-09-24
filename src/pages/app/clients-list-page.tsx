import { Archive, Download, Eye, Mail, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Container, PageHeader, Stack } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Modal } from '@/components/ui/modal'
import { Select } from '@/components/ui/select'
import { Table } from '@/components/ui/table'
import { toast } from '@/components/ui/toast'
import { mockSource } from '@/mocks/api'
import { clients as all, type Client } from '@/mocks/clients'
import { clientColumns } from './client-columns'
import { ClientDrawer } from './client-drawer'

const statuses = ['Ativo', 'Em análise', 'Inadimplente', 'Inativo']
const segments = [...new Set(all.map((c) => c.segment))].sort()

// API de demonstração: pagina, busca em todos os registros e ordena no "servidor".
const clientsApi = mockSource(all, {
  searchIn: (c) => [c.name, c.city, c.email, c.document],
  sortBy: {
    name: (c) => c.name,
    status: (c) => c.status,
    city: (c) => c.city,
    segment: (c) => c.segment,
    email: (c) => c.email,
    revenue: (c) => c.revenue,
    createdAt: (c) => c.createdAt,
  },
})

/**
 * Listagem padrão: título só no header; barra de ferramentas no mesmo card da tabela
 * (busca, ações, Filtros e a ação principal Novo); chips dos filtros; tabela carregada
 * página por página (15 por vez) com busca em todos os registros; paginação no rodapé.
 */
export function ClientsListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string[]>([])
  const [segment, setSegment] = useState<string | null>(null)
  const [drawer, setDrawer] = useState<'create' | 'edit' | null>(null)
  const [toDelete, setToDelete] = useState<Client | null>(null)

  // Filtros da tela vão junto na requisição; queryKey avisa a Table para voltar à página 1.
  const source = useMemo(
    () =>
      clientsApi(
        (c) => (!status.length || status.includes(c.status)) && (!segment || c.segment === segment),
      ),
    [status, segment],
  )
  const filterCount = status.length + (segment ? 1 : 0)
  const clear = () => {
    setStatus([])
    setSegment(null)
  }

  return (
    <Container padded>
      <Stack gap="section">
        <PageHeader title="Clientes" />
        <Table<Client>
          aria-label="Clientes"
          source={source}
          queryKey={`${status.join(',')}|${segment ?? ''}`}
          columns={clientColumns}
          getRowId={(c) => c.id}
          selectable
          columnVisibility
          globalFilter={search}
          empty={{
            title: 'Nenhum cliente ainda',
            description: 'Cadastre o primeiro cliente para começar.',
            action: (
              <Button icon={<Plus />} onClick={() => setDrawer('create')}>
                Novo cliente
              </Button>
            ),
          }}
          rowActions={[
            { label: 'Ver', icon: <Eye />, onClick: (c) => navigate(`/clientes/${c.id}`) },
            { label: 'Editar', icon: <Pencil />, onClick: () => setDrawer('edit') },
            {
              label: 'Enviar e-mail',
              icon: <Mail />,
              onClick: (c) => toast.success('E-mail enviado', { description: c.email }),
            },
            {
              label: 'Excluir',
              icon: <Trash2 />,
              destructive: true,
              onClick: (c) => setToDelete(c),
            },
          ]}
          bulkActions={(sel) => (
            <Button
              size="sm"
              variant="outline"
              icon={<Download />}
              onClick={() => toast.success(`${sel.length} clientes exportados`)}
            >
              Exportar
            </Button>
          )}
          bulkMenu={[
            {
              label: 'Enviar e-mail',
              icon: <Mail />,
              onClick: (sel) => toast.success(`E-mail enviado para ${sel.length}`),
            },
            {
              label: 'Arquivar',
              icon: <Archive />,
              onClick: (sel, c) => {
                toast.info(`${sel.length} arquivados`)
                c()
              },
            },
            {
              label: 'Excluir',
              icon: <Trash2 />,
              destructive: true,
              onClick: (sel, c) => {
                toast.error(`${sel.length} excluídos`)
                c()
              },
            },
          ]}
          toolbar={{
            search: {
              value: search,
              onChange: setSearch,
              placeholder: 'Buscar por nome, cidade ou e-mail',
            },
            primaryAction: (
              <Button size="sm" icon={<Plus />} onClick={() => setDrawer('create')}>
                Novo cliente
              </Button>
            ),
            filterCount,
            onClearFilters: filterCount ? clear : undefined,
            chips: [
              ...status.map((s) => ({
                id: `s-${s}`,
                label: `Situação: ${s}`,
                onRemove: () => setStatus(status.filter((x) => x !== s)),
              })),
              ...(segment
                ? [{ id: 'seg', label: `Segmento: ${segment}`, onRemove: () => setSegment(null) }]
                : []),
            ],
            filters: (
              <Stack gap="4">
                <Field label="Situação" compact>
                  <Select
                    multiple
                    label="Situação"
                    value={status}
                    onChange={setStatus}
                    options={statuses.map((s) => ({ value: s, label: s }))}
                  />
                </Field>
                <Field label="Segmento" compact>
                  <Select
                    label="Segmento"
                    clearable
                    value={segment}
                    onChange={setSegment}
                    options={segments.map((s) => ({ value: s, label: s }))}
                  />
                </Field>
              </Stack>
            ),
            actions: (
              <Button
                variant="outline"
                size="sm"
                icon={<Download />}
                onClick={() => toast.info('Exportação iniciada')}
              >
                Exportar
              </Button>
            ),
          }}
        />
      </Stack>
      <ClientDrawer
        open={drawer !== null}
        mode={drawer ?? 'create'}
        onOpenChange={(o) => !o && setDrawer(null)}
      />
      <Modal
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
        type="destructive"
        title={`Excluir ${toDelete?.name ?? 'cliente'}?`}
        description="Esta ação não pode ser desfeita. Contratos e histórico também serão removidos."
        confirmLabel="Excluir cliente"
        onConfirm={async () => {
          await new Promise((r) => window.setTimeout(r, 800))
          toast.error('Cliente excluído')
        }}
      />
    </Container>
  )
}
