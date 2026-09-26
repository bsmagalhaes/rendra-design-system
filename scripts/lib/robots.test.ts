import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { AI_TRAINING_BOTS, buildRobotsTxt } from './robots'

describe('buildRobotsTxt', () => {
  const txt = buildRobotsTxt('https://exemplo.test/')

  it('libera todo robô por padrão', () => {
    expect(txt).toContain('User-agent: *\nAllow: /')
  })

  it('bloqueia as dez diretivas de robô de IA', () => {
    expect(AI_TRAINING_BOTS).toHaveLength(10)
    for (const bot of AI_TRAINING_BOTS) {
      expect(txt).toContain(`User-agent: ${bot}\nDisallow: /`)
    }
  })

  it('inclui os dez robôs esperados pelo plano da fase 3', () => {
    expect(AI_TRAINING_BOTS).toEqual([
      'GPTBot',
      'ChatGPT-User',
      'OAI-SearchBot',
      'ClaudeBot',
      'anthropic-ai',
      'CCBot',
      'Google-Extended',
      'PerplexityBot',
      'Bytespider',
      'Applebot-Extended',
    ])
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
