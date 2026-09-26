/**
 * SEO e AEO depois do build (roda no pages.yml, depois de `npm run build`):
 *  - uma página estática por rota (dist/clientes/index.html etc.), com título, descrição,
 *    canonical e Open Graph da rota. Assim o GitHub Pages responde 200 em link direto, em vez
 *    do 404.html, e o buscador indexa cada tela;
 *  - sitemap.xml, robots.txt (liberado para busca, bloqueado para os robôs de IA,
 *    scripts/lib/robots.ts) e llms.txt.
 * Textos em src/config/seo.ts. Endereço público em SITE_URL (padrão: o demo no GitHub Pages).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { routeSeo, siteSeo } from '../src/config/seo.ts'
import { buildRobotsTxt } from './lib/robots.ts'

const DIST = 'dist'
const SITE = (process.env.SITE_URL ?? siteSeo.url).replace(/\/?$/, '/')
const template = readFileSync(join(DIST, 'index.html'), 'utf8')
const today = new Date().toISOString().slice(0, 10)

// Escape de atributo HTML para os textos fixos de src/config/seo.ts (não há entrada de usuário).
const esc = (s) =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
// Cada rota é uma pasta no Pages (/kanban redireciona para /kanban/): o endereço canônico tem a barra.
const urlFor = (route) => (route === '/' ? SITE : `${SITE}${route.slice(1)}/`)

/** Troca o conteúdo de uma meta (name ou property) no HTML. */
function setMeta(html, attr, key, value) {
  const re = new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`)
  return html.replace(re, `$1${esc(value)}$2`)
}

function pageFor(route, seo) {
  const title = `${seo.title} | ${siteSeo.name}`
  const url = urlFor(route)
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
  html = setMeta(html, 'name', 'description', seo.description)
  html = setMeta(html, 'property', 'og:title', title)
  html = setMeta(html, 'property', 'og:description', seo.description)
  html = setMeta(html, 'property', 'og:url', url)
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
  if (seo.indexable === false) html = setMeta(html, 'name', 'robots', 'noindex, follow')
  return html
}

const routes = Object.entries(routeSeo)
for (const [route, seo] of routes) {
  if (route === '/') {
    writeFileSync(join(DIST, 'index.html'), pageFor(route, { ...seo, title: siteSeo.tagline }))
    continue
  }
  const file = join(DIST, route, 'index.html')
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, pageFor(route, seo))
}

// Rota que não existe: o 404.html devolve o app, que mostra a tela de erro.
writeFileSync(
  join(DIST, '404.html'),
  setMeta(
    pageFor('/pagina-inexistente', routeSeo['/pagina-inexistente']),
    'name',
    'robots',
    'noindex',
  ),
)

const indexable = routes.filter(([, s]) => s.indexable !== false)
writeFileSync(
  join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable
  .map(
    ([route]) =>
      `  <url><loc>${urlFor(route)}</loc><lastmod>${today}</lastmod><priority>${route === '/' ? '1.0' : '0.7'}</priority></url>`,
  )
  .join('\n')}
  <url><loc>${SITE}storybook/</loc><lastmod>${today}</lastmod><priority>0.6</priority></url>
</urlset>
`,
)

writeFileSync(join(DIST, 'robots.txt'), buildRobotsTxt(SITE))

// llms.txt: resumo em Markdown para assistentes de IA (https://llmstxt.org).
writeFileSync(
  join(DIST, 'llms.txt'),
  `# ${siteSeo.name}

> ${siteSeo.description}

Código aberto (licença MIT): ${siteSeo.repository}

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

## Telas do demo

${indexable.map(([route, s]) => `- [${s.title}](${urlFor(route)}): ${s.description}`).join('\n')}
- [Storybook](${SITE}storybook/): todos os componentes com as props.

## Documentação

- [README](${siteSeo.repository}#readme)
- [Regras de design](${siteSeo.repository}/blob/main/DESIGN_RULES.md)
- [Como aplicar em outro projeto](${siteSeo.repository}/blob/main/docs/COMO_APLICAR.md)
- [Instruções para agentes de IA](${siteSeo.repository}/blob/main/AGENTS.md)
`,
)

console.log(
  `SEO: ${routes.length} páginas, sitemap com ${indexable.length + 1} endereços, robots.txt e llms.txt.`,
)
