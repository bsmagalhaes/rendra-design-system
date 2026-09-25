// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render'
import {
  ChatComposer,
  ChatThread,
  ConversationList,
  type ChatMessage,
  type Conversation,
} from './chat'

const conversations: Conversation[] = [
  { id: '1', name: 'Ana Souza', channel: 'whatsapp', lastMessage: 'Oi', time: new Date() },
]

const messages: ChatMessage[] = [{ id: 'm1', from: 'contact', text: 'Olá', time: new Date() }]

describe('ConversationList', () => {
  it('lista as conversas e usa o código CHAT-001', () => {
    const { container } = renderApp(<ConversationList items={conversations} onSelect={() => {}} />)
    expect(screen.getByText('Ana Souza')).toBeInTheDocument()
    expect(container.querySelector('[data-rendra="CHAT-001"]')).toBeInTheDocument()
  })
})

describe('ChatThread', () => {
  it('mostra as mensagens e usa o código CHAT-002', () => {
    renderApp(<ChatThread messages={messages} />)
    expect(screen.getByRole('log')).toHaveAttribute('data-rendra', 'CHAT-002')
  })
})

describe('ChatComposer', () => {
  it('renderiza o campo de mensagem com o código CHAT-003', () => {
    const onSend = vi.fn()
    const { container } = renderApp(<ChatComposer onSend={onSend} />)
    expect(container.querySelector('[data-rendra="CHAT-003"]')).toBeInTheDocument()
  })
})
