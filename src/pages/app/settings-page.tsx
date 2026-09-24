import { Bell, Building2, LayoutTemplate, Lock, Palette, User } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useBrand } from '@/brand'
import type { ColorMode } from '@/brand/brand-context'
import { useShell } from '@/components/app-shell/shell-context'
import { Container, Grid, PageHeader, Stack } from '@/components/layout'
import { ActionBar } from '@/components/ui/action-bar'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { RadioGroup } from '@/components/ui/radio-group'
import { Select } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/toast'
import { layoutOptions, type ShellLayout } from '@/config/layout'
import { currentUser } from '@/config/navigation'
import { cn } from '@/lib/cn'
import { shapeLabels } from '@/lib/shape'

const sections = [
  { id: 'perfil', label: 'Perfil', icon: User },
  { id: 'empresa', label: 'Empresa', icon: Building2 },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
  { id: 'seguranca', label: 'Segurança', icon: Lock },
  { id: 'aparencia', label: 'Aparência', icon: Palette },
  { id: 'layout', label: 'Layout', icon: LayoutTemplate },
] as const
type SectionId = (typeof sections)[number]['id']

const save = () => toast.success('Configurações salvas')

function Panel({
  title,
  description,
  children,
  footer = true,
}: {
  title: string
  description: string
  children: ReactNode
  footer?: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && (
        <div className="border-t p-4 md:px-6">
          <ActionBar
            cancel={{ label: 'Descartar' }}
            primary={{ label: 'Salvar alterações', onClick: save }}
          />
        </div>
      )}
    </Card>
  )
}

function Profile() {
  return (
    <Panel title="Perfil" description="Como você aparece para a equipe.">
      <Stack gap="6">
        <div className="flex items-center gap-4">
          <Avatar name={currentUser.name} size="lg" />
          <Button variant="outline" size="sm">
            Trocar foto
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2">
          <Field label="Nome" required>
            <Input defaultValue={currentUser.name} autoComplete="name" />
          </Field>
          <Field label="Cargo">
            <Input defaultValue={currentUser.role} />
          </Field>
          <Field label="E-mail" required>
            <Input type="email" inputMode="email" defaultValue={currentUser.email} />
          </Field>
          <Field label="Celular">
            <Input mask="phone" defaultValue="(11) 98765-4321" />
          </Field>
        </div>
      </Stack>
    </Panel>
  )
}

function Company() {
  return (
    <Panel title="Empresa" description="Dados que aparecem em propostas e faturas.">
      <div className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2">
        <Field label="Razão social" required span="full">
          <Input defaultValue="Rendra Serviços Ltda." />
        </Field>
        <Field label="CNPJ" required>
          <Input mask="cnpj" defaultValue="12.345.678/0001-95" />
        </Field>
        <Field label="Fuso horário">
          <Select
            label="Fuso horário"
            value="sp"
            options={[
              { value: 'sp', label: 'Brasília (GMT-3)' },
              { value: 'am', label: 'Manaus (GMT-4)' },
            ]}
          />
        </Field>
        <Field label="CEP">
          <Input mask="cep" defaultValue="01310-100" />
        </Field>
        <Field label="Cidade">
          <Input defaultValue="São Paulo" />
        </Field>
      </div>
    </Panel>
  )
}

function Notifications() {
  return (
    <Panel title="Notificações" description="Escolha o que chega até você e por qual canal.">
      <Stack gap="0">
        <Switch
          label="Resumo diário por e-mail"
          description="Pendências e vencimentos do dia, às 8h."
          defaultChecked
        />
        <Separator />
        <Switch
          label="Contrato assinado"
          description="Aviso na hora em que o cliente assina."
          defaultChecked
        />
        <Separator />
        <Switch
          label="Pagamento em atraso"
          description="Quando uma fatura passa do vencimento."
          defaultChecked
        />
        <Separator />
        <Switch label="Novidades do produto" description="No máximo um e-mail por mês." />
      </Stack>
    </Panel>
  )
}

function Security() {
  const [confirm, setConfirm] = useState(false)
  return (
    <Stack gap="6">
      <Panel title="Senha" description="Troque a senha periodicamente.">
        <div className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2">
          <Field label="Senha atual" required span="full">
            <Input type="password" autoComplete="current-password" />
          </Field>
          <Field label="Senha nova" required help="8 ou mais caracteres.">
            <Input type="password" autoComplete="new-password" />
          </Field>
          <Field label="Confirmar senha nova" required>
            <Input type="password" autoComplete="new-password" />
          </Field>
        </div>
      </Panel>
      <Panel
        title="Verificação em duas etapas"
        description="Pede um código a cada novo acesso."
        footer={false}
      >
        <Switch
          label="Ativar verificação em duas etapas"
          description="Código enviado por e-mail."
          defaultChecked
        />
      </Panel>
      <Card>
        <CardHeader>
          <CardTitle>Encerrar sessões</CardTitle>
          <CardDescription>Sai de todos os outros aparelhos conectados.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setConfirm(true)}>
            Encerrar outras sessões
          </Button>
        </CardContent>
      </Card>
      <Modal
        open={confirm}
        onOpenChange={setConfirm}
        type="destructive"
        title="Encerrar outras sessões?"
        description="Quem estiver conectado em outros aparelhos precisará entrar de novo."
        confirmLabel="Encerrar sessões"
        onConfirm={async () => {
          await new Promise((r) => window.setTimeout(r, 800))
          toast.success('Sessões encerradas')
        }}
      />
    </Stack>
  )
}

function Appearance() {
  const { brand, brands, setBrandId, palette, palettes, setPaletteId, mode, setMode } = useBrand()
  return (
    <Panel
      title="Aparência"
      description="Modelo, paleta de cores e tema. Salvo neste navegador."
      footer={false}
    >
      <Stack gap="6">
        <Field label="Modelo" help="Define formato, fonte e símbolo." compact>
          <RadioGroup
            variant="cards"
            columns={3}
            value={brand.id}
            onChange={setBrandId}
            options={brands.map((b) => ({
              value: b.id,
              label: b.productName,
              description: shapeLabels[b.shape],
            }))}
          />
        </Field>
        <Field label="Paleta de cores" help="Combine qualquer modelo com qualquer paleta." compact>
          <ButtonGroup
            aria-label="Paleta de cores"
            value={palette.id}
            onChange={(v) => setPaletteId(v === brand.id ? null : v)}
            options={palettes.map((p) => ({ value: p.id, label: p.name }))}
          />
        </Field>
        <Field label="Tema" compact>
          <ButtonGroup
            aria-label="Tema"
            value={mode}
            onChange={(v) => setMode(v as ColorMode)}
            options={[
              { value: 'light', label: 'Claro' },
              { value: 'dark', label: 'Escuro' },
              { value: 'system', label: 'Sistema' },
            ]}
          />
        </Field>
      </Stack>
    </Panel>
  )
}

function LayoutSettings() {
  const { layout, setLayout, resetLayout } = useShell()
  const group = <K extends 'navigation' | 'sidebar' | 'submenu' | 'topbarSubmenu'>(
    key: K,
    label: string,
  ) => (
    <Field label={label} compact>
      <ButtonGroup
        aria-label={label}
        value={layout[key]}
        onChange={(v) => setLayout(key, v as ShellLayout[K])}
        options={layoutOptions[key].map((o) => ({ value: o.value, label: o.label }))}
      />
    </Field>
  )
  return (
    <Panel
      title="Layout"
      description="Todas as opções do AppShell também são props do componente."
      footer={false}
    >
      <Stack gap="6">
        {group('navigation', 'Posição do menu')}
        {layout.navigation === 'sidebar' ? (
          <>
            {group('sidebar', 'Sidebar')}
            <Switch
              label="Abrir ao passar o mouse"
              description="Com a sidebar recolhida, ela abre por cima do conteúdo."
              checked={layout.expandOnHover}
              disabled={layout.sidebar !== 'collapsed'}
              onCheckedChange={(v) => setLayout('expandOnHover', v)}
            />
            {group('submenu', 'Submenu')}
          </>
        ) : (
          group('topbarSubmenu', 'Submenu do menu superior')
        )}
        <Switch
          label="Barra inferior no celular"
          checked={layout.bottomNav}
          onCheckedChange={(v) => setLayout('bottomNav', v)}
        />
        <Button variant="outline" className="self-start" onClick={resetLayout}>
          Voltar ao padrão do projeto
        </Button>
      </Stack>
    </Panel>
  )
}

const content: Record<SectionId, () => ReactNode> = {
  perfil: Profile,
  empresa: Company,
  notificacoes: Notifications,
  seguranca: Security,
  aparencia: Appearance,
  layout: LayoutSettings,
}

/** Configurações com navegação lateral interna (vira seletor no mobile). */
export function SettingsPage() {
  const [active, setActive] = useState<SectionId>('perfil')
  const Current = content[active]
  return (
    <Container padded>
      <Stack gap="section">
        <PageHeader
          title="Configurações"
          description="Preferências da conta, da empresa e da aparência."
        />
        <Grid cols={{ base: 1, lg: 4 }} gap="8">
          <div className="lg:hidden">
            <Select
              label="Seção"
              value={active}
              onChange={(v) => v && setActive(v as SectionId)}
              options={sections.map((s) => ({ value: s.id, label: s.label }))}
            />
          </div>
          <nav aria-label="Seções das configurações" className="hidden lg:block">
            <ul className="flex flex-col gap-1">
              {sections.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setActive(s.id)}
                    aria-current={active === s.id ? 'page' : undefined}
                    className={cn(
                      'flex h-control-md w-full cursor-pointer items-center gap-3 rounded-item px-3 text-left text-sm transition-colors',
                      active === s.id
                        ? 'bg-primary-soft font-medium text-primary-soft-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    <s.icon className="size-icon-sm" aria-hidden />
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="min-w-0 lg:col-span-3">
            <Current />
          </div>
        </Grid>
      </Stack>
    </Container>
  )
}
