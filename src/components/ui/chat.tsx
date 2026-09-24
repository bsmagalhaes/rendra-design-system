import { format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Bot,
  MoreHorizontal,
  Reply,
  Pencil,
  Pause,
  Download,
  Check,
  CheckCheck,
  FileText,
  Film,
  Globe,
  ImagePlus,
  Mail,
  MessageCircle,
  MessagesSquare,
  Mic,
  Play,
  Paperclip,
  Search,
  Send,
  Smartphone,
  Smile,
  Trash2,
  X,
  ArrowLeft,
  EllipsisVertical,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { ContextMenu } from 'radix-ui'
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type DragEvent,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { Avatar } from '@/components/ui/avatar'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import logoFacebook from '@/assets/channels/facebook.png'
import logoGoogle from '@/assets/channels/google.png'
import logoInstagram from '@/assets/channels/instagram.png'
import logoReclameAqui from '@/assets/channels/reclameaqui.png'
import logoTiktok from '@/assets/channels/tiktok.png'
import logoWhatsappWeb from '@/assets/channels/whatsapp-web.png'
import logoWhatsapp from '@/assets/channels/whatsapp.png'
import { cn } from '@/lib/cn'

/*
 * Chat de atendimento: três peças que as telas combinam.
 *   ConversationList  lista de conversas (canal, última mensagem, espera, não lidas)
 *   ChatThread        mensagens do cliente, do atendente, do robô (URA/IA) e do sistema
 *   ChatComposer      campo de mensagem: textarea de 2 linhas que cresce, anexos por botão,
 *                     arrastar e soltar ou colar (Ctrl+V de arquivo, print ou imagem)
 * Selo do canal sobre a foto do contato com o logotipo (src/assets/channels); site, e-mail
 * e SMS com ícone. A etiqueta do canal (ChannelBadge) usa sempre o ícone e o nome.
 */

export type ChatChannel =
  | 'whatsapp'
  | 'whatsapp-web'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'google'
  | 'reclameaqui'
  | 'site'
  | 'email'
  | 'sms'

export const chatChannels: Record<
  ChatChannel,
  {
    label: string
    icon: LucideIcon
    /** Logotipo do canal (imagem redonda); sem ele, vale o ícone. */
    logo?: string
    tone: NonNullable<BadgeProps['tone']>
  }
> = {
  whatsapp: { label: 'WhatsApp', icon: MessageCircle, logo: logoWhatsapp, tone: 'success' },
  'whatsapp-web': {
    label: 'WhatsApp Web',
    icon: MessageCircle,
    logo: logoWhatsappWeb,
    tone: 'info',
  },
  instagram: { label: 'Instagram', icon: MessagesSquare, logo: logoInstagram, tone: 'error' },
  facebook: { label: 'Facebook', icon: MessagesSquare, logo: logoFacebook, tone: 'info' },
  tiktok: { label: 'TikTok', icon: MessagesSquare, logo: logoTiktok, tone: 'neutral' },
  google: { label: 'Google Meu Negócio', icon: Globe, logo: logoGoogle, tone: 'info' },
  reclameaqui: {
    label: 'Reclame Aqui',
    icon: MessagesSquare,
    logo: logoReclameAqui,
    tone: 'success',
  },
  site: { label: 'Chat do site', icon: Globe, tone: 'primary' },
  email: { label: 'E-mail', icon: Mail, tone: 'neutral' },
  sms: { label: 'SMS', icon: Smartphone, tone: 'warning' },
}

/** Logotipo do canal em círculo (selo sobre a foto do contato), ou o ícone sem logotipo. */
function ChannelMark({ channel, className }: { channel: ChatChannel; className?: string }) {
  const c = chatChannels[channel]
  if (c.logo) return <img src={c.logo} alt="" className={cn('shrink-0 rounded-full', className)} />
  return <c.icon className={className} aria-hidden />
}

export function ChannelBadge({ channel }: { channel: ChatChannel }) {
  const c = chatChannels[channel]
  return (
    <Badge tone={c.tone} icon={<c.icon />}>
      {c.label}
    </Badge>
  )
}

export interface ChatAttachment {
  name: string
  /** Endereço do arquivo (ou blob: local, para prévia antes de enviar). */
  url?: string
  type?: string
  size?: number
  /** Duração em segundos (áudio e vídeo). */
  duration?: number
}

export interface ChatMessage {
  id: string
  /** Foto de quem enviou (cliente ou atendente). */
  avatar?: string
  /** Quem enviou: o cliente, o atendente, o robô (URA/IA) ou um aviso do sistema. */
  from: 'contact' | 'agent' | 'bot' | 'system'
  text?: string
  time: Date
  /** Nome de quem enviou (atendente ou robô). */
  author?: string
  /** Resposta a outra mensagem: mostra a citação acima do texto. */
  /** Mensagem citada. Com o id, clicar na citação leva até a original. */
  replyTo?: { id?: string; author?: string; text?: string }
  /** Reações com emoji. */
  reactions?: string[]
  /** Excluída: continua no chat, riscada e em vermelho claro. */
  deleted?: boolean
  /** Texto antes da edição: a mensagem mostra o novo e o original. */
  editedFrom?: string
  /** Situação da mensagem enviada: enviada, entregue, lida. */
  status?: 'sent' | 'delivered' | 'read'
  attachments?: ChatAttachment[]
}

export interface Conversation {
  id: string
  name: string
  /** Foto do contato. */
  avatar?: string
  channel: ChatChannel
  /** Conta ou número do canal que recebeu (ex.: "Comercial"). */
  account?: string
  /** Departamento ou fila (ex.: "Suporte"). */
  department?: string
  lastMessage: string
  time: Date
  unread?: number
  /** Esperando desde (fila): mostra o tempo de espera. */
  waitingSince?: Date
  assignee?: string
}

const hhmm = (d: Date) => format(d, 'HH:mm')
const secs = (n: number) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`
const stamp = (d: Date) => (isToday(d) ? hhmm(d) : format(d, 'dd/MM/yyyy HH:mm'))
const channelText: Record<ChatChannel, string> = {
  whatsapp: 'text-success-soft-foreground',
  'whatsapp-web': 'text-info-soft-foreground',
  tiktok: 'text-foreground',
  google: 'text-info-soft-foreground',
  reclameaqui: 'text-success-soft-foreground',
  instagram: 'text-destructive-soft-foreground',
  facebook: 'text-info-soft-foreground',
  site: 'text-primary-text',
  email: 'text-muted-foreground',
  sms: 'text-warning-soft-foreground',
}
const dayLabel = (d: Date) =>
  isToday(d) ? 'Hoje' : isYesterday(d) ? 'Ontem' : format(d, "d 'de' MMMM", { locale: ptBR })
const sizeLabel = (n?: number) =>
  n == null
    ? ''
    : n < 1024 * 1024
      ? `${Math.max(1, Math.round(n / 1024))} KB`
      : `${(n / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
const waited = (since: Date, now = new Date()) => {
  const min = Math.max(0, Math.round((now.getTime() - since.getTime()) / 60000))
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60} min`
}

/* ================================================================ lista */

export interface ConversationListProps {
  items: Conversation[]
  activeId?: string | null
  onSelect: (id: string) => void
  /** Texto quando não há conversas (ex.: com os filtros aplicados). */
  empty?: string
  className?: string
}

export function ConversationList({
  items,
  activeId,
  onSelect,
  empty = 'Nenhuma conversa aqui.',
  className,
}: ConversationListProps) {
  if (!items.length) return <p className="p-6 text-center text-sm text-muted-foreground">{empty}</p>
  return (
    <ul className={cn('flex flex-col gap-1 p-2', className)}>
      {items.map((c) => {
        const active = c.id === activeId
        return (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onSelect(c.id)}
              aria-current={active || undefined}
              className={cn(
                'flex w-full cursor-pointer items-start gap-3 rounded-item px-3 py-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active ? 'bg-primary-soft' : 'hover:bg-accent',
              )}
            >
              <span className="relative shrink-0">
                <Avatar name={c.name} src={c.avatar} size="lg" />
                <span
                  className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-card text-muted-foreground ring-2 ring-card"
                  title={chatChannels[c.channel].label}
                >
                  <ChannelMark
                    channel={c.channel}
                    className={chatChannels[c.channel].logo ? 'size-6' : 'size-3'}
                  />
                </span>
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex items-baseline gap-2">
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{c.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {stamp(c.time)}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                    {[c.department, c.assignee].filter(Boolean).join(' · ') || c.lastMessage}
                  </span>
                  {c.unread ? (
                    <span className="flex min-w-6 shrink-0 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground tabular-nums">
                      {c.unread}
                    </span>
                  ) : null}
                </span>
                <span className="flex min-w-0 items-center gap-1 text-xs">
                  <span className={cn('shrink-0 font-semibold', channelText[c.channel])}>
                    {chatChannels[c.channel].label}
                    {c.account ? ':' : ''}
                  </span>
                  {c.account && <span className="truncate text-muted-foreground">{c.account}</span>}
                </span>
                {c.waitingSince && (
                  <span className="text-xs font-medium text-warning-soft-foreground">
                    Esperando há {waited(c.waitingSince)}
                  </span>
                )}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/* ================================================================ mensagens */

export interface ChatThreadProps {
  messages: ChatMessage[]
  /** Responder (citar) uma mensagem: a tela mostra a citação no campo de mensagem. */
  onReply?: (message: ChatMessage) => void
  /** Reagir com emoji (clicar de novo na mesma reação a remove). */
  onReact?: (message: ChatMessage, emoji: string) => void
  /** Editar uma mensagem do atendente. */
  onEdit?: (message: ChatMessage) => void
  /** Excluir uma mensagem do atendente (continua no chat, riscada). */
  onDelete?: (message: ChatMessage) => void
  className?: string
}

const REACTIONS = ['👍', '❤️', '😂', '😮', '🙏', '✅']
const SPEEDS = [1, 1.5, 2] as const

/** Tocador de áudio: tocar e pausar, progresso, velocidade 1x, 1,5x e 2x, e baixar. */
function AudioPlayer({ file, mine }: { file: ChatAttachment; mine: boolean }) {
  const total = Math.max(1, file.duration ?? 8)
  const [playing, setPlaying] = useState(false)
  const [pos, setPos] = useState(0)
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1)
  const audio = useRef<HTMLAudioElement>(null)
  // Sem arquivo de verdade (demo), o progresso é simulado no ritmo da velocidade escolhida.
  useEffect(() => {
    if (!playing || file.url) return
    const t = window.setInterval(() => {
      setPos((p) => {
        const next = p + 0.1 * speed
        if (next >= total) {
          setPlaying(false)
          return 0
        }
        return next
      })
    }, 100)
    return () => window.clearInterval(t)
  }, [playing, speed, total, file.url])
  useEffect(() => {
    if (audio.current) audio.current.playbackRate = speed
  }, [speed])
  const toggle = () => {
    if (file.url && audio.current) {
      if (playing) audio.current.pause()
      else void audio.current.play()
    }
    setPlaying((v) => !v)
  }
  const progress = Math.min(1, pos / total)
  return (
    <span
      className={cn(
        'flex min-w-0 items-center gap-2 rounded-full py-1 pr-1 pl-1 text-xs md:min-w-3xs',
        mine ? 'bg-primary-foreground/15' : 'bg-muted',
      )}
    >
      {file.url && (
        <audio
          ref={audio}
          src={file.url}
          onTimeUpdate={(e) => setPos(e.currentTarget.currentTime)}
          onEnded={() => {
            setPlaying(false)
            setPos(0)
          }}
        >
          <track kind="captions" />
        </audio>
      )}
      <Button
        size="sm"
        iconOnly
        variant={mine ? 'secondary' : 'primary'}
        aria-label={playing ? 'Pausar áudio' : 'Tocar áudio'}
        onClick={toggle}
        className="rounded-full"
      >
        {playing ? <Pause /> : <Play />}
      </Button>
      <span className="relative h-1 min-w-12 flex-1 overflow-hidden rounded-full bg-current/25">
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-progress rounded-full bg-current"
          style={{ '--progress': `${(progress * 100).toFixed(1)}%` } as CSSProperties}
        />
      </span>
      <span className="shrink-0 tabular-nums">{secs(Math.round(playing ? pos : total))}</span>
      <button
        type="button"
        onClick={() => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length] ?? 1)}
        aria-label={`Velocidade ${String(speed).replace('.', ',')}x. Trocar velocidade`}
        className="flex h-6 min-w-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-current/15 px-2 font-semibold tabular-nums max-md:h-touch"
      >
        {String(speed).replace('.', ',')}x
      </button>
      <a
        href={file.url ?? '#'}
        download={file.name}
        aria-label={`Baixar ${file.name}`}
        onClick={(e) => !file.url && e.preventDefault()}
        className="flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-current/15 max-md:size-touch"
      >
        <Download className="size-icon-sm" aria-hidden />
      </a>
    </span>
  )
}

function Attachments({ files, mine }: { files: ChatAttachment[]; mine: boolean }) {
  return (
    <span className="flex flex-col gap-2">
      {files.map((f, i) => {
        if (f.type?.startsWith('audio/')) return <AudioPlayer key={i} file={f} mine={mine} />
        const media = f.url && (f.type?.startsWith('image/') || f.type?.startsWith('video/'))
        return media ? (
          <span key={i} className="relative flex flex-col gap-1">
            {f.type?.startsWith('video/') ? (
              <video src={f.url} controls className="max-h-chart-sm max-w-full rounded-item">
                <track kind="captions" />
              </video>
            ) : (
              <img
                src={f.url}
                alt={f.name}
                className="max-h-chart-sm max-w-full rounded-item object-cover"
              />
            )}
            <a
              href={f.url}
              download={f.name}
              className="flex items-center gap-1 self-start text-xs underline-offset-4 hover:underline max-md:min-h-touch"
            >
              <Download className="size-3" aria-hidden />
              Baixar
              <span className="sr-only">{f.name}</span>
            </a>
          </span>
        ) : (
          <a
            key={i}
            href={f.url}
            download={f.name}
            className={cn(
              'flex min-w-0 items-center gap-2 rounded-item px-2 py-2 text-xs underline-offset-4 hover:underline',
              mine ? 'bg-primary-foreground/15' : 'bg-muted',
            )}
          >
            <FileText className="size-icon-sm shrink-0" aria-hidden />
            <span className="min-w-0 flex-1 truncate">{f.name}</span>
            {f.size != null && <span className="shrink-0">{sizeLabel(f.size)}</span>}
            <Download className="size-icon-sm shrink-0" aria-label="Baixar" />
          </a>
        )
      })}
    </span>
  )
}

/** Ações da mensagem: no botão direito (ContextMenu) e no botão "…" (toque e teclado). */
function MessageActions({
  m,
  mine,
  onReply,
  onReact,
  onEdit,
  onDelete,
  kind,
}: {
  m: ChatMessage
  mine: boolean
  kind: 'context' | 'dropdown'
} & Pick<ChatThreadProps, 'onReply' | 'onReact' | 'onEdit' | 'onDelete'>) {
  const Item = kind === 'context' ? ContextMenu.Item : DropdownMenuItem
  const itemClass =
    kind === 'context'
      ? 'flex min-h-touch cursor-pointer items-center gap-2 rounded-item px-3 text-sm outline-none select-none data-[highlighted]:bg-accent md:min-h-0 md:py-2 [&_svg]:size-icon-sm'
      : undefined
  return (
    <>
      <div role="group" aria-label="Reagir" className="flex gap-1 p-1">
        {REACTIONS.map((e) => (
          <Item
            key={e}
            onSelect={() => onReact?.(m, e)}
            aria-label={`Reagir com ${e}`}
            className={cn(
              'flex size-touch cursor-pointer items-center justify-center rounded-item text-lg outline-none data-[highlighted]:bg-accent md:size-8',
            )}
          >
            {e}
          </Item>
        ))}
      </div>
      <Item className={itemClass} onSelect={() => onReply?.(m)}>
        <Reply aria-hidden /> Responder
      </Item>
      {mine && !m.deleted && (
        <>
          <Item className={itemClass} onSelect={() => onEdit?.(m)}>
            <Pencil aria-hidden /> Editar
          </Item>
          <Item
            className={cn(itemClass, kind === 'context' && 'text-destructive-soft-foreground')}
            {...(kind === 'dropdown' ? { destructive: true } : {})}
            onSelect={() => onDelete?.(m)}
          >
            <Trash2 aria-hidden /> Excluir
          </Item>
        </>
      )}
    </>
  )
}

export function ChatThread({
  messages,
  onReply,
  onReact,
  onEdit,
  onDelete,
  className,
}: ChatThreadProps) {
  const endRef = useRef<HTMLDivElement>(null)
  // Sempre mostra a mensagem mais nova.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length])

  const groups = useMemo(() => {
    const out: { day: string; items: ChatMessage[] }[] = []
    for (const m of messages) {
      const day = dayLabel(m.time)
      const last = out[out.length - 1]
      if (last?.day === day) last.items.push(m)
      else out.push({ day, items: [m] })
    }
    return out
  }, [messages])
  const actionsOn = Boolean(onReply || onReact || onEdit || onDelete)
  const logRef = useRef<HTMLDivElement>(null)
  const [flash, setFlash] = useState<string | null>(null)
  useEffect(() => {
    if (!flash) return
    const t = window.setTimeout(() => setFlash(null), 1600)
    return () => window.clearTimeout(t)
  }, [flash])
  // Leva até a mensagem citada e a destaca por um instante.
  const goTo = (id: string) => {
    const el = logRef.current?.querySelector<HTMLElement>(`[data-message-id="${CSS.escape(id)}"]`)
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    setFlash(id)
  }

  return (
    <div
      ref={logRef}
      role="log"
      // Área rolável focável: dá para rolar as mensagens pelo teclado (WCAG, axe
      // scrollable-region-focusable). O log não é interativo, mas precisa receber foco.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      aria-live="polite"
      aria-label="Mensagens da conversa"
      className={cn(
        'flex min-h-0 flex-1 scrollbar-subtle flex-col gap-3 overflow-y-auto overscroll-contain bg-muted/40 p-4',
        className,
      )}
    >
      {groups.map((g) => (
        <section key={g.day} className="flex flex-col gap-3" aria-label={g.day}>
          <div className="flex items-center gap-3 text-xs text-muted-foreground" aria-hidden>
            <span className="h-px flex-1 bg-border" />
            {g.day}
            <span className="h-px flex-1 bg-border" />
          </div>
          {g.items.map((m) => {
            if (m.from === 'system')
              return (
                <p key={m.id} className="self-center text-center text-xs text-muted-foreground">
                  {m.text} · {hhmm(m.time)}
                </p>
              )
            const mine = m.from === 'agent'
            const bot = m.from === 'bot'
            const who = m.author ?? (bot ? 'Assistente virtual' : undefined)
            const bubble = (
              <div
                className={cn(
                  'group/msg relative flex min-w-0 flex-col gap-2 rounded-surface px-3 py-2 text-sm wrap-anywhere shadow-sm transition-shadow',
                  flash === m.id && 'ring-4 ring-ring/60',
                  mine && !m.deleted && 'bg-primary text-primary-foreground',
                  bot && 'border border-dashed bg-card',
                  m.from === 'contact' && !m.deleted && 'border bg-card',
                  m.deleted &&
                    'border border-destructive/30 bg-destructive-soft text-destructive-soft-foreground',
                )}
              >
                <span
                  className={cn(
                    'flex items-center gap-2 text-xs',
                    mine && !m.deleted
                      ? 'flex-row-reverse text-primary-foreground'
                      : 'text-muted-foreground',
                    m.deleted && 'text-destructive-soft-foreground',
                  )}
                >
                  {bot ? (
                    <Bot className="size-icon-sm" aria-hidden />
                  ) : (
                    <Avatar name={who ?? '?'} src={m.avatar} size="sm" />
                  )}
                  {who && <span className="font-semibold">{who}</span>}
                  <span className={cn('tabular-nums', mine ? 'mr-auto' : 'ml-auto')}>
                    {format(m.time, 'dd/MM/yyyy HH:mm')}
                  </span>
                  {actionsOn && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        aria-label="Ações da mensagem"
                        className="-my-1 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-item opacity-70 outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring max-md:size-touch"
                      >
                        <MoreHorizontal className="size-icon-sm" aria-hidden />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={mine ? 'end' : 'start'}>
                        <MessageActions
                          kind="dropdown"
                          m={m}
                          mine={mine}
                          onReply={onReply}
                          onReact={onReact}
                          onEdit={onEdit}
                          onDelete={onDelete}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </span>
                {m.replyTo &&
                  (() => {
                    const quoteClass = cn(
                      'flex flex-col rounded-item border-l-4 px-2 py-1 text-left text-xs',
                      mine && !m.deleted
                        ? 'border-primary-foreground/60 bg-primary-foreground/15'
                        : 'border-primary bg-muted',
                    )
                    const body = (
                      <>
                        <span className="font-semibold">{m.replyTo.author}</span>
                        <span className="line-clamp-2">{m.replyTo.text}</span>
                      </>
                    )
                    const target = m.replyTo.id
                    return target ? (
                      <button
                        type="button"
                        onClick={() => goTo(target)}
                        aria-label={`Ir para a mensagem citada de ${m.replyTo.author ?? 'contato'}`}
                        className={cn(
                          quoteClass,
                          'cursor-pointer outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring',
                        )}
                      >
                        {body}
                      </button>
                    ) : (
                      <span className={quoteClass}>{body}</span>
                    )
                  })()}
                {m.attachments?.length && !m.deleted ? (
                  <Attachments files={m.attachments} mine={mine} />
                ) : null}
                {m.deleted ? (
                  <p className="line-through">
                    {m.text || 'Anexo'}
                    <span className="sr-only"> (mensagem excluída)</span>
                  </p>
                ) : (
                  m.text && <p className="wrap-anywhere whitespace-pre-wrap">{m.text}</p>
                )}
                {m.editedFrom && !m.deleted && (
                  <p
                    className={cn(
                      'border-t pt-1 text-xs',
                      mine
                        ? 'border-primary-foreground/30 text-primary-foreground'
                        : 'text-muted-foreground',
                    )}
                  >
                    Editada. Antes: <span className="line-through">{m.editedFrom}</span>
                  </p>
                )}
                {(m.deleted || (mine && m.status)) && (
                  <span className="flex items-center justify-end gap-1 text-xs">
                    {m.deleted && <span className="font-semibold">Mensagem excluída</span>}
                    {mine && !m.deleted && m.status === 'sent' && (
                      <Check className="size-3" aria-label="Enviada" />
                    )}
                    {mine && !m.deleted && m.status && m.status !== 'sent' && (
                      <CheckCheck
                        className="size-3"
                        aria-label={m.status === 'read' ? 'Lida' : 'Entregue'}
                      />
                    )}
                  </span>
                )}
              </div>
            )
            return (
              <div
                key={m.id}
                data-message-id={m.id}
                className={cn(
                  'flex max-w-full flex-col gap-1 md:max-w-4/5',
                  mine ? 'items-end self-end' : 'items-start self-start',
                )}
              >
                {actionsOn ? (
                  <ContextMenu.Root>
                    <ContextMenu.Trigger asChild>{bubble}</ContextMenu.Trigger>
                    <ContextMenu.Portal>
                      <ContextMenu.Content className="z-50 min-w-3xs rounded-surface border bg-popover p-1 text-popover-foreground shadow-md">
                        <MessageActions
                          kind="context"
                          m={m}
                          mine={mine}
                          onReply={onReply}
                          onReact={onReact}
                          onEdit={onEdit}
                          onDelete={onDelete}
                        />
                      </ContextMenu.Content>
                    </ContextMenu.Portal>
                  </ContextMenu.Root>
                ) : (
                  bubble
                )}
                {m.reactions && m.reactions.length > 0 && (
                  <span className="-mt-2 flex gap-1 px-2" aria-label="Reações">
                    {[...new Set(m.reactions)].map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => onReact?.(m, e)}
                        aria-label={`Reação ${e}. Remover`}
                        className="flex h-6 cursor-pointer items-center gap-1 rounded-full border bg-card px-2 text-xs shadow-sm max-md:h-touch"
                      >
                        {e}
                        {m.reactions!.filter((x) => x === e).length > 1 && (
                          <span className="tabular-nums">
                            {m.reactions!.filter((x) => x === e).length}
                          </span>
                        )}
                      </button>
                    ))}
                  </span>
                )}
              </div>
            )
          })}
        </section>
      ))}
      <div ref={endRef} />
    </div>
  )
}

/* ================================================================ campo de mensagem */

const EMOJIS = [
  '😀',
  '😂',
  '😊',
  '😍',
  '🤔',
  '😅',
  '😉',
  '🙏',
  '👍',
  '👏',
  '🙌',
  '💪',
  '🎉',
  '✅',
  '❤️',
  '🔥',
  '👀',
  '🚀',
  '📎',
  '📅',
  '💬',
  '⏰',
  '📞',
  '🤝',
]

export interface QuickReply {
  id: string
  /** Nome curto na lista (ex.: "Saudação"). */
  title: string
  text: string
}

export interface ChatComposerProps {
  /** files inclui o áudio gravado (tipo audio/*), com a duração em segundos. */
  onSend: (message: { text: string; files: File[]; audioSeconds?: number }) => void
  placeholder?: string
  disabled?: boolean
  /** Motivo de estar desativado, mostrado no lugar do campo (ex.: "Assuma a conversa"). */
  disabledHint?: string
  /** Ação mostrada junto do motivo (ex.: botão "Assumir atendimento"). */
  disabledAction?: ReactNode
  /** Tipos aceitos no botão de arquivo. Padrão: qualquer arquivo. */
  accept?: string
  /**
   * Mensagens rápidas cadastradas. Com elas, o raio ao lado do microfone abre a lista (com
   * busca); a escolhida vai para o campo, para revisar antes de enviar.
   */
  quickReplies?: QuickReply[]
  /** Mensagem sendo respondida: aparece citada acima do campo. */
  quote?: { author?: string; text?: string } | null
  onCancelQuote?: () => void
  /** Mensagem sendo editada: o campo vem com o texto dela. */
  editing?: { id: string; text?: string } | null
  onCancelEdit?: () => void
  className?: string
}

/**
 * Campo de mensagem. Esquerda: arquivo, imagem ou vídeo e emoji. Centro: textarea de 2
 * linhas que cresce com o texto (Enter envia, Shift+Enter quebra a linha); aceita arrastar e
 * soltar e colar arquivos, prints e imagens. Direita: mensagens rápidas (quando cadastradas),
 * gravar áudio (a gravação é simulada no demo: contador, ondas e ponto pulsando; cancelar ou
 * enviar) e enviar.
 */
export function ChatComposer({
  onSend,
  placeholder = 'Escreva uma mensagem',
  disabled,
  disabledHint,
  disabledAction,
  accept,
  quickReplies,
  quote,
  onCancelQuote,
  editing,
  onCancelEdit,
  className,
}: ChatComposerProps) {
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [drag, setDrag] = useState(false)
  const [recording, setRecording] = useState(false)
  // Menu de ações da conversa estreita: lista, emojis ou mensagens rápidas.
  const [menu, setMenu] = useState<'menu' | 'emoji' | 'quick' | null>(null)
  const [seconds, setSeconds] = useState(0)
  const fileInput = useRef<HTMLInputElement>(null)
  const mediaInput = useRef<HTMLInputElement>(null)
  const area = useRef<HTMLTextAreaElement>(null)
  // Safari e Firefox não têm field-sizing: mede a altura do texto para o campo crescer.
  useLayoutEffect(() => {
    const el = area.current
    if (!el || CSS.supports('field-sizing', 'content')) return
    el.style.removeProperty('--autosize-h')
    el.style.setProperty('--autosize-h', `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`)
  }, [text])
  const previews = useMemo(
    () => files.map((f) => (f.type.startsWith('image/') ? URL.createObjectURL(f) : null)),
    [files],
  )
  useEffect(() => () => previews.forEach((u) => u && URL.revokeObjectURL(u)), [previews])
  // Editar: o campo recebe o texto da mensagem escolhida.
  useEffect(() => {
    if (!editing) return
    setText(editing.text ?? '')
    window.requestAnimationFrame(() => area.current?.focus())
  }, [editing])
  useEffect(() => {
    if (quote) area.current?.focus()
  }, [quote])
  useEffect(() => {
    if (!recording) return
    const t = window.setInterval(() => setSeconds((n) => n + 1), 1000)
    return () => window.clearInterval(t)
  }, [recording])

  const add = (list: FileList | File[] | null | undefined) => {
    const next = [...(list ?? [])]
    if (next.length) setFiles((f) => [...f, ...next])
  }
  const send = () => {
    if (disabled || (!text.trim() && !files.length)) return
    onSend({ text: text.trim(), files })
    setText('')
    setFiles([])
  }
  const insertEmoji = (emoji: string) => {
    const el = area.current
    const start = el?.selectionStart ?? text.length
    const end = el?.selectionEnd ?? text.length
    setText(text.slice(0, start) + emoji + text.slice(end))
    window.requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(start + emoji.length, start + emoji.length)
    })
  }
  const insertQuickReply = (t: string) => {
    setText((cur) => (cur.trim() ? `${cur.trimEnd()} ${t}` : t))
    window.requestAnimationFrame(() => area.current?.focus())
  }
  const startRecording = () => {
    setSeconds(0)
    setRecording(true)
  }
  const stopRecording = (keep: boolean) => {
    setRecording(false)
    if (keep && seconds > 0) {
      const audio = new File(
        [new Blob([], { type: 'audio/webm' })],
        `Áudio ${secs(seconds)}.webm`,
        {
          type: 'audio/webm',
        },
      )
      onSend({ text: '', files: [audio], audioSeconds: seconds })
    }
    setSeconds(0)
  }
  const onPaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    // Colar arquivo, print ou imagem copiada vira anexo; texto segue normal.
    if (e.clipboardData.files.length) {
      e.preventDefault()
      add(e.clipboardData.files)
    }
  }
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDrag(false)
    if (!disabled) add(e.dataTransfer.files)
  }

  if (disabled && disabledHint)
    return (
      <div
        className={cn(
          'flex flex-col items-center gap-3 border-t bg-card p-4 pb-safe text-center text-sm text-muted-foreground md:pb-4',
          className,
        )}
      >
        {disabledHint}
        {disabledAction}
      </div>
    )

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setDrag(true)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDrag(false)
      }}
      onDrop={onDrop}
      className={cn(
        '@container relative flex flex-col gap-2 border-t bg-card p-3 pb-safe md:pb-3',
        className,
      )}
    >
      {drag && (
        <div className="pointer-events-none absolute inset-2 z-10 flex items-center justify-center rounded-control border-2 border-dashed border-primary bg-primary-soft text-sm font-medium text-primary-soft-foreground">
          Solte para anexar
        </div>
      )}
      {(quote || editing) && (
        <div className="flex items-start gap-2 rounded-item border-l-4 border-primary bg-muted px-3 py-2 text-xs">
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="font-semibold">
              {editing ? 'Editando mensagem' : `Respondendo a ${quote?.author ?? 'mensagem'}`}
            </span>
            {!editing && <span className="line-clamp-2 text-muted-foreground">{quote?.text}</span>}
          </span>
          <button
            type="button"
            aria-label={editing ? 'Cancelar edição' : 'Cancelar resposta'}
            onClick={() => {
              if (editing) {
                setText('')
                onCancelEdit?.()
              } else onCancelQuote?.()
            }}
            className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-item text-muted-foreground hover:bg-card hover:text-foreground max-md:size-touch"
          >
            <X className="size-3" aria-hidden />
          </button>
        </div>
      )}
      {files.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Anexos">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex max-w-full items-center gap-2 rounded-item border bg-muted py-1 pr-1 pl-1 text-xs"
            >
              {previews[i] ? (
                <img src={previews[i] ?? ''} alt="" className="size-8 rounded-item object-cover" />
              ) : f.type.startsWith('video/') ? (
                <Film className="ml-1 size-icon-sm shrink-0 text-muted-foreground" aria-hidden />
              ) : (
                <FileText
                  className="ml-1 size-icon-sm shrink-0 text-muted-foreground"
                  aria-hidden
                />
              )}
              <span className="max-w-3xs truncate">{f.name}</span>
              <span className="text-muted-foreground">{sizeLabel(f.size)}</span>
              <button
                type="button"
                aria-label={`Remover ${f.name}`}
                onClick={() => setFiles((l) => l.filter((_, j) => j !== i))}
                className="flex size-6 cursor-pointer items-center justify-center rounded-item text-muted-foreground hover:bg-card hover:text-foreground max-md:size-touch"
              >
                <X className="size-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      {/*
       * Conversa larga: arquivo, imagem, emoji | campo | mensagens rápidas, áudio, enviar.
       * Conversa estreita (celular ou três colunas): campo, enviar e o botão de ações, que abre
       * as outras opções.
       */}
      <div className="flex items-end gap-1">
        {recording ? (
          /* Gravação simulada: ponto pulsando, tempo e ondas no lugar do campo. */
          <div
            role="status"
            aria-live="polite"
            className="flex h-control-md min-w-0 flex-1 items-center gap-3 rounded-control border border-destructive/40 bg-destructive-soft px-3 text-destructive-soft-foreground"
          >
            <span
              aria-hidden
              className="size-3 shrink-0 animate-pulse rounded-full bg-destructive"
            />
            <span className="shrink-0 text-sm font-semibold tabular-nums">{secs(seconds)}</span>
            <span className="sr-only">Gravando áudio</span>
            <span
              aria-hidden
              className="flex h-6 min-w-0 flex-1 items-center gap-1 overflow-hidden"
            >
              {Array.from({ length: 28 }, (_, i) => (
                <span
                  key={i}
                  className="h-full w-1 shrink-0 wave-bar rounded-full bg-destructive"
                  style={{ '--delay': `${(i * 83) % 900}ms` } as CSSProperties}
                />
              ))}
            </span>
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              iconOnly
              aria-label="Anexar arquivo"
              disabled={disabled}
              onClick={() => fileInput.current?.click()}
              className="@max-xl:hidden"
            >
              <Paperclip />
            </Button>
            <Button
              variant="ghost"
              iconOnly
              aria-label="Enviar imagem ou vídeo"
              disabled={disabled}
              onClick={() => mediaInput.current?.click()}
              className="@max-xl:hidden"
            >
              <ImagePlus />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  iconOnly
                  aria-label="Emoji"
                  disabled={disabled}
                  className="@max-xl:hidden"
                >
                  <Smile />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" side="top" className="w-auto p-2">
                <EmojiGrid onPick={insertEmoji} />
              </PopoverContent>
            </Popover>
            <textarea
              ref={area}
              rows={2}
              value={text}
              disabled={disabled}
              onChange={(e) => setText(e.target.value)}
              onPaste={onPaste}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder={placeholder}
              aria-label="Mensagem"
              className="field-sizing-content h-autosize max-h-chart-sm min-h-control-md min-w-0 flex-1 resize-none rounded-control border border-input bg-field px-3 py-2 text-base wrap-break-word text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/25 disabled:opacity-60 md:text-sm"
            />
            {quickReplies?.length ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    iconOnly
                    aria-label="Mensagens rápidas"
                    disabled={disabled}
                    className="@max-xl:hidden"
                  >
                    <Zap />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" side="top" className="flex flex-col gap-2 p-2">
                  <QuickReplyList items={quickReplies} onPick={insertQuickReply} />
                </PopoverContent>
              </Popover>
            ) : null}
            <Button
              variant="ghost"
              iconOnly
              aria-label="Gravar áudio"
              disabled={disabled}
              onClick={startRecording}
              className="@max-xl:hidden"
            >
              <Mic />
            </Button>
          </>
        )}
        {recording ? (
          <>
            <Button
              variant="ghost"
              iconOnly
              aria-label="Cancelar gravação"
              onClick={() => stopRecording(false)}
            >
              <Trash2 />
            </Button>
            <Button iconOnly aria-label="Enviar áudio" onClick={() => stopRecording(true)}>
              <Send />
            </Button>
          </>
        ) : (
          <>
            <Button
              iconOnly
              aria-label="Enviar"
              disabled={disabled || (!text.trim() && !files.length)}
              onClick={send}
            >
              <Send />
            </Button>
            {/* Conversa estreita: as outras opções num só botão. */}
            <Popover open={menu !== null} onOpenChange={(v) => setMenu(v ? 'menu' : null)}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  iconOnly
                  aria-label="Mais ações da mensagem"
                  disabled={disabled}
                  className="@xl:hidden"
                >
                  <EllipsisVertical />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" side="top" className="flex flex-col gap-1 p-2">
                {menu === 'menu' && (
                  <ul className="flex flex-col gap-1" aria-label="Ações da mensagem">
                    {[
                      {
                        label: 'Anexar arquivo',
                        icon: Paperclip,
                        run: () => {
                          setMenu(null)
                          fileInput.current?.click()
                        },
                      },
                      {
                        label: 'Imagem ou vídeo',
                        icon: ImagePlus,
                        run: () => {
                          setMenu(null)
                          mediaInput.current?.click()
                        },
                      },
                      { label: 'Emoji', icon: Smile, run: () => setMenu('emoji') },
                      ...(quickReplies?.length
                        ? [{ label: 'Mensagens rápidas', icon: Zap, run: () => setMenu('quick') }]
                        : []),
                      {
                        label: 'Gravar áudio',
                        icon: Mic,
                        run: () => {
                          setMenu(null)
                          startRecording()
                        },
                      },
                    ].map((a) => (
                      <li key={a.label}>
                        <button
                          type="button"
                          onClick={a.run}
                          className="flex min-h-touch w-full cursor-pointer items-center gap-3 rounded-item px-3 text-left text-sm outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <a.icon className="size-icon-sm text-muted-foreground" aria-hidden />
                          {a.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {menu && menu !== 'menu' && (
                  <button
                    type="button"
                    onClick={() => setMenu('menu')}
                    className="flex min-h-touch cursor-pointer items-center gap-2 rounded-item px-2 text-left text-xs font-semibold outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ArrowLeft className="size-icon-sm" aria-hidden />
                    Voltar
                  </button>
                )}
                {menu === 'emoji' && (
                  <EmojiGrid
                    onPick={(em) => {
                      insertEmoji(em)
                      setMenu(null)
                    }}
                  />
                )}
                {menu === 'quick' && quickReplies && (
                  <QuickReplyList
                    items={quickReplies}
                    onPick={(t) => {
                      insertQuickReply(t)
                      setMenu(null)
                    }}
                  />
                )}
              </PopoverContent>
            </Popover>
          </>
        )}
      </div>
      <p className="hidden text-xs text-muted-foreground md:block">
        Enter envia, Shift+Enter quebra a linha. Arraste ou cole arquivos e prints no campo.
      </p>
      <input
        ref={fileInput}
        type="file"
        multiple
        hidden
        accept={accept}
        onChange={(e) => {
          add(e.target.files)
          e.target.value = ''
        }}
      />
      <input
        ref={mediaInput}
        type="file"
        multiple
        hidden
        accept="image/*,video/*"
        onChange={(e) => {
          add(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}

/** Grade de emojis do campo de mensagem. */
function EmojiGrid({ onPick }: { onPick: (emoji: string) => void }) {
  return (
    <div role="group" aria-label="Emojis" className="grid grid-cols-6 gap-1">
      {EMOJIS.map((em) => (
        <button
          key={em}
          type="button"
          onClick={() => onPick(em)}
          aria-label={`Inserir ${em}`}
          className="flex size-touch cursor-pointer items-center justify-center rounded-item text-xl hover:bg-accent md:size-control-md"
        >
          {em}
        </button>
      ))}
    </div>
  )
}

/** Lista de mensagens rápidas, com busca pelo nome ou pelo texto. */
function QuickReplyList({
  items,
  onPick,
}: {
  items: QuickReply[]
  onPick: (text: string) => void
}) {
  const [q, setQ] = useState('')
  const term = q.trim().toLowerCase()
  const list = term
    ? items.filter((i) => `${i.title} ${i.text}`.toLowerCase().includes(term))
    : items
  return (
    <>
      <span className="px-2 pt-1 text-xs font-semibold">Mensagens rápidas</span>
      <Input
        icon={<Search />}
        type="search"
        value={q}
        onChange={setQ}
        placeholder="Buscar mensagem"
        aria-label="Buscar mensagem rápida"
      />
      <ul className="flex max-h-chart-sm scrollbar-subtle flex-col gap-1 overflow-y-auto">
        {list.map((i) => (
          <li key={i.id}>
            <PopoverClose asChild>
              <button
                type="button"
                onClick={() => onPick(i.text)}
                className="flex min-h-touch w-full cursor-pointer flex-col gap-1 rounded-item px-2 py-2 text-left outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-sm font-semibold">{i.title}</span>
                <span className="line-clamp-2 text-xs text-muted-foreground">{i.text}</span>
              </button>
            </PopoverClose>
          </li>
        ))}
        {!list.length && (
          <li className="px-2 py-4 text-center text-xs text-muted-foreground">
            Nenhuma mensagem com essa busca.
          </li>
        )}
      </ul>
    </>
  )
}
