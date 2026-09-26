/*
 * Banner gravado no topo de cada arquivo publicado do pacote (JS e CSS), com a versão
 * exata de `package.json` no momento do build (nunca escrita à mão em mais de um lugar):
 * `vite.lib.config.ts` usa para o JS, `scripts/build-lib.mjs` para o CSS, e
 * `scripts/verify-pack.mjs` para conferir que os dois saíram com o banner certo.
 */
export function packageBanner(version: string): string {
  return `/*! Rendra Design System v${version} | MIT | © 2026 Bruno Magalhaes | brunomagalhaes.me */`
}
