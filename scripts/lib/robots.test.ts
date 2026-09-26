import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { AI_SEARCH_BOTS, AI_TRAINING_BOTS, buildRobotsTxt } from './robots'

describe('buildRobotsTxt', () => {
  const txt = buildRobotsTxt('https://exemplo.test/')

  it('libera todo robô por padrão', () => {
    expect(txt).toContain('User-agent: *\nAllow: /')
  })

  it('bloqueia as sete diretivas de robô de treino de IA', () => {
    expect(AI_TRAINING_BOTS).toHaveLength(7)
    for (const bot of AI_TRAINING_BOTS) {
      expect(txt).toContain(`User-agent: ${bot}\nDisallow: /`)
    }
  })

  it('inclui os sete robôs de treino esperados', () => {
    expect(AI_TRAINING_BOTS).toEqual([
      'GPTBot',
      'ClaudeBot',
      'anthropic-ai',
      'CCBot',
      'Google-Extended',
      'Bytespider',
      'Applebot-Extended',
    ])
  })

  it('libera os seis robôs de busca e de resposta de assistente de IA, sem Disallow', () => {
    expect(AI_SEARCH_BOTS).toHaveLength(6)
    expect(AI_SEARCH_BOTS).toEqual([
      'OAI-SearchBot',
      'ChatGPT-User',
      'Claude-SearchBot',
      'Claude-User',
      'PerplexityBot',
      'Perplexity-User',
    ])
    for (const bot of AI_SEARCH_BOTS) {
      expect(txt).not.toContain(`User-agent: ${bot}\nDisallow: /`)
    }
  })

  it('aponta o sitemap do site recebido', () => {
    expect(txt).toContain('Sitemap: https://exemplo.test/sitemap.xml')
  })
})

describe('index.html (meta noai/noimageai ao lado do robots)', () => {
  const html = readFileSync(join(import.meta.dirname, '../../index.html'), 'utf8')

  it('tem a meta noai', () => {
    expect(html).toMatch(/<meta name="noai" content="noai" \/>/)
  })

  it('tem a meta noimageai', () => {
    expect(html).toMatch(/<meta name="noimageai" content="noimageai" \/>/)
  })

  it('mantém o robots já existente', () => {
    expect(html).toContain(
      '<meta name="robots" content="index, follow, max-image-preview:large" />',
    )
  })
})
