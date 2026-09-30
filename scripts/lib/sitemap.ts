/*
 * Sitemap e endereços da demo, extraídos de scripts/seo-build.mjs (achado C8 do Opus) para terem
 * teste. O Storybook não entra: ele vive na raiz do site (`/storybook/`), fora de `/demo/`, e o
 * protocolo só aceita URLs sob o caminho do próprio sitemap; o da raiz o lista (pages-stage.ts).
 * Toda rota do web é uma pasta no Pages (`/kanban` redireciona para `/kanban/`), então o
 * endereço canônico de uma rota termina em barra.
 */

/** Endereço de uma rota sob a URL base (`/` é a própria URL base). */
export function routeUrl(siteUrl: string, route: string): string {
  return route === '/' ? siteUrl : `${siteUrl}${route.slice(1)}/`
}

/** URL da raiz do site: a da demo (`.../demo/`) sem o `demo/` final. */
export function rootUrlFrom(siteUrl: string): string {
  return siteUrl.replace(/demo\/$/, '')
}

export function sitemapXml({
  siteUrl,
  routes,
  today = new Date().toISOString().slice(0, 10),
}: {
  siteUrl: string
  routes: string[]
  today?: string
}): string {
  const itens = routes.map(
    (route) =>
      `  <url><loc>${routeUrl(siteUrl, route)}</loc><lastmod>${today}</lastmod><priority>${route === '/' ? '1.0' : '0.7'}</priority></url>`,
  )
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${itens.join('\n')}
</urlset>
`
}
