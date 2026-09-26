/*
 * `typescript` não é dependência de execução do pacote (decisão do coordenador, fase 3, Lote
 * B): entra em peerDependencies com peerDependenciesMeta.typescript.optional = true. `rendra
 * trocar` (o único comando que precisa do parser) carrega o `typescript` do PROJETO DO
 * USUÁRIO por import dinâmico, resolvido a partir do `cwd` passado na linha de comando, nunca
 * o `typescript` deste repositório: um projeto de destino sem `typescript` instalado não deve
 * quebrar ao instalar o pacote, só ao rodar `rendra trocar` sem o parser disponível, com uma
 * mensagem clara em português.
 */
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

export const TYPESCRIPT_NOT_FOUND_MESSAGE =
  'Não encontrei o pacote "typescript" no projeto. O comando "rendra trocar" precisa dele ' +
  'para ler e reescrever o JSX: rode "npm install --save-dev typescript" (ou o equivalente do ' +
  'seu gerenciador de pacotes) no projeto de destino e tente de novo.'

/**
 * Resolve e importa o `typescript` a partir de `cwd` (a árvore node_modules do PROJETO DE
 * DESTINO, nunca a deste repositório): `createRequire` com um nome de arquivo dentro de `cwd`
 * refaz a resolução `require` do Node a partir dali, subindo por node_modules como o Node
 * faria para qualquer import do próprio projeto. Sem o pacote instalado ali (nem em nenhum
 * node_modules acima), devolve `undefined`; quem chama decide a mensagem e o código de saída.
 */
export async function loadTypeScript(
  cwd: string,
): Promise<typeof import('typescript') | undefined> {
  let specifier: string
  try {
    const requireFromCwd = createRequire(join(cwd, 'package.json'))
    specifier = requireFromCwd.resolve('typescript')
  } catch {
    return undefined
  }
  const mod = (await import(pathToFileURL(specifier).href)) as {
    default?: typeof import('typescript')
  } & typeof import('typescript')
  return (mod.default ?? mod) as typeof import('typescript')
}
