/*
 * robots.txt gerado por scripts/seo-build.mjs: bloqueia os robôs de treinamento de IA, mantém
 * tudo liberado para os buscadores comuns. Módulo único: o script e o teste (robots.test.ts)
 * importam daqui, para nunca divergir.
 */

/**
 * Robôs de IA a bloquear: rastreiam o site para treinar modelo ou para responder pergunta de
 * assistente com o conteúdo dele. O robô de BUSCA da mesma empresa continua liberado (ex.:
 * Googlebot, que indexa para o Google buscador, é diferente do Google-Extended da lista, que
 * só treina modelo).
 */
export const AI_TRAINING_BOTS = [
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
]

/** robots.txt: liberado para todo robô, bloqueado só para os de IA listados acima. */
export function buildRobotsTxt(siteUrl: string): string {
  const blocks = AI_TRAINING_BOTS.map((bot) => `User-agent: ${bot}\nDisallow: /`).join('\n\n')
  return `# Liberado para todo robô de busca. Bloqueado para os robôs de IA (treinam modelo ou
# respondem pergunta de assistente com o conteúdo do site).
User-agent: *
Allow: /

${blocks}

Sitemap: ${siteUrl}sitemap.xml
`
}
