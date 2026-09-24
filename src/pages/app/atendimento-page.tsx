import {
  ArrowLeft,
  ArrowRightLeft,
  Bot,
  CircleCheck,
  Filter,
  Mail,
  Phone,
  Plus,
  RotateCcw,
  Search,
  UserCheck,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Container, PageHeader } from '@/components/layout'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ChannelBadge,
  ChatComposer,
  ChatThread,
  chatChannels,
  ConversationList,
  type ChatChannel,
  type ChatMessage,
} from '@/components/ui/chat'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select } from '@/components/ui/select'
import { toast } from '@/components/ui/toast'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { useFillHeight } from '@/hooks/use-fill-height'
import { cn } from '@/lib/cn'
import {
  agentOnline,
  agentPhoto,
  agents,
  demoTickets,
  quickReplies,
  type Ticket,
  type TicketStage,
} from '@/mocks/chat'

const stages: { value: TicketStage; label: string; short: string }[] = [
  { value: 'ura', label: 'URA/IA', short: 'URA/IA' },
  { value: 'fila', label: 'Fila', short: 'Fila' },
  { value: 'atendimento', label: 'Atendimento', short: 'Atend.' },
  { value: 'encerrado', label: 'Encerrado', short: 'Enc.' },
]
const ME = 'Ana Ribeiro'
const channelOptions = (Object.keys(chatChannels) as ChatChannel[]).map((c) => ({
  value: c,
  label: chatChannels[c].label,
}))

/**
 * Atendimento omnichannel (WhatsApp, redes sociais, site, e-mail e SMS). Abas pela etapa:
 * URA/IA (o robô atende), Fila (esperando um atendente), Atendimento e Encerrado. A busca
 * acha conversas e pessoas do time; o filtro (canal e atendente) e o (+) de nova conversa
 * ficam ao lado dela. Nas mensagens: botão direito ou "…" para responder, reagir, editar e
 * excluir. Desktop: lista, conversa e dados do contato na altura da tela. Celular: a lista
 * e, ao tocar, a conversa em tela cheia.
 */
export function AtendimentoPage() {
  const { isMobile } = useBreakpoint()
  const boxRef = useFillHeight()
  const [tickets, setTickets] = useState<Ticket[]>(() => demoTickets())
  const [stage, setStage] = useState<TicketStage>('fila')
  const [search, setSearch] = useState('')
  const [channels, setChannels] = useState<string[]>([])
  const [agent, setAgent] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [quote, setQuote] = useState<ChatMessage | null>(null)
  const [editing, setEditing] = useState<ChatMessage | null>(null)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState({ name: '', channel: 'whatsapp' as string | null })

  const counts = useMemo(
    () =>
      Object.fromEntries(
        stages.map((s) => [s.value, tickets.filter((t) => t.stage === s.value).length]),
      ),
    [tickets],
  )
  const q = search.trim().toLowerCase()
  const list = tickets.filter(
    (t) =>
      t.stage === stage &&
      (!channels.length || channels.includes(t.channel)) &&
      (!agent || t.assignee === agent) &&
      (!q || t.name.toLowerCase().includes(q) || t.lastMessage.toLowerCase().includes(q)),
  )
  // A busca também acha pessoas do time interno.
  const team = q ? agents.filter((a) => a.toLowerCase().includes(q)) : agents
  const filterCount = channels.length + (agent ? 1 : 0)
  const active = tickets.find((t) => t.id === activeId) ?? null

  const update = (id: string, patch: (t: Ticket) => Partial<Ticket>, note?: string) =>
    setTickets((all) =>
      all.map((t) => {
        if (t.id !== id) return t
        const next = { ...t, ...patch(t) }
        if (note)
          next.messages = [
            ...next.messages,
            { id: `s${Date.now()}`, from: 'system', text: note, time: new Date() },
          ]
        return next
      }),
    )
  const updateMessage = (
    id: string,
    mid: string,
    patch: (m: ChatMessage) => Partial<ChatMessage>,
  ) =>
    update(id, (t) => ({
      messages: t.messages.map((m) => (m.id === mid ? { ...m, ...patch(m) } : m)),
    }))

  const assume = (t: Ticket) => {
    update(
      t.id,
      () => ({ stage: 'atendimento', assignee: ME, waitingSince: undefined, unread: 0 }),
      `${ME} assumiu a conversa`,
    )
    setStage('atendimento')
    toast.success('Conversa assumida', { description: t.name })
  }
  const transfer = (t: Ticket, to: string) => {
    update(t.id, () => ({ assignee: to }), `Transferida para ${to}`)
    toast.info('Conversa transferida', { description: `Para ${to}` })
  }
  const close = (t: Ticket) => {
    update(t.id, () => ({ stage: 'encerrado' }), `${ME} encerrou a conversa`)
    setStage('encerrado')
    toast.success('Atendimento encerrado', { description: t.name })
  }
  const reopen = (t: Ticket) => {
    update(t.id, () => ({ stage: 'atendimento', assignee: ME }), `${ME} reabriu a conversa`)
    setStage('atendimento')
  }
  const send = (t: Ticket, text: string, files: File[], audioSeconds?: number) => {
    if (editing) {
      updateMessage(t.id, editing.id, (m) => ({ text, editedFrom: m.editedFrom ?? m.text }))
      setEditing(null)
      return
    }
    const msg: ChatMessage = {
      id: `a${Date.now()}`,
      from: 'agent',
      author: ME,
      avatar: agentPhoto[ME],
      text: text || undefined,
      time: new Date(),
      status: 'sent',
      replyTo: quote ? { id: quote.id, author: quote.author, text: quote.text } : undefined,
      attachments: files.map((f) => ({
        name: f.name,
        type: f.type,
        size: f.size,
        duration: f.type.startsWith('audio/') ? audioSeconds : undefined,
        url: f.type.startsWith('audio/') ? undefined : URL.createObjectURL(f),
      })),
    }
    setQuote(null)
    update(t.id, (x) => ({
      messages: [...x.messages, msg],
      lastMessage: text || (audioSeconds ? 'Mensagem de áudio' : `${files.length} anexo(s)`),
      time: msg.time,
    }))
  }
  const createConversation = () => {
    const id = `n${Date.now()}`
    const channel = (draft.channel ?? 'whatsapp') as ChatChannel
    setTickets((all) => [
      {
        id,
        name: draft.name.trim() || 'Novo contato',
        channel,
        stage: 'atendimento',
        assignee: ME,
        department: 'Comercial',
        account: 'Comercial',
        lastMessage: 'Conversa iniciada',
        time: new Date(),
        messages: [
          { id: `${id}-s`, from: 'system', text: `${ME} iniciou a conversa`, time: new Date() },
        ],
      },
      ...all,
    ])
    setStage('atendimento')
    setActiveId(id)
    setDraft({ name: '', channel: 'whatsapp' })
  }

  const actions = (t: Ticket) => {
    if (t.stage === 'ura' || t.stage === 'fila')
      return (
        <Button icon={t.stage === 'ura' ? <Bot /> : <UserCheck />} onClick={() => assume(t)}>
          {t.stage === 'ura' ? 'Assumir do robô' : 'Assumir atendimento'}
        </Button>
      )
    if (t.stage === 'encerrado')
      return (
        <Button variant="outline" icon={<RotateCcw />} onClick={() => reopen(t)}>
          Reabrir
        </Button>
      )
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" icon={<ArrowRightLeft />} aria-label="Transferir">
              <span className="max-md:sr-only">Transferir</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Transferir para</DropdownMenuLabel>
            {agents
              .filter((a) => a !== t.assignee)
              .map((a) => (
                <DropdownMenuItem key={a} onSelect={() => transfer(t, a)}>
                  <Avatar name={a} src={agentPhoto[a]} size="sm" />
                  {a}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button icon={<CircleCheck />} onClick={() => close(t)} aria-label="Encerrar">
          <span className="max-md:sr-only">Encerrar</span>
        </Button>
      </>
    )
  }

  /* ---------------- lista: time, busca com filtro e nova conversa, etapas */
  const listPane = (
    <section aria-label="Conversas" className="flex min-h-0 flex-col border-r max-md:border-r-0">
      <div className="flex flex-col gap-3 border-b p-3">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold">Equipe</span>
          {team.length ? (
            <ul
              className="flex scrollbar-subtle gap-3 overflow-x-auto pb-1"
              data-allow-overflow
              aria-label="Time interno"
            >
              {team.map((a) => (
                <li key={a} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => toast.info('Conversa interna', { description: `Com ${a}` })}
                    className="flex min-h-touch min-w-touch cursor-pointer flex-col items-center gap-1 rounded-item px-1 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="relative">
                      <Avatar name={a} src={agentPhoto[a]} />
                      <span
                        aria-hidden
                        className={cn(
                          'absolute -right-1 -bottom-1 size-3 rounded-full ring-2 ring-card',
                          agentOnline[a] ? 'bg-success' : 'bg-muted-foreground',
                        )}
                      />
                    </span>
                    <span className="max-w-16 truncate text-xs text-muted-foreground">
                      {a.split(' ')[0]}
                    </span>
                    <span className="sr-only">
                      {a}, {agentOnline[a] ? 'online' : 'ausente'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">Ninguém do time com esse nome.</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Input
            icon={<Search />}
            clearable
            type="search"
            value={search}
            onChange={setSearch}
            placeholder="Buscar conversa ou pessoa do time"
            aria-label="Buscar conversa ou pessoa do time"
            className="min-w-0 flex-1"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                iconOnly
                aria-label={`Filtros${filterCount ? `, ${filterCount} aplicados` : ''}`}
                className="relative"
              >
                <Filter />
                {filterCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {filterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="flex w-popover flex-col gap-3 p-4">
              <Field label="Canal">
                <Select
                  multiple
                  showCount
                  label="Canal"
                  placeholder="Todos os canais"
                  value={channels}
                  onChange={setChannels}
                  options={channelOptions}
                />
              </Field>
              <Field label="Atendente">
                <Select
                  label="Atendente"
                  placeholder="Todos"
                  clearable
                  value={agent}
                  onChange={setAgent}
                  options={agents.map((a) => ({ value: a, label: a }))}
                />
              </Field>
              {filterCount > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setChannels([])
                    setAgent(null)
                  }}
                >
                  Limpar filtros
                </Button>
              )}
            </PopoverContent>
          </Popover>
          <Button iconOnly aria-label="Nova conversa" onClick={() => setCreating(true)}>
            <Plus />
          </Button>
        </div>
        {/* Etapas sempre visíveis: 4 botões iguais, com o total em destaque. */}
        <div
          role="group"
          aria-label="Etapa do atendimento"
          className="grid grid-cols-4 gap-1 rounded-control bg-muted p-1"
        >
          {stages.map((s) => {
            const on = s.value === stage
            return (
              <button
                key={s.value}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setStage(s.value)
                  setActiveId(null)
                }}
                className={cn(
                  'flex min-h-touch min-w-0 cursor-pointer flex-col items-center justify-center rounded-item px-1 py-1 text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  on
                    ? 'bg-card font-semibold text-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-card/60 hover:text-foreground',
                )}
              >
                <span className="text-base font-semibold tabular-nums">{counts[s.value]}</span>
                <span className="max-w-full truncate" aria-hidden>
                  {s.short}
                </span>
                <span className="sr-only">{s.label}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="min-h-0 flex-1 scrollbar-subtle overflow-y-auto">
        <ConversationList
          items={list}
          activeId={activeId}
          onSelect={(id) => {
            setActiveId(id)
            setQuote(null)
            setEditing(null)
          }}
          empty="Nenhuma conversa com essa busca ou filtros."
        />
      </div>
    </section>
  )

  /* ---------------- conversa */
  const threadPane = active ? (
    <section aria-label={`Conversa com ${active.name}`} className="flex min-h-0 min-w-0 flex-col">
      <header className="flex items-center gap-3 border-b p-3">
        {isMobile && (
          <Button
            variant="ghost"
            iconOnly
            aria-label="Voltar para a lista"
            onClick={() => setActiveId(null)}
          >
            <ArrowLeft />
          </Button>
        )}
        <Avatar name={active.name} src={active.avatar} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold">{active.name}</span>
          <span className="flex min-w-0 items-center gap-2 overflow-hidden text-xs text-muted-foreground">
            {active.phone && (
              <span className="shrink-0 tabular-nums max-2xl:hidden">{active.phone}</span>
            )}
            <ChannelBadge channel={active.channel} />
            {active.assignee && (
              <span className="truncate max-md:hidden">Com {active.assignee}</span>
            )}
          </span>
        </div>
        {/* No celular, quando a ação já aparece no lugar do campo (assumir, reabrir), sai daqui. */}
        <div
          className={cn(
            'flex shrink-0 items-center gap-2',
            active.stage !== 'atendimento' && 'max-md:hidden',
          )}
        >
          {actions(active)}
        </div>
      </header>
      <ChatThread
        messages={active.messages}
        onReply={(m) => {
          setEditing(null)
          setQuote(m)
        }}
        onReact={(m, e) =>
          updateMessage(active.id, m.id, (x) => ({
            reactions: x.reactions?.includes(e)
              ? x.reactions.filter((r) => r !== e)
              : [...(x.reactions ?? []), e],
          }))
        }
        onEdit={(m) => {
          setQuote(null)
          setEditing(m)
        }}
        onDelete={(m) => {
          updateMessage(active.id, m.id, () => ({ deleted: true }))
          toast.info('Mensagem excluída', { description: 'Continua no histórico, riscada.' })
        }}
      />
      <ChatComposer
        disabled={active.stage !== 'atendimento'}
        disabledHint={
          active.stage === 'encerrado'
            ? 'Conversa encerrada. Reabra para responder.'
            : 'Assuma este atendimento para poder responder.'
        }
        disabledAction={actions(active)}
        quote={quote ? { author: quote.author, text: quote.text } : null}
        onCancelQuote={() => setQuote(null)}
        editing={editing ? { id: editing.id, text: editing.text } : null}
        onCancelEdit={() => setEditing(null)}
        quickReplies={quickReplies}
        onSend={({ text, files, audioSeconds }) => send(active, text, files, audioSeconds)}
      />
    </section>
  ) : (
    <div className="flex min-h-0 flex-col items-center justify-center gap-2 bg-muted/40 p-6 text-center text-sm text-muted-foreground max-md:hidden">
      <p className="font-medium text-foreground">Escolha uma conversa</p>
      <p>As mensagens aparecem aqui, com as ações para assumir, transferir e encerrar.</p>
    </div>
  )

  /* ---------------- dados do contato */
  const contactPane = active && (
    <aside
      aria-label="Dados do contato"
      className="flex min-h-0 scrollbar-subtle flex-col gap-4 overflow-y-auto border-l p-4 max-xl:hidden"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <Avatar name={active.name} src={active.avatar} size="lg" />
        <span className="font-semibold">{active.name}</span>
        <ChannelBadge channel={active.channel} />
      </div>
      <dl className="flex flex-col gap-3 text-sm">
        {active.phone && (
          <div className="flex items-center gap-2">
            <Phone className="size-icon-sm text-muted-foreground" aria-hidden />
            <dt className="sr-only">Telefone</dt>
            <dd className="tabular-nums">{active.phone}</dd>
          </div>
        )}
        {active.email && (
          <div className="flex min-w-0 items-center gap-2">
            <Mail className="size-icon-sm shrink-0 text-muted-foreground" aria-hidden />
            <dt className="sr-only">E-mail</dt>
            <dd className="truncate">{active.email}</dd>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <dt className="text-xs text-muted-foreground">Atendente</dt>
          <dd>{active.assignee ?? 'Ninguém ainda'}</dd>
        </div>
        {active.tags && (
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">Etiquetas</dt>
            <dd className="flex flex-wrap gap-1">
              {active.tags.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </dd>
          </div>
        )}
      </dl>
      <Button asChild variant="outline" fullWidth>
        <Link to="/clientes/1000">Abrir cadastro</Link>
      </Button>
    </aside>
  )

  return (
    <Container padded>
      <div className="flex flex-col gap-4">
        <PageHeader title="Atendimento" />
        <div
          ref={boxRef}
          className={cn(
            'grid h-board min-w-0 overflow-hidden rounded-surface border bg-card',
            isMobile ? 'grid-cols-1' : active ? 'grid-chat-3' : 'grid-chat-2',
          )}
        >
          {isMobile ? (
            active ? (
              threadPane
            ) : (
              listPane
            )
          ) : (
            <>
              {listPane}
              {threadPane}
              {contactPane}
            </>
          )}
        </div>
      </div>
      <Modal
        open={creating}
        onOpenChange={setCreating}
        type="form"
        title="Nova conversa"
        description="Conversa nova com um contato, pelo canal escolhido."
        confirmLabel="Iniciar conversa"
        onConfirm={createConversation}
      >
        <Field label="Contato" required>
          <Input
            value={draft.name}
            onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
            placeholder="Nome ou telefone"
          />
        </Field>
        <Field label="Canal">
          <Select
            label="Canal"
            value={draft.channel}
            onChange={(v) => setDraft((d) => ({ ...d, channel: v }))}
            options={channelOptions}
          />
        </Field>
      </Modal>
    </Container>
  )
}
