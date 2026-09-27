/*
 * Checagem de scripts/verify-pack.mjs extraída em função pura, para dar teste de verdade sem
 * rodar o pacote inteiro (npm pack, instalação num projeto à parte).
 */

/**
 * package.json com "private": true nunca deveria chegar à publicação: o npm publish recusaria
 * com EPRIVATE, mas "npm pack" (o comando que verify-pack.mjs usa para inspecionar o pacote)
 * empacota normalmente e não acusa nada, mascarando o problema até o publish de verdade falhar.
 * Devolve a mensagem de erro quando `private` é `true`, ou undefined quando está tudo certo.
 */
export function privateFieldError(pkg: { private?: boolean }): string | undefined {
  if (pkg.private !== true) return undefined
  return (
    'package.json tem "private": true: o npm publish recusaria com EPRIVATE, e "npm pack" ' +
    'não acusa isso (empacota normalmente). Remova "private" antes de publicar.'
  )
}

/**
 * "bin" com caminho prefixado por "./" (`{ "rendra": "./bin/rendra.mjs" }`) passa despercebido
 * por `npm pack` e por `npm install` do tarball (o bin-links do npm normaliza o prefixo por
 * conta própria e cria o comando mesmo assim), mas o `npm publish` roda o normalizador de
 * `@npmcli/package-json` e avisa `"bin[rendra]" script name bin/rendra.mjs was invalid and
 * removed`, corrigindo o campo em silêncio: quem só olhar o aviso (sem saber que o campo é só
 * renomeado, não apagado) acha que o comando `rendra` sumiu do pacote publicado. Confere as
 * três coisas que `npm pkg fix` normalizaria por trás: existe `bin.rendra`, o caminho não
 * começa com "./" e ele aponta para um arquivo dentro de alguma entrada de `files` (senão o
 * arquivo nem seria incluído no pacote). Devolve a mensagem de erro, ou undefined se está tudo
 * certo.
 */
export function binFieldError(pkg: {
  bin?: Record<string, unknown>
  files?: unknown
}): string | undefined {
  const bin = pkg.bin
  if (!bin || typeof bin !== 'object' || typeof bin.rendra !== 'string' || bin.rendra === '') {
    return (
      'package.json não tem "bin.rendra" (string): o comando `rendra` não seria publicado. ' +
      'Ex.: { "bin": { "rendra": "bin/rendra.mjs" } }.'
    )
  }

  const binPath = bin.rendra
  if (binPath.startsWith('./')) {
    return (
      `"bin.rendra" começa com "./" (${binPath}): o npm publish aceita mas normaliza o campo ` +
      `e avisa "was invalid and removed" (o comando \`npm pkg fix\` confirma, tirando o ` +
      `prefixo). Use o caminho sem "./", por exemplo "${binPath.slice(2)}".`
    )
  }

  const files = Array.isArray(pkg.files)
    ? pkg.files.filter((entry) => typeof entry === 'string')
    : []
  const included = files.some((entry) => binPath === entry || binPath.startsWith(`${entry}/`))
  if (!included) {
    return (
      `"bin.rendra" (${binPath}) não está dentro de nenhuma entrada de "files" ` +
      `(${files.length > 0 ? files.join(', ') : 'nenhuma'}): o arquivo não seria incluído no ` +
      'pacote publicado.'
    )
  }

  return undefined
}
