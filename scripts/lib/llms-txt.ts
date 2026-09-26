/*
 * llms.txt (https://llmstxt.org): resumo em Markdown para assistentes de IA, montado por
 * scripts/seo-build.mjs depois do build. Função pura: recebe os dados do site e das telas já
 * resolvidos (nome, descrição e repositório do site; título, descrição e URL de cada página),
 * nunca lê arquivo nem grava nada, para dar teste de verdade sem rodar o build inteiro.
 */

export interface LlmsTxtSite {
  name: string
  description: string
  repository: string
}

export interface LlmsTxtPage {
  title: string
  description: string
  url: string
}

export function buildLlmsTxt(params: {
  site: LlmsTxtSite
  pages: LlmsTxtPage[]
  storybookUrl: string
}): string {
  const { site, pages, storybookUrl } = params
  return `# ${site.name}

> ${site.description}

Código aberto (licença MIT): ${site.repository}

## Para quem

Times de produto e desenvolvedores React que precisam de um layout de sistema administrativo
pronto (dashboard, listagens, formulários, CRM kanban, agenda, chat), seja para começar um
sistema novo ou para migrar o layout de um sistema existente.

## O que é

Template de sistema e design system em React 19, TypeScript, Vite e Tailwind CSS v4, com Radix e
shadcn/ui copiados para o projeto. Serve para criar sistemas novos e para migrar o layout de
sistemas existentes. Três modelos de layout (Safira, Equilíbrio e Aurora), quatro paletas, seis
tipos de menu e um código para cada combinação.

## Regras de interface

- Um componente por finalidade: diferenças por props, nunca um arquivo parecido.
- Mobile-first real: tudo escrito para 360 px, sem rolagem horizontal, toque de 44 px.
- Marca isolada em theme.css, brand.config.ts e src/brand/assets (white label).
- Só a escala de espaço e tokens nomeados; sem valor arbitrário nem estilo inline.
- Ações sempre em lugares previstos (rodapé fixo, barra da tabela, cabeçalho); texto
  orientativo em modal aberto por um ícone de informação.
- Interface em português do Brasil, datas em DD/MM/AAAA e valores em R$ 1.250,00.

## Instalação

\`\`\`bash
npm install @rendra-ui/web react react-dom radix-ui
\`\`\`

## CLI (\`rendra\`)

\`\`\`bash
rendra codigos                        # lista o catálogo de códigos de componente
rendra auditar [pasta]                # regras genéricas de DESIGN_RULES.md (padrão: pasta atual)
rendra trocar <DE> <PARA> [--dry-run] # troca a variante DE pela PARA no projeto
\`\`\`

## Telas do demo

${pages.map((p) => `- [${p.title}](${p.url}): ${p.description}`).join('\n')}
- [Storybook](${storybookUrl}): todos os componentes com as props.

## Documentação

- [README](${site.repository}#readme)
- [Regras de design](${site.repository}/blob/main/DESIGN_RULES.md)
- [Como aplicar em outro projeto](${site.repository}/blob/main/docs/COMO_APLICAR.md)
- [Instruções para agentes de IA](${site.repository}/blob/main/AGENTS.md)
`
}
