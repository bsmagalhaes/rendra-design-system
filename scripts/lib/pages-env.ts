/*
 * Endereços do GitHub Pages derivados do repositório (achado C10 do Opus): no Actions,
 * GITHUB_REPOSITORY (`dono/repo`) e GITHUB_REPOSITORY_OWNER definem tudo, então um fork publica
 * no próprio endereço sem editar script. Fora do Actions, vale o repositório do Rendra.
 */

export interface PagesEnv {
  repo: string
  owner: string
  /** Base do build da demo (BASE_PATH do Vite). */
  basePath: string
  /** URL pública da demo (SITE_URL do build). */
  siteUrl: string
  /** URL pública da raiz do site. */
  rootUrl: string
  /** Pasta que o GitHub Pages publica. */
  outDir: string
}

export function pagesEnv(env: Record<string, string | undefined>): PagesEnv {
  const [dono, nome] = (env.GITHUB_REPOSITORY ?? '').split('/')
  const repo = nome ? nome : 'rendra-ui-web'
  const owner = env.GITHUB_REPOSITORY_OWNER ?? (nome && dono ? dono : 'bsmagalhaes')
  const rootUrl = `https://${owner}.github.io/${repo}/`
  return {
    repo,
    owner,
    basePath: `/${repo}/demo/`,
    siteUrl: `${rootUrl}demo/`,
    rootUrl,
    outDir: `.pages/${repo}`,
  }
}
