#!/usr/bin/env node
/*
 * Compõe .pages/<repo>/ a partir de dist/ (demo, registry e Storybook, já construídos) e docs/
 * (página de apresentação): node scripts/pages-stage.mjs. É a mesma árvore que o Playwright do
 * test:site serve, então o que se testa é o que vai ao ar.
 */
import { routeSeo, siteSeo } from '../src/config/seo.ts'
import { buildLlmsTxt } from './lib/llms-txt.ts'
import { pagesEnv } from './lib/pages-env.ts'
import { stageSite } from './lib/pages-stage.ts'
import { routeUrl } from './lib/sitemap.ts'

const { rootUrl, siteUrl, outDir } = pagesEnv(process.env)

// [rota, seo] das telas indexáveis; `/pagina-inexistente` (noindex) fica de fora (W2).
const indexaveis = Object.entries(routeSeo).filter(([, seo]) => seo.indexable !== false)

// O llms.txt da raiz descreve o produto, não a página de venda da demo: mesma estrutura do da demo,
// com as telas sob /demo/ e o Storybook pela raiz (W10), e uma descrição sem promessa de preço (W18).
const descricao =
  'Design system e boilerplate React (Vite, TypeScript, Tailwind CSS v4, Radix e shadcn/ui) para sistemas administrativos: dashboard, tabelas, formulários, CRM kanban, agenda, chat omnichannel e mais de 50 componentes. Mobile-first, acessível (WCAG 2.1 AA), em português do Brasil e pronto para white label. Licença MIT, código completo no GitHub, uso comercial permitido.'

const llmsTxt = buildLlmsTxt({
  site: { name: siteSeo.name, description: descricao, repository: siteSeo.repository },
  pages: indexaveis.map(([rota, seo]) => ({
    title: seo.title,
    description: seo.description,
    url: routeUrl(siteUrl, rota),
  })),
  storybookUrl: `${rootUrl}storybook/`,
})

stageSite({
  distDir: 'dist',
  docsDir: 'docs',
  outDir,
  rootUrl,
  routes: indexaveis.map(([rota]) => rota),
  llmsTxt,
})
console.log(`pages-stage: OK (${outDir}, ${rootUrl})`)
