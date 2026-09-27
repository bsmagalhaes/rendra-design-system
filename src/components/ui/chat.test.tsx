// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/render'
import {
  ChannelBadge,
  ChatComposer,
  ChatThread,
  ConversationList,
  type ChatMessage,
  type Conversation,
} from './chat'

const conversations: Conversation[] = [
  {
    id: '1',
    name: 'Ana Souza',
    channel: 'whatsapp',
    lastMessage: 'Oi',
    time: new Date(),
    unread: 2,
  },
  {
    id: '2',
    name: 'Bruno Costa',
    channel: 'instagram',
    lastMessage: 'Olá',
    time: new Date(),
    unread: 1,
  },
]

const messagesById: Record<string, ChatMessage[]> = {
  '1': [{ id: 'm1', from: 'contact', text: 'Mensagem da Ana', time: new Date() }],
  '2': [{ id: 'm2', from: 'contact', text: 'Mensagem do Bruno', time: new Date() }],
}

/*
 * ConversationList, ChatThread e ChannelBadge são peças do mesmo chat de atendimento: quem
 * guarda a conversa ativa, as mensagens dela e a contagem de não lidas é quem usa o
 * componente. O invólucro reproduz uma caixa de entrada real (do jeito que a tela faz),
 * do mesmo jeito que o teste do DataToolbar já faz para busca e colunas.
 */
function InboxDemo() {
  const [items, setItems] = useState(conversations)
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = items.find((c) => c.id === activeId)
  const openConversation = (id: string) => {
    setActiveId(id)
    setItems((list) => list.map((c) => (c.id === id ? { ...c, unread: 0 } : c)))
  }
  return (
    <div>
      <ConversationList items={items} activeId={activeId} onSelect={openConversation} />
      {active && <ChannelBadge channel={active.channel} />}
      <ChatThread messages={activeId ? (messagesById[activeId] ?? []) : []} />
    </div>
  )
}

function ComposerDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  return (
    <div>
      <ChatThread messages={messages} />
      <ChatComposer
        onSend={({ text }) =>
          setMessages((m) => [
            ...m,
            { id: String(m.length), from: 'agent', text, time: new Date() },
          ])
        }
      />
    </div>
  )
}

describe('ConversationList', () => {
  it('lista as conversas com o remetente e usa o código CHAT-001', () => {
    const { container } = renderApp(<ConversationList items={conversations} onSelect={() => {}} />)
    expect(screen.getByText('Ana Souza')).toBeInTheDocument()
    expect(screen.getByText('Bruno Costa')).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="CHAT-001"]')).toBeInTheDocument()
  })

  it('sem conversas, mostra o texto do estado vazio', () => {
    renderApp(<ConversationList items={[]} onSelect={() => {}} empty="Nada por aqui" />)
    expect(screen.getByText('Nada por aqui')).toBeInTheDocument()
  })
})

describe('abrir uma conversa', () => {
  it('marca a conversa como atual, troca as mensagens exibidas, mostra o canal e some com a contagem de não lidas', async () => {
    const { container } = renderApp(<InboxDemo />)
    const anaButton = screen.getByText('Ana Souza').closest('button')!
    expect(anaButton).not.toHaveAttribute('aria-current')
    expect(screen.getByText('2')).toBeInTheDocument()

    await userEvent.click(anaButton)
    expect(anaButton).toHaveAttribute('aria-current', 'true')
    expect(screen.getByText('Mensagem da Ana')).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="BDG-001"]')).toHaveTextContent('WhatsApp')
    expect(screen.queryByText('2')).not.toBeInTheDocument()

    const brunoButton = screen.getByText('Bruno Costa').closest('button')!
    await userEvent.click(brunoButton)
    expect(screen.getByText('Mensagem do Bruno')).toBeInTheDocument()
    expect(screen.queryByText('Mensagem da Ana')).not.toBeInTheDocument()
    expect(container.querySelector('[data-rendra="BDG-001"]')).toHaveTextContent('Instagram')
  })
})

describe('ChatThread', () => {
  it('mostra as mensagens e usa o código CHAT-002', () => {
    renderApp(<ChatThread messages={messagesById['1']!} />)
    expect(screen.getByRole('log')).toHaveAttribute('data-rendra', 'CHAT-002')
    expect(screen.getByText('Mensagem da Ana')).toBeInTheDocument()
  })
})

describe('ChatComposer', () => {
  it('renderiza o campo de mensagem com o código CHAT-003', () => {
    const { container } = renderApp(<ChatComposer onSend={() => {}} />)
    expect(container.querySelector('[data-rendra="CHAT-003"]')).toBeInTheDocument()
  })

  it('sem texto nem anexo, o botão de enviar fica desabilitado', () => {
    renderApp(<ChatComposer onSend={() => {}} />)
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled()
  })

  it('escrever e enviar mostra a mensagem nova na lista, e limpa o campo', async () => {
    renderApp(<ComposerDemo />)
    const campo = screen.getByRole('textbox', { name: 'Mensagem' })
    await userEvent.type(campo, 'Olá, tudo bem?')
    const enviar = screen.getByRole('button', { name: 'Enviar' })
    expect(enviar).toBeEnabled()
    await userEvent.click(enviar)
    expect(screen.getByText('Olá, tudo bem?')).toBeInTheDocument()
    expect(campo).toHaveValue('')
    expect(enviar).toBeDisabled()
  })
})
