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
import { buildLlmsTxt } from './lib/llms-txt.ts'
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

writeFileSync(
  join(DIST, 'llms.txt'),
  buildLlmsTxt({
    site: siteSeo,
    pages: indexable.map(([route, s]) => ({
      title: s.title,
      description: s.description,
      url: urlFor(route),
    })),
    storybookUrl: `${SITE}storybook/`,
  }),
)

console.log(
  `SEO: ${routes.length} páginas, sitemap com ${indexable.length + 1} endereços, robots.txt e llms.txt.`,
)
