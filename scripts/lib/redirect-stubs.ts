/*
 * Páginas de redirecionamento das rotas antigas do web (achado A10): antes a demo vivia na raiz
 * do site (`/rendra-ui-web/clientes/`) e o README 2.2.2, publicado no npm, linka esses endereços.
 * Cada rota antiga ganha uma página que responde 200 e leva para `/demo/<rota>/`.
 */
import { escapeHtml } from './html.ts'

/** Destinos que já existem na raiz do Pages e nunca recebem um stub. */
const RESERVADOS = ['demo', 'r', 'storybook']

/**
 * HTML de redirecionamento: `refresh` para quem não roda script, `canonical` para o buscador
 * consolidar no endereço novo e um script que preserva a query e o hash (o refresh sozinho
 * perde o `?imagem=` que o README linka). Sem `noindex`: junto de `refresh` e `canonical` ele
 * manda sinais conflitantes (observação O2 do Opus).
 */
export function buildRedirectStub(destino: string): string {
  const url = escapeHtml(destino)
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Esta página mudou de endereço</title>
<meta http-equiv="refresh" content="0; url=${url}">
<link rel="canonical" href="${url}">
<script>location.replace(${JSON.stringify(destino)} + location.search + location.hash)</script>
</head>
<body>
<p>Esta página mudou de endereço. <a href="${url}">Abrir a demo do Rendra Design System</a>.</p>
</body>
</html>
`
}

/** Rotas do app (`/clientes`) sem a barra inicial, descartando a raiz e os destinos reservados. */
export function staleRoutePaths(routes: string[]): string[] {
  return routes
    .map((rota) => rota.replace(/^\//, ''))
    .filter((rota) => rota !== '' && !RESERVADOS.includes(rota.split('/')[0] as string))
}
