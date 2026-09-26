/*
 * robots.txt gerado por scripts/seo-build.mjs: bloqueia os robôs de treinamento de IA, mantém
 * tudo liberado para os buscadores comuns e para os robôs de busca e resposta de assistente de
 * IA. Módulo único: o script e o teste (robots.test.ts) importam daqui, para nunca divergir.
 */

/**
 * Robôs de IA a bloquear: rastreiam o site inteiro para treinar modelo, sem pedido de ninguém.
 * O robô de BUSCA da mesma empresa continua liberado (ex.: Googlebot, que indexa para o Google
 * buscador, é diferente do Google-Extended da lista, que só treina modelo).
 */
export const AI_TRAINING_BOTS = [
  'GPTBot',
  'ClaudeBot',
  'anthropic-ai',
  'CCBot',
  'Google-Extended',
  'Bytespider',
  'Applebot-Extended',
]

/**
 * Robôs de busca ou de resposta ao vivo de assistente de IA: buscam uma página específica a
 * pedido de alguém, igual a um buscador comum, em vez de rastrear o site inteiro para treinar
 * modelo. Liberados de propósito: buildRobotsTxt nunca os bloqueia.
 */
export const AI_SEARCH_BOTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
]

/** robots.txt: liberado para todo robô, bloqueado só para os de IA listados acima. */
export function buildRobotsTxt(siteUrl: string): string {
  const blocks = AI_TRAINING_BOTS.map((bot) => `User-agent: ${bot}\nDisallow: /`).join('\n\n')
  return `# Liberado para todo robô de busca, inclusive os de busca e resposta de assistente de
# IA a pedido de alguém. Bloqueado só para os robôs que rastreiam o site inteiro para treinar
# modelo.
User-agent: *
Allow: /

${blocks}

Sitemap: ${siteUrl}sitemap.xml
`
}
