import type { ChatChannel, ChatMessage, Conversation, QuickReply } from '@/components/ui/chat'
import { photoAt } from './avatars'

/* Conversas fictícias de atendimento omnichannel, sempre em torno de agora. */

export type TicketStage = 'ura' | 'fila' | 'atendimento' | 'encerrado'

export interface Ticket extends Conversation {
  stage: TicketStage
  phone?: string
  email?: string
  tags?: string[]
  messages: ChatMessage[]
}

/** Time interno (atendentes). */
export const agents = [
  'Ana Ribeiro',
  'Bruno Costa',
  'Carla Mendes',
  'Diego Martins',
  'Elisa Rocha',
  'Fábio Lima',
  'Gabriela Nunes',
  'Heitor Alves',
]
/** Fotos do time (banco de retratos de demonstração). */
export const agentPhoto: Record<string, string | undefined> = Object.fromEntries(
  agents.map((a, i) => [a, photoAt([0, 6, 4, 13, 1, 8, 11, 3][i] ?? i)]),
)
/** Quem está online agora. */
export const agentOnline: Record<string, boolean> = Object.fromEntries(
  agents.map((a, i) => [a, i % 3 !== 2]),
)
const departments: Record<TicketStage, string> = {
  ura: 'Triagem',
  fila: 'Suporte',
  atendimento: 'Comercial',
  encerrado: 'Comercial',
}
const accounts: Record<ChatChannel, string> = {
  whatsapp: 'Comercial',
  'whatsapp-web': 'Suporte',
  tiktok: '@rendra',
  google: 'Loja Centro',
  reclameaqui: 'Rendra',
  instagram: '@rendra',
  facebook: 'Rendra',
  site: 'Chat do site',
  email: 'contato@',
  sms: 'Avisos',
}

const ago = (min: number) => new Date(Date.now() - min * 60_000)

interface Seed {
  name: string
  channel: ChatChannel
  stage: TicketStage
  minutes: number
  assignee?: string
  unread?: number
  tags?: string[]
  script: [ChatMessage['from'], string][]
  /** Respostas com citação: [mensagem, mensagem citada], pelas posições no script. */
  replies?: [number, number][]
}

const seeds: Seed[] = [
  {
    name: 'Mariana Alves',
    channel: 'whatsapp',
    stage: 'ura',
    minutes: 2,
    tags: ['Segunda via'],
    script: [
      ['contact', 'Oi, preciso da segunda via do boleto.'],
      ['bot', 'Olá, Mariana! Sou a assistente virtual. Para qual contrato é a segunda via?'],
      ['contact', 'Do plano Empresa, vence dia 10.'],
      ['bot', 'Encontrei o contrato 1042. Quer que eu envie o boleto por aqui ou por e-mail?'],
    ],
  },
  {
    name: 'Pedro Henrique',
    channel: 'google',
    stage: 'ura',
    minutes: 5,
    script: [
      ['contact', 'Qual o horário de atendimento?'],
      ['bot', 'Atendemos de segunda a sexta, das 8h às 18h. Posso ajudar em mais alguma coisa?'],
    ],
  },
  {
    name: 'Luciana Freitas',
    channel: 'instagram',
    stage: 'ura',
    minutes: 9,
    tags: ['Orçamento'],
    script: [
      ['contact', 'Vocês atendem em Curitiba?'],
      ['bot', 'Atendemos sim! Quer falar com um consultor para um orçamento?'],
      ['contact', 'Quero sim.'],
    ],
  },
  {
    name: 'Clínica Vida Plena',
    channel: 'whatsapp-web',
    stage: 'fila',
    minutes: 14,
    unread: 3,
    tags: ['Suporte', 'Prioridade'],
    script: [
      ['bot', 'Olá! Em que posso ajudar?'],
      ['contact', 'O sistema não está gerando as notas desde ontem.'],
      ['bot', 'Entendi. Vou transferir para um atendente do suporte.'],
      ['system', 'Conversa entrou na fila do Suporte'],
      ['contact', 'Tem previsão? Temos pacientes esperando.'],
    ],
  },
  {
    name: 'Rafael Moreira',
    channel: 'facebook',
    stage: 'fila',
    minutes: 6,
    unread: 1,
    script: [
      ['contact', 'Quero cancelar a assinatura.'],
      ['bot', 'Vou chamar alguém da equipe para te ajudar com isso.'],
      ['system', 'Conversa entrou na fila do Financeiro'],
    ],
  },
  {
    name: 'Thiago Lopes',
    channel: 'tiktok',
    stage: 'fila',
    minutes: 11,
    unread: 1,
    script: [
      ['contact', 'Vi o vídeo de vocês, dá para integrar com minha loja virtual?'],
      ['bot', 'Dá sim! Vou chamar um consultor para explicar as integrações.'],
      ['system', 'Conversa entrou na fila do Comercial'],
    ],
  },
  {
    name: 'Renata Souza',
    channel: 'reclameaqui',
    stage: 'fila',
    minutes: 52,
    unread: 1,
    tags: ['Reclamação'],
    script: [
      ['contact', 'Fui cobrada duas vezes no mesmo mês e ninguém me respondeu.'],
      ['system', 'Conversa entrou na fila do Financeiro'],
    ],
  },
  {
    name: 'Padaria Bom Grão',
    channel: 'email',
    stage: 'fila',
    minutes: 38,
    unread: 1,
    tags: ['Financeiro'],
    script: [
      ['contact', 'Bom dia. Segue em anexo o comprovante do pagamento de agosto.'],
      ['system', 'Conversa entrou na fila do Financeiro'],
    ],
  },
  {
    name: 'Oficina Rota Sul',
    channel: 'whatsapp',
    stage: 'atendimento',
    minutes: 3,
    assignee: 'Ana Ribeiro',
    unread: 2,
    tags: ['Implantação'],
    script: [
      ['contact', 'Bom dia! Quando começa o treinamento da equipe?'],
      ['system', 'Ana Ribeiro assumiu a conversa'],
      ['agent', 'Bom dia! Temos horário na quinta às 14h ou na sexta às 9h. Qual fica melhor?'],
      ['contact', 'Quinta às 14h.'],
      ['contact', 'Pode ser online?'],
      ['agent', 'Pode sim! Envio o link da reunião na quarta.'],
    ],
    replies: [[5, 4]],
  },
  {
    name: 'Juliana Prado',
    channel: 'instagram',
    stage: 'atendimento',
    minutes: 12,
    assignee: 'Bruno Costa',
    script: [
      ['contact', 'Vi o anúncio do plano Profissional, tem teste grátis?'],
      ['system', 'Bruno Costa assumiu a conversa'],
      ['agent', 'Oi, Juliana! Tem sim, 14 dias sem compromisso. Posso ativar para você?'],
    ],
  },
  {
    name: 'Mercado Central',
    channel: 'sms',
    stage: 'atendimento',
    minutes: 25,
    assignee: 'Ana Ribeiro',
    script: [
      ['contact', 'Preciso alterar o endereço de cobrança.'],
      ['system', 'Ana Ribeiro assumiu a conversa'],
      ['agent', 'Claro! Qual o novo CEP?'],
    ],
  },
  {
    name: 'Escola Saber',
    channel: 'site',
    stage: 'encerrado',
    minutes: 180,
    assignee: 'Carla Mendes',
    tags: ['Resolvido'],
    script: [
      ['contact', 'Consegui acessar, obrigada!'],
      ['agent', 'Que bom! Qualquer coisa, estamos por aqui.'],
      ['system', 'Carla Mendes encerrou a conversa'],
    ],
  },
  {
    name: 'Indústria Aço Forte',
    channel: 'email',
    stage: 'encerrado',
    minutes: 1440,
    assignee: 'Bruno Costa',
    tags: ['Contrato'],
    script: [
      ['contact', 'Contrato assinado e enviado.'],
      ['agent', 'Recebido! Bem-vindos à Rendra.'],
      ['system', 'Bruno Costa encerrou a conversa'],
    ],
  },
]

export function demoTickets(): Ticket[] {
  return seeds.map((s, i) => {
    const messages: ChatMessage[] = s.script.map(([from, text], j) => ({
      id: `m${i}-${j}`,
      from,
      text,
      time: ago(s.minutes + (s.script.length - j) * 2),
      author: from === 'bot' ? 'Assistente virtual' : from === 'agent' ? s.assignee : s.name,
      avatar:
        from === 'agent'
          ? agentPhoto[s.assignee ?? '']
          : from === 'contact'
            ? photoAt(i + 1)
            : undefined,
      status: from === 'agent' ? 'read' : undefined,
    }))
    for (const [j, k] of s.replies ?? []) {
      const quoted = messages[k]
      if (messages[j] && quoted)
        messages[j].replyTo = { id: quoted.id, author: quoted.author, text: quoted.text }
    }
    const last = messages[messages.length - 1]
    return {
      id: `t${i + 1}`,
      name: s.name,
      avatar: photoAt(i + 1),
      channel: s.channel,
      account: accounts[s.channel],
      department: departments[s.stage],
      stage: s.stage,
      lastMessage: last?.text ?? '',
      time: last?.time ?? ago(s.minutes),
      unread: s.unread,
      waitingSince: s.stage === 'fila' ? ago(s.minutes) : undefined,
      assignee: s.assignee,
      tags: s.tags,
      phone:
        s.channel === 'whatsapp' || s.channel === 'whatsapp-web' || s.channel === 'sms'
          ? `(11) 9${String(8000 + i * 37).slice(-4)}-${String(1200 + i * 91).slice(-4)}`
          : undefined,
      email:
        s.channel === 'email' || s.channel === 'site'
          ? `${s.name
              .toLowerCase()
              .normalize('NFD')
              .replace(/[^a-z ]/g, '')
              .replace(/ /g, '.')}@exemplo.com.br`
          : undefined,
      messages,
    }
  })
}

/** Mensagens rápidas cadastradas (o atendente escolhe e revisa antes de enviar). */
export const quickReplies: QuickReply[] = [
  {
    id: 'q1',
    title: 'Saudação',
    text: 'Olá! Tudo bem? Sou do time de atendimento, como posso ajudar?',
  },
  {
    id: 'q2',
    title: 'Pedir um instante',
    text: 'Um instante, por favor, vou verificar isso para você.',
  },
  {
    id: 'q3',
    title: 'Segunda via do boleto',
    text: 'Envio a segunda via do boleto por aqui mesmo. Confirma o CPF ou CNPJ do contrato?',
  },
  {
    id: 'q4',
    title: 'Horário de atendimento',
    text: 'Atendemos de segunda a sexta, das 8h às 18h, e aos sábados das 8h às 12h.',
  },
  {
    id: 'q5',
    title: 'Agendar treinamento',
    text: 'Temos horários na quinta às 14h ou na sexta às 9h. Qual fica melhor para a sua equipe?',
  },
  {
    id: 'q6',
    title: 'Encerramento',
    text: 'Posso ajudar em mais alguma coisa? Se não, vou encerrar o atendimento. Obrigado pelo contato!',
  },
]
